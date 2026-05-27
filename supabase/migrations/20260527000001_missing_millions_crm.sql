-- Migration: Missing Millions CRM Core Tables
-- Prefix: sales_ (namespace isolation within shared Supabase project)

-- Pipeline stages for seller funnel
CREATE TABLE IF NOT EXISTS sales_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_num INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed pipeline stages
INSERT INTO sales_pipeline_stages (name, order_num) VALUES
  ('Not Ready', 1),
  ('Nurturing', 2),
  ('Considering', 3),
  ('Appraisal', 4),
  ('Listing', 5),
  ('Sold', 6),
  ('Lost', 7)
ON CONFLICT DO NOTHING;

-- CRM contacts
CREATE TABLE IF NOT EXISTS sales_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  assigned_agent TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  pipeline_stage_id UUID REFERENCES sales_pipeline_stages(id),
  provenance TEXT DEFAULT 'Manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact-to-property links (many-to-many)
CREATE TABLE IF NOT EXISTS sales_contact_property_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES sales_contacts(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes (call, sms, email, meeting, appraisal, general)
CREATE TABLE IF NOT EXISTS sales_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES sales_contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks with follow-up dates
CREATE TABLE IF NOT EXISTS sales_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES sales_contacts(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Audit trail
CREATE TABLE IF NOT EXISTS sales_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_cpl_property_id ON sales_contact_property_links(property_id);
CREATE INDEX IF NOT EXISTS idx_sales_cpl_contact_id ON sales_contact_property_links(contact_id);
CREATE INDEX IF NOT EXISTS idx_sales_contacts_pipeline ON sales_contacts(pipeline_stage_id);
CREATE INDEX IF NOT EXISTS idx_sales_notes_contact ON sales_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_contact ON sales_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_due ON sales_tasks(due_date) WHERE status = 'pending';

-- RLS: authenticated users only (shared office model)
ALTER TABLE sales_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_contact_property_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated access" ON sales_pipeline_stages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated access" ON sales_contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated access" ON sales_contact_property_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated access" ON sales_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated access" ON sales_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated access" ON sales_activity_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
