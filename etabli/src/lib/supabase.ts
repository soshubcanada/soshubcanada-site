// ========================================================
// SOS Hub Canada - Client Supabase
// ========================================================
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Vérifie si Supabase est configuré
export function isSupabaseReady(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return Boolean(url && key && !url.includes('VOTRE-PROJET'));
}

// Client côté navigateur — créé avec les valeurs disponibles
// Si les env vars sont vides au build, le client est créé avec des placeholders
// et les appels échoueront gracieusement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client côté serveur (pour les API routes, bypass RLS)
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server config missing');
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
