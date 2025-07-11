-- SQL script to create automatic synchronization between startup_details and startup_vectors
-- This script creates a function and trigger to automatically link vector_id when new records are inserted

-- Step 1: Create a function to find and link matching startup_vectors
CREATE OR REPLACE FUNCTION sync_startup_vector_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if vector_id is NULL
  IF NEW.vector_id IS NULL AND NEW.company_name IS NOT NULL THEN
    -- Try to find matching startup_vector by company name
    SELECT sv.id INTO NEW.vector_id
    FROM startup_vectors sv
    WHERE NEW.company_name = COALESCE(
      sv.metadata->'metadata'->'output'->'company'->>'company_name',
      sv.metadata->'output'->'company'->>'company_name',
      sv.metadata->'metadata'->>'Company Name',
      sv.metadata->>'Company Name'
    )
    ORDER BY sv.created_at DESC
    LIMIT 1;
    
    -- Log the result for debugging (optional)
    IF NEW.vector_id IS NOT NULL THEN
      RAISE NOTICE 'Linked startup_details % with vector_id %', NEW.id, NEW.vector_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create trigger for INSERT operations
DROP TRIGGER IF EXISTS auto_sync_vector_id_on_insert ON startup_details;
CREATE TRIGGER auto_sync_vector_id_on_insert
  BEFORE INSERT ON startup_details
  FOR EACH ROW
  EXECUTE FUNCTION sync_startup_vector_id();

-- Step 3: Create trigger for UPDATE operations (when company_name changes)
DROP TRIGGER IF EXISTS auto_sync_vector_id_on_update ON startup_details;
CREATE TRIGGER auto_sync_vector_id_on_update
  BEFORE UPDATE ON startup_details
  FOR EACH ROW
  WHEN (OLD.company_name IS DISTINCT FROM NEW.company_name OR NEW.vector_id IS NULL)
  EXECUTE FUNCTION sync_startup_vector_id();

-- Step 4: Create a function to sync existing NULL vector_ids (for manual execution)
CREATE OR REPLACE FUNCTION sync_all_null_vector_ids()
RETURNS TABLE(updated_count INTEGER, details TEXT) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Update all startup_details with NULL vector_id
  WITH matched_companies AS (
    SELECT 
      sd.id as detail_id,
      sv.id as vector_id
    FROM startup_details sd
    JOIN startup_vectors sv ON 
      sd.company_name = COALESCE(
        sv.metadata->'metadata'->'output'->'company'->>'company_name',
        sv.metadata->'output'->'company'->>'company_name',
        sv.metadata->'metadata'->>'Company Name',
        sv.metadata->>'Company Name'
      )
    WHERE sd.vector_id IS NULL
  )
  UPDATE startup_details
  SET vector_id = mc.vector_id
  FROM matched_companies mc
  WHERE startup_details.id = mc.detail_id;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY 
  SELECT v_count, 'startup_details records updated with vector_id'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create a reverse trigger for when new startup_vectors are inserted
CREATE OR REPLACE FUNCTION sync_startup_details_from_vector()
RETURNS TRIGGER AS $$
DECLARE
  v_company_name TEXT;
  v_count INTEGER;
BEGIN
  -- Extract company name from the new vector
  v_company_name := COALESCE(
    NEW.metadata->'metadata'->'output'->'company'->>'company_name',
    NEW.metadata->'output'->'company'->>'company_name',
    NEW.metadata->'metadata'->>'Company Name',
    NEW.metadata->>'Company Name'
  );
  
  -- Update any matching startup_details that don't have a vector_id
  IF v_company_name IS NOT NULL THEN
    UPDATE startup_details
    SET vector_id = NEW.id
    WHERE company_name = v_company_name
      AND vector_id IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    IF v_count > 0 THEN
      RAISE NOTICE 'Updated % startup_details records with new vector_id %', v_count, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for new startup_vectors
DROP TRIGGER IF EXISTS auto_sync_details_on_vector_insert ON startup_vectors;
CREATE TRIGGER auto_sync_details_on_vector_insert
  AFTER INSERT ON startup_vectors
  FOR EACH ROW
  EXECUTE FUNCTION sync_startup_details_from_vector();

-- Step 7: Create a scheduled function for periodic cleanup (optional)
-- This can be called by a cron job or Supabase Edge Function
CREATE OR REPLACE FUNCTION periodic_vector_sync()
RETURNS TABLE(
  synced_count INTEGER,
  duplicate_check INTEGER,
  orphaned_details INTEGER
) AS $$
DECLARE
  v_synced INTEGER;
  v_duplicates INTEGER;
  v_orphans INTEGER;
BEGIN
  -- Sync NULL vector_ids
  SELECT updated_count INTO v_synced 
  FROM sync_all_null_vector_ids();
  
  -- Count potential duplicates (same company name in multiple vectors)
  SELECT COUNT(DISTINCT company_name) INTO v_duplicates
  FROM (
    SELECT COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    ) as company_name
    FROM startup_vectors
    GROUP BY company_name
    HAVING COUNT(*) > 1
  ) dup;
  
  -- Count orphaned details (no matching vector)
  SELECT COUNT(*) INTO v_orphans
  FROM startup_details sd
  WHERE sd.vector_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM startup_vectors sv
      WHERE sd.company_name = COALESCE(
        sv.metadata->'metadata'->'output'->'company'->>'company_name',
        sv.metadata->'output'->'company'->>'company_name',
        sv.metadata->'metadata'->>'Company Name',
        sv.metadata->>'Company Name'
      )
    );
  
  RETURN QUERY SELECT v_synced, v_duplicates, v_orphans;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_startup_details_company_name_vector_null 
  ON startup_details(company_name) 
  WHERE vector_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_startup_vectors_metadata_company_names 
  ON startup_vectors ((
    COALESCE(
      metadata->'metadata'->'output'->'company'->>'company_name',
      metadata->'output'->'company'->>'company_name',
      metadata->'metadata'->>'Company Name',
      metadata->>'Company Name'
    )
  ));

-- Usage examples:
-- 1. Manually sync all NULL vector_ids:
--    SELECT * FROM sync_all_null_vector_ids();
--
-- 2. Run periodic sync and get report:
--    SELECT * FROM periodic_vector_sync();
--
-- 3. Check current sync status:
--    SELECT 
--      COUNT(*) FILTER (WHERE vector_id IS NOT NULL) as linked,
--      COUNT(*) FILTER (WHERE vector_id IS NULL) as unlinked,
--      COUNT(*) as total
--    FROM startup_details;