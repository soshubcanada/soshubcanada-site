"use client";
// ========================================================
// SOS Hub Canada - Authentification Portail Client/Employeur
// Gère la session Supabase + accès portail
// Mode démo si Supabase n'est pas configuré
// ========================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper: cast supabase pour contourner les types `never` de v2.99
const db = supabase as any;

// ============================================================
// Types
// ============================================================
export type PortalEntityType = 'client' | 'employer';

export interface PortalAccess {
  id: string;
  auth_id: string;
  entity_type: PortalEntityType;
  entity_id: string;
  email: string;
  active: boolean;
  permissions: string[];
  created_at: string;
  last_login?: string;
}

export interface PortalProfile {
  access: PortalAccess;
  entity: any; // Client or Employer data
  displayName: string;
}

// Backward-compatible type alias
export interface PortalUser {
  id: string;
  email: string;
  companyName: string;
  role: 'employer';
}

interface PortalAuthState {
  portalProfile: PortalProfile | null;
  loading: boolean;
  isDemo: boolean;
  error: string | null;
}

// ============================================================
// Détection du mode
// ============================================================
const isSupabaseConfigured = () => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return Boolean(url && key && !url.includes('VOTRE-PROJET'));
  } catch {
    return false;
  }
};

// ============================================================
// Données démo pour le portail client
// ============================================================
const DEMO_CLIENT_PORTAL_ACCESS: PortalAccess = {
  id: 'pa-demo-client-1',
  auth_id: 'demo-auth-client-1',
  entity_type: 'client',
  entity_id: 'c1',
  email: 'carlos@email.com',
  active: true,
  permissions: ['view_cases', 'upload_documents', 'view_appointments', 'send_messages'],
  created_at: '2024-01-15',
  last_login: '2026-03-20',
};

const DEMO_CLIENT_PORTAL_PROFILE: PortalProfile = {
  access: DEMO_CLIENT_PORTAL_ACCESS,
  entity: {
    id: 'c1',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'carlos@email.com',
    phone: '+1-514-555-0101',
    nationality: 'Colombie',
    assignedTo: 'u2',
    assignedToName: 'A. Kabeche',
  },
  displayName: 'Carlos Rodriguez',
};

const DEMO_EMPLOYER_PORTAL_ACCESS: PortalAccess = {
  id: 'pa-demo-employer-1',
  auth_id: 'demo-auth-employer-1',
  entity_type: 'employer',
  entity_id: 'emp-1',
  email: 'rh@techsolutions.ca',
  active: true,
  permissions: ['view_workers', 'manage_lmia', 'upload_documents', 'view_compliance'],
  created_at: '2024-06-01',
  last_login: '2026-03-20',
};

const DEMO_EMPLOYER_PORTAL_PROFILE: PortalProfile = {
  access: DEMO_EMPLOYER_PORTAL_ACCESS,
  entity: {
    id: 'emp-1',
    company_name: 'Entreprise Demo Inc.',
    email: 'rh@techsolutions.ca',
    contact_name: 'Marie Dupont',
  },
  displayName: 'Entreprise Demo Inc.',
};

// ============================================================
// Fonctions d'authentification portail
// ============================================================

/**
 * Connexion portail — sign in puis vérifie l'accès dans portal_access
 */
