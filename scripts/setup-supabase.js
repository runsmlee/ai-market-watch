// Script to set up Supabase tables and storage
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabase() {
  console.log('Setting up Supabase...\n');

  // Test connection
  const { data: testData, error: testError } = await supabase
    .from('startup_vectors')
    .select('id')
    .limit(1);

  if (testError) {
    console.error('❌ Failed to connect to Supabase:', testError.message);
    console.log('\n⚠️  Please run the following SQL in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/sgogyjibcpuwvlxvxzow/sql/new\n');
    
    // Print SQL for manual execution
    console.log('-- 1. Create DNA Match Reports Table --');
    console.log(`
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

CREATE INDEX IF NOT EXISTS idx_dna_match_reports_email ON dna_match_reports(email);
CREATE INDEX IF NOT EXISTS idx_dna_match_reports_created_at ON dna_match_reports(created_at DESC);
`);

    console.log('\n-- 2. Create Storage Bucket --');
    console.log(`
INSERT INTO storage.buckets (id, name, public)
VALUES ('dna-reports', 'dna-reports', true)
ON CONFLICT (id) DO NOTHING;
`);
    
    return;
  }

  console.log('✅ Connected to Supabase successfully');
  
  // Check if table exists
  const { data: tableCheck } = await supabase
    .from('dna_match_reports')
    .select('id')
    .limit(1);
    
  if (!tableCheck) {
    console.log('ℹ️  Table dna_match_reports does not exist yet');
    console.log('   Please create it using the SQL above');
  } else {
    console.log('✅ Table dna_match_reports exists');
  }

  // Check storage bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'dna-reports');
  
  if (!bucketExists) {
    console.log('ℹ️  Storage bucket dna-reports does not exist yet');
    console.log('   Please create it using the SQL above');
  } else {
    console.log('✅ Storage bucket dna-reports exists');
  }
}

setupSupabase();