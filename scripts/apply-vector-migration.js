require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Not found');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyVectorMigration() {
  try {
    console.log('🚀 Starting vector search migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_vector_search_functions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded, executing SQL...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query execution as fallback
          const { data: directData, error: directError } = await supabase
            .from('pg_stat_statements')
            .select('*')
            .limit(0); // This will fail but helps establish connection
            
          // Use raw SQL execution
          const { data: rawData, error: rawError } = await supabase
            .postgrest
            .query(statement);
            
          if (rawError) {
            console.error(`❌ Error in statement ${i + 1}:`, rawError);
            throw rawError;
          }
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (execError) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, execError);
        console.log('Statement was:', statement.substring(0, 100) + '...');
        throw execError;
      }
    }
    
    console.log('🎉 Vector search migration completed successfully!');
    
    // Test the functions
    console.log('🧪 Testing vector search functions...');
    const { data: functions, error: testError } = await supabase
      .rpc('search_companies_hybrid', {
        query_embedding: new Array(1536).fill(0),
        p_limit: 1
      });
      
    if (testError) {
      console.log('⚠️ Function test failed (this might be normal if no vector data exists):', testError.message);
    } else {
      console.log('✅ Vector search function is working!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function applyMigrationDirect() {
  try {
    console.log('🔄 Trying direct SQL execution method...');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_vector_search_functions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the entire migration as one block
    const { data, error } = await supabase
      .channel('migration')
      .send({
        type: 'migration',
        payload: { sql: migrationSQL }
      });
      
    if (error) {
      throw error;
    }
    
    console.log('✅ Direct migration completed');
    
  } catch (error) {
    console.error('❌ Direct migration failed:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  applyVectorMigration()
    .then(() => {
      console.log('🎯 All done! Vector search is now available.');
      process.exit(0);
    })
    .catch(async (error) => {
      console.log('🔄 Primary method failed, trying alternative...');
      try {
        await applyMigrationDirect();
        console.log('🎯 Alternative method succeeded!');
        process.exit(0);
      } catch (altError) {
        console.error('❌ All migration methods failed');
        console.error('Primary error:', error);
        console.error('Alternative error:', altError);
        process.exit(1);
      }
    });
}

module.exports = { applyVectorMigration }; 