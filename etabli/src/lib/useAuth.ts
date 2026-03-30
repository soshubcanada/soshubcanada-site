"use client";
// ========================================================
// SOS Hub Canada - Hook d'authentification
// Gère la session Supabase + profil CRM
// ========================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { signIn as authSignIn, signOut as authSignOut } from './supabase-auth';
import type { CrmUser } from './crm-types';
import type { Session } from '@supabase/supabase-js';

/* eslint-disable @typescript-eslint/no-explicit-any */

const isSupabaseConfigured = () => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return Boolean(url && key && !url.includes('VOTRE-PROJET'));
  } catch {
    return false;
  }
};

// Récupérer le profil CRM via l'API /me
async function fetchMyProfile(accessToken: string): Promise<CrmUser | null> {
  try {
    const res = await fetch('/api/crm/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.id && data.email && data.role) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        active: data.active ?? true,
      };
    }
    return null;
  } catch {
    return null;
  }
}

interface AuthState {
  currentUser: CrmUser | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    currentUser: null,
    session: null,
    loading: true,
    isDemo: !isSupabaseConfigured(),
    error: null,
  });

  // Chargement initial — vérifier session existante
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState(s => ({ ...s, loading: false, isDemo: true }));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        if (session?.user) {
          const profile = await fetchMyProfile(session.access_token);
          if (cancelled) return;
          setState({
            session,
            currentUser: profile,
            loading: false,
            isDemo: false,
            error: profile ? null : 'Profil introuvable. Contactez l\'admin.',
          });
        } else {
          setState(s => ({ ...s, loading: false, isDemo: false }));
        }
      } catch {
        if (!cancelled) setState(s => ({ ...s, loading: false, isDemo: false }));
      }
    })();

    // Timeout de sécurité 6s
    const timeout = setTimeout(() => {
      if (!cancelled) setState(s => ({ ...s, loading: false }));
    }, 6000);

    // Écouter SIGNED_OUT seulement (login géré par la fonction login())
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({
            session: null,
            currentUser: null,
            loading: false,
            isDemo: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(s => ({ ...s, session }));
        }
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Login — gère tout le flow directement (pas via onAuthStateChange)
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(s => ({ ...s, error: null }));

    const { error, session } = await authSignIn(email, password);
    if (error || !session) {
      setState(s => ({
        ...s,
        loading: false,
        error: error || 'Identifiants invalides.',
      }));
      return false;
    }

    // Fetch profil directement avec le token
    const profile = await fetchMyProfile(session.access_token);
    setState({
      session,
      currentUser: profile,
      loading: false,
      isDemo: false,
      error: profile ? null : 'Profil introuvable. Contactez l\'admin.',
    });

    return !!profile;
  }, []);

  const loginDemo = useCallback((user: CrmUser) => {
    setState({
      currentUser: user,
      session: null,
      loading: false,
      isDemo: true,
      error: null,
    });
  }, []);

  const logout = useCallback(async () => {
    if (state.isDemo) {
      setState({ currentUser: null, session: null, loading: false, isDemo: true, error: null });
    } else {
      await authSignOut();
      // onAuthStateChange gère le SIGNED_OUT
    }
  }, [state.isDemo]);

  return { ...state, login, loginDemo, logout };
}
