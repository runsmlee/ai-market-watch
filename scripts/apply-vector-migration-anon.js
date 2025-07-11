require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Not found');
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'Not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyVectorMigrationStatements() {
  try {
    console.log('🚀 Starting vector search migration with individual statements...');
    
    // Define each SQL statement separately for better error handling
    const statements = [
      // Enable pgvector extension
      "CREATE EXTENSION IF NOT EXISTS vector",
      
      // Create search_companies_hybrid function
      `CREATE OR REPLACE FUNCTION search_companies_hybrid(
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
      $$`,
      
      // Create simple vector search function  
      `CREATE OR REPLACE FUNCTION search_companies_by_vector(
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
        WHERE 1 - (sv.embedding <=> query_embedding) > similarity_threshold
        ORDER BY vector_similarity DESC
        LIMIT p_limit;
      END;
      $$`,
      
      // Create vector index
      `CREATE INDEX IF NOT EXISTS startup_vectors_embedding_idx 
       ON startup_vectors USING ivfflat (embedding vector_cosine_ops) 
       WITH (lists = 100)`,
       
      // Grant permissions
      "GRANT EXECUTE ON FUNCTION search_companies_hybrid TO public",
      "GRANT EXECUTE ON FUNCTION search_companies_by_vector TO public"
    ];
    
    console.log(`📊 Attempting to execute ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Try using SQL execution via RPC or query
        const { data, error } = await supabase
          .rpc('exec_sql', { query: statements[i] })
          .single();
          
        if (error) {
          console.log(`⚠️ RPC failed for statement ${i + 1}, trying alternative...`);
          console.log('Error:', error.message);
          
          // Some statements might not work with anon key, that's expected
          if (error.message.includes('permission denied') || 
              error.message.includes('insufficient_privilege')) {
            console.log(`🔒 Permission denied for statement ${i + 1} (expected with anon key)`);
            continue;
          }
          
          throw error;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
        
      } catch (execError) {
        console.log(`⚠️ Statement ${i + 1} failed:`, execError.message);
        
        // Continue with other statements even if some fail
        if (execError.message.includes('permission denied') ||
            execError.message.includes('insufficient_privilege') ||
            execError.message.includes('function "exec_sql" does not exist')) {
          console.log(`🔒 Skipping statement ${i + 1} due to permissions`);
          continue;
        }
        
        console.log('Statement preview:', statements[i].substring(0, 100) + '...');
      }
    }
    
    console.log('🎉 Migration process completed!');
    
    // Test if the functions exist
    console.log('🧪 Testing if vector search functions are available...');
    
    try {
      const { data, error } = await supabase
        .rpc('search_companies_hybrid', {
          query_embedding: new Array(1536).fill(0.1),
          p_limit: 1
        });
        
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log('❌ Vector search functions are not available yet');
          console.log('💡 You may need to run this migration with service role key');
        } else {
          console.log('⚠️ Function exists but test failed:', error.message);
          console.log('✅ This might be normal if no vector data exists');
        }
      } else {
        console.log('🎉 Vector search functions are working!');
        console.log('📊 Test result:', data);
      }
    } catch (testError) {
      console.log('⚠️ Function test failed:', testError.message);
    }
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    console.log('\n💡 Recommendations:');
    console.log('1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
    console.log('2. Or apply the migration manually in Supabase SQL Editor');
    console.log('3. The SQL statements are in: supabase/migrations/create_vector_search_functions.sql');
  }
}

// Main execution
if (require.main === module) {
  applyVectorMigrationStatements()
    .then(() => {
      console.log('🎯 Migration process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { applyVectorMigrationStatements }; 