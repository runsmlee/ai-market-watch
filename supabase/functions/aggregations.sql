-- Aggregation functions for categories and locations
-- These functions provide quick access to filter options

-- Get all unique categories with counts
CREATE OR REPLACE FUNCTION get_all_categories()
RETURNS TABLE (
  category text,
  count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    metadata->>'Category' as category,
    COUNT(*) as count
  FROM startup_vectors
  WHERE metadata->>'Category' IS NOT NULL
    AND metadata->>'Category' != ''
  GROUP BY metadata->>'Category'
  ORDER BY count DESC, category ASC;
END;
$$;

-- Get all unique locations with counts
CREATE OR REPLACE FUNCTION get_all_locations()
RETURNS TABLE (
  location text,
  count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    metadata->>'Location' as location,
    COUNT(*) as count
  FROM startup_vectors
  WHERE metadata->>'Location' IS NOT NULL
    AND metadata->>'Location' != ''
  GROUP BY metadata->>'Location'
  ORDER BY count DESC, location ASC;
END;
$$;

-- Get funding stages with counts
CREATE OR REPLACE FUNCTION get_funding_stages()
RETURNS TABLE (
  stage text,
  count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(metadata->>'Current stage/status', 'Unknown') as stage,
    COUNT(*) as count
  FROM startup_vectors
  GROUP BY COALESCE(metadata->>'Current stage/status', 'Unknown')
  ORDER BY count DESC, stage ASC;
END;
$$;

-- Search companies with ranking
CREATE OR REPLACE FUNCTION search_companies(
  p_search_term text,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id bigint,
  company_name text,
  description text,
  category text,
  relevance_score numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.id,
    sv.metadata->>'Company Name' as company_name,
    sv.metadata->>'One-line description' as description,
    sv.metadata->>'Category' as category,
    (
      CASE WHEN sv.metadata->>'Company Name' ILIKE '%' || p_search_term || '%' THEN 10 ELSE 0 END +
      CASE WHEN sv.metadata->>'One-line description' ILIKE '%' || p_search_term || '%' THEN 5 ELSE 0 END +
      CASE WHEN sv.metadata->>'Category' ILIKE '%' || p_search_term || '%' THEN 3 ELSE 0 END +
      CASE WHEN sv.metadata->>'CEO' ILIKE '%' || p_search_term || '%' THEN 2 ELSE 0 END +
      CASE WHEN sv.metadata->>'Key technological/business advantage' ILIKE '%' || p_search_term || '%' THEN 1 ELSE 0 END
    )::numeric as relevance_score
  FROM startup_vectors sv
  WHERE 
    sv.metadata->>'Company Name' ILIKE '%' || p_search_term || '%' OR
    sv.metadata->>'One-line description' ILIKE '%' || p_search_term || '%' OR
    sv.metadata->>'Category' ILIKE '%' || p_search_term || '%' OR
    sv.metadata->>'CEO' ILIKE '%' || p_search_term || '%' OR
    sv.metadata->>'Key technological/business advantage' ILIKE '%' || p_search_term || '%'
  ORDER BY relevance_score DESC, company_name ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_all_categories() TO anon;
GRANT EXECUTE ON FUNCTION get_all_categories() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_locations() TO anon;
GRANT EXECUTE ON FUNCTION get_all_locations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_funding_stages() TO anon;
GRANT EXECUTE ON FUNCTION get_funding_stages() TO authenticated;
GRANT EXECUTE ON FUNCTION search_companies(text, int) TO anon;
GRANT EXECUTE ON FUNCTION search_companies(text, int) TO authenticated;