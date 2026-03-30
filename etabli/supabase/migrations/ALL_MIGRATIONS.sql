-- ========================================================
-- SOS Hub Canada - TOUTES LES MIGRATIONS
-- Copier-coller dans le SQL Editor de Supabase Dashboard
-- https://supabase.com/dashboard/project/whwzfccxuumhqqnffxom/sql
-- ========================================================

-- ============ NETTOYAGE (si exécution précédente partielle) ============
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DROP TABLE IF EXISTS emails_sent CASCADE;
DROP TABLE IF EXISTS scoring_results CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS case_forms CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS client_documents CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP TYPE IF EXISTS email_type CASCADE;
DROP TYPE IF EXISTS scoring_type CASCADE;
DROP TYPE IF EXISTS fee_payeur CASCADE;
DROP TYPE IF EXISTS timeline_event_type CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS appointment_type CASCADE;
DROP TYPE IF EXISTS contract_status CASCADE;
DROP TYPE IF EXISTS form_status CASCADE;
DROP TYPE IF EXISTS case_priority CASCADE;
DROP TYPE IF EXISTS case_status CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS crm_role CASCADE;

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
  auth_id UUID UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role crm_role NOT NULL DEFAULT 'conseiller',
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);

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

-- Politique: insertions/modifications
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
CREATE POLICY "Auth users can insert/update users" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update users" ON users FOR UPDATE TO authenticated USING (true);

-- ========================================================
-- DONNÉES INITIALES (SEED)
-- ========================================================

INSERT INTO users (id, email, name, role, active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'marie@soshub.ca', 'Marie Tremblay', 'receptionniste', true),
  ('00000000-0000-0000-0000-000000000002', 'ahmed@soshub.ca', 'Ahmed Benali', 'conseiller', true),
  ('00000000-0000-0000-0000-000000000003', 'sophie@soshub.ca', 'Sophie Lavoie', 'technicienne_juridique', true),
  ('00000000-0000-0000-0000-000000000004', 'jp@soshub.ca', 'Me. Jean-Pierre Roy', 'avocat_consultant', true),
  ('00000000-0000-0000-0000-000000000005', 'fatima@soshub.ca', 'Fatima Zahra', 'coordinatrice', true);

