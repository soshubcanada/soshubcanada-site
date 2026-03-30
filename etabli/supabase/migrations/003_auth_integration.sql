-- ========================================================
-- Phase 2: Intégration Supabase Auth
-- Lie les utilisateurs CRM aux comptes Supabase Auth
-- ========================================================

-- Ajouter la colonne auth_id pour lier à auth.users
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Index pour recherche rapide par auth_id
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Fonction trigger: créer automatiquement un profil CRM
-- quand un utilisateur s'inscrit via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, email, name, role, active)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::crm_role, 'conseiller'),
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    auth_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Politique RLS: les utilisateurs peuvent lire leur propre profil
CREATE POLICY IF NOT EXISTS "users_read_own_profile"
  ON users FOR SELECT
  USING (auth_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.role IN ('coordinatrice', 'avocat_consultant')
  ));

-- Politique RLS: coordinatrice et avocat peuvent voir tous les utilisateurs
-- (déjà couvert par la politique ci-dessus avec le OR)

-- Créer les comptes Supabase Auth pour les utilisateurs démo
-- (à exécuter manuellement ou via le dashboard Supabase)
-- Note: Les mots de passe sont temporaires, à changer après première connexion
--
-- Comptes démo:
-- marie@soshub.ca    / SosHub2026!  (réceptionniste)
-- ahmed@soshub.ca    / SosHub2026!  (conseiller)
-- sophie@soshub.ca   / SosHub2026!  (technicienne juridique)
-- jp@soshub.ca       / SosHub2026!  (avocat-consultant)
-- fatima@soshub.ca   / SosHub2026!  (coordinatrice)
