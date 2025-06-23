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
    
    if (data.error) {
      throw new Error(data.message || 'API Error');
    }

    // Transform and cache the data
    const transformedStartups = transformApiDataToStartups(data.data || []);
    
    const apiResponse: ApiResponse = {
      ...data,
      data: data.data,
      transformedData: transformedStartups,
      lastUpdated: new Date().toISOString()
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
  return apiData.map((item, index) => ({
    id: `startup-${index}`,
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
  }));
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