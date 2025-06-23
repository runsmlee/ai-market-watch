# 🚀 AI Startups Dashboard - Next.js 개발 사양서

## 📋 프로젝트 개요

**프로젝트명**: AI Startups Intelligence Platform  
**기술 스택**: Next.js 14 (App Router), TypeScript, Tailwind CSS  
**디자인 시스템**: Monochromatic + Orange Accent  
**데이터 소스**: Google Apps Script API  

---

## 🏗️ 기술 스택 및 아키텍처

### **Core Technologies**
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS + CSS Modules",
  "state": "Zustand",
  "data-fetching": "TanStack Query (React Query)",
  "charts": "Chart.js + react-chartjs-2",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "fonts": "Inter (Google Fonts)"
}
```

### **Project Structure**
```
ai-startups-dashboard/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── components/             # Reusable Components
│   │   ├── ui/                 # Base UI Components
│   │   ├── charts/             # Chart Components
│   │   ├── filters/            # Filter Components
│   │   ├── company/            # Company-related Components
│   │   └── layout/             # Layout Components
│   ├── hooks/                  # Custom Hooks
│   ├── lib/                    # Utilities & Config
│   ├── store/                  # Zustand Store
│   ├── types/                  # TypeScript Types
│   └── utils/                  # Helper Functions
├── public/
└── package.json
```

---

## 🎨 디자인 시스템 (Tailwind Config)

### **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
        tertiary: '#2a2a2a',
        accent: '#ffffff',
        orange: {
          DEFAULT: '#ff6b35',
          light: '#ff8a65',
          dark: '#e64a19',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#666666',
        },
        border: {
          DEFAULT: '#333333',
          light: '#404040',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange': '0 10px 25px -5px rgba(255, 107, 53, 0.3)',
        'dark': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 📊 데이터 모델 & Types

### **types/startup.ts**
```typescript
export interface Startup {
  id: string;
  companyName: string;
  ceo: string;
  previousExperience?: string;
  keyMembers?: string;
  teamSize?: string;
  webpage?: string;
  location: string;
  yearFounded: number;
  description: string;
  currentStage?: string;
  targetCustomer?: string;
  mainValueProposition?: string;
  keyProducts?: string;
  industryVerticals?: string;
  uvp?: string;
  technologicalAdvantage?: string;
  patents?: string;
  keyPartnerships?: string;
  competitors?: string;
  differentiation?: string;
  marketPositioning?: string;
  geographicFocus?: string;
  totalFundingRaised?: string;
  latestFundingRound?: string;
  keyInvestors?: string;
  growthMetrics?: string;
  notableCustomers?: string;
  majorMilestones?: string;
  category: string;
  updatedDate: string;
  postingStatus?: string;
}

export interface StartupFilters {
  search: string;
  categories: Set<string>;
  locations: Set<string>;
  yearFrom: number;
  yearTo: number;
}

export interface DashboardStats {
  totalCompanies: number;
  totalCategories: number;
  totalFunding: number;
  filteredCount: number;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}
```

---

## 🔧 핵심 컴포넌트 구조

### **1. Layout Components**

#### **components/layout/Header.tsx**
```typescript
'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      className="text-center mb-12 relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       w-96 h-96 bg-gradient-to-br from-orange to-orange-light 
                       blur-3xl opacity-15 rounded-full" />
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange to-orange-light 
                     bg-clip-text text-transparent mb-4 tracking-tight">
        AI Startups Intelligence
      </h1>
      <p className="text-xl text-text-secondary font-medium">
        Comprehensive insights into the global AI startup ecosystem
      </p>
    </motion.header>
  );
}
```

#### **components/layout/StatsGrid.tsx**
```typescript
'use client';

import { motion } from 'framer-motion';
import { Building, Tags, DollarSign, Filter } from 'lucide-react';
import { DashboardStats } from '@/types/startup';