INSERT INTO clients (id, first_name, last_name, email, phone, date_of_birth, nationality, current_country, current_status, passport_number, passport_expiry, address, city, province, postal_code, status, assigned_to, notes, language_english, language_french, education, work_experience, marital_status, dependants) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Carlos', 'Rodriguez', 'carlos@email.com', '+1-514-555-0101', '1990-05-15', 'Colombie', 'Canada', 'travailleur', 'CO1234567', '2028-03-20', '1234 Rue Saint-Denis', 'Montréal', 'QC', 'H2X 3K5', 'actif', '00000000-0000-0000-0000-000000000002', 'Intéressé par RP via PEQ - voie travailleurs', 'CLB 7', 'NCLC 8', 'Baccalauréat en informatique', '5 ans - Développeur logiciel (NOC 21232)', 'Marié', 1),
  ('10000000-0000-0000-0000-000000000002', 'Amina', 'Diallo', 'amina@email.com', '+1-514-555-0102', '1988-11-03', 'Sénégal', 'Canada', 'demandeur_asile', 'SN9876543', '2026-07-15', '567 Boul. René-Lévesque', 'Montréal', 'QC', 'H3B 1H7', 'actif', '00000000-0000-0000-0000-000000000004', 'Demande d''asile - persécution politique. Audience CISR planifiée pour avril 2024.', 'CLB 4', 'NCLC 9', 'Maîtrise en journalisme', '8 ans - Journaliste (NOC 51111)', 'Célibataire', 2),
  ('10000000-0000-0000-0000-000000000003', 'Wei', 'Zhang', 'wei@email.com', '+1-514-555-0103', '1995-02-28', 'Chine', 'Canada', 'etudiant', 'CN5555555', '2029-01-10', '890 Rue Sherbrooke Ouest', 'Montréal', 'QC', 'H3A 1G1', 'actif', '00000000-0000-0000-0000-000000000002', 'Finit sa maîtrise en mai 2024. Veut PTPD puis PEQ voie diplômés.', 'CLB 9', 'NCLC 6', 'Maîtrise en génie électrique (en cours)', '2 ans - Stage en ingénierie', 'Célibataire', 0),
  ('10000000-0000-0000-0000-000000000004', 'Fatima', 'Al-Hassan', 'fatima.h@email.com', '+1-514-555-0104', '1985-07-12', 'Syrie', 'Canada', 'personne_protegee', '', NULL, '321 Ave du Parc', 'Montréal', 'QC', 'H2V 4E7', 'actif', '00000000-0000-0000-0000-000000000004', 'Personne protégée depuis 2023. Demande de RP en cours.', 'CLB 3', 'NCLC 5', 'Diplôme d''études secondaires', '3 ans - Couturière', 'Veuve', 3),
  ('10000000-0000-0000-0000-000000000005', 'Jean-Baptiste', 'Nguema', 'jb@email.com', '+1-438-555-0105', '1992-03-19', 'Cameroun', 'Canada', 'travailleur', 'CM3333333', '2027-09-01', '456 Rue Jean-Talon', 'Montréal', 'QC', 'H2R 1S9', 'actif', '00000000-0000-0000-0000-000000000003', 'Profil très fort pour Entrée express FSW. Score CRS estimé: 485.', 'CLB 8', 'NCLC 10', 'Maîtrise en génie civil', '6 ans - Ingénieur civil (NOC 21300)', 'Célibataire', 0),
  ('10000000-0000-0000-0000-000000000006', 'Priya', 'Sharma', 'priya@email.com', '+1-514-555-0106', '1993-09-08', 'Inde', 'Inde', 'etranger', 'IN8888888', '2030-05-20', '15 MG Road', 'New Delhi', '', '110001', 'prospect', '00000000-0000-0000-0000-000000000002', 'Consultation initiale demandée. Intérêt pour permis d''études au Québec.', 'CLB 8', 'NCLC 4', 'Baccalauréat en commerce', '4 ans - Analyste financier', 'Célibataire', 0),
  ('10000000-0000-0000-0000-000000000007', 'Mohamed', 'Bouazizi', 'mohamed.b@email.com', '+1-438-555-0107', '1987-12-01', 'Tunisie', 'Canada', 'resident_permanent', 'TN4444444', '2028-11-15', '789 Boul. Saint-Laurent', 'Montréal', 'QC', 'H2T 1R2', 'actif', '00000000-0000-0000-0000-000000000003', 'RP depuis 2020. Veut la citoyenneté.', 'CLB 6', 'NCLC 10', 'Doctorat en pharmacie', '10 ans - Pharmacien', 'Marié', 2);

INSERT INTO family_members (client_id, relationship, first_name, last_name, date_of_birth, nationality, passport_number, accompany) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Épouse', 'Maria', 'Rodriguez', '1992-08-22', 'Colombie', 'CO7654321', true),
  ('10000000-0000-0000-0000-000000000002', 'Fils', 'Ibrahim', 'Diallo', '2015-04-10', 'Sénégal', 'SN1111111', true),
  ('10000000-0000-0000-0000-000000000002', 'Fille', 'Fatou', 'Diallo', '2018-09-25', 'Sénégal', 'SN2222222', true),
  ('10000000-0000-0000-0000-000000000004', 'Fils', 'Omar', 'Al-Hassan', '2010-01-05', 'Syrie', '', true),
  ('10000000-0000-0000-0000-000000000004', 'Fille', 'Layla', 'Al-Hassan', '2012-06-18', 'Syrie', '', true),
  ('10000000-0000-0000-0000-000000000004', 'Fils', 'Hassan', 'Al-Hassan', '2016-11-30', 'Syrie', '', true),
  ('10000000-0000-0000-0000-000000000007', 'Épouse', 'Salma', 'Bouazizi', '1990-04-15', 'Tunisie', 'TN5555555', true),
  ('10000000-0000-0000-0000-000000000007', 'Fils', 'Youssef', 'Bouazizi', '2019-07-22', 'Canada', '', true);

