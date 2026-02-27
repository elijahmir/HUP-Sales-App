-- Allow anonymous (null user_id) inserts for public form
ALTER TABLE sales_offer_submissions ALTER COLUMN user_id DROP NOT NULL;

-- Add tracking columns for anonymous submissions
ALTER TABLE sales_offer_submissions ADD COLUMN IF NOT EXISTS submitter_email TEXT;
ALTER TABLE sales_offer_submissions ADD COLUMN IF NOT EXISTS submitter_ip TEXT;
