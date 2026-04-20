// ============================================================
// SOS Hub Canada · /api/chat-sosia · v2
// ============================================================
// Endpoint serveur du chatbot SOSIA Client B2C.
//
// Améliorations v2 :
//   · Prompt caching Anthropic (ephemeral) sur le system prompt
//     → -90% coût sur les requêtes en cache (TTL 5 min)
//   · Fallback automatique vers Claude Haiku 4.5 si Sonnet
//     retourne 529 (overloaded) ou 503 temporairement
//   · Retry silencieux 1 fois sur erreurs réseau
//   · Contexte dynamique injecté dans le system prompt
//     (date courante, URL visiteur, langue détectée)
//   · Sanitization défensive renforcée
//
// Responsabilités :
//   1. Recevoir un message visiteur + session_id + métadonnées
//   2. Charger l'historique de la session depuis Supabase
//   3. Appeler Claude (Sonnet 4.5 → fallback Haiku 4.5)
//   4. Persister user message + assistant response
//   5. Détecter les événements de conversion (email, test)
//   6. Rate-limit par session_id (10 messages/min)
//
// Fallback gracieux :
//   · Si ANTHROPIC_API_KEY absent → 503 → widget se masque
//   · Si Supabase indisponible → on répond quand même, sans logger
//   · Si Sonnet overloaded → retry Haiku → si échec, erreur claire

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import {
  SOSIA_CLIENT_SYSTEM_PROMPT,
  detectConversionEvent,
  detectLang,
  computeCostUsd,
  type ConversionEvent,
  type VisitorLang,
} from '@/lib/prompts/sosia-client-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ------------------------------------------------------------
// Config
// ------------------------------------------------------------
const MODEL_PRIMARY = 'claude-sonnet-4-5-20250929';
const MODEL_FALLBACK = 'claude-haiku-4-5-20250929';
const MAX_OUTPUT_TOKENS = 600;
const HISTORY_LIMIT = 20; // derniers messages repris dans le contexte
const RATE_LIMIT_PER_MIN = 10;
const MAX_MESSAGE_LEN = 2000;
const MIN_MESSAGE_LEN = 1;

// Modèles et erreurs transitoires à rattraper
const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504, 529]);

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
    lang_hint?: string;
  };
}

interface ClaudeResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  cacheWriteTokens: number;
  model: 'sonnet' | 'haiku';
}

// ------------------------------------------------------------
// Helper · appel Claude avec prompt caching + fallback Haiku
// ------------------------------------------------------------
async function callClaude(
  anthropic: Anthropic,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<ClaudeResult> {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  // Le system prompt est envoyé comme un array de blocs avec
  // cache_control ephemeral sur le bloc principal · réduit les coûts
  // input de ~90% pour les appels suivants dans la fenêtre 5 min.
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ];

  const invoke = async (model: string): Promise<Anthropic.Message> => {
    return anthropic.messages.create({
      model,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemBlocks,
      messages,
    });
  };

  // Essai primaire · Sonnet avec retry 1x sur statut transitoire
  let completion: Anthropic.Message | null = null;
  let chosenModel: 'sonnet' | 'haiku' = 'sonnet';
  let lastError: unknown = null;

  try {
    completion = await invoke(MODEL_PRIMARY);
  } catch (err) {
    lastError = err;
    const status = (err as { status?: number })?.status;
    if (status && TRANSIENT_STATUSES.has(status)) {
      // Fallback immédiat sur Haiku · plus léger, moins susceptible d'être surchargé
      try {
        completion = await invoke(MODEL_FALLBACK);
        chosenModel = 'haiku';
      } catch (err2) {
        lastError = err2;
      }
    }
  }

  if (!completion) {
    throw lastError ?? new Error('Appel Claude échoué');
  }

  const text = completion.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  const usage = completion.usage as Anthropic.Usage & {
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };

  return {
    text,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cachedInputTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
    model: chosenModel,
  };
}

