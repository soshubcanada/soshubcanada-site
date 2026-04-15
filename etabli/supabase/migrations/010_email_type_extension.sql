-- ========================================================
-- Migration 010 : Extension du type email_type
-- Ajoute les valeurs 'analysis' et 'premium_report' a l'enum
-- pour supporter :
--   - envoi manuel d'analyse depuis /crm/analyse-admissibilite
--   - envoi automatique du rapport premium a J+1 (cron)
-- ========================================================
--
-- Postgres exige d'ajouter les valeurs ALTER TYPE ... ADD VALUE
-- hors transaction, donc on les execute individuellement.
-- Idempotent grace a IF NOT EXISTS (Postgres 12+).
-- ========================================================

ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'analysis';
ALTER TYPE email_type ADD VALUE IF NOT EXISTS 'premium_report';

-- ------------------------------------------------
-- Index pour accelerer les requetes du cron
-- auto-followup / premium-followup (duplicate check)
-- ------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_emails_client_type
  ON emails_sent (client_id, type);

-- ------------------------------------------------
-- Index pour les requetes par fenetre temporelle
-- (cron cherche les clients crees il y a 23-24h)
-- ------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_created_status
  ON clients (status, created_at);
