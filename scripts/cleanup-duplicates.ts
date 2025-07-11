#!/usr/bin/env node

/**
 * Script to find and remove duplicate startups from Supabase startup_vectors table
 * 
 * Usage:
 *   npm run cleanup-duplicates          # Dry run - shows what would be deleted
 *   npm run cleanup-duplicates -- --execute  # Actually delete duplicates
 *   npm run cleanup-duplicates -- --stats    # Show duplicate statistics only
 *   npm run cleanup-duplicates -- --company "Company Name"  # Check specific company
 */

import dotenv from 'dotenv';
import path from 'path';
import { 
  findDuplicateStartups, 
  deleteOldDuplicates, 
  getDuplicateStatistics,
  getDuplicatesForCompany 
} from '../src/lib/supabase-duplicates';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Debug env vars
console.log('Environment check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Not found');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Not found');
console.log('');

async function main() {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');
  const isStats = args.includes('--stats');
  const companyIndex = args.indexOf('--company');
  const companyName = companyIndex !== -1 && args[companyIndex + 1] ? args[companyIndex + 1] : null;

  console.log('🔍 Supabase Duplicate Cleanup Tool\n');

  // Check for specific company
  if (companyName) {
    console.log(`Checking duplicates for company: ${companyName}\n`);
    const duplicates = await getDuplicatesForCompany(companyName);
    
    if (duplicates && duplicates.length > 0) {
      console.log(`Found ${duplicates.length} entries:`);
      duplicates.forEach((dup, index) => {
        console.log(`\n${index + 1}. ID: ${dup.id}`);
        console.log(`   Created: ${dup.createdAt}`);
        console.log(`   Metadata structure:`, JSON.stringify(dup.metadata, null, 2).substring(0, 200) + '...');
      });
    } else {
      console.log('No entries found for this company');
    }
    return;
  }

  // Show statistics only
  if (isStats) {
    console.log('📊 Gathering duplicate statistics...\n');
    const stats = await getDuplicateStatistics();
    
    if (stats) {
      console.log(`Total companies with duplicates: ${stats.companiesWithDuplicates}`);
      console.log(`Total duplicate records to remove: ${stats.totalDuplicateRecords}\n`);
      
      if (stats.duplicateGroups.length > 0) {
        console.log('Top companies with most duplicates:');
        const topDuplicates = stats.duplicateGroups
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        
        topDuplicates.forEach((group) => {
          console.log(`  - ${group.companyName}: ${group.count} entries`);
          console.log(`    (from ${new Date(group.oldestDate).toLocaleDateString()} to ${new Date(group.newestDate).toLocaleDateString()})`);
        });
      }
    }
    return;
  }

  // Find and optionally delete duplicates
  if (isExecute) {
    console.log('⚠️  EXECUTING DELETION - This will remove old duplicate records\n');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    
    // Give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const deletedIds = await deleteOldDuplicates(false);
    
    if (deletedIds) {
      console.log(`\n✅ Cleanup complete! Deleted ${deletedIds.length} duplicate records.`);
    } else {
      console.log('\n❌ Cleanup failed. Check the error messages above.');
    }
  } else {
    console.log('🔍 Running in DRY RUN mode - no data will be deleted\n');
    console.log('Finding duplicates...\n');
    
    const deletedIds = await deleteOldDuplicates(true);
    
    if (deletedIds && deletedIds.length > 0) {
      console.log(`\n📋 Summary: Found ${deletedIds.length} duplicate records that would be deleted.`);
      console.log('\nTo actually delete these duplicates, run:');
      console.log('  npm run cleanup-duplicates -- --execute\n');
    } else if (deletedIds) {
      console.log('\n✨ No duplicates found! Your database is clean.');
    }
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});