-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create or update the search_companies_hybrid function
CREATE OR REPLACE FUNCTION search_companies_hybrid(
  query_embedding vector(1536),
  search_text text DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_locations text[] DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id text,
  company_name text,
  one_line_description text,
  location text,
  category text,
  total_funding_raised text,
  year_founded integer,
  company_slug text,
  vector_similarity float,
  -- Add all additional fields from startup_details
  ceo text,
  previous_experience_of_ceo text,
  key_members text,
  team_size text,
  webpage text,
  current_stage_status text,
  target_customer text,
  main_value_proposition text,
  key_products_solutions_portfolio text,
  industry_verticals_served text,
  uvp text,
  key_technological_business_advantage text,
  patents_ip_if_public text,
  key_partnerships_collaborations text,
  main_competitors_2_3 text,
  how_they_differentiate text,
  market_positioning text,
  geographic_competition_focus text,
  latest_funding_round text,
  key_investors text,
  basic_growth_metrics text,
  notable_customers text,
  major_milestones text,
  updated_date text,
  vector_id integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id::text,
    sd.company_name,
    sd.one_line_description,
    sd.location,
    sd.category,
    sd.total_funding_raised,
    sd.year_founded,
    sd.company_slug,
    1 - (sv.embedding <=> query_embedding) as vector_similarity,
    -- Return all additional fields
    sd.ceo,
    sd.previous_experience_of_ceo,
    sd.key_members,
    sd.team_size,
    sd.webpage,
    sd.current_stage_status,
    sd.target_customer,
    sd.main_value_proposition,
    sd.key_products_solutions_portfolio,
    sd.industry_verticals_served,
    sd.uvp,
    sd.key_technological_business_advantage,
    sd.patents_ip_if_public,
    sd.key_partnerships_collaborations,
    sd.main_competitors_2_3,
    sd.how_they_differentiate,
    sd.market_positioning,
    sd.geographic_competition_focus,
    sd.latest_funding_round,
    sd.key_investors,
    sd.basic_growth_metrics,
    sd.notable_customers,
    sd.major_milestones,
    sd.updated_date,
    sd.vector_id
  FROM startup_details sd
  JOIN startup_vectors sv ON sd.vector_id = sv.id
  WHERE 
    (p_categories IS NULL OR sd.category = ANY(p_categories))
    AND (p_locations IS NULL OR sd.location LIKE ANY(ARRAY['%' || loc || '%' for loc in p_locations]))
    AND (search_text IS NULL OR 
         sd.company_name ILIKE '%' || search_text || '%' OR
         sd.one_line_description ILIKE '%' || search_text || '%')
  ORDER BY vector_similarity DESC
  LIMIT p_limit;
END;
$$;

-- Create vector similarity search function (simpler version)
CREATE OR REPLACE FUNCTION search_companies_by_vector(
  query_embedding vector(1536),
  p_limit integer DEFAULT 20,
  similarity_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id text,
  company_name text,
  one_line_description text,
  location text,
  category text,
  total_funding_raised text,
  year_founded integer,
  company_slug text,
  vector_similarity float,
  -- Add all additional fields from startup_details
  ceo text,
  previous_experience_of_ceo text,
  key_members text,
  team_size text,
  webpage text,
  current_stage_status text,
  target_customer text,
  main_value_proposition text,
  key_products_solutions_portfolio text,
  industry_verticals_served text,
  uvp text,
  key_technological_business_advantage text,
  patents_ip_if_public text,
  key_partnerships_collaborations text,
  main_competitors_2_3 text,
  how_they_differentiate text,
  market_positioning text,
  geographic_competition_focus text,
  latest_funding_round text,
  key_investors text,
  basic_growth_metrics text,
  notable_customers text,
  major_milestones text,
  updated_date text,
  vector_id integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id::text,
    sd.company_name,
    sd.one_line_description,
    sd.location,
    sd.category,
    sd.total_funding_raised,
    sd.year_founded,
    sd.company_slug,
    1 - (sv.embedding <=> query_embedding) as vector_similarity,
    -- Return all additional fields
    sd.ceo,
    sd.previous_experience_of_ceo,
    sd.key_members,
    sd.team_size,
    sd.webpage,
    sd.current_stage_status,
    sd.target_customer,
    sd.main_value_proposition,
    sd.key_products_solutions_portfolio,
    sd.industry_verticals_served,
    sd.uvp,
    sd.key_technological_business_advantage,
    sd.patents_ip_if_public,
    sd.key_partnerships_collaborations,
    sd.main_competitors_2_3,
    sd.how_they_differentiate,
    sd.market_positioning,
    sd.geographic_competition_focus,
    sd.latest_funding_round,
    sd.key_investors,
    sd.basic_growth_metrics,
    sd.notable_customers,
    sd.major_milestones,
    sd.updated_date,
    sd.vector_id
  FROM startup_details sd
  JOIN startup_vectors sv ON sd.vector_id = sv.id
  WHERE 1 - (sv.embedding <=> query_embedding) > similarity_threshold
  ORDER BY vector_similarity DESC
  LIMIT p_limit;
END;
$$;

-- Create index on vector embeddings for better performance (if not exists)
CREATE INDEX IF NOT EXISTS startup_vectors_embedding_idx 
ON startup_vectors USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create function to get vector by startup detail id
CREATE OR REPLACE FUNCTION get_startup_vector_by_detail_id(detail_id text)
RETURNS vector(1536)
LANGUAGE plpgsql
AS $$
DECLARE
  result_vector vector(1536);
BEGIN
  SELECT sv.embedding INTO result_vector
  FROM startup_vectors sv
  JOIN startup_details sd ON sd.vector_id = sv.id
  WHERE sd.id = detail_id;
  
  RETURN result_vector;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION search_companies_hybrid IS 'Hybrid search combining vector similarity and text filtering';
COMMENT ON FUNCTION search_companies_by_vector IS 'Pure vector similarity search with threshold';
COMMENT ON FUNCTION get_startup_vector_by_detail_id IS 'Get vector embedding by startup detail ID';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_companies_hybrid TO public;
GRANT EXECUTE ON FUNCTION search_companies_by_vector TO public;
GRANT EXECUTE ON FUNCTION get_startup_vector_by_detail_id TO public;

-- Verify the functions were created
SELECT 
  routine_name, 
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name LIKE 'search_companies%' 
   OR routine_name = 'get_startup_vector_by_detail_id'; 