-- Dashboard statistics function
-- This function calculates various statistics for the dashboard

CREATE OR REPLACE FUNCTION get_dashboard_statistics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  result := json_build_object(
    'total_companies', (
      SELECT COUNT(*) 
      FROM startup_vectors
    ),
    'total_funding', (
      SELECT SUM(
        CASE 
          WHEN metadata->>'Total funding raised' ~ '^\$?[0-9.]+[Bb]$' THEN
            REGEXP_REPLACE(metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric * 1000000000
          WHEN metadata->>'Total funding raised' ~ '^\$?[0-9.]+[Mm]$' THEN
            REGEXP_REPLACE(metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric * 1000000
          WHEN metadata->>'Total funding raised' ~ '^\$?[0-9.]+[Kk]$' THEN
            REGEXP_REPLACE(metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric * 1000
          WHEN metadata->>'Total funding raised' ~ '^\$?[0-9.]+$' THEN
            REGEXP_REPLACE(metadata->>'Total funding raised', '[^0-9.]', '', 'g')::numeric
          ELSE 0
        END
      ) 
      FROM startup_vectors
      WHERE metadata->>'Total funding raised' IS NOT NULL 
        AND metadata->>'Total funding raised' != ''
        AND metadata->>'Total funding raised' != 'N/A'
    ),
    'avg_year_founded', (
      SELECT ROUND(AVG((metadata->>'Year Founded')::numeric))
      FROM startup_vectors
      WHERE metadata->>'Year Founded' ~ '^\d{4}$'
    ),
    'category_distribution', (
      SELECT json_agg(
        json_build_object(
          'category', category,
          'count', count,
          'percentage', ROUND((count * 100.0 / total_count)::numeric, 1)
        ) ORDER BY count DESC
      )
      FROM (
        SELECT 
          metadata->>'Category' as category,
          COUNT(*) as count,
          SUM(COUNT(*)) OVER () as total_count
        FROM startup_vectors
        WHERE metadata->>'Category' IS NOT NULL
        GROUP BY metadata->>'Category'
        ORDER BY count DESC
        LIMIT 15
      ) t
    ),
    'location_distribution', (
      SELECT json_agg(
        json_build_object(
          'location', location,
          'count', count,
          'percentage', ROUND((count * 100.0 / total_count)::numeric, 1)
        ) ORDER BY count DESC
      )
      FROM (
        SELECT 
          metadata->>'Location' as location,
          COUNT(*) as count,
          SUM(COUNT(*)) OVER () as total_count
        FROM startup_vectors
        WHERE metadata->>'Location' IS NOT NULL
        GROUP BY metadata->>'Location'
        ORDER BY count DESC
        LIMIT 15
      ) t
    ),
    'year_distribution', (
      SELECT json_agg(
        json_build_object(
          'year', year,
          'count', count
        ) ORDER BY year DESC
      )
      FROM (
        SELECT 
          (metadata->>'Year Founded')::int as year,
          COUNT(*) as count
        FROM startup_vectors
        WHERE metadata->>'Year Founded' ~ '^\d{4}$'
          AND (metadata->>'Year Founded')::int >= 2010
        GROUP BY (metadata->>'Year Founded')::int
        ORDER BY year DESC
      ) t
    ),
    'funding_stage_distribution', (
      SELECT json_agg(
        json_build_object(
          'stage', stage,
          'count', count
        ) ORDER BY count DESC
      )
      FROM (
        SELECT 
          COALESCE(metadata->>'Current stage/status', 'Unknown') as stage,
          COUNT(*) as count
        FROM startup_vectors
        GROUP BY COALESCE(metadata->>'Current stage/status', 'Unknown')
        ORDER BY count DESC
        LIMIT 10
      ) t
    ),
    'last_updated', NOW()
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_dashboard_statistics() TO anon;
GRANT EXECUTE ON FUNCTION get_dashboard_statistics() TO authenticated;