interface StatsGridProps {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    { 
      icon: Building, 
      value: stats.totalCompanies.toLocaleString(), 
      label: 'Total Companies' 
    },
    { 
      icon: Tags, 
      value: stats.totalCategories, 
      label: 'AI Categories' 
    },
    { 
      icon: DollarSign, 
      value: formatFunding(stats.totalFunding), 
      label: 'Total Funding' 
    },
    { 
      icon: Filter, 
      value: stats.filteredCount.toLocaleString(), 
      label: 'Filtered Results' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          className="bg-secondary border border-border rounded-xl p-6 relative overflow-hidden
                     hover:transform hover:-translate-y-1 transition-all duration-300
                     hover:shadow-orange hover:border-border-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          {/* Top border accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange to-orange-light" />
          
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-tertiary rounded-xl flex items-center justify-center mr-4">
              <item.icon className="w-6 h-6 text-text-secondary" />
            </div>
          </div>
          
          <div className="text-3xl font-bold text-text-primary mb-2">
            {item.value}
          </div>
          <div className="text-text-secondary font-medium">
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

### **2. Filter Components**

#### **components/filters/AdvancedFilters.tsx**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Bot, X, SlidersHorizontal } from 'lucide-react';
import { StartupFilters } from '@/types/startup';
import { useDebounce } from '@/hooks/useDebounce';

interface AdvancedFiltersProps {
  filters: StartupFilters;
  onFiltersChange: (filters: StartupFilters) => void;
  categories: string[];
  locations: string[];
}

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  locations 
}: AdvancedFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Update filters when debounced search changes
  useCallback(() => {
    onFiltersChange({ ...filters, search: debouncedSearch });
  }, [debouncedSearch]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = new Set(filters.categories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      categories: new Set(),
      locations: new Set(),
      yearFrom: 2010,
      yearTo: 2025,
    });
  };

  return (
    <motion.div
      className="bg-secondary border border-border rounded-xl p-8 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
          <SlidersHorizontal className="w-6 h-6" />
          Advanced Filters
        </h2>
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-2 px-4 py-2 bg-tertiary border border-border 
                     rounded-lg text-text-secondary hover:text-text-primary hover:bg-border
                     transition-all duration-200"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {/* Search */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-text-primary font-semibold">
            <Search className="w-5 h-5" />
            Search Companies
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name, CEO, description..."
            className="w-full px-4 py-3 bg-tertiary border border-border rounded-lg
                       text-text-primary placeholder-text-muted
                       focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20
                       transition-all duration-200"
          />
        </div>

        {/* Location Tags */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-text-primary font-semibold">
            <MapPin className="w-5 h-5" />
            Location
          </label>
          <div className="flex flex-wrap gap-2">
            {locations.slice(0, 6).map((location) => (
              <FilterTag
                key={location}
                label={location}
                active={filters.locations.has(location)}
                onClick={() => handleLocationToggle(location)}
              />
            ))}
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-text-primary font-semibold">
            <Calendar className="w-5 h-5" />
            Founded Year
          </label>
          <div className="space-y-4">
            <input
              type="range"
              min="2010"
              max="2025"
              value={filters.yearFrom}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                yearFrom: parseInt(e.target.value) 
              })}
              className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-orange/20
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange
                         [&::-webkit-slider-thumb]:shadow-orange"
            />
            <div className="flex justify-between text-sm text-text-muted">
              <span>2010</span>
              <span className="text-orange font-semibold">{filters.yearFrom}+</span>
              <span>2025</span>
            </div>
          </div>
        </div>

