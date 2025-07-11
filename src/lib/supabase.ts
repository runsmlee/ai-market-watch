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
    
    // Fetching from startup_vectors
    
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
    
    // Fetching all startups from startup_vectors using pagination
    // Supabase API has a default max_rows limit of 1000, so we need to paginate
    const allData: any[] = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('startup_vectors')
        .select('id, metadata')
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      if (data && data.length > 0) {
        allData.push(...data);
        offset += data.length;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    if (allData.length === 0) {
      console.log('No startups found in startup_vectors table');
      return [];
    }

    console.log(`📊 Found ${allData.length} startups in Supabase (fetched in ${Math.ceil(allData.length / pageSize)} pages)`);
    
    // Convert each startup to the expected format
    const startups = allData
      .map((item: { id: string; metadata: any }) => {
        const startup = convertSupabaseToStartup(item.id, item.metadata);
        return startup;
      })
      .filter((startup): startup is Startup => startup !== null); // Type-safe filter

    console.log(`✅ Successfully converted ${startups.length} startups (filtered out ${allData.length - startups.length})`);

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
    console.error('Invalid metadata structure for id:', id, metadata);
    return null;
  }

  try {
    // Converting Supabase data
    
    // Handle nested metadata structure
    // Check if we have the new structure (metadata.output) or old structure
    let companyData: any;
    let productData: any;
    let fundingData: any;
    let innovationData: any;
    let competitionData: any;
    
    if (metadata.metadata?.output) {
      // New structure: metadata.metadata.output.company, etc.
      const output = metadata.metadata.output;
      companyData = output.company || {};
      productData = output.product || {};
      fundingData = output.funding || {};
      innovationData = output.innovation || {};
      competitionData = output.competition || {};
    } else if (metadata.output) {
      // Alternative new structure: metadata.output.company, etc.
      companyData = metadata.output.company || {};
      productData = metadata.output.product || {};
      fundingData = metadata.output.funding || {};
      innovationData = metadata.output.innovation || {};
      competitionData = metadata.output.competition || {};
    } else if (metadata.metadata) {
      // Old structure: flat fields in metadata.metadata
      const data = metadata.metadata;
      companyData = {
        company_name: data["Company Name"],
        ceo_name: data["CEO"],
        ceo_experience: data["Previous experience of CEO"],
        team_size: data["Team size"],
        key_members: data["Key members"],
        webpage: data["Webpage"],
        location: data["Location"],
        founded_year: data["Year Founded"],
        category: data["Category"]
      };
      productData = {
        description: data["One-line description"],
        current_stage: data["Current stage/status"],
        target_customer: data["Target customer"],
        value_proposition: data["Main value proposition"],
        product_portfolio: data["Key products/solutions portfolio"],
        industries_served: data["Industry verticals served"]
      };
      fundingData = {
        total_raised: data["Total funding raised"],
        latest_round: data["Latest funding round"],
        key_investors: data["Key investors"],
        growth_metrics: data["Basic growth metrics"],
        notable_customers: data["Notable customers"],
        major_milestones: data["Major milestones"]
      };
      innovationData = {
        unique_factors: data["UVP"],
        tech_business_advantage: data["Key technological/business advantage"],
        patents: data["Patents/IP (if public)"],
        key_partnerships: data["Key partnerships/collaborations"]
      };
      competitionData = {
        main_competitors: data["2-3 main competitors"],
        differentiation: data["How they differentiate"],
        market_position: data["Market positioning"],
        geographic_focus: data["Geographic competition focus"]
      };
    } else {
      // Fallback to direct metadata
      const data = metadata;
      companyData = {
        company_name: data["Company Name"],
        ceo_name: data["CEO"],
        ceo_experience: data["Previous experience of CEO"],
        team_size: data["Team size"],
        key_members: data["Key members"],
        webpage: data["Webpage"],
        location: data["Location"],
        founded_year: data["Year Founded"],
        category: data["Category"]
      };
      productData = {
        description: data["One-line description"],
        current_stage: data["Current stage/status"],
        target_customer: data["Target customer"],
        value_proposition: data["Main value proposition"],
        product_portfolio: data["Key products/solutions portfolio"],
        industries_served: data["Industry verticals served"]
      };
      fundingData = {
        total_raised: data["Total funding raised"],
        latest_round: data["Latest funding round"],
        key_investors: data["Key investors"],
        growth_metrics: data["Basic growth metrics"],
        notable_customers: data["Notable customers"],
        major_milestones: data["Major milestones"]
      };
      innovationData = {
        unique_factors: data["UVP"],
        tech_business_advantage: data["Key technological/business advantage"],
        patents: data["Patents/IP (if public)"],
        key_partnerships: data["Key partnerships/collaborations"]
      };
      competitionData = {
        main_competitors: data["2-3 main competitors"],
        differentiation: data["How they differentiate"],
        market_position: data["Market positioning"],
        geographic_focus: data["Geographic competition focus"]
      };
    }

    // Map to our Startup interface
    const startup: Startup = {
      id: id || `startup-${companyData.company_name?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
      companyName: companyData.company_name || '',
      description: productData.description || '',
      category: companyData.category || '',
      yearFounded: parseInt(String(companyData.founded_year)) || new Date().getFullYear(),
      location: companyData.location || '',
      teamSize: companyData.team_size || '',
      keyMembers: companyData.key_members || '',
      webpage: companyData.webpage || '',
      ceo: companyData.ceo_name || '',
      previousExperience: companyData.ceo_experience || '',
      targetCustomer: productData.target_customer || '',
      mainValueProposition: productData.value_proposition || '',
      uvp: innovationData.unique_factors || '',
      technologicalAdvantage: innovationData.tech_business_advantage || '',
      competitors: Array.isArray(competitionData.main_competitors) 
        ? competitionData.main_competitors.join(', ') 
        : competitionData.main_competitors || '',
      differentiation: competitionData.differentiation || '',
      notableCustomers: Array.isArray(fundingData.notable_customers)
        ? fundingData.notable_customers.join(', ')
        : fundingData.notable_customers || '',
      keyInvestors: Array.isArray(fundingData.key_investors)
        ? fundingData.key_investors.join(', ')
        : fundingData.key_investors || '',
      latestFundingRound: fundingData.latest_round || '',
      totalFundingRaised: fundingData.total_raised || '',
      growthMetrics: fundingData.growth_metrics || '',
      keyProducts: Array.isArray(productData.product_portfolio)
        ? productData.product_portfolio.join(', ')
        : productData.product_portfolio || '',
      industryVerticals: Array.isArray(productData.industries_served)
        ? productData.industries_served.join(', ')
        : productData.industries_served || '',
      marketPositioning: competitionData.market_position || '',
      geographicFocus: competitionData.geographic_focus || '',
      keyPartnerships: Array.isArray(innovationData.key_partnerships)
        ? innovationData.key_partnerships.join(', ')
        : innovationData.key_partnerships || '',
      patents: innovationData.patents || '',
      majorMilestones: Array.isArray(fundingData.major_milestones)
        ? fundingData.major_milestones.join(', ')
        : fundingData.major_milestones || '',
      currentStage: productData.current_stage || '',
      updatedDate: metadata.updatedDate || new Date().toISOString(),
      postingStatus: metadata.postingStatus || ''
    };

    // Conversion complete

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