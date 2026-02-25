CREATE TABLE saa_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed')),
    form_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    vendor_name TEXT,
    property_address TEXT,
    listing_price TEXT
);

-- Enable RLS
ALTER TABLE saa_submissions ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can insert their own SAA submissions" 
ON saa_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own SAA submissions" 
ON saa_submissions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own SAA submissions" 
ON saa_submissions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SAA submissions" 
ON saa_submissions FOR DELETE 
USING (auth.uid() = user_id);
