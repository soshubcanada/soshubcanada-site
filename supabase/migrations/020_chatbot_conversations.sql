-- ============================================================
-- SOS Hub Canada · Chatbot SOSIA Client B2C
-- Migration : 020_chatbot_conversations
-- Objet : Tables de logging des conversations visiteurs <> SOSIA
-- ============================================================
--
-- Contexte : widget de chat flottant sur soshub.ca + soshubcanada.com.
-- Persiste chaque session visiteur, chaque message, et suit les
-- événements de conversion (capture email, push vers /peq).
--
-- Remarque : la table `clients` est optionnelle (référence lead CRM).
-- Si elle n'existe pas dans ce projet Supabase, la FOREIGN KEY
-- retombe silencieusement sur NULL via ON DELETE SET NULL. Pour
-- un déploiement propre, retirer la contrainte ci-dessous si la
-- table `clients` n'est pas provisionnée sur cette instance.

-- ------------------------------------------------------------
-- chatbot_conversations · une ligne par session visiteur
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          TEXT        NOT NULL UNIQUE,
  lead_id             UUID        NULL,
  visitor_email       TEXT        NULL,
  visitor_name        TEXT        NULL,
  source_url          TEXT        NULL,
  message_count       INT         NOT NULL DEFAULT 0,
  user_agent          TEXT        NULL,
  conversion_event    TEXT        NULL,
  converted_to_lead   BOOLEAN     NOT NULL DEFAULT FALSE,
  converted_at        TIMESTAMPTZ NULL,
  total_tokens        INT         NOT NULL DEFAULT 0,
  total_cost_usd      NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK vers clients : appliquée seulement si la table existe.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'clients'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'chatbot_conversations_lead_id_fkey'
        AND table_name = 'chatbot_conversations'
    ) THEN
      ALTER TABLE chatbot_conversations
        ADD CONSTRAINT chatbot_conversations_lead_id_fkey
        FOREIGN KEY (lead_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------
-- chatbot_messages · une ligne par message (user ou assistant)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID        NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role             TEXT        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content          TEXT        NOT NULL,
  tokens           INT         NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Index · optimisés pour les requêtes fréquentes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions
  ON chatbot_conversations (session_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_conv_messages
  ON chatbot_messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chatbot_leads
  ON chatbot_conversations (lead_id)
  WHERE lead_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chatbot_converted
  ON chatbot_conversations (converted_to_lead, created_at DESC)
  WHERE converted_to_lead = TRUE;

CREATE INDEX IF NOT EXISTS idx_chatbot_last_message
  ON chatbot_conversations (last_message_at DESC);

-- ------------------------------------------------------------
-- Row Level Security · lecture/écriture serveur uniquement
-- ------------------------------------------------------------
-- Les endpoints Next.js utilisent la service_role_key côté serveur.
-- On bloque anon pour éviter qu'un visiteur ne lise d'autres sessions.
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages      ENABLE ROW LEVEL SECURITY;

-- Policy : service_role contourne RLS automatiquement · aucune
-- policy pour anon, donc lecture/écriture client bloquée.
-- Si on veut permettre à un visiteur de relire sa propre session,
-- il faudra une policy basée sur un JWT custom (non pertinent MVP).

-- ------------------------------------------------------------
-- Vue analytique · conversions par jour
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW chatbot_daily_metrics AS
SELECT
  DATE(created_at)                                AS day,
  COUNT(*)                                        AS sessions,
  COUNT(*) FILTER (WHERE message_count >= 2)      AS engaged_sessions,
  COUNT(*) FILTER (WHERE visitor_email IS NOT NULL) AS email_captures,
  COUNT(*) FILTER (WHERE converted_to_lead)       AS conversions,
  COALESCE(SUM(message_count), 0)                 AS total_messages,
  COALESCE(SUM(total_tokens), 0)                  AS total_tokens,
  COALESCE(SUM(total_cost_usd), 0)                AS total_cost_usd
FROM chatbot_conversations
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- ============================================================
-- Fin migration 020
-- ============================================================
