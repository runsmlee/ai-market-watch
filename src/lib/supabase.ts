import { createClient } from '@supabase/supabase-js';
import { Startup } from '@/types/startup';

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a function to get the Supabase client
// This prevents issues during build time when env vars might not be available
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please check your .env.local file');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Type for the startup vector content
export interface StartupVectorContent {
  company: {
    company_name: string;
    ceo_name: string;
    ceo_experience: string;
    team_size: string;
    key_members: string;
    webpage: string;
    location: string;
    founded_year: string;
    category: string;
  };
  product: {
    description: string;
    current_stage: string;
    target_customer: string;
    value_proposition: string;
    product_portfolio: string[];
    industries_served: string[];
  };
  innovation: {
    unique_factors: string;
    tech_business_advantage: string;
    patents: string;
    key_partnerships: string[];
  };
  competition: {
    main_competitors: string[];
    differentiation: string;
    market_position: string;
    geographic_focus: string;
  };
  funding: {
    total_raised: string;
    latest_round: string;
    key_investors: string[];
    growth_metrics: string;
    notable_customers: string[];
    major_milestones: string[];
  };
}

// Function to fetch company data from startup_vectors table
export async function fetchCompanyFromSupabase(companyId: string): Promise<any | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    console.log('Fetching from startup_vectors with ID:', companyId);
    
    const { data, error } = await supabase
      .from('startup_vectors')
      .select('metadata')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    console.log('Raw Supabase response:', data);

    if (!data || !data.metadata) {
      console.error('No data found for company ID:', companyId);
      return null;
    }

    // The metadata field contains the JSON data
    console.log('Metadata field type:', typeof data.metadata);
    console.log('Metadata field value:', data.metadata);
    
    return data.metadata;
  } catch (error) {
    console.error('Error in fetchCompanyFromSupabase:', error);
    return null;
  }
}

// Function to fetch all startups from startup_vectors table
export async function fetchAllStartupsFromSupabase(): Promise<Startup[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    console.log('Fetching all startups from startup_vectors');
    
    const { data, error } = await supabase
      .from('startup_vectors')
      .select('id, metadata');

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No startups found in startup_vectors table');
      return [];
    }

    console.log(`Found ${data.length} startups in Supabase`);
    
    // Convert each startup to the expected format
    const startups = data
      .map((item: { id: string; metadata: any }) => {
        const startup = convertSupabaseToStartup(item.id, item.metadata);
        return startup;
      })
      .filter((startup): startup is Startup => startup !== null); // Type-safe filter

    console.log(`Successfully converted ${startups.length} startups`);
    console.log('First 3 startups:', startups.slice(0, 3).map(s => ({
      id: s.id,
      companyName: s.companyName,
      category: s.category
    })));

    return startups;
  } catch (error) {
    console.error('Error in fetchAllStartupsFromSupabase:', error);
    return null;
  }
}

// Convert Supabase data to our Startup type
export function convertSupabaseToStartup(id: string, metadata: any): Startup | null {
  // Check if metadata has the expected structure
  if (!metadata || typeof metadata !== 'object') {
    console.error('Invalid metadata structure:', metadata);
    return null;
  }

  try {
    // Converting Supabase data
    
    // Handle nested metadata structure (metadata.metadata)
    // The startup_vectors table has data nested in metadata.metadata
    const data = metadata.metadata || metadata;
    
    // Data structure is correct

    // Map Supabase metadata fields to our Startup interface
    const startup: Startup = {
      id: id || `startup-${data["Company Name"]?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
      companyName: data["Company Name"] || '',
      description: data["One-line description"] || '',
      category: data["Category"] || '',
      yearFounded: parseInt(String(data["Year Founded"])) || new Date().getFullYear(),
      location: data["Location"] || '',
      teamSize: data["Team size"] || '',
      keyMembers: data["Key members"] || '',
      webpage: data["Webpage"] || '',
      ceo: data["CEO"] || '',
      previousExperience: data["Previous experience of CEO"] || '',
      targetCustomer: data["Target customer"] || '',
      mainValueProposition: data["Main value proposition"] || '',
      uvp: data["UVP"] || '',
      technologicalAdvantage: data["Key technological/business advantage"] || '',
      competitors: data["2-3 main competitors"] || '',
      differentiation: data["How they differentiate"] || '',
      notableCustomers: data["Notable customers"] || '',
      keyInvestors: data["Key investors"] || '',
      latestFundingRound: data["Latest funding round"] || '',
      totalFundingRaised: data["Total funding raised"] || '',
      growthMetrics: data["Basic growth metrics"] || '',
      keyProducts: data["Key products/solutions portfolio"] || '',
      industryVerticals: data["Industry verticals served"] || '',
      marketPositioning: data["Market positioning"] || '',
      geographicFocus: data["Geographic competition focus"] || '',
      keyPartnerships: data["Key partnerships/collaborations"] || '',
      patents: data["Patents/IP (if public)"] || '',
      majorMilestones: data["Major milestones"] || '',
      currentStage: data["Current stage/status"] || '',
      updatedDate: data["Updated Date"] || new Date().toISOString(),
      postingStatus: data["Posting"] || ''
    };

    // Log the full converted startup object
    console.log('Converted startup (full):', JSON.stringify(startup, null, 2));

    return startup;
  } catch (error) {
    console.error('Error converting Supabase data:', error);
    return null;
  }
}

// Function to get dashboard statistics using RPC
export async function getDashboardStatistics() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase.rpc('get_dashboard_statistics');
    
    if (error) {
      console.error('Error fetching dashboard statistics:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDashboardStatistics:', error);
    return null;
  }
}

// Function to filter startups using RPC
export async function filterStartupsRPC(filters: {
  categories?: string[];
  locations?: string[];
  yearFrom?: number;
  yearTo?: number;
  searchTerm?: string;
  fundingMin?: number;
  fundingMax?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase.rpc('filter_startups', {
      p_categories: filters.categories || null,
      p_locations: filters.locations || null,
      p_year_from: filters.yearFrom || null,
      p_year_to: filters.yearTo || null,
      p_search_term: filters.searchTerm || null,
      p_funding_min: filters.fundingMin || null,
      p_funding_max: filters.fundingMax || null,
      p_limit: filters.limit || 1000,
      p_offset: filters.offset || 0
    });
    
    if (error) {
      console.error('Error filtering startups:', error);
      return null;
    }
    
    // Transform the data to match our Startup interface
    if (data && data.length > 0) {
      const totalCount = data[0].total_count;
      const startups = data
        .map((item: any) => convertSupabaseToStartup(item.id, item.metadata))
        .filter((startup): startup is Startup => startup !== null);
      
      return { startups, totalCount };
    }
    
    return { startups: [], totalCount: 0 };
  } catch (error) {
    console.error('Error in filterStartupsRPC:', error);
    return null;
  }
}

// Function to get all categories
export async function getAllCategories() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase.rpc('get_all_categories');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return null;
  }
}

// Function to get all locations
export async function getAllLocations() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase.rpc('get_all_locations');
    
    if (error) {
      console.error('Error fetching locations:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAllLocations:', error);
    return null;
  }
}

// Function to search companies
export async function searchCompanies(searchTerm: string, limit: number = 20) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase.rpc('search_companies', {
      p_search_term: searchTerm,
      p_limit: limit
    });
    
    if (error) {
      console.error('Error searching companies:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in searchCompanies:', error);
    return null;
  }
}