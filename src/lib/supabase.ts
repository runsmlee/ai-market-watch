import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// You'll need to add these to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found. Please check your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
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
      companyName: metadata.company_name || metadata["Company Name"] || 'Unknown Company',
      description: metadata.description || metadata["One-line description"] || '',
      category: metadata.category || metadata["Category"] || '',
      yearFounded: parseInt(metadata.year_founded || metadata["Year Founded"]) || new Date().getFullYear(),
      location: metadata.location || metadata["Location"] || '',
      teamSize: metadata["Team size"] || '',
      keyMembers: metadata["Key members"] || '',
      webpage: metadata["Webpage"] || '',
      ceo: metadata["CEO"] || '',
      previousExperience: metadata["Previous experience of CEO"] || '',
      targetCustomer: metadata["Target customer"] || '',
      mainValueProposition: metadata["Main value proposition"] || '',
      uvp: metadata["UVP"] || '',
      technologicalAdvantage: metadata["Key technological/business advantage"] || '',
      // Convert arrays to comma-separated strings for compatibility
      competitors: parseArray(metadata["2-3 main competitors"]).join(', '),
      differentiation: metadata["How they differentiate"] || '',
      notableCustomers: parseArray(metadata["Notable customers"]).join(', '),
      keyInvestors: parseArray(metadata["Key investors"]).join(', '),
      latestFundingRound: metadata["Latest funding round"] || '',
      totalFundingRaised: metadata.total_funding || metadata["Total funding raised"] || '',
      growthMetrics: metadata["Basic growth metrics"] || '',
      // Additional metadata fields (convert to strings for compatibility)
      keyProducts: parseArray(metadata["Key products/solutions portfolio"]).join(', '),
      industryVerticals: parseArray(metadata["Industry verticals served"]).join(', '),
      marketPositioning: metadata["Market positioning"] || '',
      geographicFocus: metadata["Geographic competition focus"] || '',
      keyPartnerships: parseArray(metadata["Key partnerships/collaborations"]).join(', '),
      patents: metadata["Patents/IP (if public)"] || '',
      majorMilestones: metadata["Major milestones"] || '',
      currentStage: metadata.funding_stage || metadata["Current stage/status"] || '',
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