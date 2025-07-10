import { Startup, ApiResponse, DashboardStats } from '@/types/startup';
import { DataCache, CACHE_KEYS } from './cache';
import { calculateDashboardStats, clearStatsCache } from './statistics';

// API endpoint - uses Next.js API route as proxy to avoid CORS issues
const API_ENDPOINT = '/api/startups';

// Cache configuration - 24시간 캐시 (하루에 한번 업데이트되므로)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface FetchOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
  includeStats?: boolean;
}

export async function fetchStartups(
  params?: Record<string, string>, 
  options: FetchOptions = {}
): Promise<ApiResponse> {
  const { useCache = true, forceRefresh = false, includeStats = false } = options;
  
  // Create cache key based on parameters
  const cacheKey = params ? 
    `${CACHE_KEYS.STARTUPS}-${JSON.stringify(params)}` : 
    CACHE_KEYS.STARTUPS;

  // Try cache first (unless force refresh)
  if (useCache && !forceRefresh) {
    const cachedData = DataCache.get<ApiResponse>({ key: cacheKey });
    if (cachedData) {
      console.log('📦 Using cached data');
      return cachedData;
    }
  }

  try {
    console.log('🌐 Fetching fresh data from API');
    const url = new URL(API_ENDPOINT, 
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    // Add timestamp to prevent aggressive caching
    url.searchParams.append('_t', Date.now().toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('🔍 Raw API Response:', {
      hasError: !!data.error,
      hasData: !!data.data,
      dataLength: Array.isArray(data.data) ? data.data.length : 'Not an array'
    });
    
    if (data.error) {
      throw new Error(data.message || 'API Error');
    }

    // Transform and cache the data
    // Check if data is from Supabase (already transformed) or Google Apps Script
    const isSupabaseData = data.source === 'supabase';
    
    // Data structure verified
    
    // Always transform the data to ensure consistent field names
    const transformedStartups = transformApiDataToStartups(data.data || []);
    
    console.log('🔄 Data transformed successfully:', {
      source: data.source || 'google-apps-script',
      originalLength: (data.data || []).length,
      transformedLength: transformedStartups.length,
      isSupabaseData
    });
    
    const apiResponse: ApiResponse = {
      ...data,
      data: data.data,
      transformedData: transformedStartups,
      lastUpdated: new Date().toISOString(),
      source: data.source || 'unknown'
    };

    // Cache the response
    if (useCache) {
      DataCache.set({ key: cacheKey, ttl: CACHE_TTL }, apiResponse);
      console.log('💾 Data cached successfully');
    }

    // Clear stats cache since we have new data
    clearStatsCache();

    // Cache pre-computed statistics if requested
    if (includeStats && transformedStartups.length > 0) {
      const stats = calculateDashboardStats(transformedStartups, transformedStartups);
      DataCache.set({ key: CACHE_KEYS.STATS, ttl: CACHE_TTL }, stats);
    }

    return apiResponse;
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Try to return cached data as fallback
    if (useCache) {
      const cachedData = DataCache.get<ApiResponse>({ key: cacheKey });
      if (cachedData) {
        console.log('⚠️ API failed, using stale cached data');
        return cachedData;
      }
    }
    
    // No fallback to demo data - throw error to be handled by UI
    throw error;
  }
}

export function transformApiDataToStartups(apiData: any[]): Startup[] {
  return apiData
    .map((item, index) => {
      // Transform data based on format
      
      // Check if data is already in camelCase format (from Supabase)
      const isTransformed = 'companyName' in item;
      
      if (isTransformed) {
        // Data is already transformed (from Supabase), but ensure all fields are properly typed
        return {
          id: item.id || `startup-${index}`,
          companyName: String(item.companyName || ''),
          ceo: String(item.ceo || ''),
          previousExperience: String(item.previousExperience || ''),
          keyMembers: String(item.keyMembers || ''),
          teamSize: String(item.teamSize || ''),
          webpage: String(item.webpage || ''),
          location: String(item.location || ''),
          yearFounded: parseInt(String(item.yearFounded || '0')) || 0,
          description: String(item.description || ''),
          currentStage: String(item.currentStage || ''),
          targetCustomer: String(item.targetCustomer || ''),
          mainValueProposition: String(item.mainValueProposition || ''),
          keyProducts: String(item.keyProducts || ''),
          industryVerticals: String(item.industryVerticals || ''),
          uvp: String(item.uvp || ''),
          technologicalAdvantage: String(item.technologicalAdvantage || ''),
          patents: String(item.patents || ''),
          keyPartnerships: String(item.keyPartnerships || ''),
          competitors: String(item.competitors || ''),
          differentiation: String(item.differentiation || ''),
          marketPositioning: String(item.marketPositioning || ''),
          geographicFocus: String(item.geographicFocus || ''),
          totalFundingRaised: String(item.totalFundingRaised || ''),
          latestFundingRound: String(item.latestFundingRound || ''),
          keyInvestors: String(item.keyInvestors || ''),
          growthMetrics: String(item.growthMetrics || ''),
          notableCustomers: String(item.notableCustomers || ''),
          majorMilestones: String(item.majorMilestones || ''),
          category: String(item.category || 'Other'),
          updatedDate: String(item.updatedDate || ''),
          postingStatus: String(item.postingStatus || ''),
        } as Startup;
      }
      
      // Transform from Google Apps Script format
      return {
        id: item.id || `startup-${index}`,
        companyName: String(item['Company Name'] || ''),
        ceo: String(item['CEO'] || ''),
        previousExperience: String(item['Previous experience of CEO'] || ''),
        keyMembers: String(item['Key members'] || ''),
        teamSize: String(item['Team size'] || ''),
        webpage: String(item['Webpage'] || ''),
        location: String(item['Location'] || ''),
        yearFounded: parseInt(String(item['Year Founded'] || '0')) || 0,
        description: String(item['One-line description'] || ''),
        currentStage: String(item['Current stage/status'] || ''),
        targetCustomer: String(item['Target customer'] || ''),
        mainValueProposition: String(item['Main value proposition'] || ''),
        keyProducts: String(item['Key products/solutions portfolio'] || ''),
        industryVerticals: String(item['Industry verticals served'] || ''),
        uvp: String(item['UVP'] || ''),
        technologicalAdvantage: String(item['Key technological/business advantage'] || ''),
        patents: String(item['Patents/IP (if public)'] || ''),
        keyPartnerships: String(item['Key partnerships/collaborations'] || ''),
        competitors: String(item['2-3 main competitors'] || ''),
        differentiation: String(item['How they differentiate'] || ''),
        marketPositioning: String(item['Market positioning'] || ''),
        geographicFocus: String(item['Geographic competition focus'] || ''),
        totalFundingRaised: String(item['Total funding raised'] || ''),
        latestFundingRound: String(item['Latest funding round'] || ''),
        keyInvestors: String(item['Key investors'] || ''),
        growthMetrics: String(item['Basic growth metrics'] || ''),
        notableCustomers: String(item['Notable customers'] || ''),
        majorMilestones: String(item['Major milestones'] || ''),
        category: String(item['Category'] || 'Other'),
        updatedDate: String(item['Updated Date'] || ''),
        postingStatus: String(item['Posting'] || ''),
      };
    })
    .filter((startup) => {
      // Filter out companies with invalid or empty names
      // Ensure companyName is a string before calling trim
      const rawCompanyName = startup.companyName;
      const companyName = typeof rawCompanyName === 'string' 
        ? rawCompanyName.trim() 
        : String(rawCompanyName || '').trim();
      
      // Only filter out if company name is truly empty or null
      if (!companyName || companyName === '') {
        console.log(`🚫 Filtered out company with empty name:`, {
          id: startup.id,
          rawCompanyName: startup.companyName,
          companyNameType: typeof startup.companyName,
          keys: Object.keys(startup).slice(0, 5)
        });
        return false;
      }
      
      return true;
    });
}

export function formatFunding(amount: number): string {
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  } else if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(1)}M`;
  } else if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(1)}K`;
  }
  return `$${amount}`;
}