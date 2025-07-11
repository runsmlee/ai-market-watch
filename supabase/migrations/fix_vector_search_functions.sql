-- Fix vector search functions to handle text-stored vectors
-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS search_companies_hybrid(vector, text, text[], text[], integer);

-- Create corrected RPC function for 1536-dimensional vectors stored as text
CREATE OR REPLACE FUNCTION search_companies_hybrid(
  query_embedding_text text,
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
  vector_similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_vector vector(1536);
BEGIN
  -- Convert text to vector
  query_vector := query_embedding_text::vector(1536);
  
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
    1 - (sv.embedding::vector(1536) <=> query_vector) as vector_similarity
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

-- Create simpler vector search function
CREATE OR REPLACE FUNCTION search_companies_by_vector(
  query_embedding_text text,
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
  vector_similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_vector vector(1536);
BEGIN
  -- Convert text to vector
  query_vector := query_embedding_text::vector(1536);
  
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
    1 - (sv.embedding::vector(1536) <=> query_vector) as vector_similarity
  FROM startup_details sd
  JOIN startup_vectors sv ON sd.vector_id = sv.id
  WHERE 1 - (sv.embedding::vector(1536) <=> query_vector) > similarity_threshold
  ORDER BY vector_similarity DESC
  LIMIT p_limit;
END;
$$;

-- Create index on vector embeddings for better performance (if not exists)
CREATE INDEX IF NOT EXISTS startup_vectors_embedding_idx 
ON startup_vectors USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Add comments for documentation
COMMENT ON FUNCTION search_companies_hybrid IS 'Hybrid search combining vector similarity and text filtering - handles text-stored vectors';
COMMENT ON FUNCTION search_companies_by_vector IS 'Pure vector similarity search with threshold - handles text-stored vectors';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_companies_hybrid TO public;
GRANT EXECUTE ON FUNCTION search_companies_by_vector TO public;

-- Test the function
SELECT 
  'Testing search_companies_hybrid function...' as status,
  count(*) as function_exists
FROM information_schema.routines 
WHERE routine_name = 'search_companies_hybrid'; 