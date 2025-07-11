-- Migration: Create DNA Match Reports Table and Storage
-- Date: 2025-01-11
-- Description: Creates table for DNA match email reports and storage bucket for PDFs

-- 1. Create DNA Match Reports table
CREATE TABLE IF NOT EXISTS public.dna_match_reports (
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

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dna_match_reports_email 
  ON public.dna_match_reports(email);
CREATE INDEX IF NOT EXISTS idx_dna_match_reports_created_at 
  ON public.dna_match_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dna_match_reports_company_name 
  ON public.dna_match_reports(company_name);

-- 3. Enable Row Level Security
ALTER TABLE public.dna_match_reports ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Allow anyone to insert (for collecting emails)
CREATE POLICY "Enable insert for all users" ON public.dna_match_reports
  FOR INSERT TO public
  WITH CHECK (true);

-- Only authenticated users can read
CREATE POLICY "Enable read for authenticated users" ON public.dna_match_reports
  FOR SELECT TO authenticated
  USING (true);

-- 5. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger
DROP TRIGGER IF EXISTS update_dna_match_reports_updated_at ON public.dna_match_reports;
CREATE TRIGGER update_dna_match_reports_updated_at
  BEFORE UPDATE ON public.dna_match_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create storage bucket for DNA reports
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  avif_autodetection, 
  file_size_limit, 
  allowed_mime_types
)
VALUES (
  'dna-reports',
  'dna-reports', 
  true, -- Public bucket for easy access
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 8. Create storage policies
-- Allow public read
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'dna-reports');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dna-reports');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'dna-reports' AND owner = auth.uid()::text);

-- Allow authenticated users to delete their own files  
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'dna-reports' AND owner = auth.uid()::text);

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.dna_match_reports TO anon, authenticated;
GRANT USAGE ON SEQUENCE dna_match_reports_id_seq TO anon, authenticated;

-- 10. Add helpful comments
COMMENT ON TABLE public.dna_match_reports IS 'Stores DNA match analysis reports sent via email';
COMMENT ON COLUMN public.dna_match_reports.email IS 'Recipient email address';
COMMENT ON COLUMN public.dna_match_reports.company_name IS 'Name of the startup being analyzed';
COMMENT ON COLUMN public.dna_match_reports.company_data IS 'Original form data submitted by user';
COMMENT ON COLUMN public.dna_match_reports.analysis_results IS 'Complete analysis results from n8n';
COMMENT ON COLUMN public.dna_match_reports.pdf_url IS 'URL to the generated PDF report in storage';
COMMENT ON COLUMN public.dna_match_reports.email_sent_at IS 'Timestamp when email was sent';

-- Verification queries
-- SELECT COUNT(*) FROM public.dna_match_reports;
-- SELECT * FROM storage.buckets WHERE id = 'dna-reports';