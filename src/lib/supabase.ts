import { createClient } from '@supabase/supabase-js';

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

// Convert Supabase data to our Startup type
export function convertSupabaseToStartup(id: string, metadata: any): any {
  // Check if metadata has the expected structure
  if (!metadata || typeof metadata !== 'object') {
    console.error('Invalid metadata structure:', metadata);
    return null;
  }

  try {
    console.log('Converting Supabase data for ID:', id);
    console.log('Metadata structure:', JSON.stringify(metadata, null, 2));
    
    // Handle nested metadata structure (metadata.metadata)
    const data = metadata.metadata || metadata;
    
    // Parse arrays from string format if needed
    const parseArray = (value: any): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        // Split by common delimiters
        return value.split(/[,;]/).map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    // The n8n response uses lowercase field names, not Title Case
    return {
      id,
      companyName: data.company_name || data["Company Name"] || 'Unknown Company',
      description: data.description || data["One-line description"] || '',
      category: data.category || data["Category"] || '',
      yearFounded: parseInt(data.year_founded || data["Year Founded"]) || new Date().getFullYear(),
      location: data.location || data["Location"] || '',
      teamSize: data["Team size"] || '',
      keyMembers: data["Key members"] || '',
      webpage: data["Webpage"] || '',
      ceo: data["CEO"] || '',
      previousExperience: data["Previous experience of CEO"] || '',
      targetCustomer: data["Target customer"] || '',
      mainValueProposition: data["Main value proposition"] || '',
      uvp: data["UVP"] || '',
      technologicalAdvantage: data["Key technological/business advantage"] || '',
      // Convert arrays to comma-separated strings for compatibility
      competitors: parseArray(data["2-3 main competitors"]).join(', '),
      differentiation: data["How they differentiate"] || '',
      notableCustomers: parseArray(data["Notable customers"]).join(', '),
      keyInvestors: parseArray(data["Key investors"]).join(', '),
      latestFundingRound: data["Latest funding round"] || '',
      totalFundingRaised: data.total_funding || data["Total funding raised"] || '',
      growthMetrics: data["Basic growth metrics"] || '',
      // Additional metadata fields (convert to strings for compatibility)
      keyProducts: parseArray(data["Key products/solutions portfolio"]).join(', '),
      industryVerticals: parseArray(data["Industry verticals served"]).join(', '),
      marketPositioning: data["Market positioning"] || '',
      geographicFocus: data["Geographic competition focus"] || '',
      keyPartnerships: parseArray(data["Key partnerships/collaborations"]).join(', '),
      patents: data["Patents/IP (if public)"] || '',
      majorMilestones: data["Major milestones"] || '',
      currentStage: data.funding_stage || data["Current stage/status"] || '',
      updatedDate: new Date().toISOString(),
      // Fields for compatibility
      postingStatus: '',
      demoDay: '',
      exitStrategy: '',
      tags: [],
      logo: '',
      analysisScore: {
        team: 0,
        market: 0,
        technology: 0,
        funding: 0,
        growth: 0,
        differentiation: 0,
        overall: 0
      }
    };
  } catch (error) {
    console.error('Error converting Supabase data:', error);
    return null;
  }
}