INSERT INTO cases (id, client_id, program_id, title, status, assigned_to, assigned_lawyer, priority, deadline, ircc_app_number, uci_number, notes) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'pnp-peq', 'PEQ - Voie travailleurs', 'en_preparation', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'normale', '2024-06-30', '', '1234-5678', 'CSQ en cours de traitement au MIFI'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'asile-inland', 'Demande d''asile - Persécution politique', 'formulaires_remplis', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'urgente', '2024-04-15', 'ASY-2024-00123', '2345-6789', 'Audience CISR planifiée le 15 avril 2024.'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'pgwp', 'PTPD - Post-diplôme', 'soumis', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'haute', '2024-05-01', 'WP-2024-00456', '3456-7890', 'Demande soumise le 8 mars.'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'protected-person-pr', 'RP - Personne protégée', 'en_traitement_ircc', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'haute', NULL, 'PR-2023-00789', '4567-8901', 'En traitement IRCC. ARC reçu en février.'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'ee-fsw', 'Entrée express - FSW', 'consultation', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'normale', '2024-09-01', '', '5678-9012', 'Score CRS estimé: 485. Avec bonus francophone: ~515.'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000007', 'citizenship-adult', 'Citoyenneté canadienne', 'en_preparation', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'normale', '2024-06-01', '', '6789-0123', 'Vérification des jours de présence physique en cours.');

INSERT INTO timeline_events (case_id, date, type, description, user_id) VALUES
  ('20000000-0000-0000-0000-000000000001', '2024-01-20', 'note', 'Consultation initiale - évaluation profil PEQ travailleurs', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000001', '2024-02-15', 'status_change', 'Dossier passé en préparation', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000001', '2024-03-05', 'form_update', 'IMM 5476 rempli - représentant désigné', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', '2024-02-01', 'note', 'Ouverture dossier d''asile - récit initial recueilli', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000002', '2024-02-16', 'form_update', 'Formulaire FDA (BOC) complété et soumis à la CISR', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000002', '2024-03-05', 'status_change', 'Tous les formulaires remplis - en attente audience', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000002', '2024-03-12', 'document', 'Preuves documentaires reçues du Sénégal', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000003', '2024-03-08', 'status_change', 'Demande PTPD soumise en ligne à IRCC', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000004', '2023-12-15', 'status_change', 'Dossier RP soumis à IRCC', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000004', '2024-02-20', 'ircc_update', 'Accusé de réception (ARC) reçu d''IRCC', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000004', '2024-03-10', 'document', 'Examen médical complété chez le médecin désigné', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000005', '2024-02-10', 'note', 'Première consultation - évaluation profil Entrée express', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000005', '2024-03-15', 'note', 'En attente des résultats TEF et de l''ECA de WES', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000006', '2024-03-01', 'note', 'Ouverture dossier citoyenneté - calcul présence physique', '00000000-0000-0000-0000-000000000003');

INSERT INTO appointments (client_id, case_id, user_id, title, date, time, duration, type, status, notes) VALUES
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Suivi PEQ - Documents manquants', '2024-03-18', '10:00', 30, 'suivi', 'planifie', 'Vérifier relevés emploi et attestation MIFI'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Préparation audience CISR', '2024-03-19', '14:00', 90, 'preparation_entrevue', 'confirme', 'Revoir le narratif FDA'),
  ('10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Consultation EE - Résultats TEF', '2024-03-20', '09:30', 60, 'consultation_initiale', 'planifie', 'Analyser résultats TEF'),
  ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Signature documents RP', '2024-03-21', '11:00', 45, 'signature', 'planifie', 'Signer les formulaires finaux'),
  ('10000000-0000-0000-0000-000000000006', NULL, '00000000-0000-0000-0000-000000000002', 'Consultation initiale - Permis d''études', '2024-03-22', '15:00', 60, 'consultation_initiale', 'planifie', 'Évaluation profil'),
  ('10000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Révision formulaire citoyenneté', '2024-03-25', '10:00', 45, 'revision_formulaires', 'planifie', 'Vérifier calcul jours de présence');

-- ========================================================
-- PHASE 2: AUTH TRIGGER
-- ========================================================

-- Trigger: auto-créer profil CRM quand un utilisateur s'inscrit via Supabase Auth
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
