-- ========================================================
-- Migration 009: Comptes Supabase Auth pour le staff reel
-- Cree les comptes auth + le trigger handle_new_auth_user()
-- lie automatiquement au profil CRM existant via email
-- ========================================================
--
-- IMPORTANT: Cette migration utilise la fonction Supabase Admin
-- auth.create_user() disponible uniquement via le SQL Editor
-- du dashboard Supabase ou supabase-js admin API.
--
-- Alternative: creer les comptes via le Dashboard Supabase
-- sous Authentication > Users > Add User, puis executer
-- uniquement les UPDATEs ci-dessous pour lier les auth_id.
--
-- Apres creation, envoyer un email de reset password a chaque
-- employe pour qu'ils definissent leur propre mot de passe.
-- ========================================================

-- Methode recommandee: creer via Supabase Admin API (JS)
-- dans une route API temporaire ou un script Node.js:
--
-- const { data, error } = await supabase.auth.admin.createUser({
--   email: 'pcadet@soshubcanada.com',
--   password: 'TempPassword2026!',
--   email_confirm: true,
--   user_metadata: { name: 'P. Cadet', role: 'superadmin' },
-- });
--
-- Le trigger handle_new_auth_user() (migration 003) fera
-- automatiquement ON CONFLICT (email) DO UPDATE SET auth_id

-- ========================================================
-- Comptes staff a creer:
-- ========================================================
--
-- | Email                        | Role                    | Nom         |
-- |------------------------------|-------------------------|-------------|
-- | pcadet@soshubcanada.com      | superadmin              | P. Cadet    |
-- | akabeche@soshubcanada.com    | coordinatrice           | A. Kabeche  |
-- | sguerrier@soshubcanada.com   | coordinatrice           | S. Guerrier |
-- | direction@soshubcanada.com   | coordinatrice           | Direction   |
-- | nsaadou@soshubcanada.com     | technicienne_juridique  | N. Saadou   |
-- | sloulidi@soshubcanada.com    | technicienne_juridique  | S. Loulidi  |
-- | fmadjer@soshubcanada.com     | receptionniste          | F. Madjer   |

-- ========================================================
-- S'assurer que les profils CRM existent dans la table users
-- (seront lies au auth_id par le trigger lors de la creation)
-- ========================================================

INSERT INTO users (id, email, name, role, active)
VALUES
  (gen_random_uuid(), 'pcadet@soshubcanada.com', 'P. Cadet', 'superadmin', true),
  (gen_random_uuid(), 'akabeche@soshubcanada.com', 'A. Kabeche', 'coordinatrice', true),
  (gen_random_uuid(), 'sguerrier@soshubcanada.com', 'S. Guerrier', 'coordinatrice', true),
  (gen_random_uuid(), 'direction@soshubcanada.com', 'Direction', 'coordinatrice', true),
  (gen_random_uuid(), 'nsaadou@soshubcanada.com', 'N. Saadou', 'technicienne_juridique', true),
  (gen_random_uuid(), 'sloulidi@soshubcanada.com', 'S. Loulidi', 'technicienne_juridique', true),
  (gen_random_uuid(), 'fmadjer@soshubcanada.com', 'F. Madjer', 'receptionniste', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  active = true;
