-- ========================================================
-- Migration 007: Activer Supabase Realtime sur les tables CRM
-- Permet le lien direct WebSocket pour sync instantanee
-- ========================================================

-- Activer Realtime sur les tables principales du CRM
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE emails_sent;

-- Ajouter colonnes CRM avancees si elles n'existent pas encore
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS refere_par TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS priorite TEXT DEFAULT 'moyenne';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_dernier_contact DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS prochaine_relance DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS numero_uci TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS numero_dossier_ircc TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_expiration_statut DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS programme_interet TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consentement_communication BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consentement_partage BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_consentement DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_inscription DATE;

-- Index pour les requetes de cron (relances, expirations)
CREATE INDEX IF NOT EXISTS idx_clients_prochaine_relance
  ON clients (prochaine_relance)
  WHERE prochaine_relance IS NOT NULL AND status NOT IN ('archive', 'annule');

CREATE INDEX IF NOT EXISTS idx_clients_expiration_statut
  ON clients (date_expiration_statut)
  WHERE date_expiration_statut IS NOT NULL AND status != 'archive';

CREATE INDEX IF NOT EXISTS idx_leads_status_created
  ON leads (status, created_at)
  WHERE status = 'new';
