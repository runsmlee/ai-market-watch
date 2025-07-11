-- Create DNA Match Reports table
CREATE TABLE IF NOT EXISTS dna_match_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_data JSONB NOT NULL,
  analysis_results JSONB NOT NULL,
  pdf_url TEXT,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_dna_match_reports_email ON dna_match_reports(email);
CREATE INDEX idx_dna_match_reports_created_at ON dna_match_reports(created_at DESC);
CREATE INDEX idx_dna_match_reports_company_name ON dna_match_reports(company_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE dna_match_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for collecting emails)
CREATE POLICY "Allow public insert" ON dna_match_reports
  FOR INSERT TO public
  WITH CHECK (true);

-- Only authenticated users can read
CREATE POLICY "Allow authenticated read" ON dna_match_reports
  FOR SELECT TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dna_match_reports_updated_at
  BEFORE UPDATE ON dna_match_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();