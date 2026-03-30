-- ========================================================
-- SOS Hub Canada — Migration: Gestion documentaire avancée
-- Expand client_documents + Create employer_documents
-- ========================================================

-- Expand client_documents table
ALTER TABLE client_documents
  ADD COLUMN IF NOT EXISTS file_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'autre',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'televerse',
  ADD COLUMN IF NOT EXISTS file_size bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mime_type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS uploaded_by uuid,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS case_id uuid;

-- Create employer_documents table
CREATE TABLE IF NOT EXISTS employer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id text NOT NULL,
  name text NOT NULL,
  file_name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'autre',
  status text NOT NULL DEFAULT 'televerse',
  file_path text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid,
  verified_at timestamptz,
  verified_by uuid,
  expiry_date date,
  version integer NOT NULL DEFAULT 1,
  notes text,
  lmia_id text
);

CREATE INDEX IF NOT EXISTS idx_employer_documents_employer ON employer_documents(employer_id);

-- RLS
ALTER TABLE employer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage employer documents"
  ON employer_documents FOR ALL
  USING (auth.role() = 'authenticated');

-- Ensure client_documents RLS policy exists
DO $$ BEGIN
  CREATE POLICY "Authenticated users can manage client documents"
    ON client_documents FOR ALL
    USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
