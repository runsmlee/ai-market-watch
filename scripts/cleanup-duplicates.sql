-- SQL script to find and remove duplicate startups from startup_vectors table
-- This script keeps the newest entry for each company and deletes older duplicates

-- First, let's see what duplicates we have
WITH duplicate_companies AS (
  SELECT 
    id,
    created_at,
    -- Extract company name from different possible metadata structures
    COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) as company_name,
    -- Rank entries by creation date (newest first)
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(
        metadata->'metadata'->'output'->'company'->>'company_name',
        metadata->'output'->'company'->>'company_name',
        metadata->'metadata'->>'Company Name',
        metadata->>'Company Name'
      )
      ORDER BY created_at DESC
    ) as rn
  FROM startup_vectors
  WHERE 
    -- Only include entries that have a company name
    COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) IS NOT NULL
)
SELECT 
  company_name,
  COUNT(*) as total_entries,
  COUNT(*) - 1 as duplicates_to_delete
FROM duplicate_companies
GROUP BY company_name
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- To see the actual entries that would be deleted:
WITH duplicate_companies AS (
  SELECT 
    id,
    created_at,
    COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) as company_name,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(
        metadata->'metadata'->'output'->'company'->>'company_name',
        metadata->'output'->'company'->>'company_name',
        metadata->'metadata'->>'Company Name',
        metadata->>'Company Name'
      )
      ORDER BY created_at DESC
    ) as rn
  FROM startup_vectors
  WHERE 
    COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) IS NOT NULL
)
SELECT 
  id,
  company_name,
  created_at,
  CASE WHEN rn = 1 THEN 'KEEP' ELSE 'DELETE' END as action
FROM duplicate_companies
WHERE company_name IN (
  SELECT company_name 
  FROM duplicate_companies 
  GROUP BY company_name 
  HAVING COUNT(*) > 1
)
ORDER BY company_name, created_at;

-- ACTUAL DELETE STATEMENT
-- CAUTION: This will permanently delete duplicate entries!
-- Uncomment and run only after reviewing the results above
/*
WITH duplicate_companies AS (
  SELECT 
    id,
    created_at,
    COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) as company_name,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(
        metadata->'metadata'->'output'->'company'->>'company_name',
        metadata->'output'->'company'->>'company_name',
        metadata->'metadata'->>'Company Name',
        metadata->>'Company Name'
      )
      ORDER BY created_at DESC
    ) as rn
  FROM startup_vectors
  WHERE 
    COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) IS NOT NULL
)
DELETE FROM startup_vectors
WHERE id IN (
  SELECT id 
  FROM duplicate_companies 
  WHERE rn > 1  -- Delete all but the newest entry
);
*/

-- Create a function to automatically prevent duplicates in the future
CREATE OR REPLACE FUNCTION prevent_duplicate_startups()
RETURNS TRIGGER AS $$
DECLARE
  v_company_name TEXT;
  v_existing_id UUID;
BEGIN
  -- Extract company name from the new record
  v_company_name := COALESCE(
    NEW.metadata->'metadata'->'output'->'company'->>'company_name',
    NEW.metadata->'output'->'company'->>'company_name',
    NEW.metadata->'metadata'->>'Company Name',
    NEW.metadata->>'Company Name'
  );
  
  -- If we can't extract a company name, allow the insert
  IF v_company_name IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if a record with this company name already exists
  SELECT id INTO v_existing_id
  FROM startup_vectors
  WHERE id != NEW.id  -- Don't compare with itself (for updates)
    AND COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) = v_company_name
  LIMIT 1;
  
  -- If a duplicate exists, prevent the insert
  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Duplicate company "%" already exists with ID %', v_company_name, v_existing_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent future duplicates
-- Uncomment to enable automatic duplicate prevention
/*
DROP TRIGGER IF EXISTS prevent_duplicate_startups_trigger ON startup_vectors;
CREATE TRIGGER prevent_duplicate_startups_trigger
  BEFORE INSERT OR UPDATE ON startup_vectors
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_startups();
*/