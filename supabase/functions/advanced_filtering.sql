-- Advanced filtering function for startups
-- This function provides server-side filtering with multiple parameters

CREATE OR REPLACE FUNCTION filter_startups(
  p_categories text[] DEFAULT NULL,
  p_locations text[] DEFAULT NULL,
  p_year_from int DEFAULT NULL,
  p_year_to int DEFAULT NULL,
  p_search_term text DEFAULT NULL,
  p_funding_min numeric DEFAULT NULL,
  p_funding_max numeric DEFAULT NULL,
  p_limit int DEFAULT 1000,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id bigint,
  metadata jsonb,
  total_count bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_count bigint;
BEGIN
  -- Create a temporary table for filtered results
  CREATE TEMP TABLE temp_filtered AS
  SELECT 
    sv.id,
    sv.metadata,
    CASE 
      WHEN sv.metadata->>'Total funding raised' ~ '^\$?[0-9.]+[Bb]$' THEN
        REGEXP_REPLACE(sv.metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric * 1000000000
      WHEN sv.metadata->>'Total funding raised' ~ '^\$?[0-9.]+[Mm]$' THEN
        REGEXP_REPLACE(sv.metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric * 1000000
      WHEN sv.metadata->>'Total funding raised' ~ '^\$?[0-9.]+[Kk]$' THEN
        REGEXP_REPLACE(sv.metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric * 1000
      WHEN sv.metadata->>'Total funding raised' ~ '^\$?[0-9.]+$' THEN
        REGEXP_REPLACE(sv.metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric
      ELSE 0
    END as funding_amount
  FROM startup_vectors sv
  WHERE 
    -- Category filter
    (p_categories IS NULL OR sv.metadata->>'Category' = ANY(p_categories))
    -- Location filter
    AND (p_locations IS NULL OR sv.metadata->>'Location' = ANY(p_locations))
    -- Year range filter
    AND (p_year_from IS NULL OR (sv.metadata->>'Year Founded')::int >= p_year_from)
    AND (p_year_to IS NULL OR (sv.metadata->>'Year Founded')::int <= p_year_to)
    -- Search filter (searches in multiple fields)
    AND (p_search_term IS NULL OR (
      sv.metadata->>'Company Name' ILIKE '%' || p_search_term || '%' OR
      sv.metadata->>'One-line description' ILIKE '%' || p_search_term || '%' OR
      sv.metadata->>'Category' ILIKE '%' || p_search_term || '%' OR
      sv.metadata->>'CEO' ILIKE '%' || p_search_term || '%' OR
      sv.metadata->>'Key technological/business advantage' ILIKE '%' || p_search_term || '%'
    ));

  -- Get total count before funding filter and pagination
  SELECT COUNT(*) INTO v_total_count FROM temp_filtered
  WHERE 
    (p_funding_min IS NULL OR funding_amount >= p_funding_min)
    AND (p_funding_max IS NULL OR funding_amount <= p_funding_max);

  -- Return paginated results with funding filter
  RETURN QUERY
  SELECT 
    tf.id,
    tf.metadata,
    v_total_count
  FROM temp_filtered tf
  WHERE 
    (p_funding_min IS NULL OR tf.funding_amount >= p_funding_min)
    AND (p_funding_max IS NULL OR tf.funding_amount <= p_funding_max)
  ORDER BY tf.metadata->>'Company Name'
  LIMIT p_limit
  OFFSET p_offset;

  -- Clean up
  DROP TABLE temp_filtered;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION filter_startups(text[], text[], int, int, text, numeric, numeric, int, int) TO anon;
GRANT EXECUTE ON FUNCTION filter_startups(text[], text[], int, int, text, numeric, numeric, int, int) TO authenticated;