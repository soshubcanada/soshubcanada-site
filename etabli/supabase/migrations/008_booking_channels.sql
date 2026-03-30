-- ========================================================
-- Migration 008: Table booking_channels
-- Canaux de reservation dynamiques (style Calendly)
-- Permet de creer des liens /rdv/slug pour n'importe quel
-- service, departement ou employe
-- ========================================================

CREATE TABLE IF NOT EXISTS booking_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  email TEXT NOT NULL,
  cc_emails TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  color TEXT DEFAULT '#D4A03C',
  duration INTEGER DEFAULT 30,
  types TEXT[] DEFAULT ARRAY['Consultation', 'Suivi', 'Juridique', 'Administratif'],
  assign_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour lookup par slug (public API)
CREATE INDEX IF NOT EXISTS idx_booking_channels_slug
  ON booking_channels (slug)
  WHERE active = true;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_booking_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_channels_updated_at
  BEFORE UPDATE ON booking_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_channels_updated_at();

-- Seed les deux canaux par defaut
INSERT INTO booking_channels (slug, name, title, email, cc_emails, bio, color, duration, types)
VALUES
  (
    'equipe-sos',
    'Equipe SOS Hub',
    'Consultation generale',
    'info@soshubcanada.com',
    '{}',
    'Notre equipe d''experts en relocalisation et services d''etablissement',
    '#D4A03C',
    30,
    ARRAY['Consultation', 'Suivi', 'Juridique', 'Administratif']
  ),
  (
    'patrick-cadet',
    'Patrick Cadet',
    'Directeur general',
    'pcadet@soshubcanada.com',
    ARRAY['info@soshubcanada.com'],
    'Plus de 10 ans d''experience en relocalisation et services aux nouveaux arrivants',
    '#1B2559',
    30,
    ARRAY['Consultation', 'Suivi', 'Juridique', 'Administratif']
  )
ON CONFLICT (slug) DO NOTHING;

-- Activer Realtime sur booking_channels
ALTER PUBLICATION supabase_realtime ADD TABLE booking_channels;

-- RLS: lecture publique (API channels), ecriture authentifiee
ALTER TABLE booking_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active channels"
  ON booking_channels FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users manage channels"
  ON booking_channels FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
