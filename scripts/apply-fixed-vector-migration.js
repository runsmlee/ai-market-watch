require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyFixedVectorMigration() {
  try {
    console.log('🚀 Applying fixed vector search migration...\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'fix_vector_search_functions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration loaded. Testing function with actual data...');
    
    // First test if we can call the current function to see what happens
    console.log('\n🧪 Testing current function state...');
    
    try {
      const testEmbedding = JSON.stringify(new Array(1536).fill(0.1));
      
      const { data: testData, error: testError } = await supabase
        .rpc('search_companies_hybrid', {
          query_embedding_text: testEmbedding,
          p_limit: 1
        });
        
      if (testError) {
        console.log('❌ Current function error:', testError.message);
        console.log('💡 This confirms we need to apply the migration');
      } else {
        console.log('✅ Function already working!', testData?.length, 'results');
        if (testData && testData.length > 0) {
          console.log('Sample result:', {
            company_name: testData[0].company_name,
            similarity: testData[0].vector_similarity
          });
          
          console.log('\n🎉 Vector search is already working! No migration needed.');
          return;
        }
      }
    } catch (funcTestError) {
      console.log('⚠️ Function test failed:', funcTestError.message);
    }
    
    console.log('\n📝 The migration needs to be applied manually in Supabase SQL Editor');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/sgogyjibcpuwvlxvxzow/sql/new');
    console.log('\n📋 Copy and paste this SQL:');
    console.log('=' * 80);
    console.log(migrationSQL);
    console.log('=' * 80);
    
    console.log('\n🎯 After applying the migration, test again with:');
    console.log('curl "http://localhost:3002/api/startups/search?q=artificial+intelligence+medical+diagnostics&limit=3"');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
  }
}

if (require.main === module) {
  applyFixedVectorMigration()
    .then(() => {
      console.log('\n🎯 Migration guidance completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { applyFixedVectorMigration }; 