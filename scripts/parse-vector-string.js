require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function parseVectorString() {
  try {
    console.log('🔍 Analyzing vector string format...\n');
    
    // Get a sample vector
    const { data: vectors, error } = await supabase
      .from('startup_vectors')
      .select('id, embedding')
      .limit(1);
      
    if (error || !vectors || vectors.length === 0) {
      console.error('❌ Error accessing vectors:', error?.message || 'No data');
      return;
    }
    
    const sampleVector = vectors[0];
    const embeddingString = sampleVector.embedding;
    
    console.log('📊 Raw embedding string (first 200 chars):');
    console.log(embeddingString.substring(0, 200) + '...');
    
    try {
      // Try to parse as JSON array
      const embeddingArray = JSON.parse(embeddingString);
      
      if (Array.isArray(embeddingArray)) {
        console.log('\n✅ Successfully parsed as JSON array');
        console.log('📏 Vector dimensions:', embeddingArray.length);
        console.log('🔢 First 10 values:', embeddingArray.slice(0, 10));
        console.log('📊 Value types:', typeof embeddingArray[0]);
        
        // Generate corrected RPC function
        const dimensions = embeddingArray.length;
        
        console.log(`\n🛠️ SOLUTION: Create RPC function for ${dimensions}-dimensional vectors\n`);
        
        const correctedFunction = `-- Corrected RPC function for ${dimensions}-dimensional vectors
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
  query_vector vector(${dimensions});
BEGIN
  -- Convert text to vector
  query_vector := query_embedding_text::vector(${dimensions});
  
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
    1 - (sv.embedding::vector(${dimensions}) <=> query_vector) as vector_similarity
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
$$;`;

        console.log(correctedFunction);
        
        // Test vector conversion
        console.log('\n🧪 Testing vector string conversion...');
        console.log('Sample conversion test:');
        console.log('- Original string length:', embeddingString.length);
        console.log('- Parsed array length:', embeddingArray.length);
        console.log('- Array to string (first 100 chars):', JSON.stringify(embeddingArray).substring(0, 100) + '...');
        
        return { dimensions, embeddingArray, correctedFunction };
        
      } else {
        console.log('❌ Parsed result is not an array:', typeof embeddingArray);
      }
    } catch (parseError) {
      console.log('❌ Failed to parse as JSON:', parseError.message);
      
      // Try alternative parsing methods
      console.log('\n🔄 Trying alternative parsing methods...');
      
      // Check if it's a PostgreSQL array format
      if (embeddingString.startsWith('[') && embeddingString.endsWith(']')) {
        try {
          // Remove brackets and split by comma
          const values = embeddingString.slice(1, -1).split(',').map(s => parseFloat(s.trim()));
          console.log('✅ Parsed as PostgreSQL array format');
          console.log('📏 Vector dimensions:', values.length);
          console.log('🔢 First 10 values:', values.slice(0, 10));
          
          return { dimensions: values.length, embeddingArray: values };
        } catch (altError) {
          console.log('❌ Alternative parsing failed:', altError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

if (require.main === module) {
  parseVectorString()
    .then((result) => {
      if (result) {
        console.log('\n🎯 Vector analysis completed successfully.');
        console.log(`📏 Found ${result.dimensions}-dimensional vectors`);
      } else {
        console.log('\n❌ Vector analysis failed.');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { parseVectorString }; 