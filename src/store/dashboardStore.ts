import { create } from 'zustand';
import { Startup, StartupFilters, DashboardStats, SortOption } from '@/types/startup';
import { calculateDashboardStats } from '@/lib/statistics';
import { fetchStartups } from '@/lib/api';
import { DataCache, CACHE_KEYS } from '@/lib/cache';
import { searchCompanies, SearchResult } from '@/lib/search';

interface DashboardState {
  // Data
  allStartups: (Startup | SearchResult)[];
  filteredStartups: (Startup | SearchResult)[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isFromCache: boolean;

  // Filters
  filters: StartupFilters;
  searchQuery: string | null;
  isVectorSearchActive: boolean;
  
  // Performance
  isProcessing: boolean;
  processingTask: string | null;
  
  // Actions
  setStartups: (startups: (Startup | SearchResult)[], lastUpdated?: string, isFromCache?: boolean) => void;
  updateFilters: (filters: Partial<StartupFilters>) => void;
  applyFilters: () => Promise<void>;
  performVectorSearch: (query?: string) => Promise<void>;
  sortStartups: (startups: (Startup | SearchResult)[], sortBy: SortOption) => (Startup | SearchResult)[];
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
  getFilterMetadata: () => { categories: string[]; locations: string[] };
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Web Worker actions
  processDataInBackground: (data: any[]) => Promise<(Startup | SearchResult)[]>;
  calculateStatsInBackground: (companies: (Startup | SearchResult)[]) => Promise<DashboardStats>;
  filterInBackground: (companies: (Startup | SearchResult)[], filters: StartupFilters) => Promise<(Startup | SearchResult)[]>;
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
  searchQuery: null,
  isVectorSearchActive: false,
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
    // Don't override if vector search is active
    const { isVectorSearchActive } = get();
    if (isVectorSearchActive) {
      return;
    }
    
    // Get current filters and sort function
    const { filters, sortStartups } = get();
    
    // Apply filters immediately with the new data
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
    
  },

  updateFilters: async (newFilters) => {
    const currentState = get();
    
    // During vector search, only allow clearing search filter
    if (currentState.isVectorSearchActive) {
      // Only process if search is being cleared
      if ('search' in newFilters && newFilters.search === '') {
        // Reset to full data when clearing vector search
        set({ 
          isVectorSearchActive: false,
          filters: { ...currentState.filters, ...newFilters }
        });
        
        // Reload full dataset
        const { refreshData } = get();
        refreshData();
        return;
      }
      
      // Block all other filter updates during vector search
      return;
    }
    
    // Normal filter update
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    
    // Apply filters immediately
    get().applyFilters();
  },

