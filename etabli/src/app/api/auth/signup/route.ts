// ========================================================
// SOS Hub Canada — API: Inscription utilisateur
// Crée un compte Supabase Auth + profil CRM
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseReady } from '@/lib/supabase';
import { checkRateLimit, validateOrigin, isValidEmail, isDisposableEmail, sanitizeField } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

const VALID_ROLES = ['agent', 'technicienne', 'coordinatrice'];

export async function POST(req: NextRequest) {
  // Supabase must be configured
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Service non disponible' }, { status: 503 });
  }

  // Rate limit: 5 signups per 10 min per IP
  const rl = checkRateLimit(req, 5, 600000, 'signup');
  if (!rl.allowed) return rl.error!;

  // Origin check
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { email, password, name, role, adminKey } = body;

  // Validate required fields
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Courriel, mot de passe et nom requis' }, { status: 400 });
  }

  // Email validation
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Format de courriel invalide' }, { status: 400 });
  }
  if (isDisposableEmail(email)) {
    return NextResponse.json({ error: 'Courriel temporaire non accepté' }, { status: 400 });
  }

  // Password validation
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 });
  }

  // Name validation
  const safeName = sanitizeField(name, 100);
  if (safeName.length < 2) {
    return NextResponse.json({ error: 'Le nom doit contenir au moins 2 caractères' }, { status: 400 });
  }

  // Role: only admin can assign roles other than 'agent'
  const assignedRole = VALID_ROLES.includes(role) ? role : 'agent';

  // Admin key check for elevated roles (optional security layer)
  if (assignedRole !== 'agent' && adminKey !== process.env.ADMIN_SIGNUP_KEY) {
    return NextResponse.json({ error: 'Clé admin requise pour ce rôle' }, { status: 403 });
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const db = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }) as any;

    // Check if email already exists in CRM
    const { data: existing } = await db.from('users').select('id').eq('email', email).single();
    if (existing) {
      return NextResponse.json({ error: 'Ce courriel est déjà utilisé' }, { status: 409 });
    }

    // Create Supabase Auth user (using service client to bypass email confirmation in dev)
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for internal users
      user_metadata: { name: safeName, role: assignedRole },
    });

    if (authError || !authData?.user) {
      return NextResponse.json({ error: authError?.message || 'Erreur création compte' }, { status: 400 });
    }

    // Create CRM profile
    const { data: profile, error: profileError } = await db.from('users').insert({
      auth_id: authData.user.id,
      email,
      name: safeName,
      role: assignedRole,
      active: true,
    }).select('id, name, email, role').single();

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await db.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Erreur création profil CRM: ' + profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role },
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
