-- ========================================================
-- Migration 006: Prospect tracking, tasks, and follow-up
-- Adds: leads table, tasks table, tag columns
-- ========================================================

-- Create leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(100) DEFAULT 'website',
  name VARCHAR(500) NOT NULL,
  email VARCHAR(500) NOT NULL,
  phone VARCHAR(100),
  subject VARCHAR(500),
  message TEXT,
  form_data JSONB,
  status VARCHAR(50) DEFAULT 'new',
  tag VARCHAR(50) DEFAULT 'prospect',
  assigned_to UUID REFERENCES users(id),
  ip_address VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tag column to leads if it doesn't exist
DO $$ BEGIN
  ALTER TABLE leads ADD COLUMN IF NOT EXISTS tag VARCHAR(50) DEFAULT 'prospect';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add tag/status to clients if missing
DO $$ BEGIN
  ALTER TABLE clients ADD COLUMN IF NOT EXISTS current_status VARCHAR(50) DEFAULT 'prospect';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create tasks table for follow-up tracking
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  lead_id UUID,
  assigned_to UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_tag ON leads(tag);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- RLS policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage leads and tasks
CREATE POLICY IF NOT EXISTS "Authenticated users can manage leads"
  ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage tasks"
  ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anonymous inserts to leads (from website forms)
CREATE POLICY IF NOT EXISTS "Anyone can insert leads"
  ON leads FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role full access leads"
  ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access tasks"
  ON tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
