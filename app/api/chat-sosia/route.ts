// ============================================================
// SOS Hub Canada · /api/chat-sosia
// ============================================================
// Endpoint serveur du chatbot SOSIA Client B2C.
//
// Responsabilités :
//   1. Recevoir un message visiteur + session_id + métadonnées
//   2. Charger l'historique de la session depuis Supabase
//   3. Appeler Claude Sonnet 4.5 avec le prompt système SOSIA
//   4. Persister user message + assistant response
//   5. Détecter les événements de conversion (email, test)
//   6. Rate-limit par session_id (10 messages/min)
//
// Fallback gracieux :
//   - Si ANTHROPIC_API_KEY absent → 503 · le widget côté client
//     se masque.
//   - Si Supabase indisponible → on répond quand même, sans logger
//     (best-effort).

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  SOSIA_CLIENT_SYSTEM_PROMPT,
  detectConversionEvent,
  computeCostUsd,
  type ConversionEvent,
} from '@/lib/prompts/sosia-client-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ------------------------------------------------------------
// Config
// ------------------------------------------------------------
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_OUTPUT_TOKENS = 600;
const HISTORY_LIMIT = 20; // derniers messages repris dans le contexte
const RATE_LIMIT_PER_MIN = 10;
const MAX_MESSAGE_LEN = 2000;

// ------------------------------------------------------------
// Clients lazy (évite de crasher le build si env absent)
// ------------------------------------------------------------
function getAnthropic(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
type Role = 'user' | 'assistant';
interface ChatMessage {
  role: Role;
  content: string;
}

interface PostBody {
  message: string;
  session_id: string;
  visitor_metadata?: {
    source_url?: string;
    user_agent?: string;
    visitor_name?: string;
  };
}

// ------------------------------------------------------------
// POST
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  // 1. Feature flag serveur · off par défaut · il faut ENABLE_CHATBOT_B2C=true
  if (process.env.ENABLE_CHATBOT_B2C !== 'true') {
    return NextResponse.json({ error: 'Chatbot désactivé' }, { status: 503 });
  }

  // 2. Clients
  const anthropic = getAnthropic();
  if (!anthropic) {
    // Le widget interprète 503 comme « chatbot indisponible » et se masque
    return NextResponse.json(
      { error: 'Service IA non configuré' },
      { status: 503 }
    );
  }
  const supabase = getSupabaseServer();

  // 3. Parse + validation
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const message = (body.message || '').trim();
  const sessionId = (body.session_id || '').trim();

  if (!message || !sessionId) {
    return NextResponse.json(
      { error: 'message et session_id requis' },
      { status: 400 }
    );
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json(
      { error: `Message trop long (max ${MAX_MESSAGE_LEN} caractères)` },
      { status: 400 }
    );
  }
  if (sessionId.length > 64 || !/^[a-zA-Z0-9_\-]+$/.test(sessionId)) {
    return NextResponse.json({ error: 'session_id invalide' }, { status: 400 });
  }

  // 4. Récupère ou crée la conversation + historique (best-effort)
  type ConvRow = {
    id: string;
    message_count: number;
    total_tokens: number;
    total_cost_usd: number;
  };
  let conversation: ConvRow | null = null;
  let history: ChatMessage[] = [];

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('chatbot_conversations')
        .select('id, message_count, total_tokens, total_cost_usd')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing) {
        conversation = existing as ConvRow;
      } else {
        const { data: created, error: createErr } = await supabase
          .from('chatbot_conversations')
          .insert({
            session_id: sessionId,
            source_url: body.visitor_metadata?.source_url ?? null,
            user_agent: body.visitor_metadata?.user_agent ?? null,
            visitor_name: body.visitor_metadata?.visitor_name ?? null,
          })
          .select('id, message_count, total_tokens, total_cost_usd')
          .single();
        if (!createErr && created) conversation = created as ConvRow;
      }

      // Rate limit · count messages user dans les 60 dernières secondes
      if (conversation) {
        const since = new Date(Date.now() - 60_000).toISOString();
        const { count } = await supabase
          .from('chatbot_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .eq('role', 'user')
          .gte('created_at', since);
        if ((count ?? 0) >= RATE_LIMIT_PER_MIN) {
          return NextResponse.json(
            { error: 'Trop de messages · merci de patienter un instant.' },
            { status: 429 }
          );
        }

        // Historique
        const { data: msgs } = await supabase
          .from('chatbot_messages')
          .select('role, content, created_at')
          .eq('conversation_id', conversation.id)
          .in('role', ['user', 'assistant'])
          .order('created_at', { ascending: true })
          .limit(HISTORY_LIMIT);
        if (msgs) {
          history = msgs.map((m) => ({
            role: m.role as Role,
            content: m.content,
          }));
        }
      }
    } catch (err) {
      console.error('[sosia] supabase read error:', err);
      // On continue sans persistance
    }
  }

  // 5. Appel Claude
  let assistantText = '';
  let inputTokens = 0;
  let outputTokens = 0;
  try {
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SOSIA_CLIENT_SYSTEM_PROMPT,
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: message },
      ],
    });

    assistantText = completion.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    inputTokens = completion.usage.input_tokens;
    outputTokens = completion.usage.output_tokens;
  } catch (err) {
    console.error('[sosia] anthropic error:', err);
    return NextResponse.json(
      { error: 'Service IA temporairement indisponible · réessayez dans un instant.' },
      { status: 502 }
    );
  }

  // Purge défensive · compliance Québec · si Claude a généré le mot
  // « immigration » (hors CICC) on le remplace proprement.
  assistantText = sanitizeImmigrationWord(assistantText);

  // 6. Détection de conversion
  const { event, email } = detectConversionEvent(message, assistantText);

  let suggestedAction: { type: 'push_test' | 'capture_email'; url?: string } | null =
    null;
  if (event === 'test_accepted' || event === 'test_intent') {
    suggestedAction = { type: 'push_test', url: 'https://soshub.ca/peq' };
  } else if (event === 'email_captured' && email) {
    suggestedAction = { type: 'capture_email' };
  }

  // 7. Persistance (best-effort)
  if (supabase && conversation) {
    const costUsd = computeCostUsd(inputTokens, outputTokens);
    try {
      await supabase.from('chatbot_messages').insert([
        {
          conversation_id: conversation.id,
          role: 'user',
          content: message,
          tokens: inputTokens,
        },
        {
          conversation_id: conversation.id,
          role: 'assistant',
          content: assistantText,
          tokens: outputTokens,
        },
      ]);

      type ConvUpdate = {
        message_count: number;
        total_tokens: number;
        total_cost_usd: number;
        last_message_at: string;
        visitor_email?: string;
        conversion_event?: string;
        converted_to_lead?: boolean;
        converted_at?: string;
      };
      const update: ConvUpdate = {
        message_count: (conversation.message_count ?? 0) + 2,
        total_tokens: (conversation.total_tokens ?? 0) + inputTokens + outputTokens,
        total_cost_usd: Number(
          ((conversation.total_cost_usd ?? 0) + costUsd).toFixed(6)
        ),
        last_message_at: new Date().toISOString(),
      };
      if (email) update.visitor_email = email;
      if (event) update.conversion_event = event;
      if (event === 'email_captured' || event === 'test_accepted') {
        update.converted_to_lead = true;
        update.converted_at = new Date().toISOString();
      }
      await supabase
        .from('chatbot_conversations')
        .update(update)
        .eq('id', conversation.id);
    } catch (err) {
      console.error('[sosia] supabase write error:', err);
      // pas de retour d'erreur au client · l'utilisateur a sa réponse
    }
  }

  // 8. Si email capturé · forward vers CRM (best-effort, async)
  if (event === 'email_captured' && email) {
    void forwardToCRM({
      email,
      message,
      sessionId,
      sourceUrl: body.visitor_metadata?.source_url,
    });
  }

  return NextResponse.json({
    response: assistantText,
    session_id: sessionId,
    suggested_action: suggestedAction,
    conversion_event: event as ConversionEvent,
  });
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
/**
 * Nettoyage de conformité Québec · remplace « immigration » par
 * « relocalisation » sauf dans l'acronyme CICC ou Collège des
 * consultants en immigration et citoyenneté (nom propre officiel).
 */