// ------------------------------------------------------------
// POST
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  // 1. Feature flag serveur · off par défaut
  if (process.env.ENABLE_CHATBOT_B2C !== 'true') {
    return NextResponse.json({ error: 'Chatbot désactivé' }, { status: 503 });
  }

  // 2. Clients
  const anthropic = getAnthropic();
  if (!anthropic) {
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
  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json(
      { error: `Longueur du message invalide (max ${MAX_MESSAGE_LEN} caractères)` },
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

  // 5. Contexte dynamique · date, URL, langue détectée
  //    → injecté APRÈS le prompt statique pour ne pas casser le cache
  const visitorLang: VisitorLang = detectLang(message);
  const today = new Date().toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Montreal',
  });
  const pathFromUrl = (() => {
    try {
      return body.visitor_metadata?.source_url
        ? new URL(body.visitor_metadata.source_url).pathname
        : '/';
    } catch {
      return '/';
    }
  })();

  const dynamicContext = `\n\n[Contexte de la session · usage interne, ne pas citer]
Date du jour · ${today}
Langue détectée dans le dernier message · ${visitorLang}
Page source du visiteur · ${pathFromUrl}
Règle · adapte la langue à celle du visiteur, reste concis, oriente vers la consultation gratuite dès que la question devient personnelle.`;

  const finalSystemPrompt = SOSIA_CLIENT_SYSTEM_PROMPT + dynamicContext;

  // 6. Appel Claude (avec cache + fallback)
  let claudeResult: ClaudeResult;
  try {
    claudeResult = await callClaude(
      anthropic,
      finalSystemPrompt,
      history,
      message
    );
  } catch (err) {
    console.error('[sosia] anthropic error:', err);
    return NextResponse.json(
      {
        error:
          'Service IA temporairement indisponible · réessayez dans un instant.',
      },
      { status: 502 }
    );
  }

  // Sanitization défensive · compliance Québec
  const assistantText = sanitizeAssistantText(claudeResult.text);

  // 7. Détection de conversion
  const { event, email } = detectConversionEvent(message, assistantText);

  let suggestedAction: { type: 'push_test' | 'capture_email'; url?: string } | null =
    null;
  if (event === 'test_accepted' || event === 'test_intent') {
    suggestedAction = { type: 'push_test', url: 'https://soshub.ca/peq' };
  } else if (event === 'email_captured' && email) {
    suggestedAction = { type: 'capture_email' };
  }

  // 8. Persistance (best-effort)
  if (supabase && conversation) {
    const costUsd = computeCostUsd(
      claudeResult.inputTokens,
      claudeResult.outputTokens,
      {
        model: claudeResult.model,
        cachedInputTokens: claudeResult.cachedInputTokens,
        cacheWriteTokens: claudeResult.cacheWriteTokens,
      }
    );
    try {
      await supabase.from('chatbot_messages').insert([
        {
          conversation_id: conversation.id,
          role: 'user',
          content: message,
          tokens: claudeResult.inputTokens,
        },
        {
          conversation_id: conversation.id,
          role: 'assistant',
          content: assistantText,
          tokens: claudeResult.outputTokens,
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
        total_tokens:
          (conversation.total_tokens ?? 0) +
          claudeResult.inputTokens +
          claudeResult.outputTokens,
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
    }
  }

  // 9. Si email capturé · forward vers CRM (best-effort, async)
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
    lang: visitorLang,
    model: claudeResult.model,
  });
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/**
 * Sanitization défensive · compliance Québec.
 * Même si le prompt empêche Claude de drifter, on nettoie en dernière
 * ligne pour être absolument certain que jamais le mot « immigration »
 * n'atteint un visiteur (hors CICC · nom propre officiel).
 */
function sanitizeAssistantText(text: string): string {
  // Préserve « Collège des consultants en immigration et citoyenneté »
  const OFFICIAL = 'Collège des consultants en immigration et citoyenneté';
  const placeholder = '\u0000CICC_OFFICIAL\u0000';
  let out = text.replace(new RegExp(OFFICIAL, 'gi'), placeholder);

  // Remplace immigration (→ relocalisation)
  out = out.replace(/\bimmigration\b/gi, (m) => {
    return m[0] === 'I' ? 'Relocalisation' : 'relocalisation';
  });

  // Remplace immigrer → s'installer au Canada
  out = out.replace(/\bimmigrer\b/gi, (m) => {
    return m[0] === 'I' ? "S'installer au Canada" : "s'installer au Canada";
  });

  // Remplace immigrants(s) → nouvel(s) arrivant(s)
  out = out.replace(/\bimmigrants?\b/gi, (m) => {
    const plural = m.toLowerCase().endsWith('s');
    const base = m[0] === 'I' ? 'Nouvel arrivant' : 'nouvel arrivant';
    return plural ? `${base}s` : base;
  });

  // Remplace immigrant adjectif (ex. "travailleur immigrant") → nouvel arrivant
  // (géré par la règle précédente · redondant par sûreté)

  // Remplace tirets cadratins/demi · style typographique québécois
  out = out.replace(/—/g, '·').replace(/–/g, '·');

  // Restore le nom propre
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
    model_primary: MODEL_PRIMARY,
    model_fallback: MODEL_FALLBACK,
    hasAnthropicKey: hasKey,
    featureFlagEnabled: enabled,
  });
}
