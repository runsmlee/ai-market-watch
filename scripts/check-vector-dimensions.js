require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkVectorDimensions() {
  try {
    console.log('🔍 Checking vector dimensions and data structure...\n');
    
    // Get a sample vector to check dimensions
    const { data: vectors, error } = await supabase
      .from('startup_vectors')
      .select('id, embedding, metadata')
      .limit(1);
      
    if (error) {
      console.error('❌ Error accessing vectors:', error.message);
      return;
    }
    
    if (!vectors || vectors.length === 0) {
      console.log('❌ No vectors found');
      return;
    }
    
    const sampleVector = vectors[0];
    console.log('📊 Sample vector info:');
    console.log('- Vector ID:', sampleVector.id);
    console.log('- Embedding type:', typeof sampleVector.embedding);
    console.log('- Metadata company:', sampleVector.metadata?.company?.company_name || 'N/A');
    
    if (sampleVector.embedding) {
      if (Array.isArray(sampleVector.embedding)) {
        console.log('- Embedding dimensions:', sampleVector.embedding.length);
        console.log('- First 5 values:', sampleVector.embedding.slice(0, 5));
      } else {
        console.log('- Embedding is not an array, type:', typeof sampleVector.embedding);
        console.log('- Embedding value:', String(sampleVector.embedding).substring(0, 100) + '...');
      }
    } else {
      console.log('- No embedding data found');
    }
    
    // Check table schema
    console.log('\n🗄️ Checking startup_vectors table schema...');
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'startup_vectors');
        
      if (schemaError) {
        console.log('⚠️ Could not access schema info:', schemaError.message);
      } else if (schemaData) {
        console.log('Table columns:');
        schemaData.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      }
    } catch (schemaErr) {
      console.log('⚠️ Schema check failed:', schemaErr.message);
    }
    
    // Try to determine correct vector dimensions
    console.log('\n🎯 Determining correct RPC function signature...');
    
    if (sampleVector.embedding && Array.isArray(sampleVector.embedding)) {
      const dimensions = sampleVector.embedding.length;
      console.log(`\n✅ SOLUTION: Use vector(${dimensions}) instead of vector(1536)`);
      
      console.log('\n📝 Corrected function would be:');
      console.log(`CREATE OR REPLACE FUNCTION search_companies_hybrid(
  query_embedding vector(${dimensions}),
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
    1 - (sv.embedding <=> query_embedding) as vector_similarity
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
$$;`);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

if (require.main === module) {
  checkVectorDimensions()
    .then(() => {
      console.log('\n🎯 Vector dimension check completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { checkVectorDimensions }; 