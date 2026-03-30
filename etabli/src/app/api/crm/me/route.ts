// ========================================================
// SOS Hub Canada - API: Mon profil CRM
// Retourne le profil CRM de l'utilisateur authentifié
// Pas de contrôle de rôle — chaque user peut voir son propre profil
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    // Extraire le token JWT du header Authorization
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    // Vérifier le token et obtenir l'utilisateur auth
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Chercher le profil CRM par auth_id ou email
    const db = createServiceClient() as any;

    // D'abord par auth_id
    let { data: profile } = await db
      .from('users')
      .select('id, name, email, role, active, auth_id')
      .eq('auth_id', user.id)
      .single();

    // Fallback par email
    if (!profile) {
      const { data: byEmail } = await db
        .from('users')
        .select('id, name, email, role, active, auth_id')
        .eq('email', user.email)
        .single();

      if (byEmail) {
        // Lier le auth_id pour les prochaines fois
        if (!byEmail.auth_id) {
          await db.from('users').update({ auth_id: user.id }).eq('id', byEmail.id);
        }
        profile = byEmail;
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profil CRM introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      active: profile.active ?? true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