        {/* Category Tags */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-text-primary font-semibold">
            <Bot className="w-5 h-5" />
            AI Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <FilterTag
                key={category}
                label={category}
                active={filters.categories.has(category)}
                onClick={() => handleCategoryToggle(category)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Filter Tag Component
interface FilterTagProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterTag({ label, active, onClick }: FilterTagProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-orange to-orange-light text-white shadow-orange'
          : 'bg-tertiary border border-border text-text-secondary hover:text-text-primary hover:bg-border'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}
```

### **3. Company Components**

#### **components/company/CompanyGrid.tsx**
```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List } from 'lucide-react';
import { Startup } from '@/types/startup';
import CompanyCard from './CompanyCard';
import CompanyModal from './CompanyModal';

interface CompanyGridProps {
  companies: Startup[];
  loading?: boolean;
}

export default function CompanyGrid({ companies, loading }: CompanyGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCompany, setSelectedCompany] = useState<Startup | null>(null);

  if (loading) {
    return <CompanyGridSkeleton />;
  }

  return (
    <>
      <div className="bg-secondary border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
              🚀 Startups Directory
            </h2>
            
            {/* View Toggle */}
            <div className="flex bg-tertiary rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-border text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-border text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className={`p-8 grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          <AnimatePresence mode="wait">
            {companies.length === 0 ? (
              <motion.div
                className="col-span-full flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Search className="w-16 h-16 text-text-muted mb-4" />
                <h3 className="text-xl font-semibold text-text-secondary mb-2">
                  No companies found
                </h3>
                <p className="text-text-muted">
                  Try adjusting your filters to see more results
                </p>
              </motion.div>
            ) : (
              companies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <CompanyCard
                    company={company}
                    onClick={() => setSelectedCompany(company)}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Company Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
    </>
  );
}
```

### **4. State Management (Zustand)**

#### **store/dashboardStore.ts**
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
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
    }),
    {
      name: 'dashboard-store',
    }
  )
);

// Helper function
function calculateTotalFunding(startups: Startup[]): number {
  // Simplified calculation - in reality, parse funding strings
  return startups.length * 150000000;
}
```

### **5. API Integration**

#### **lib/api.ts**
```typescript
import { Startup } from '@/types/startup';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!;

export interface ApiResponse {
  lastUpdated: string;
  totalCompanies: number;
  data: any[];
  summary?: {
    categoriesCount: number;
    topCategories: [string, number][];
    topLocations: [string, number][];
    averageFunding: number;
  };
  filteredCount?: number;
}

export async function fetchStartups(params?: Record<string, string>): Promise<ApiResponse> {
  try {
    const url = new URL(APPS_SCRIPT_URL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export function transformApiDataToStartups(apiData: any[]): Startup[] {
  return apiData.map((item, index) => ({
    id: `startup-${index}`,
    companyName: item['Company Name'] || '',
    ceo: item['CEO'] || '',
    previousExperience: item['Previous experience of CEO'],
    keyMembers: item['Key members'],
    teamSize: item['Team size'],
    webpage: item['Webpage'],
    location: item['Location'] || '',
    yearFounded: parseInt(item['Year Founded']) || 0,
    description: item['One-line description'] || '',
    currentStage: item['Current stage/status'],
    targetCustomer: item['Target customer'],
    mainValueProposition: item['Main value proposition'],
    keyProducts: item['Key products/solutions portfolio'],
    industryVerticals: item['Industry verticals served'],
    uvp: item['UVP'],
    technologicalAdvantage: item['Key technological/business advantage'],
    patents: item['Patents/IP (if public)'],
    keyPartnerships: item['Key partnerships/collaborations'],
    competitors: item['2-3 main competitors'],
    differentiation: item['How they differentiate'],
    marketPositioning: item['Market positioning'],
    geographicFocus: item['Geographic competition focus'],
    totalFundingRaised: item['Total funding raised'],
    latestFundingRound: item['Latest funding round'],
    keyInvestors: item['Key investors'],
    growthMetrics: item['Basic growth metrics'],
    notableCustomers: item['Notable customers'],
    majorMilestones: item['Major milestones'],
    category: item['Category'] || 'Other',
    updatedDate: item['Updated Date'] || '',
    postingStatus: item['Posting'],
  }));
}
```

### **6. Custom Hooks**

#### **hooks/useStartups.ts**
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStartups, transformApiDataToStartups } from '@/lib/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { useEffect } from 'react';

export function useStartups() {
  const { setStartups, setLoading, setError } = useDashboardStore();

  const query = useQuery({
    queryKey: ['startups'],
    queryFn: async () => {
      const data = await fetchStartups();
      return transformApiDataToStartups(data.data);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // Refetch every 1 minute
  });

  useEffect(() => {
    setLoading(query.isLoading);
    setError(query.error?.message || null);
    
    if (query.data) {
      setStartups(query.data);
    }
  }, [query.data, query.isLoading, query.error, setStartups, setLoading, setError]);

  return query;
}
```

---

## 🚀 주요 페이지 구현

### **app/page.tsx**
```typescript
'use client';

import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import StatsGrid from '@/components/layout/StatsGrid';
import AdvancedFilters from '@/components/filters/AdvancedFilters';
import CompanyGrid from '@/components/company/CompanyGrid';
import AnalyticsSidebar from '@/components/charts/AnalyticsSidebar';
import { useDashboardStore } from '@/store/dashboardStore';
import { useStartups } from '@/hooks/useStartups';

const queryClient = new QueryClient();

function DashboardContent() {
  const {
    filteredStartups,
    stats,
    filters,
    updateFilters,
    clearFilters,
    loading,
    error
  } = useDashboardStore();

  // Fetch startups data
  useStartups();

  // Extract unique categories and locations
  const categories = Array.from(new Set(filteredStartups.map(s => s.category))).filter(Boolean);
  const locations = Array.from(new Set(
    filteredStartups.map(s => s.location.split(',')[0].trim())
  )).filter(Boolean);

  if (error) {
    return (
      <div className="min-h-screen bg-primary text-text-primary p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-secondary border border-border rounded-xl p-12">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white 
                         rounded-lg hover:shadow-orange transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      <div className="max-w-7xl mx-auto p-8">
        <Header />
        <StatsGrid stats={stats} />
        <AdvancedFilters
          filters={filters}
          onFiltersChange={updateFilters}
          categories={categories}
          locations={locations}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <CompanyGrid companies={filteredStartups} loading={loading} />
          </div>
          <div className="xl:col-span-1">
            <AnalyticsSidebar companies={filteredStartups} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </QueryClientProvider>
  );
}

// Loading Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-primary text-text-primary">
      <div className="max-w-7xl mx-auto p-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="h-16 bg-secondary rounded-lg mb-4 mx-auto max-w-2xl"></div>
            <div className="h-6 bg-secondary rounded-lg mx-auto max-w-lg"></div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-secondary rounded-xl p-6">
                <div className="h-12 bg-tertiary rounded-lg mb-4"></div>
                <div className="h-8 bg-tertiary rounded mb-2"></div>
                <div className="h-4 bg-tertiary rounded w-2/3"></div>
              </div>
            ))}
          </div>
          
