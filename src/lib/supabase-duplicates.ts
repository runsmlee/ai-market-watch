import { createClient } from '@supabase/supabase-js';

// Create a function to get the Supabase client
function getSupabaseClient() {
  // Get credentials at runtime, not module load time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please check your .env.local file');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

interface DuplicateStartup {
  id: string;
  companyName: string;
  createdAt: string;
  metadata: any;
}

interface DuplicateGroup {
  companyName: string;
  duplicates: DuplicateStartup[];
}

/**
 * Finds duplicate startups in the startup_vectors table based on company name
 * Groups them by company name and sorts by creation date
 */
export async function findDuplicateStartups(): Promise<DuplicateGroup[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    // Fetch all startups with their metadata
    const { data, error } = await supabase
      .from('startup_vectors')
      .select('id, metadata, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching startups:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No startups found');
      return [];
    }

    // Map to extract company names and group duplicates
    const companyMap = new Map<string, DuplicateStartup[]>();

    data.forEach((item) => {
      let companyName = '';

      // Extract company name from different possible metadata structures
      if (item.metadata?.metadata?.output?.company?.company_name) {
        companyName = item.metadata.metadata.output.company.company_name;
      } else if (item.metadata?.output?.company?.company_name) {
        companyName = item.metadata.output.company.company_name;
      } else if (item.metadata?.metadata?.['Company Name']) {
        companyName = item.metadata.metadata['Company Name'];
      } else if (item.metadata?.['Company Name']) {
        companyName = item.metadata['Company Name'];
      }

      if (companyName) {
        const startup: DuplicateStartup = {
          id: item.id,
          companyName,
          createdAt: item.created_at,
          metadata: item.metadata
        };

        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, []);
        }
        companyMap.get(companyName)!.push(startup);
      }
    });

    // Filter out groups with only one entry (no duplicates)
    const duplicateGroups: DuplicateGroup[] = [];
    companyMap.forEach((duplicates, companyName) => {
      if (duplicates.length > 1) {
        // Sort by creation date (oldest first)
        duplicates.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        duplicateGroups.push({ companyName, duplicates });
      }
    });

    console.log(`Found ${duplicateGroups.length} companies with duplicates`);
    return duplicateGroups;
  } catch (error) {
    console.error('Error in findDuplicateStartups:', error);
    return null;
  }
}

/**
 * Deletes old duplicate entries, keeping only the newest one for each company
 * @param dryRun - If true, only logs what would be deleted without actually deleting
 * @returns Array of deleted record IDs
 */
export async function deleteOldDuplicates(dryRun: boolean = true): Promise<string[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    const duplicateGroups = await findDuplicateStartups();
    if (!duplicateGroups) {
      console.error('Failed to find duplicates');
      return null;
    }

    const idsToDelete: string[] = [];

    // For each group of duplicates, mark all but the newest for deletion
    duplicateGroups.forEach((group) => {
      // Keep the newest (last in the sorted array)
      const toKeep = group.duplicates[group.duplicates.length - 1];
      const toDelete = group.duplicates.slice(0, -1);

      console.log(`\nCompany: ${group.companyName}`);
      console.log(`  Keeping: ${toKeep.id} (created: ${toKeep.createdAt})`);
      toDelete.forEach((dup) => {
        console.log(`  Deleting: ${dup.id} (created: ${dup.createdAt})`);
        idsToDelete.push(dup.id);
      });
    });

    if (dryRun) {
      console.log(`\n[DRY RUN] Would delete ${idsToDelete.length} duplicate records`);
      return idsToDelete;
    }

    // Perform actual deletion
    if (idsToDelete.length > 0) {
      console.log(`\nDeleting ${idsToDelete.length} duplicate records...`);
      
      const { error } = await supabase
        .from('startup_vectors')
        .delete()
        .in('id', idsToDelete);

      if (error) {
        console.error('Error deleting duplicates:', error);
        return null;
      }

      console.log(`Successfully deleted ${idsToDelete.length} duplicate records`);
    } else {
      console.log('No duplicates to delete');
    }

    return idsToDelete;
  } catch (error) {
    console.error('Error in deleteOldDuplicates:', error);
    return null;
  }
}

/**
 * Gets detailed information about duplicates for a specific company
 */
export async function getDuplicatesForCompany(companyName: string): Promise<DuplicateStartup[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    // Query with different possible metadata structures
    const { data, error } = await supabase
      .from('startup_vectors')
      .select('id, metadata, created_at')
      .or(
        `metadata->metadata->output->company->>company_name.ilike.${companyName},` +
        `metadata->output->company->>company_name.ilike.${companyName},` +
        `metadata->metadata->>Company Name.ilike.${companyName},` +
        `metadata->>Company Name.ilike.${companyName}`
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching duplicates for company:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`No entries found for company: ${companyName}`);
      return [];
    }

    const duplicates: DuplicateStartup[] = data.map((item) => ({
      id: item.id,
      companyName,
      createdAt: item.created_at,
      metadata: item.metadata
    }));

    console.log(`Found ${duplicates.length} entries for company: ${companyName}`);
    return duplicates;
  } catch (error) {
    console.error('Error in getDuplicatesForCompany:', error);
    return null;
  }
}

/**
 * Gets statistics about duplicates in the database
 */
export async function getDuplicateStatistics() {
  try {
    const duplicateGroups = await findDuplicateStartups();
    if (!duplicateGroups) {
      console.error('Failed to find duplicates');
      return null;
    }

    const totalDuplicates = duplicateGroups.reduce(
      (sum, group) => sum + group.duplicates.length - 1, // -1 because we keep one
      0
    );

    const stats = {
      companiesWithDuplicates: duplicateGroups.length,
      totalDuplicateRecords: totalDuplicates,
      duplicateGroups: duplicateGroups.map((group) => ({
        companyName: group.companyName,
        count: group.duplicates.length,
        oldestDate: group.duplicates[0].createdAt,
        newestDate: group.duplicates[group.duplicates.length - 1].createdAt
      }))
    };

    return stats;
  } catch (error) {
    console.error('Error in getDuplicateStatistics:', error);
    return null;
  }
}