  applyFilters: async () => {
    const { allStartups, filters, processDataInBackground, calculateStatsInBackground, isVectorSearchActive, filteredStartups } = get();
    
    // Don't apply text-based filtering when vector search is active
    if (isVectorSearchActive) {
      return;
    }
    
    
    if (!allStartups || allStartups.length === 0) {
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
    
    // During vector search, preserve similarity order
    const { isVectorSearchActive } = get();
    if (isVectorSearchActive && sorted.length > 0 && 'vectorSimilarity' in sorted[0] && (sorted[0] as SearchResult).vectorSimilarity !== undefined) {
      // Keep the original order from vector search (already sorted by similarity)
      return sorted;
    }
    
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
      },
      searchQuery: null,
      isVectorSearchActive: false
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
    const { allStartups, filteredStartups, isVectorSearchActive } = get();
    
    // Use filteredStartups during vector search to show current results metadata
    const startupsToAnalyze = isVectorSearchActive ? filteredStartups : allStartups;
    
    console.log('🔍 getFilterMetadata called:', {
      allStartupsLength: allStartups.length,
      filteredStartupsLength: filteredStartups.length,
      isVectorSearchActive,
      startupsToAnalyzeLength: startupsToAnalyze.length
    });
    
    // If no startups loaded yet, return empty arrays
    if (!startupsToAnalyze || startupsToAnalyze.length === 0) {
      return { categories: [], locations: [] };
    }
    
    // Skip cache during vector search
    if (!isVectorSearchActive) {
      // Try to get from cache first
      const cached = DataCache.get<{ categories: string[]; locations: string[] }>({ 
        key: CACHE_KEYS.FILTERS_META 
      });
      if (cached && cached.categories.length > 0 && cached.locations.length > 0) {
        return cached;
      }
    }

    
    const categories = Array.from(new Set(startupsToAnalyze.map(s => s.category))).filter(Boolean) as string[];
    const locations = Array.from(new Set(
      startupsToAnalyze.map(s => {
        if (!s.location) return 'Unknown';
        // Extract city from "City, State/Country" format
        const city = s.location.split(',')[0].trim();
        return city || 'Unknown';
      })
    )).filter(location => location !== 'Unknown') as string[];
    

    const metadata = { categories, locations };
    
    console.log('📊 Filter metadata:', {
      categoriesCount: categories.length,
      locationsCount: locations.length,
      sampleCategories: categories.slice(0, 5),
      sampleLocations: locations.slice(0, 5)
    });
    
    
    // Cache for 1 hour (only in browser) and only if we have data AND not in vector search mode
    if (!isVectorSearchActive && categories.length > 0 && locations.length > 0) {
      DataCache.set({ key: CACHE_KEYS.FILTERS_META, ttl: 60 * 60 * 1000 }, metadata);
    }
    
    return metadata;
  },

  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  // Web Worker methods
  processDataInBackground: async (data: any[]): Promise<(Startup | SearchResult)[]> => {
    try {
      return await postWorkerMessage('PROCESS_STARTUPS', data);
    } catch (error) {
      throw new Error(`Background processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  calculateStatsInBackground: async (companies: (Startup | SearchResult)[]): Promise<DashboardStats> => {
    try {
      return await postWorkerMessage('CALCULATE_STATISTICS', companies);
    } catch (error) {
      throw new Error(`Background stats calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  filterInBackground: async (companies: (Startup | SearchResult)[], filters: StartupFilters): Promise<(Startup | SearchResult)[]> => {
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

  performVectorSearch: async (query?: string) => {
    const { filters, setLoading, setError } = get();
    
    // Use provided query or fall back to filter search
    const searchQuery = (query || filters.search).trim();
    if (!searchQuery) {
      console.log('🔍 No search query for vector search');
      return;
    }
    
    console.log('🚀 Performing vector search for:', searchQuery);
    
    // First set vector search active, then update search filter
    set({ 
      searchQuery, 
      isVectorSearchActive: true,
      filters: { ...filters, search: searchQuery }
    });
    console.log('🛡️ Vector search protection activated');
    
    try {
      setLoading(true);
      
      const searchResponse = await searchCompanies(searchQuery, {
        categories: filters.categories.size > 0 ? Array.from(filters.categories) : undefined,
        locations: filters.locations.size > 0 ? Array.from(filters.locations) : undefined,
        limit: 50,
        forceVectorSearch: true,
      });
      
      if (!searchResponse.success) {
        throw new Error('Vector search failed');
      }
      
      
      // 🔧 FIX: Use search results directly instead of overriding with empty strings
      // searchResponse.data already contains all the fields from SearchResult (extends Startup)
      const vectorResults = searchResponse.data;
      
      
      // Apply year filter if needed
      const yearFiltered = vectorResults.filter(startup => {
        const yearFounded = startup.yearFounded || 0;
        if (yearFounded > 0 && (yearFounded < filters.yearFrom || yearFounded > filters.yearTo)) {
          return false;
        }
        return true;
      });
      
      const sorted = get().sortStartups(yearFiltered, filters.sortBy);
      // Use vectorResults for stats calculation, not old allStartups
      const stats = calculateDashboardStats(vectorResults, sorted);
      
      // 🔧 CRITICAL: Set both allStartups and filteredStartups to prevent override
      set({ 
        allStartups: vectorResults,  // This is the key - set the full dataset
        filteredStartups: sorted, 
        stats,
        loading: false
      });
      
    } catch (error) {
      console.error('❌ Vector search failed:', error);
      setError(error instanceof Error ? error.message : 'Vector search failed');
      setLoading(false);
      set({ isVectorSearchActive: false });
    }
  }
}));

 