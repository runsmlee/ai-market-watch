require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testVectorSearch() {
  try {
    console.log('🔍 Testing vector search infrastructure...\n');
    
    // 1. Check startup_details table
    console.log('📊 Checking startup_details table...');
    const { data: startupDetails, error: detailsError } = await supabase
      .from('startup_details')
      .select('id, company_name, vector_id')
      .limit(5);
      
    if (detailsError) {
      console.error('❌ Error accessing startup_details:', detailsError.message);
    } else {
      console.log(`✅ Found ${startupDetails?.length || 0} startup_details records`);
      console.log('Sample records:', startupDetails?.slice(0, 3).map(r => ({
        id: r.id,
        company_name: r.company_name,
        vector_id: r.vector_id
      })));
    }
    
    // 2. Check startup_vectors table
    console.log('\n🔢 Checking startup_vectors table...');
    const { data: vectors, error: vectorsError } = await supabase
      .from('startup_vectors')
      .select('id, metadata')
      .limit(5);
      
    if (vectorsError) {
      console.error('❌ Error accessing startup_vectors:', vectorsError.message);
    } else {
      console.log(`✅ Found ${vectors?.length || 0} startup_vectors records`);
      console.log('Sample vector IDs:', vectors?.map(v => v.id));
    }
    
    // 3. Check vector linkage
    if (startupDetails && vectors && startupDetails.length > 0 && vectors.length > 0) {
      console.log('\n🔗 Checking vector linkage...');
      const linkedRecords = startupDetails.filter(d => d.vector_id);
      console.log(`📎 ${linkedRecords.length}/${startupDetails.length} startup_details have vector_id`);
      
      if (linkedRecords.length > 0) {
        const sampleVectorId = linkedRecords[0].vector_id;
        const { data: vectorData, error: vectorCheckError } = await supabase
          .from('startup_vectors')
          .select('id, metadata')
          .eq('id', sampleVectorId)
          .single();
          
        if (vectorCheckError) {
          console.log('⚠️ Vector linkage broken:', vectorCheckError.message);
        } else {
          console.log('✅ Vector linkage working, sample metadata:', vectorData?.metadata?.company?.company_name);
        }
      }
    }
    
    // 4. Test RPC function existence
    console.log('\n🛠️ Testing RPC functions...');
    
    try {
      // Create a dummy embedding (1536 dimensions)
      const dummyEmbedding = new Array(1536).fill(0.1);
      
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('search_companies_hybrid', {
          query_embedding: dummyEmbedding,
          p_limit: 1
        });
        
      if (rpcError) {
        console.error('❌ RPC function error:', rpcError.message);
        if (rpcError.message.includes('does not exist')) {
          console.log('💡 The search_companies_hybrid function needs to be created in Supabase');
        }
      } else {
        console.log('✅ RPC function exists and returned:', rpcData?.length, 'results');
        if (rpcData && rpcData.length > 0) {
          console.log('Sample result:', {
            company_name: rpcData[0].company_name,
            vector_similarity: rpcData[0].vector_similarity
          });
        }
      }
    } catch (rpcTestError) {
      console.error('❌ RPC test failed:', rpcTestError.message);
    }
    
    // 5. Test pgvector extension
    console.log('\n🧩 Testing pgvector extension...');
    try {
      const { data: extensionData, error: extensionError } = await supabase
        .from('pg_extension')
        .select('extname')
        .eq('extname', 'vector');
        
      if (extensionError) {
        console.log('⚠️ Could not check extensions:', extensionError.message);
      } else if (extensionData && extensionData.length > 0) {
        console.log('✅ pgvector extension is installed');
      } else {
        console.log('❌ pgvector extension not found');
      }
    } catch (extError) {
      console.log('⚠️ Extension check failed:', extError.message);
    }
    
    // Summary
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('1. Startup details table:', startupDetails ? '✅ Accessible' : '❌ Not accessible');
    console.log('2. Startup vectors table:', vectors ? '✅ Accessible' : '❌ Not accessible');
    console.log('3. Data linkage:', (startupDetails && vectors && startupDetails.some(d => d.vector_id)) ? '✅ Working' : '⚠️ Needs checking');
    console.log('4. OpenAI embeddings API:', process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' ? '✅ Configured' : '❌ Not configured');
    
    console.log('\n💡 RECOMMENDATIONS:');
    if (!vectors || vectors.length === 0) {
      console.log('- Run vector synchronization to populate startup_vectors table');
    }
    if (startupDetails && !startupDetails.some(d => d.vector_id)) {
      console.log('- Link startup_details records to their corresponding vectors');
    }
    console.log('- Ensure the search_companies_hybrid RPC function is created in Supabase');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testVectorSearch()
    .then(() => {
      console.log('\n🎯 Vector search diagnosis completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testVectorSearch }; 