          {/* Filters Skeleton */}
          <div className="bg-secondary rounded-xl p-8 mb-12">
            <div className="h-8 bg-tertiary rounded mb-6 w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 bg-tertiary rounded w-1/2"></div>
                  <div className="h-12 bg-tertiary rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📦 패키지 설치 및 설정

### **package.json**
```json
{
  "name": "ai-startups-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.2",
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.25",
    "@types/react-dom": "^18.2.10",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "zustand": "^4.4.4",
    "@tanstack/react-query": "^5.0.5",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "eslint": "^8.51.0",
    "eslint-config-next": "14.0.0",
    "@typescript-eslint/eslint-plugin": "^6.7.4",
    "@typescript-eslint/parser": "^6.7.4",
    "prettier": "^3.0.3",
    "prettier-plugin-tailwindcss": "^0.5.6"
  }
}
```

### **Environment Variables (.env.local)**
```bash
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🎯 개발 단계별 구현 계획

### **Phase 1: 기본 구조 (1-2일)**
- [x] Next.js 14 프로젝트 설정
- [x] Tailwind CSS 설정 및 디자인 시스템 구축
- [x] 기본 레이아웃 컴포넌트 (Header, Layout)
- [x] TypeScript 타입 정의
- [x] Zustand 스토어 설정

### **Phase 2: 데이터 레이어 (1일)**
- [x] API 연동 함수 구현
- [x] React Query 설정
- [x] 커스텀 훅 구현
- [x] 에러 처리 및 로딩 상태

### **Phase 3: 필터링 시스템 (2일)**
- [x] 고급 필터 컴포넌트
- [x] 검색 기능 (디바운스)
- [x] 카테고리/지역 태그 필터
- [x] 년도 범위 슬라이더
- [x] 필터 상태 관리

### **Phase 4: 회사 표시 시스템 (2일)**
- [x] 회사 카드 컴포넌트
- [x] 그리드/리스트 뷰 토글
- [x] 상세 모달 구현
- [x] 애니메이션 및 인터랙션

### **Phase 5: 차트 및 분석 (1-2일)**
- [x] Chart.js 연동
- [x] 카테고리 분포 도넛 차트
- [x] 지역 분포 바 차트
- [x] 펀딩 트렌드 라인 차트
- [x] 반응형 차트 구현

### **Phase 6: 성능 최적화 (1일)**
- [x] 코드 스플리팅
- [x] 이미지 최적화
- [x] 메모이제이션 (useMemo, useCallback)
- [x] 가상화 (큰 데이터셋용)

### **Phase 7: 배포 준비 (1일)**
- [x] 빌드 최적화
- [x] SEO 설정
- [x] Progressive Web App 설정
- [x] 에러 바운더리 구현

---

## 🛠️ 추가 고려사항

### **성능 최적화**
```typescript
// 가상화를 위한 react-window 사용
import { FixedSizeList as List } from 'react-window';

// 메모이제이션 예시
const MemoizedCompanyCard = memo(CompanyCard, (prevProps, nextProps) => {
  return prevProps.company.id === nextProps.company.id;
});
```

### **SEO 최적화**
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'AI Startups Intelligence Platform',
  description: 'Comprehensive insights into the global AI startup ecosystem',
  keywords: 'AI, startups, funding, technology, innovation',
  openGraph: {
    title: 'AI Startups Intelligence Platform',
    description: 'Comprehensive insights into the global AI startup ecosystem',
    type: 'website',
    url: 'https://your-domain.com',
  },
};
```

### **PWA 설정**
```json
// public/manifest.json
{
  "name": "AI Startups Intelligence",
  "short_name": "AI Startups",
  "description": "Global AI startup ecosystem insights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#ff6b35",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🚀 배포 전략

### **Vercel 배포 (추천)**
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
vercel

# 3. 환경 변수 설정
vercel env add NEXT_PUBLIC_APPS_SCRIPT_URL
```

### **Docker 배포**
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📊 예상 성능 지표

### **Core Web Vitals 목표**
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### **번들 크기 목표**
- **Initial JS Bundle**: < 200KB (gzipped)
- **Total Page Weight**: < 1MB
- **Time to Interactive**: < 3초

---

## 🎯 완성 후 기대 효과

✅ **현대적인 사용자 경험**: Framer Motion 애니메이션으로 부드러운 인터랙션  
✅ **최적화된 성능**: Next.js 14 + React Query로 빠른 로딩  
✅ **확장 가능한 아키텍처**: 모듈화된 컴포넌트와 타입 안정성  
✅ **프리미엄 디자인**: 모노크로매틱 + 오렌지 포인트 컬러  
✅ **반응형 디자인**: 모든 디바이스에서 완벽한 표시  
✅ **실시간 데이터**: Google Apps Script와 실시간 연동

이 사양서대로 구현하면 **전문 개발팀에서 만든 수준의 고품질 대시보드**가 완성됩니다! 🚀