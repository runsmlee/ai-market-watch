import { create } from 'zustand';
import { Startup, StartupFilters, DashboardStats, SortOption } from '@/types/startup';
import { calculateDashboardStats } from '@/lib/statistics';
import { DataCache, CACHE_KEYS } from '@/lib/cache';
import { fetchStartups } from '@/lib/api';

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
  
  // Actions
  setStartups: (startups: Startup[], lastUpdated?: string, isFromCache?: boolean) => void;
  updateFilters: (filters: Partial<StartupFilters>) => void;
  applyFilters: () => void;
  sortStartups: (startups: Startup[], sortBy: SortOption) => Startup[];
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
  getFilterMetadata: () => { categories: string[]; locations: string[] };
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const initialFilters: StartupFilters = {
  search: '',
  categories: new Set(),
  locations: new Set(),
  yearFrom: 2010,
  yearTo: 2025,
  sortBy: 'recent',
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
  filters: initialFilters,
  sidebarCollapsed: true, // 기본값을 숨김으로 변경

  // Actions
  setStartups: (startups, lastUpdated, isFromCache = false) => {
    console.log('🏪 Store: Setting startups:', {
      count: startups.length,
      sampleStartup: startups[0],
      lastUpdated,
      isFromCache
    });
    
    set({ 
      allStartups: startups, 
      lastUpdated: lastUpdated || null,
      isFromCache 
    });
    get().applyFilters();
  },

  updateFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { allStartups, filters } = get();
    
    let filtered = allStartups.filter((startup) => {
      // Search filter
      if (filters.search) {
        const searchText = [
          startup.companyName,
          startup.ceo,
          startup.description,
          startup.category,
        ].join(' ').toLowerCase();
        
        if (!searchText.includes(filters.search.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (filters.categories.size > 0) {
        if (!filters.categories.has(startup.category)) {
          return false;
        }
      }

      // Location filter
      if (filters.locations.size > 0) {
        const location = startup.location.split(',')[0].trim();
        if (!filters.locations.has(location)) {
          return false;
        }
      }

      // Year filter
      if (startup.yearFounded < filters.yearFrom || 
          startup.yearFounded > filters.yearTo) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered = get().sortStartups(filtered, filters.sortBy);

    // Use optimized stats calculation
    const stats = calculateDashboardStats(allStartups, filtered);

    set({ 
      filteredStartups: filtered,
      stats 
    });
  },

  sortStartups: (startups: Startup[], sortBy: SortOption): Startup[] => {
    return [...startups].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Sort by updatedDate in descending order (most recent first)
          if (!a.updatedDate && !b.updatedDate) return 0;
          if (!a.updatedDate) return 1;
          if (!b.updatedDate) return -1;
          
          const dateA = new Date(a.updatedDate);
          const dateB = new Date(b.updatedDate);
          
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateB.getTime() - dateA.getTime();
          }
          
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          return 0;

        case 'name':
          return a.companyName.localeCompare(b.companyName);

        case 'founded':
          return b.yearFounded - a.yearFounded; // Most recent founded year first

        case 'category':
          const categoryCompare = a.category.localeCompare(b.category);
          if (categoryCompare === 0) {
            return a.companyName.localeCompare(b.companyName); // Secondary sort by name
          }
          return categoryCompare;

        default:
          return 0;
      }
    });
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  refreshData: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetchStartups({}, { forceRefresh: true, includeStats: true });
      const startups = response.transformedData || [];
      get().setStartups(startups, response.lastUpdated, false);
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh data' });
    } finally {
      set({ loading: false });
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
}));

 