export async function portalSignIn(
  email: string,
  password: string
): Promise<{ profile: PortalProfile | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Mode démo: accepter n'importe quel email/mot de passe
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('portal_profile', JSON.stringify(DEMO_CLIENT_PORTAL_PROFILE));
    }
    return { profile: DEMO_CLIENT_PORTAL_PROFILE, error: null };
  }

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      console.error('[PORTAL-AUTH] signIn error:', authError.message);
      return { profile: null, error: authError.message };
    }
    if (!data.user) {
      return { profile: null, error: 'Aucun utilisateur trouvé.' };
    }

    // Vérifier l'accès portail
    const { data: access, error: accessError } = await db
      .from('portal_access')
      .select('*')
      .eq('auth_id', data.user.id)
      .eq('active', true)
      .single();

    if (accessError || !access) {
      // Fallback: chercher par email
      const { data: accessByEmail, error: emailErr } = await db
        .from('portal_access')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();

      if (emailErr || !accessByEmail) {
        await supabase.auth.signOut();
        return { profile: null, error: 'Accès portail non autorisé. Contactez votre conseiller.' };
      }

      // Lier l'auth_id automatiquement
      await db.from('portal_access').update({ auth_id: data.user.id }).eq('id', accessByEmail.id);

      const portalAccess = mapPortalAccess(accessByEmail);
      const profile = await loadEntityData(portalAccess);

      // Mettre à jour last_login
      await db.from('portal_access').update({ last_login: new Date().toISOString() }).eq('id', portalAccess.id);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('portal_profile', JSON.stringify(profile));
      }
      return { profile, error: null };
    }

    const portalAccess = mapPortalAccess(access);
    const profile = await loadEntityData(portalAccess);

    // Mettre à jour last_login
    await db.from('portal_access').update({ last_login: new Date().toISOString() }).eq('id', portalAccess.id);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('portal_profile', JSON.stringify(profile));
    }
    return { profile, error: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur de connexion';
    console.error('[PORTAL-AUTH] signIn exception:', msg);
    return { profile: null, error: 'Erreur de connexion. Veuillez réessayer.' };
  }
}

/**
 * Connexion portail employeur — backward compatibility
 */
export async function portalEmployerSignIn(
  email: string,
  password: string
): Promise<{ user: PortalUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const demoUser: PortalUser = {
      id: 'demo-employer-1',
      email,
      companyName: 'Entreprise Demo Inc.',
      role: 'employer',
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('portal_employer', JSON.stringify(demoUser));
    }
    return { user: demoUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[PORTAL-AUTH] employer signIn error:', error.message);
      return { user: null, error: error.message };
    }
    if (data.user) {
      const { data: employer } = await db
        .from('employers')
        .select('id, company_name')
        .eq('email', data.user.email)
        .single();

      const portalUser: PortalUser = {
        id: employer?.id ?? data.user.id,
        email: data.user.email ?? email,
        companyName: employer?.company_name ?? 'Mon entreprise',
        role: 'employer',
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('portal_employer', JSON.stringify(portalUser));
      }
      return { user: portalUser, error: null };
    }
    return { user: null, error: 'Erreur inconnue' };
  } catch (e) {
    console.error('[PORTAL-AUTH] employer signIn exception:', e);
    return { user: null, error: 'Erreur de connexion. Veuillez réessayer.' };
  }
}

/**
 * Récupérer le profil portail à partir de l'auth_id
 */
export async function getPortalProfile(authId: string): Promise<PortalProfile | null> {
  if (!isSupabaseConfigured()) {
    return DEMO_CLIENT_PORTAL_PROFILE;
  }

  try {
    const { data: access, error } = await db
      .from('portal_access')
      .select('*')
      .eq('auth_id', authId)
      .eq('active', true)
      .single();

    if (error || !access) return null;

    const portalAccess = mapPortalAccess(access);
    return await loadEntityData(portalAccess);
  } catch (e) {
    console.error('[PORTAL-AUTH] getPortalProfile error:', e);
    return null;
  }
}

/**
 * Déconnexion portail
 */
export async function portalSignOut(): Promise<{ error: string | null }> {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('portal_profile');
    sessionStorage.removeItem('portal_employer');
  }
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  } catch {
    return { error: null };
  }
}

/**
 * Réinitialisation du mot de passe portail
 */
