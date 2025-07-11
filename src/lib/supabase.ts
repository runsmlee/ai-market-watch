import { createClient } from '@supabase/supabase-js';
import { Startup } from '@/types/startup';

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a function to get the Supabase client
// This prevents issues during build time when env vars might not be available
export function getSupabaseClient() {
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

// Function to fetch company data from startup_details table
export async function fetchCompanyFromSupabase(companyId: string): Promise<any | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    console.log('🔍 Fetching company with ID:', companyId);
    
    // First try to fetch from startup_details by ID
    const { data, error } = await supabase
      .from('startup_details')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      // If not found by ID, try with vector_id for backward compatibility
      const { data: vectorData, error: vectorError } = await supabase
        .from('startup_details')
        .select('*')
        .eq('vector_id', companyId)
        .single();
        
      if (vectorError) {
        console.error('Supabase error:', vectorError);
        return null;
      }
      
      console.log('✅ Found company via vector_id:', vectorData);
      return vectorData;
    }

    console.log('✅ Found company:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchCompanyFromSupabase:', error);
    return null;
  }
}

// New function to fetch company by slug
export async function fetchCompanyBySlug(slug: string): Promise<any | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    console.log('🔍 Fetching company with slug:', slug);
    
    // Use case-insensitive search for slug
    const { data, error } = await supabase
      .from('startup_details')
      .select('*')
      .ilike('company_slug', slug)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    console.log('✅ Found company by slug:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchCompanyBySlug:', error);
    return null;
  }
}

// New function to search companies
export async function searchCompanies(query: string): Promise<any[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    console.log('🔍 Searching companies with query:', query);
    
    const { data, error } = await supabase
      .from('startup_details')
      .select('*')
      .or(`company_name.ilike.%${query}%,one_line_description.ilike.%${query}%,main_value_proposition.ilike.%${query}%`)
      .order('company_name')
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    console.log(`✅ Found ${data?.length || 0} companies matching query`);
    return data || [];
  } catch (error) {
    console.error('Error in searchCompanies:', error);
    return null;
  }
}

// New function to fetch companies by category
export async function fetchCompaniesByCategory(category: string): Promise<any[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    console.log('🔍 Fetching companies with category:', category);
    
    const { data, error } = await supabase
      .from('startup_details')
      .select('*')
      .ilike('category', `%${category}%`)
      .order('company_name');

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    console.log(`✅ Found ${data?.length || 0} companies in category`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchCompaniesByCategory:', error);
    return null;
  }
}

// Function to fetch all startups from startup_details table
export async function fetchAllStartupsFromSupabase(): Promise<Startup[] | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    // Fetching all startups from startup_details using pagination
    const allData: any[] = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('startup_details')
        .select('*')
        .range(offset, offset + pageSize - 1)
        .order('company_name');

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
      console.log('No startups found in startup_details table');
      return [];
    }

    console.log(`📊 Found ${allData.length} startups in Supabase (fetched in ${Math.ceil(allData.length / pageSize)} pages)`);
    
    // Convert each startup to the expected format
    const startups = allData
      .map((item) => convertStartupDetailsToStartup(item))
      .filter((startup): startup is Startup => startup !== null);

    console.log(`✅ Successfully converted ${startups.length} startups`);

    return startups;
  } catch (error) {
    console.error('Error in fetchAllStartupsFromSupabase:', error);
    return null;
  }
}

// Convert startup_details row to our Startup type
export function convertStartupDetailsToStartup(data: any): Startup | null {
  if (!data) return null;
  
  try {
    const startup: Startup = {
      id: data.id || data.vector_id?.toString() || '',
      companyName: data.company_name || '',
      ceo: data.ceo || '',
      previousExperience: data.previous_experience_of_ceo || '',
      keyMembers: data.key_members || '',
      teamSize: data.team_size || '',
      webpage: data.webpage || '',
      location: data.location || '',
      yearFounded: data.year_founded || null,
      description: data.one_line_description || '',
      currentStage: data.current_stage_status || '',
      targetCustomer: data.target_customer || '',
      mainValueProposition: data.main_value_proposition || '',
      keyProducts: data.key_products_solutions_portfolio || '',
      industryVerticals: data.industry_verticals_served || '',
      uvp: data.uvp || '',
      technologicalAdvantage: data.key_technological_business_advantage || '',
      patents: data.patents_ip_if_public || '',
      keyPartnerships: data.key_partnerships_collaborations || '',
      competitors: data.main_competitors_2_3 || '',
      differentiation: data.how_they_differentiate || '',
      marketPositioning: data.market_positioning || '',
      geographicFocus: data.geographic_competition_focus || '',
      totalFundingRaised: data.total_funding_raised || '',
      latestFundingRound: data.latest_funding_round || '',
      keyInvestors: data.key_investors || '',
      growthMetrics: data.basic_growth_metrics || '',
      notableCustomers: data.notable_customers || '',
      majorMilestones: data.major_milestones || '',
      category: data.category || '',
      updatedDate: data.updated_date || '',
    };
    
    return startup;
  } catch (error) {
    console.error('Error converting startup details:', error);
    return null;
  }
}

// Convert Supabase data to our Startup type (for backward compatibility with startup_vectors)
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
        .filter((startup: Startup | null): startup is Startup => startup !== null);
      
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


// Function to find company by exact name match
export async function findCompanyByName(companyName: string): Promise<any | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    console.log('🔍 Searching for company:', companyName);
    
    // First try exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from('startup_details')
      .select('*')
      .eq('company_name', companyName)
      .single();
      
    if (exactMatch && !exactError) {
      console.log('✅ Found via exact match:', exactMatch);
      return exactMatch;
    }
    
    // Then try case-insensitive match
    const { data: iMatch, error: iError } = await supabase
      .from('startup_details')
      .select('*')
      .ilike('company_name', companyName)
      .single();
      
    if (iMatch && !iError) {
      console.log('✅ Found via case-insensitive match:', iMatch);
      return iMatch;
    }
    
    // Finally try partial match
    const { data: partialMatch, error: partialError } = await supabase
      .from('startup_details')
      .select('*')
      .ilike('company_name', `%${companyName}%`)
      .limit(1);
      
    if (partialMatch && partialMatch.length > 0 && !partialError) {
      console.log('✅ Found via partial match:', partialMatch[0]);
      return partialMatch[0];
    }
    
    console.log('❌ Company not found in Supabase:', companyName);
    return null;
    
  } catch (error) {
    console.error('Error in findCompanyByName:', error);
    return null;
  }
}

// Function to save DNA match report
export async function saveDNAMatchReport({
  email,
  companyName,
  companyData,
  analysisResults,
  pdfUrl,
}: {
  email: string;
  companyName: string;
  companyData: any;
  analysisResults: any;
  pdfUrl?: string;
}) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase
      .from('dna_match_reports')
      .insert({
        email,
        company_name: companyName,
        company_data: companyData,
        analysis_results: analysisResults,
        pdf_url: pdfUrl,
        email_sent_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving DNA match report:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveDNAMatchReport:', error);
    return null;
  }
}

// Function to upload PDF to Supabase Storage
export async function uploadPDFToStorage(
  pdfBuffer: Buffer,
  fileName: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { error } = await supabase.storage
      .from('dna-reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading PDF:', error);
      return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('dna-reports')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadPDFToStorage:', error);
    return null;
  }
}