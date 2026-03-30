// ========================================================
// SOS Hub Canada - API: Invitation portail client/employeur
// POST: créer compte + accès portail + envoyer email
// GET: lister les accès portail
// DELETE: révoquer un accès
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, checkRateLimit, isValidEmail, sanitizeInput, validateOrigin } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }
  try {
    const db = createServiceClient() as any;
    const entityType = req.nextUrl.searchParams.get('entity_type');
    const entityId = req.nextUrl.searchParams.get('entity_id');

    let query = db.from('portal_access').select('*').order('created_at', { ascending: false });
    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req, 10, 60000); // Max 10 invitations/minute
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const { email, name, entityType, entityId, permissions } = await req.json();
    if (!email || !entityType || !entityId) {
      return NextResponse.json({ error: 'Email, type et ID requis' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    if (!['client', 'employer'].includes(entityType)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    const db = createServiceClient() as any;
    const tempPassword = generatePassword();

    // Check if portal access already exists
    const { data: existing } = await db
      .from('portal_access')
      .select('id, active')
      .eq('email', email)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();

    if (existing?.active) {
      return NextResponse.json({ error: 'Cet accès existe déjà' }, { status: 409 });
    }

    // Create or get Supabase Auth account
    let authUserId: string;
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: name || email, portal_type: entityType },
    });

    if (authError) {
      // User might already exist, try to get their ID
      if (authError.message?.includes('already been registered')) {
        const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
        const found = users?.users?.find((u: any) => u.email === email);
        if (found) {
          authUserId = found.id;
          // Reset their password
          await db.auth.admin.updateUserById(found.id, { password: tempPassword });
        } else {
          return NextResponse.json({ error: `Erreur auth: ${authError.message}` }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: `Erreur auth: ${authError.message}` }, { status: 500 });
      }
    } else {
      authUserId = authData.user.id;
    }

    // Create or reactivate portal_access
    if (existing) {
      await db.from('portal_access').update({
        auth_id: authUserId,
        active: true,
        permissions: permissions || { upload_docs: true, view_forms: true, messaging: true },
        invited_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await db.from('portal_access').insert({
        entity_type: entityType,
        entity_id: entityId,
        auth_id: authUserId,
        email,
        permissions: permissions || { upload_docs: true, view_forms: true, messaging: true },
        active: true,
      });
    }

    // Send invitation email via EmailJS
    const portalUrl = entityType === 'client' ? '/client' : '/employeur';
    const portalLabel = entityType === 'client' ? 'Client' : 'Employeur';
    const emailSent = await sendInvitationEmail(email, name || email, tempPassword, portalUrl, portalLabel);

    return NextResponse.json({
      success: true,
      authUserId,
      portalAccessCreated: true,
      emailSent: !!emailSent,
      note: emailSent ? undefined : 'Courriel non envoyé — réessayez ou envoyez manuellement les identifiants',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const { accessId } = await req.json();
    if (!accessId) {
      return NextResponse.json({ error: 'accessId requis' }, { status: 400 });
    }

    const db = createServiceClient() as any;
    const { error } = await db.from('portal_access').update({ active: false }).eq('id', accessId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

// Generate a random secure password
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const special = '!@#$%&*';
  let pw = '';
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  pw += special[Math.floor(Math.random() * special.length)];
  return pw;
}

// Send invitation email via EmailJS
async function sendInvitationEmail(
  toEmail: string,
  name: string,
  password: string,
  portalUrl: string,
  portalLabel: string,
): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) return false;

  try {
    const body: Record<string, unknown> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: toEmail,
        subject: `Votre accès au Portail ${portalLabel} - SOS Hub Canada`,
        message: `Bonjour ${name},\n\nVotre accès au Portail ${portalLabel} de SOS Hub Canada a été créé.\n\nCourriel: ${toEmail}\nMot de passe temporaire: ${password}\n\nConnectez-vous ici: https://soshubca.vercel.app${portalUrl}\n\nVeuillez changer votre mot de passe lors de votre première connexion.\n\nCordialement,\nL'équipe SOS Hub Canada`,
        from_name: 'SOS Hub Canada',
        reply_to: 'info@soshub.ca',
      },
    };
    if (privateKey) (body as any).accessToken = privateKey;

    const res = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
