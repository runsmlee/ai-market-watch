#!/usr/bin/env node

/**
 * Script to sync startup_details with startup_vectors
 * Can be run manually or scheduled with cron
 * 
 * Usage:
 *   npm run sync-vectors          # Run sync
 *   npm run sync-vectors -- --dry-run  # Check what would be synced
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found. Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SyncResult {
  synced_count: number;
  duplicate_check: number;
  orphaned_details: number;
}

async function runSync(dryRun: boolean = false) {
  console.log('🔄 Starting startup vector synchronization...\n');

  try {
    if (dryRun) {
      // In dry run mode, just check what would be synced
      const { data: nullVectors, error: nullError } = await supabase
        .from('startup_details')
        .select('id, company_name')
        .is('vector_id', null);

      if (nullError) throw nullError;

      console.log(`📊 Found ${nullVectors?.length || 0} startup_details with NULL vector_id\n`);

      if (nullVectors && nullVectors.length > 0) {
        console.log('Companies that would be synced:');
        nullVectors.forEach((detail, index) => {
          console.log(`${index + 1}. ${detail.company_name} (ID: ${detail.id})`);
        });
      }
    } else {
      // Run the actual sync
      const { data, error } = await supabase
        .rpc('periodic_vector_sync')
        .single<SyncResult>();

      if (error) throw error;

      console.log('✅ Sync completed successfully!\n');
      console.log(`📊 Sync Results:`);
      console.log(`   - Newly linked records: ${data.synced_count}`);
      console.log(`   - Companies with duplicates: ${data.duplicate_check}`);
      console.log(`   - Orphaned details (no matching vector): ${data.orphaned_details}`);

      // Get current statistics
      const { data: details, error: statsError } = await supabase
        .from('startup_details')
        .select('vector_id');

      if (!statsError && details) {
        const total = details.length;
        const linked = details.filter(d => d.vector_id !== null).length;
        const unlinked = total - linked;
        const linkPercentage = total > 0 ? ((linked / total) * 100).toFixed(2) : 0;

        console.log(`\n📈 Current Statistics:`);
        console.log(`   - Total startup_details: ${total}`);
        console.log(`   - Linked to vectors: ${linked} (${linkPercentage}%)`);
        console.log(`   - Not linked: ${unlinked}`);
      }

      // Check if Edge Function is deployed
      console.log('\n💡 Tip: Deploy the Edge Function for automatic syncing:');
      console.log('   supabase functions deploy sync-startup-vectors');
    }
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Run the sync
runSync(isDryRun).then(() => {
  console.log('\n✨ Done!');
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});