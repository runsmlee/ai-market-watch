// Script to create Supabase tables and storage buckets
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// NOTE: To create tables and buckets, we need service role key, not anon key
// For now, this script will output SQL that needs to be run in Supabase Dashboard

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function createResources() {
  console.log('📋 Supabase Resources Creation Script\n');
  console.log('Since we only have anon key, please run the following SQL in Supabase Dashboard:');
  console.log('Dashboard URL: https://supabase.com/dashboard/project/sgogyjibcpuwvlxvxzow/sql/new\n');
  
  console.log('=== STEP 1: Create DNA Match Reports Table ===\n');
  
  const createTableSQL = `
-- Create DNA Match Reports table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dna_match_reports_email ON public.dna_match_reports(email);
CREATE INDEX IF NOT EXISTS idx_dna_match_reports_created_at ON public.dna_match_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dna_match_reports_company_name ON public.dna_match_reports(company_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.dna_match_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for collecting emails)
CREATE POLICY "Allow public insert" ON public.dna_match_reports
  FOR INSERT TO public
  WITH CHECK (true);

-- Only authenticated users can read
CREATE POLICY "Allow authenticated read" ON public.dna_match_reports
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
DROP TRIGGER IF EXISTS update_dna_match_reports_updated_at ON public.dna_match_reports;
CREATE TRIGGER update_dna_match_reports_updated_at
  BEFORE UPDATE ON public.dna_match_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

  console.log(createTableSQL);
  
  console.log('\n=== STEP 2: Create Storage Bucket ===\n');
  
  const createBucketSQL = `
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

CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'dna-reports');

CREATE POLICY "Allow public update" ON storage.objects
  FOR UPDATE TO public
  USING (bucket_id = 'dna-reports');

CREATE POLICY "Allow public delete" ON storage.objects
  FOR DELETE TO public
  USING (bucket_id = 'dna-reports');
`;

  console.log(createBucketSQL);
  
  console.log('\n=== STEP 3: Verify Creation ===\n');
  console.log('After running the SQL above, you can verify with:');
  console.log(`
-- Check if table was created
SELECT * FROM public.dna_match_reports LIMIT 1;

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'dna-reports';
`);

  // Test connection with existing resources
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n=== Testing Current Connection ===\n');
    
    // Test existing table
    const { data, error } = await supabase
      .from('startup_vectors')
      .select('id')
      .limit(1);
      
    if (error) {
      console.log('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase');
      console.log('✅ startup_vectors table is accessible');
    }
  }
}

createResources();