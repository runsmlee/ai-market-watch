// Script to display migration SQL for Supabase
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20250111_create_dna_match_reports.sql');

console.log('📋 Supabase Migration Instructions\n');
console.log('Project: AI Market Watch');
console.log('Migration: Create DNA Match Reports Table and Storage\n');

console.log('=== Option 1: Run in Supabase Dashboard ===');
console.log('1. Go to: https://supabase.com/dashboard/project/sgogyjibcpuwvlxvxzow/sql/new');
console.log('2. Copy and paste the SQL below');
console.log('3. Click "Run"\n');

console.log('=== Option 2: Use Supabase CLI (if you have database password) ===');
console.log('supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.sgogyjibcpuwvlxvxzow.supabase.co:5432/postgres"\n');

console.log('=== SQL Migration ===\n');

try {
  const sql = fs.readFileSync(migrationFile, 'utf8');
  console.log(sql);
} catch (error) {
  console.error('Error reading migration file:', error.message);
}

console.log('\n=== After Migration ===');
console.log('Run these queries to verify:');
console.log('SELECT COUNT(*) FROM public.dna_match_reports;');
console.log('SELECT * FROM storage.buckets WHERE id = \'dna-reports\';');