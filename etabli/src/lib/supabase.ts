// ========================================================
// SOS Hub Canada - Client Supabase
// ========================================================
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Sanitize env-var string : Vercel CLI/dashboard ajoute parfois un
// `\n` de fin dans les valeurs, et le client Supabase n'accepte pas
// une URL avec des espaces/newlines — on trim systematiquement.
const clean = (v: string | undefined): string => (v || '').trim();

// Vérifie si Supabase est configuré
export function isSupabaseReady(): boolean {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return Boolean(url && key && !url.includes('VOTRE-PROJET') && !url.includes('placeholder'));
}

// Client côté navigateur — créé avec les valeurs disponibles
// Si les env vars sont vides au build, le client est créé avec des placeholders
// et les appels échoueront gracieusement
const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL) || 'https://placeholder.supabase.co';
const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'placeholder';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client côté serveur (pour les API routes, bypass RLS)
export function createServiceClient() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server config missing');
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
