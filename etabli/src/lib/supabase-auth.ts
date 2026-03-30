// ========================================================
// SOS Hub Canada - Authentification Supabase
// Fonctions d'authentification email/mot de passe
// ========================================================
import { supabase } from './supabase';
import type { CrmUser } from './crm-types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const isDev = process.env.NODE_ENV === 'development';

// Connexion par email/mot de passe
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (isDev) console.error('[AUTH] signIn error:', error.message, error.status);
      return { user: null, session: null, error: error.message };
    }
    if (isDev) console.log('[AUTH] signIn OK:', data.user?.email);
    return { user: data.user, session: data.session, error: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue';
    if (isDev) console.error('[AUTH] signIn exception:', msg);
    return { user: null, session: null, error: msg };
  }
}

// Inscription (création de compte)
export async function signUp(email: string, password: string, name: string, role: CrmUser['role']) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

// Déconnexion
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

// Session courante
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

// Récupérer le profil CRM lié à l'utilisateur Supabase Auth
export async function fetchCrmProfile(authUserId: string): Promise<CrmUser | null> {
  // Petit délai pour s'assurer que le token JWT est propagé au client Supabase
  await new Promise(resolve => setTimeout(resolve, 500));

  const db = supabase as any;

  // Essai 1: chercher par auth_id
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('auth_id', authUserId)
        .single();

      if (!error && data) {
        return mapDbUser(data);
      }

      // Si erreur RLS (pas de rows), essayer par email
      if (error) {
        if (isDev) console.warn(`[AUTH] Attempt ${attempt + 1} by auth_id failed:`, error.message);
      }
      break; // Ne pas retry si la requête a réussi mais pas de data
    } catch (e) {
      if (isDev) console.warn(`[AUTH] Attempt ${attempt + 1} exception:`, e);
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Essai 2: chercher par email
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser?.email) {
      const { data: byEmail, error: err2 } = await db
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();
      if (!err2 && byEmail) {
        // Lier l'auth_id automatiquement (fire-and-forget)
        db.from('users').update({ auth_id: authUserId }).eq('id', byEmail.id).then(() => {});
        return mapDbUser(byEmail);
      }
    }
  } catch (e) {
    if (isDev) console.error('[AUTH] fetchCrmProfile email fallback error:', e);
  }

  return null;
}

// Créer le profil CRM à partir des métadonnées Supabase Auth
export async function createCrmProfile(authUserId: string, email: string, name: string, role: CrmUser['role']): Promise<CrmUser | null> {
  const db = supabase as any;
  const { data, error } = await db.from('users').insert({
    auth_id: authUserId,
    email,
    name,
    role,
    active: true,
  }).select().single();

  if (error || !data) {
    if (isDev) console.error('createCrmProfile error:', error);
    return null;
  }
  return mapDbUser(data);
}

function mapDbUser(u: any): CrmUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar_url ?? undefined,
    active: u.active,
  };
}

// Réinitialisation du mot de passe
export async function resetPassword(email: string) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://soshubca.vercel.app');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/crm/reset-password`,
  });
  return { error: error?.message ?? null };
}
