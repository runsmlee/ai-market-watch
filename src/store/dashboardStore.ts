import { create } from 'zustand';
import { Startup, StartupFilters, DashboardStats, SortOption } from '@/types/startup';
import { calculateDashboardStats } from '@/lib/statistics';
import { fetchStartups } from '@/lib/api';
import { DataCache, CACHE_KEYS } from '@/lib/cache';
import { searchCompanies, SearchResult } from '@/lib/search';

interface DashboardState {
  // Data
  allStartups: (Startup | SearchResult)[];
  originalStartups: (Startup | SearchResult)[]; // Store original data before vector search
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
  getFilterMetadata: (options?: { forceRefresh?: boolean }) => { categories: string[]; locations: string[] };
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
  originalStartups: [],
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
    // Store original data separately and allow normal data loading even during vector search
    const { isVectorSearchActive } = get();
    
    // Always store original data for filter metadata
    set({ originalStartups: startups });
    
    // Don't override filtered results if vector search is active
    if (isVectorSearchActive) {
      console.log('📌 Vector search active - storing original data but preserving search results');
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
      originalStartups: startups, // Keep backup of original data
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
        const { originalStartups } = get();
        set({ 
          isVectorSearchActive: false,
          allStartups: originalStartups, // Restore original data
          filters: { ...currentState.filters, ...newFilters }
        });
        
        // Re-apply filters to original data
        get().applyFilters();
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
    if (isVectorSearchActive) {
      // Always preserve vector search order regardless of vectorSimilarity field presence
      console.log('🎯 Preserving vector search similarity order');
      return sorted;
    }
    
    // Also check if any item has vectorSimilarity field (backup check)
    if (sorted.length > 0 && 'vectorSimilarity' in sorted[0] && (sorted[0] as SearchResult).vectorSimilarity !== undefined) {
      console.log('🎯 Preserving similarity order based on vectorSimilarity field');
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
    
    const { originalStartups } = get();
    
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
      isVectorSearchActive: false,
      allStartups: originalStartups // Restore original data
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

  getFilterMetadata: (options?: { forceRefresh?: boolean }) => {
    const { allStartups, filteredStartups, originalStartups, isVectorSearchActive } = get();
    
    // Always use original data for filter metadata to show all available options
    const startupsToAnalyze = originalStartups.length > 0 ? originalStartups : allStartups;
    
    console.log('🔍 getFilterMetadata called:', {
      allStartupsLength: allStartups.length,
      filteredStartupsLength: filteredStartups.length,
      isVectorSearchActive,
      startupsToAnalyzeLength: startupsToAnalyze.length,
      sampleData: startupsToAnalyze.slice(0, 3).map(s => ({ 
        category: s.category, 
        location: s.location, 
        yearFounded: s.yearFounded 
      }))
    });
    
    // If no startups loaded yet, return empty arrays
    if (!startupsToAnalyze || startupsToAnalyze.length === 0) {
      console.log('⚠️ No startups data available for filter metadata');
      return { categories: [], locations: [] };
    }
    
    // Skip cache during vector search or if forceRefresh is requested
    if (!isVectorSearchActive && !options?.forceRefresh) {
      // Try to get from cache first
      const cached = DataCache.get<{ categories: string[]; locations: string[] }>({ 
        key: CACHE_KEYS.FILTERS_META 
      });
      if (cached && cached.categories.length > 0 && cached.locations.length > 0) {
        console.log('📦 Using cached filter metadata:', cached);
        return cached;
      }
    }
    
    // Clear potentially corrupted cache if forceRefresh
    if (options?.forceRefresh) {
      console.log('🧹 Force refreshing filter metadata - clearing cache');
      DataCache.remove(CACHE_KEYS.FILTERS_META);
    }

    
    // Extract categories - be more lenient with filtering
    const categories = Array.from(new Set(
      startupsToAnalyze
        .map(s => String(s.category || '').trim())
        .filter(cat => cat.length > 0 && cat.toLowerCase() !== 'other')
    )) as string[];
    
    // Extract locations - be more robust with parsing
    const locations = Array.from(new Set(
      startupsToAnalyze
        .map(s => {
          const location = String(s.location || '').trim();
          if (!location) return null;
          // Handle various location formats
          const city = location.split(',')[0].trim();
          return city.length > 0 ? city : null;
        })
        .filter(Boolean)
    )) as string[];
    

    const metadata = { categories, locations };
    
    console.log('📊 Filter metadata extracted:', {
      categoriesCount: categories.length,
      locationsCount: locations.length,
      sampleCategories: categories.slice(0, 8),
      sampleLocations: locations.slice(0, 8),
      totalStartups: startupsToAnalyze.length,
      emptyCategories: startupsToAnalyze.filter(s => !s.category || s.category.trim() === '').length,
      emptyLocations: startupsToAnalyze.filter(s => !s.location || s.location.trim() === '').length
    });
    
    
    // Cache for 1 hour (only in browser) and only if we have meaningful data AND not in vector search mode
    if (!isVectorSearchActive && categories.length > 0 && locations.length > 0 && startupsToAnalyze.length > 0) {
      console.log('💾 Caching filter metadata');
      DataCache.set({ key: CACHE_KEYS.FILTERS_META, ttl: 60 * 60 * 1000 }, metadata);
    } else {
      console.log('⚠️ Skipping cache - insufficient data or vector search active');
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
      
      // Log vector search results for debugging
      console.log('🎯 Vector search results:', {
        count: vectorResults.length,
        sampleSimilarities: vectorResults.slice(0, 5).map((r, i) => ({
          index: i,
          company: r.companyName,
          similarity: (r as SearchResult).vectorSimilarity,
          matchType: (r as SearchResult).matchType
        }))
      });
      
      
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
      
      // 🔧 CRITICAL: Only update filteredStartups, keep allStartups as original data
      set({ 
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

 