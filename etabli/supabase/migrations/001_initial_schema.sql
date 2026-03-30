-- ========================================================
-- SOS Hub Canada - CRM Immigration
-- Migration initiale - Schéma complet
-- À exécuter dans Supabase SQL Editor
-- ========================================================

-- ============ EXTENSIONS ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ TYPES ENUM ============
CREATE TYPE crm_role AS ENUM ('receptionniste', 'conseiller', 'technicienne_juridique', 'avocat_consultant', 'coordinatrice');
CREATE TYPE client_status AS ENUM ('prospect', 'actif', 'en_attente', 'complete', 'archive');
CREATE TYPE case_status AS ENUM ('nouveau', 'consultation', 'en_preparation', 'formulaires_remplis', 'revision', 'soumis', 'en_traitement_ircc', 'approuve', 'refuse', 'appel', 'ferme');
CREATE TYPE case_priority AS ENUM ('basse', 'normale', 'haute', 'urgente');
CREATE TYPE form_status AS ENUM ('vide', 'en_cours', 'rempli', 'revise', 'approuve', 'signe');
CREATE TYPE contract_status AS ENUM ('brouillon', 'envoye', 'signe', 'actif', 'termine', 'annule');
CREATE TYPE appointment_type AS ENUM ('consultation_initiale', 'suivi', 'revision_formulaires', 'preparation_entrevue', 'signature', 'autre');
CREATE TYPE appointment_status AS ENUM ('planifie', 'confirme', 'en_cours', 'complete', 'annule', 'no_show');
CREATE TYPE timeline_event_type AS ENUM ('note', 'status_change', 'form_update', 'document', 'appointment', 'email', 'ircc_update');
CREATE TYPE fee_payeur AS ENUM ('client', 'employeur');
CREATE TYPE scoring_type AS ENUM ('crs', 'mifi');
CREATE TYPE email_type AS ENUM ('scoring_results', 'contract', 'appointment', 'general');

-- ============ TABLE: USERS ============
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role crm_role NOT NULL DEFAULT 'conseiller',
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ TABLE: CLIENTS ============
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  date_of_birth DATE,
  nationality TEXT NOT NULL DEFAULT '',
  current_country TEXT NOT NULL DEFAULT 'Canada',
  current_status TEXT NOT NULL DEFAULT '',
  passport_number TEXT NOT NULL DEFAULT '',
  passport_expiry DATE,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  status client_status NOT NULL DEFAULT 'prospect',
  assigned_to UUID REFERENCES users(id),
  notes TEXT NOT NULL DEFAULT '',
  language_english TEXT NOT NULL DEFAULT '',
  language_french TEXT NOT NULL DEFAULT '',
  education TEXT NOT NULL DEFAULT '',
  work_experience TEXT NOT NULL DEFAULT '',
  marital_status TEXT NOT NULL DEFAULT '',
  dependants INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX idx_clients_email ON clients(email);

-- ============ TABLE: FAMILY_MEMBERS ============
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT NOT NULL DEFAULT '',
  passport_number TEXT NOT NULL DEFAULT '',
  accompany BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_family_members_client ON family_members(client_id);

-- ============ TABLE: CLIENT_DOCUMENTS ============
CREATE TABLE client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_documents_client ON client_documents(client_id);

-- ============ TABLE: CASES ============
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'nouveau',
  assigned_to UUID REFERENCES users(id),
  assigned_lawyer UUID REFERENCES users(id),
  priority case_priority NOT NULL DEFAULT 'normale',
  deadline DATE,
  ircc_app_number TEXT NOT NULL DEFAULT '',
  uci_number TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_program ON cases(program_id);

-- ============ TABLE: CASE_FORMS ============
CREATE TABLE case_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  form_id TEXT NOT NULL,
  status form_status NOT NULL DEFAULT 'vide',
  filled_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  data JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_forms_case ON case_forms(case_id);

-- ============ TABLE: TIMELINE_EVENTS ============
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type timeline_event_type NOT NULL DEFAULT 'note',
  description TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_case ON timeline_events(case_id);
CREATE INDEX idx_timeline_date ON timeline_events(date DESC);

-- ============ TABLE: CONTRACTS ============
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  tier_id TEXT NOT NULL DEFAULT '',
  status contract_status NOT NULL DEFAULT 'brouillon',
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  government_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  government_fee_payeur fee_payeur NOT NULL DEFAULT 'client',
  frais_ouverture NUMERIC(10,2) NOT NULL DEFAULT 250,
  tps NUMERIC(10,2) NOT NULL DEFAULT 0,
  tvq NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  installments JSONB NOT NULL DEFAULT '[]',
  payment_plan TEXT NOT NULL DEFAULT 'immediat',
  created_by UUID REFERENCES users(id),
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_case ON contracts(case_id);
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- ============ TABLE: APPOINTMENTS ============
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  type appointment_type NOT NULL DEFAULT 'autre',
  status appointment_status NOT NULL DEFAULT 'planifie',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);

-- ============ TABLE: SCORING_RESULTS ============
CREATE TABLE scoring_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scoring_type scoring_type NOT NULL,
  score INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}',
  advice JSONB NOT NULL DEFAULT '[]',
  profile_snapshot JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scoring_client ON scoring_results(client_id);
CREATE INDEX idx_scoring_case ON scoring_results(case_id);

-- ============ TABLE: EMAILS_SENT ============
CREATE TABLE emails_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type email_type NOT NULL DEFAULT 'general',
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_emails_client ON emails_sent(client_id);

-- ============ TRIGGERS: auto-update updated_at ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_sent ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs authentifiés peuvent tout lire
-- (en production, affiner par rôle)
CREATE POLICY "Authenticated users can read all" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read family_members" ON family_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read client_documents" ON client_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read cases" ON cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read case_forms" ON case_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read timeline_events" ON timeline_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read contracts" ON contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read appointments" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read scoring_results" ON scoring_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read emails_sent" ON emails_sent FOR SELECT TO authenticated USING (true);

-- Politique: insertions/modifications via service role (API routes)
-- ou utilisateurs authentifiés pour les tables courantes
CREATE POLICY "Auth users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can insert cases" ON cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update cases" ON cases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can insert case_forms" ON case_forms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update case_forms" ON case_forms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can insert timeline_events" ON timeline_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can insert contracts" ON contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update contracts" ON contracts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update appointments" ON appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can insert scoring_results" ON scoring_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can insert emails_sent" ON emails_sent FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can manage family_members" ON family_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth users can manage client_documents" ON client_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
