import { create } from 'zustand';
import { Startup, StartupFilters, DashboardStats, SortOption } from '@/types/startup';
import { calculateDashboardStats } from '@/lib/statistics';
import { fetchStartups } from '@/lib/api';
import { DataCache, CACHE_KEYS } from '@/lib/cache';
import { searchCompanies } from '@/lib/search';

interface DashboardState {
  // Data
  allStartups: Startup[];
  filteredStartups: Startup[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isFromCache: boolean;

  // Filters
  filters: StartupFilters;
  
  // Performance
  isProcessing: boolean;
  processingTask: string | null;
  
  // Actions
  setStartups: (startups: Startup[], lastUpdated?: string, isFromCache?: boolean) => void;
  updateFilters: (filters: Partial<StartupFilters>) => void;
  applyFilters: () => Promise<void>;
  performVectorSearch: () => Promise<void>;
  sortStartups: (startups: Startup[], sortBy: SortOption) => Startup[];
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
  getFilterMetadata: () => { categories: string[]; locations: string[] };
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Web Worker actions
  processDataInBackground: (data: any[]) => Promise<Startup[]>;
  calculateStatsInBackground: (companies: Startup[]) => Promise<DashboardStats>;
  filterInBackground: (companies: Startup[], filters: StartupFilters) => Promise<Startup[]>;
}

// Web Worker instance (singleton)
let dataWorker: Worker | null = null;

const initializeWorker = () => {
  if (typeof window === 'undefined') return null;
  
  if (!dataWorker) {
    try {
      dataWorker = new Worker('/workers/dataProcessor.js');
    } catch (error) {
      console.warn('Web Worker not available, falling back to main thread:', error);
      return null;
    }
  }
  
  return dataWorker;
};

const postWorkerMessage = (type: string, data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const worker = initializeWorker();
    
    if (!worker) {
      // Fallback to main thread processing
      reject(new Error('Worker not available'));
      return;
    }
    
    const handleMessage = (event: MessageEvent) => {
      const { type: responseType, data: responseData, error } = event.data;
      
      if (error) {
        worker.removeEventListener('message', handleMessage);
        reject(new Error(error));
        return;
      }
      
      if (responseType === `${type}_SUCCESS`) {
        worker.removeEventListener('message', handleMessage);
        resolve(responseData);
      }
    };
    
    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type, data });
  });
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  allStartups: [],
  filteredStartups: [],
  stats: {
    totalCompanies: 0,
    totalCategories: 0,
    totalFunding: 0,
    filteredCount: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
  isFromCache: false,
  isProcessing: false,
  processingTask: null,
  
  filters: {
    search: '',
    categories: new Set<string>(),
    locations: new Set<string>(),
    yearFrom: 2000,
    yearTo: new Date().getFullYear(),
    sortBy: 'recent' as SortOption,
  },
  
  sidebarCollapsed: true,

  setStartups: (startups, lastUpdated, isFromCache = false) => {
    console.log('📊 Setting startups:', { 
      count: startups.length, 
      lastUpdated, 
      isFromCache,
      firstStartup: startups[0]
    });
    
    // Get current filters and sort function
    const { filters, sortStartups } = get();
    
    // Apply filters immediately with the new data
    console.log('🔍 Applying filters to new startups...');
    const filtered = startups.filter((startup) => {
      // Search filter
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          startup.companyName || '',
          startup.description || '',
          startup.category || '',
          startup.location || '',
          startup.ceo || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      // Category filter
      if (filters.categories.size > 0 && !filters.categories.has(startup.category || '')) {
        return false;
      }
      
      // Location filter
      if (filters.locations.size > 0) {
        const city = startup.location?.split(',')[0]?.trim() || '';
        if (!city || !filters.locations.has(city)) {
          return false;
        }
      }
      
      // Year filter
      const yearFounded = startup.yearFounded || 0;
      if (yearFounded > 0 && (yearFounded < filters.yearFrom || yearFounded > filters.yearTo)) {
        return false;
      }
      
      return true;
    });
    
    // Sort the filtered results
    const sorted = sortStartups(filtered, filters.sortBy);
    
    // Calculate stats
    const stats = calculateDashboardStats(startups, sorted);
    
    // Update all state at once
    set({ 
      allStartups: startups,
      filteredStartups: sorted,
      stats,
      lastUpdated: lastUpdated || new Date().toISOString(),
      isFromCache 
    });
    
    console.log('✅ Startups set and filtered:', {
      totalCount: startups.length,
      filteredCount: sorted.length,
      firstFiltered: sorted[0],
      sampleFiltered: sorted.slice(0, 3).map(s => ({
        id: s.id,
        companyName: s.companyName,
        category: s.category
      })),
      stats
    });
  },

  updateFilters: async (newFilters) => {
    console.log('🔧 Updating filters:', newFilters);
    
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    
    // Apply filters immediately
    get().applyFilters();
  },

  applyFilters: async () => {
    const { allStartups, filters, processDataInBackground, calculateStatsInBackground } = get();
    
    console.log('🔍 applyFilters called with:', {
      allStartupsLength: allStartups.length,
      filtersState: {
        search: filters.search,
        categoriesSize: filters.categories.size,
        locationsSize: filters.locations.size,
        yearRange: [filters.yearFrom, filters.yearTo],
        sortBy: filters.sortBy
      }
    });
    
    if (!allStartups || allStartups.length === 0) {
      console.log('⚠️ No startups to filter - allStartups is empty or undefined');
      // Set empty filtered results explicitly
      set({ 
        filteredStartups: [],
        stats: {
          totalCompanies: 0,
          totalCategories: 0,
          totalFunding: 0,
          filteredCount: 0,
        }
      });
      return;
    }

    // Sample some data for debugging
    console.log('📊 Sample startup data:', {
      sampleCount: Math.min(3, allStartups.length),
      samples: allStartups.slice(0, 3).map(s => ({
        companyName: s.companyName,
        category: s.category,
        location: s.location,
        yearFounded: s.yearFounded,
        description: s.description?.substring(0, 50) + '...'
      }))
    });

    // DEBUG MODE: Skip filtering temporarily to test data flow
    const DEBUG_SKIP_FILTERS = false; // Set to true for debugging
    
    if (DEBUG_SKIP_FILTERS) {
      console.log('🚨 DEBUG MODE: Skipping all filters, showing all data');
      const sorted = get().sortStartups(allStartups, filters.sortBy);
      const stats = calculateDashboardStats(allStartups, sorted);
      set({ 
        filteredStartups: sorted, 
        stats,
        isProcessing: false,
        processingTask: null
      });
      return;
    }

    try {
      set({ isProcessing: true, processingTask: 'Filtering companies...' });
      
      // Use main thread filtering for reliability
      console.log('🔍 Starting main thread filtering...');
      const filtered = allStartups.filter((startup) => {
        // Search filter - simple includes
        if (filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase();
          const searchableText = [
            startup.companyName || '',
            startup.description || '',
            startup.category || '',
            startup.location || '',
            startup.ceo || ''
          ].join(' ').toLowerCase();
          
          if (!searchableText.includes(searchTerm)) {
            return false;
          }
        }
        
        // Category filter
        if (filters.categories.size > 0 && !filters.categories.has(startup.category || '')) {
          return false;
        }
        
        // Location filter
        if (filters.locations.size > 0) {
          const hasLocation = Array.from(filters.locations).some(filterLoc => 
            startup.location?.includes(filterLoc)
          );
          if (!hasLocation) {
            return false;
          }
        }
        
        // Year filter
        const yearFounded = startup.yearFounded || 0;
        if (yearFounded > 0 && (yearFounded < filters.yearFrom || yearFounded > filters.yearTo)) {
          return false;
        }
        
        return true;
      });
      
      console.log('🎯 Filter results:', {
        originalCount: allStartups.length,
        filteredCount: filtered.length,
        filterPercentage: ((filtered.length / allStartups.length) * 100).toFixed(1) + '%'
      });
      
      // Sort the filtered results
      const sorted = get().sortStartups(filtered, filters.sortBy);
      
      // Calculate stats on main thread for reliability
      const stats = calculateDashboardStats(allStartups, sorted);
      
      set({ 
        filteredStartups: sorted, 
        stats,
        isProcessing: false,
        processingTask: null
      });
      
      console.log('✅ Filters applied successfully:', {
        filteredCount: sorted.length,
        stats
      });
      
    } catch (error) {
      console.error('❌ Filter application failed:', error);
      set({ 
        error: `Filter application failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isProcessing: false,
        processingTask: null
      });
    }
  },

  sortStartups: (startups, sortBy) => {
    const sorted = [...startups];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
      case 'founded':
        return sorted.sort((a, b) => (b.yearFounded || 0) - (a.yearFounded || 0));
      case 'category':
        return sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          const aTime = new Date(a.updatedDate || 0).getTime();
          const bTime = new Date(b.updatedDate || 0).getTime();
          
          // If both dates are invalid, maintain original order
          if (isNaN(aTime) && isNaN(bTime)) return 0;
          // If a is invalid, put it at the end
          if (isNaN(aTime)) return 1;
          // If b is invalid, put it at the end
          if (isNaN(bTime)) return -1;
          
          return bTime - aTime; // b - a = newest first
        });
    }
  },

  clearFilters: () => {
    console.log('🧹 Clearing all filters');
    
    set({
      filters: {
        search: '',
        categories: new Set<string>(),
        locations: new Set<string>(),
        yearFrom: 2000,
        yearTo: new Date().getFullYear(),
        sortBy: 'recent' as SortOption,
      }
    });
    
    get().applyFilters();
  },

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => {
    console.log(error ? '❌ Error set:' : '✅ Error cleared:', error);
    set({ error });
  },

  refreshData: async () => {
    const { setStartups, setLoading, setError } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Refreshing data...');
      
      const response = await fetchStartups(undefined, { 
        useCache: false, 
        forceRefresh: true,
        includeStats: true 
      });
      
      if (response.error) {
        throw new Error(response.message || 'Failed to refresh data');
      }

      const startups = response.transformedData || [];
      setStartups(startups, response.lastUpdated, false);
      
      console.log('✅ Data refreshed successfully');
      
    } catch (error) {
      console.error('❌ Data refresh failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  },

  getFilterMetadata: () => {
    const { allStartups } = get();
    
    console.log('🔍 getFilterMetadata called with:', {
      allStartupsCount: allStartups.length,
      sampleStartup: allStartups[0],
      sampleCategory: allStartups[0]?.category,
      sampleLocation: allStartups[0]?.location
    });
    
    // If no startups loaded yet, return empty arrays
    if (!allStartups || allStartups.length === 0) {
      console.log('⚠️ No startups loaded yet, returning empty metadata');
      return { categories: [], locations: [] };
    }
    
    // Try to get from cache first
    const cached = DataCache.get<{ categories: string[]; locations: string[] }>({ 
      key: CACHE_KEYS.FILTERS_META 
    });
    if (cached && cached.categories.length > 0 && cached.locations.length > 0) {
      console.log('📋 Using cached filter metadata:', JSON.stringify(cached, null, 2));
      return cached;
    } else if (cached) {
      console.log('⚠️ Found cached metadata but it was empty, clearing cache:', JSON.stringify(cached, null, 2));
      DataCache.remove(CACHE_KEYS.FILTERS_META);
    }

    // Calculate fresh metadata
    console.log('🔬 Analyzing startup data for metadata:');
    console.log('First 5 startups categories:', allStartups.slice(0, 5).map(s => s.category));
    console.log('First 5 startups locations:', allStartups.slice(0, 5).map(s => s.location));
    
    const categories = Array.from(new Set(allStartups.map(s => s.category))).filter(Boolean) as string[];
    const locations = Array.from(new Set(
      allStartups.map(s => {
        if (!s.location) return 'Unknown';
        // Extract city from "City, State/Country" format
        const city = s.location.split(',')[0].trim();
        return city || 'Unknown';
      })
    )).filter(location => location !== 'Unknown') as string[];
    
    console.log('🏷️ Extracted categories:', categories.slice(0, 10));
    console.log('📍 Extracted locations:', locations.slice(0, 10));

    const metadata = { categories, locations };
    
    console.log('📊 Generated fresh filter metadata:', JSON.stringify(metadata, null, 2));
    
    // Cache for 1 hour (only in browser) and only if we have data
    if (categories.length > 0 && locations.length > 0) {
      DataCache.set({ key: CACHE_KEYS.FILTERS_META, ttl: 60 * 60 * 1000 }, metadata);
      console.log('✅ Cached non-empty filter metadata');
    } else {
      console.log('⚠️ Not caching empty filter metadata');
    }
    
    return metadata;
  },

  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  // Web Worker methods
  processDataInBackground: async (data: any[]): Promise<Startup[]> => {
    try {
      return await postWorkerMessage('PROCESS_STARTUPS', data);
    } catch (error) {
      throw new Error(`Background processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  calculateStatsInBackground: async (companies: Startup[]): Promise<DashboardStats> => {
    try {
      return await postWorkerMessage('CALCULATE_STATISTICS', companies);
    } catch (error) {
      throw new Error(`Background stats calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  filterInBackground: async (companies: Startup[], filters: StartupFilters): Promise<Startup[]> => {
    try {
      // Convert Set to Array for worker
      const serializedFilters = {
        ...filters,
        categories: Array.from(filters.categories),
        locations: Array.from(filters.locations)
      };
      
      return await postWorkerMessage('FILTER_COMPANIES', {
        companies,
        filters: serializedFilters
      });
    } catch (error) {
      throw new Error(`Background filtering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  performVectorSearch: async () => {
    const { filters, setLoading, setError } = get();
    
    // Check if vector search conditions are met
    const searchQuery = filters.search.trim();
    if (searchQuery.length < 10) {
      console.log('🔍 Search query too short for vector search');
      return;
    }
    
    // Check if current filtered results are empty
    const currentFilteredCount = get().filteredStartups.length;
    if (currentFilteredCount > 0) {
      console.log('🔍 Text matches found, skipping vector search');
      return;
    }
    
    console.log('🚀 Performing vector search for:', searchQuery);
    
    try {
      setLoading(true);
      
      const searchResponse = await searchCompanies(searchQuery, {
        categories: filters.categories.size > 0 ? Array.from(filters.categories) : undefined,
        locations: filters.locations.size > 0 ? Array.from(filters.locations) : undefined,
        limit: 50,
      });
      
      if (!searchResponse.success) {
        throw new Error('Vector search failed');
      }
      
      // Convert search results to Startup format
      const vectorResults = searchResponse.data.map(result => ({
        id: result.id || '',
        companyName: result.companyName || '',
        description: result.description || '',
        location: result.location || '',
        category: result.category || '',
        totalFundingRaised: result.totalFundingRaised || '',
        yearFounded: result.yearFounded || 0,
        vectorSimilarity: result.vectorSimilarity,
        matchType: result.matchType,
        // Fill in other required fields with defaults
        ceo: '',
        previousExperience: '',
        keyMembers: '',
        teamSize: '',
        webpage: '',
        currentStage: '',
        targetCustomer: '',
        mainValueProposition: '',
        keyProducts: '',
        industryVerticals: '',
        uvp: '',
        technologicalAdvantage: '',
        patents: '',
        keyPartnerships: '',
        competitors: '',
        differentiation: '',
        marketPositioning: '',
        geographicFocus: '',
        latestFundingRound: '',
        keyInvestors: '',
        growthMetrics: '',
        notableCustomers: '',
        majorMilestones: '',
        updatedDate: '',
      } as Startup & { vectorSimilarity?: number; matchType?: string }));
      
      // Apply year filter if needed
      const yearFiltered = vectorResults.filter(startup => {
        const yearFounded = startup.yearFounded || 0;
        if (yearFounded > 0 && (yearFounded < filters.yearFrom || yearFounded > filters.yearTo)) {
          return false;
        }
        return true;
      });
      
      const sorted = get().sortStartups(yearFiltered, filters.sortBy);
      const stats = calculateDashboardStats(get().allStartups, sorted);
      
      set({ 
        filteredStartups: sorted, 
        stats,
        loading: false
      });
      
      console.log(`✅ Vector search completed: ${sorted.length} results`);
    } catch (error) {
      console.error('❌ Vector search failed:', error);
      setError(error instanceof Error ? error.message : 'Vector search failed');
      setLoading(false);
    }
  }
}));

 