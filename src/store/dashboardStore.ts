import { create } from 'zustand';
import { Startup, StartupFilters, DashboardStats } from '@/types/startup';
import { calculateDashboardStats } from '@/lib/statistics';
import { DataCache, CACHE_KEYS } from '@/lib/cache';

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
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
  getFilterMetadata: () => { categories: string[]; locations: string[] };
}

const initialFilters: StartupFilters = {
  search: '',
  categories: new Set(),
  locations: new Set(),
  yearFrom: 2010,
  yearTo: 2025,
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

  // Actions
  setStartups: (startups, lastUpdated, isFromCache = false) => {
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

    // Use optimized stats calculation
    const stats = calculateDashboardStats(allStartups, filtered);

    set({ 
      filteredStartups: filtered,
      stats 
    });
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  refreshData: async () => {
    const { fetchStartups } = await import('@/lib/api');
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
    
    // Try to get from cache first
    const cached = DataCache.get<{ categories: string[]; locations: string[] }>({ 
      key: CACHE_KEYS.FILTERS_META 
    });
    if (cached) return cached;

    // Calculate fresh metadata
    const categories = Array.from(new Set(allStartups.map(s => s.category))).filter(Boolean) as string[];
    const locations = Array.from(new Set(
      allStartups.map(s => s.location ? s.location.split(',')[0].trim() : 'Unknown')
    )).filter(Boolean) as string[];

    const metadata = { categories, locations };
    
    // Cache for 1 hour
    DataCache.set({ key: CACHE_KEYS.FILTERS_META, ttl: 60 * 60 * 1000 }, metadata);
    
    return metadata;
  },
}));

 