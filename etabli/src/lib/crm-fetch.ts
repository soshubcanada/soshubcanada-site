// ========================================================
// SOS Hub Canada — Authenticated CRM fetch helper
// Wraps fetch() with Supabase Bearer token injection
// ========================================================

import { supabase } from './supabase';

/**
 * Fetch wrapper that automatically adds the Supabase JWT
 * to the Authorization header for CRM API calls.
 * Falls through without token in demo mode (no session).
 */
export async function crmFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers = new Headers(options?.headers);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  } catch {
    // Demo mode or Supabase not configured — proceed without token
  }

  // Don't override Content-Type for FormData (browser sets multipart boundary)
  if (options?.body instanceof FormData) {
    headers.delete('Content-Type');
  }

  return fetch(url, { ...options, headers });
}
