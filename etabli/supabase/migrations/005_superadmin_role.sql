-- ========================================================
-- SOS Hub Canada — Migration: Ajout rôle superadmin
-- ========================================================

-- Ajouter 'superadmin' au enum crm_role
ALTER TYPE crm_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Insérer les vrais comptes employés (si pas déjà présents)
INSERT INTO users (email, name, role, active) VALUES
  ('pcadet@soshubcanada.com', 'P. Cadet', 'superadmin', true),
  ('akabeche@soshubcanada.com', 'A. Kabeche', 'coordinatrice', true),
  ('sguerrier@soshubcanada.com', 'S. Guerrier', 'coordinatrice', true),
  ('direction@soshubcanada.com', 'Direction', 'coordinatrice', true),
  ('nsaadou@soshubcanada.com', 'N. Saadou', 'technicienne_juridique', true),
  ('sloulidi@soshubcanada.com', 'S. Loulidi', 'technicienne_juridique', true),
  ('fmadjer@soshubcnada.com', 'F. Madjer', 'receptionniste', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role::crm_role,
  active = true;
