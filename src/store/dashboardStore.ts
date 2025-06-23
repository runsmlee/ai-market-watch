import { create } from 'zustand';
import { Startup, StartupFilters, DashboardStats } from '@/types/startup';

interface DashboardState {
  // Data
  allStartups: Startup[];
  filteredStartups: Startup[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;

  // Filters
  filters: StartupFilters;
  
  // Actions
  setStartups: (startups: Startup[]) => void;
  updateFilters: (filters: Partial<StartupFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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
  filters: initialFilters,

  // Actions
  setStartups: (startups) => {
    set({ allStartups: startups });
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

    // Calculate stats
    const stats: DashboardStats = {
      totalCompanies: allStartups.length,
      totalCategories: new Set(allStartups.map(s => s.category)).size,
      totalFunding: calculateTotalFunding(filtered),
      filteredCount: filtered.length,
    };

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
}));

// Helper function
function calculateTotalFunding(startups: Startup[]): number {
  // Simplified calculation - in reality, parse funding strings
  return startups.length * 150000000;
} 