export async function portalResetPassword(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/client`,
    });
    return { error: error?.message ?? null };
  } catch {
    return { error: null }; // silently succeed in demo
  }
}

// ============================================================
// Hook React — usePortalAuth (client portal)
// ============================================================
export function usePortalAuth() {
  const [state, setState] = useState<PortalAuthState>({
    portalProfile: null,
    loading: true,
    isDemo: !isSupabaseConfigured(),
    error: null,
  });

  // Initialisation: vérifier session existante
  useEffect(() => {
    // Essayer sessionStorage d'abord (pour navigation SPA)
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('portal_profile');
        if (raw) {
          const profile = JSON.parse(raw) as PortalProfile;
          setState(s => ({
            ...s,
            portalProfile: profile,
            loading: false,
            isDemo: !isSupabaseConfigured(),
          }));
          return;
        }
      } catch {
        // ignore parse errors
      }
    }

    if (!isSupabaseConfigured()) {
      setState(s => ({ ...s, loading: false, isDemo: true }));
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const profile = await getPortalProfile(session.user.id);
          if (profile && typeof window !== 'undefined') {
            sessionStorage.setItem('portal_profile', JSON.stringify(profile));
          }
          setState(s => ({
            ...s,
            portalProfile: profile,
            loading: false,
            isDemo: false,
          }));
        } catch {
          setState(s => ({ ...s, loading: false, isDemo: false }));
        }
      } else {
        setState(s => ({ ...s, loading: false, isDemo: false }));
      }
    }).catch(() => {
      setState(s => ({ ...s, loading: false, isDemo: false }));
    });

    // Écouter les changements auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getPortalProfile(session.user.id);
          if (profile && typeof window !== 'undefined') {
            sessionStorage.setItem('portal_profile', JSON.stringify(profile));
          }
          setState(s => ({
            ...s,
            portalProfile: profile,
            loading: false,
            error: null,
          }));
        } else if (event === 'SIGNED_OUT') {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('portal_profile');
          }
          setState(s => ({
            ...s,
            portalProfile: null,
            loading: false,
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Login portail
  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const { profile, error } = await portalSignIn(email, password);
    if (error) {
      setState(s => ({ ...s, loading: false, error }));
      return false;
    }
    setState(s => ({
      ...s,
      portalProfile: profile,
      loading: false,
      error: null,
      isDemo: !isSupabaseConfigured(),
    }));
    return true;
  }, []);

  // Login démo
  const loginDemo = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('portal_profile', JSON.stringify(DEMO_CLIENT_PORTAL_PROFILE));
    }
    setState(s => ({
      ...s,
      portalProfile: DEMO_CLIENT_PORTAL_PROFILE,
      loading: false,
      isDemo: true,
      error: null,
    }));
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (state.isDemo) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('portal_profile');
      }
      setState(s => ({ ...s, portalProfile: null }));
    } else {
      await portalSignOut();
    }
  }, [state.isDemo]);

  return {
    ...state,
    login,
    loginDemo,
    logout,
  };
}

// ============================================================
// Hook backward-compatible — usePortalEmployerAuth
// ============================================================
export function usePortalEmployerAuth(): { user: PortalUser | null; loading: boolean; logout: () => Promise<void> } {
  if (typeof window === 'undefined') {
    return { user: null, loading: true, logout: async () => {} };
  }

  let user: PortalUser | null = null;
  try {
    const raw = sessionStorage.getItem('portal_employer');
    if (raw) {
      user = JSON.parse(raw) as PortalUser;
    }
  } catch {
    // ignore
  }

  const logout = async () => {
    await portalSignOut();
    window.location.href = '/employeur';
  };

  return { user, loading: false, logout };
}

// ============================================================
// Helpers internes
// ============================================================
function mapPortalAccess(row: any): PortalAccess {
  return {
    id: row.id,
    auth_id: row.auth_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    email: row.email,
    active: row.active,
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    created_at: row.created_at,
    last_login: row.last_login ?? undefined,
  };
}

async function loadEntityData(access: PortalAccess): Promise<PortalProfile> {
  const table = access.entity_type === 'client' ? 'clients' : 'employers';

  const { data: entity, error } = await db
    .from(table)
    .select('*')
    .eq('id', access.entity_id)
    .single();

  if (error || !entity) {
    return {
      access,
      entity: null,
      displayName: access.email,
    };
  }

  const displayName = access.entity_type === 'client'
    ? `${entity.first_name} ${entity.last_name}`
    : entity.company_name ?? entity.name ?? access.email;

  return { access, entity, displayName };
}
