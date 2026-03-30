// ========================================================
// SOS Hub Canada - API Route: Gestion utilisateurs CRM
// POST: créer, PUT: modifier, DELETE: désactiver
// Role-based access control enforced
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, requireCrmRole, checkRateLimit, isValidEmail, validateOrigin } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rl.error!;

  if (!isSupabaseReady()) {
    return NextResponse.json([], { status: 200 });
  }

  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!

  // Only superadmin and coordinatrice can list all users
  const roleCheck = await requireCrmRole(auth.userId!, ['superadmin', 'coordinatrice']);
  if (!roleCheck.authorized) return roleCheck.error!;

  try {
    const db = createServiceClient() as any;
    const { data, error } = await db.from('users').select('*').order('name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req, 10, 60000);
  if (!rl.allowed) return rl.error!;

  try {
    const { email, password, name, role } = await req.json();
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Email, mot de passe, nom et rôle requis' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    const validRoles = ['receptionniste', 'conseiller', 'technicienne_juridique', 'avocat_consultant', 'coordinatrice', 'superadmin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Mot de passe trop court (min 8 caractères)' }, { status: 400 });
    }

    // Demo mode — return success without Supabase
    if (!isSupabaseReady()) {
      return NextResponse.json({ success: true, userId: `demo-${Date.now()}`, demo: true });
    }

    const auth = await authenticateRequest(req);
    if (!auth.authenticated) return auth.error!;

    // Only superadmin can create users
    const roleCheck = await requireCrmRole(auth.userId!, ['superadmin']);
    if (!roleCheck.authorized) return roleCheck.error!

    const db = createServiceClient() as any;

    // Create Supabase Auth account
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (authError) {
      return NextResponse.json({ error: `Erreur auth: ${authError.message}` }, { status: 500 });
    }

    // The auth trigger should create the CRM profile automatically
    // But let's verify and create if needed
    const { data: existing } = await db.from('users').select('id').eq('email', email).single();

    if (!existing) {
      const { error: insertError } = await db.from('users').insert({
        auth_id: authData.user.id,
        email,
        name,
        role,
        active: true,
      });
      if (insertError) {
        return NextResponse.json({ error: `Erreur profil: ${insertError.message}` }, { status: 500 });
      }
    } else {
      // Link auth_id if profile exists but not linked
      await db.from('users').update({ auth_id: authData.user.id }).eq('email', email);
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rl.error!;

  if (!isSupabaseReady()) {
    return NextResponse.json({ success: true, demo: true });
  }

  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;

  // Only superadmin can modify users. Coordinatrice can modify non-superadmin users.
  const roleCheck = await requireCrmRole(auth.userId!, ['superadmin', 'coordinatrice']);
  if (!roleCheck.authorized) return roleCheck.error!;

  try {
    const { userId, name, role, active, password } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const db = createServiceClient() as any;

    // If coordinatrice, check that the target user is not a superadmin
    if (roleCheck.role === 'coordinatrice') {
      const { data: targetUser } = await db.from('users').select('role').eq('id', userId).single();
      if (targetUser?.role === 'superadmin') {
        return NextResponse.json({ error: 'Permission insuffisante pour modifier un superadmin' }, { status: 403 });
      }
      // Coordinatrice cannot promote to superadmin
      if (role === 'superadmin') {
        return NextResponse.json({ error: 'Permission insuffisante pour attribuer le rôle superadmin' }, { status: 403 });
      }
    }

    // Update password via Supabase Admin API if provided
    if (password) {
      // Get auth_id from users table
      const { data: user } = await db.from('users').select('auth_id').eq('id', userId).single();
      if (user?.auth_id) {
        const { error: pwError } = await db.auth.admin.updateUserById(user.auth_id, { password });
        if (pwError) {
          return NextResponse.json({ error: `Erreur mot de passe: ${pwError.message}` }, { status: 500 });
        }
      }
      // If no other fields to update, return early
      if (name === undefined && role === undefined && active === undefined) {
        return NextResponse.json({ success: true });
      }
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = active;

    if (Object.keys(updates).length > 0) {
      const { error } = await db.from('users').update(updates).eq('id', userId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rl.error!;

  if (!isSupabaseReady()) {
    return NextResponse.json({ success: true, demo: true });
  }

  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;

  // Only superadmin can deactivate users
  const roleCheck = await requireCrmRole(auth.userId!, ['superadmin']);
  if (!roleCheck.authorized) return roleCheck.error!;

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const db = createServiceClient() as any;
    // Soft delete: set active = false
    const { error } = await db.from('users').update({ active: false }).eq('id', userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
