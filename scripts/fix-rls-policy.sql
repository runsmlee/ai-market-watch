-- Fix RLS policy for dna_match_reports table
-- Run this in Supabase Dashboard SQL Editor

-- Drop existing policy
DROP POLICY IF EXISTS "Enable insert for all users" ON public.dna_match_reports;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.dna_match_reports;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.dna_match_reports;

-- Create new policy that allows both anonymous and authenticated users to insert
CREATE POLICY "Allow public insert" ON public.dna_match_reports
  FOR INSERT 
  WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'dna_match_reports';