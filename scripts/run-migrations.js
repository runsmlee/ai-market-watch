// Script to run Supabase migrations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

console.log('Note: These migrations should be run via Supabase Dashboard SQL Editor');
console.log('Go to: https://supabase.com/dashboard/project/sgogyjibcpuwvlxvxzow/sql/new');
console.log('\n--- Migration 1: Create DNA Match Reports Table ---\n');

const migration1 = `
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
`;

console.log(migration1);

console.log('\n--- Migration 2: Create Storage Bucket ---\n');

const migration2 = `
-- Create storage bucket for DNA reports
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'dna-reports',
  'dna-reports', 
  true, -- Public bucket for easy access via URL
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'dna-reports');

CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'dna-reports');

CREATE POLICY "Allow authenticated users to update" ON storage.objects
  FOR UPDATE TO public
  USING (bucket_id = 'dna-reports');

CREATE POLICY "Allow authenticated users to delete" ON storage.objects
  FOR DELETE TO public
  USING (bucket_id = 'dna-reports');
`;

console.log(migration2);

console.log('\n✅ Copy the above SQL and run it in the Supabase SQL Editor');
console.log('Dashboard link: https://supabase.com/dashboard/project/sgogyjibcpuwvlxvxzow/sql/new');