function sanitizeImmigrationWord(text: string): string {
  // Préserve « Collège des consultants en immigration et citoyenneté »
  const OFFICIAL = 'Collège des consultants en immigration et citoyenneté';
  const placeholder = '\u0000CICC_OFFICIAL\u0000';
  let out = text.replace(new RegExp(OFFICIAL, 'gi'), placeholder);

  // Remplace immigration / immigrant isolés
  out = out.replace(/\bimmigration\b/gi, (m) => {
    return m[0] === 'I' ? 'Relocalisation' : 'relocalisation';
  });
  out = out.replace(/\bimmigrants?\b/gi, (m) => {
    const plural = m.toLowerCase().endsWith('s');
    const base = m[0] === 'I' ? 'Nouvel arrivant' : 'nouvel arrivant';
    return plural ? `${base}s` : base;
  });

  // Remplace tirets cadratins
  out = out.replace(/—/g, '·').replace(/–/g, '·');

  // Restore
  out = out.replaceAll(placeholder, OFFICIAL);
  return out;
}

async function forwardToCRM(payload: {
  email: string;
  message: string;
  sessionId: string;
  sourceUrl?: string;
}) {
  try {
    await fetch('https://soshubca.vercel.app/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        source: 'chatbot_sosia',
        subject: 'Lead chatbot SOSIA',
        message: `Session ${payload.sessionId} · Dernier message : ${payload.message}`,
        formData: {
          source_url: payload.sourceUrl,
          channel: 'chatbot',
        },
      }),
    });
  } catch (err) {
    console.error('[sosia] crm forward error:', err);
  }
}

// ------------------------------------------------------------
// GET · healthcheck / feature flag introspection
// ------------------------------------------------------------
export async function GET() {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const enabled = process.env.ENABLE_CHATBOT_B2C === 'true';
  return NextResponse.json({
    status: hasKey && enabled ? 'ready' : 'disabled',
    model: MODEL,
    hasAnthropicKey: hasKey,
    featureFlagEnabled: enabled,
  });
}
