'use client';

import { useState, useCallback, useEffect } from 'react';
import { StartupFilters } from '@/types/startup';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, MapPin, Calendar, Bot, ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

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
  const [isCollapsed, setIsCollapsed] = useState(true); // Always start collapsed
  const debouncedSearch = useDebounce(searchValue, 300);
  const performVectorSearch = useDashboardStore(state => state.performVectorSearch);

  console.log('🎛️ AdvancedFilters render:', {
    categoriesCount: categories.length,
    locationsCount: locations.length,
    categories: categories.slice(0, 3),
    locations: locations.slice(0, 3),
    isCollapsed
  });

  // Update filters when debounced search changes
  useEffect(() => {
    const newFilters = { ...filters, search: debouncedSearch };
    onFiltersChange(newFilters);
  }, [debouncedSearch, onFiltersChange]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = new Set(filters.categories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleLocationToggle = (location: string) => {
    const newLocations = new Set(filters.locations);
    if (newLocations.has(location)) {
      newLocations.delete(location);
    } else {
      newLocations.add(location);
    }
    onFiltersChange({ ...filters, locations: newLocations });
  };

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      categories: new Set(),
      locations: new Set(),
      yearFrom: 2010,
      yearTo: 2025,
      sortBy: 'recent' as const,
    });
  };

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.categories.size > 0) count += filters.categories.size;
    if (filters.locations.size > 0) count += filters.locations.size;
    if (filters.yearFrom > 2010 || filters.yearTo < 2025) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Background glow - 통일된 스타일 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent rounded-xl"></div>
      
      {/* Main container - 더 미니멀한 스타일 */}
      <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-lg sm:rounded-xl 
                      backdrop-blur-sm overflow-hidden">
        {/* Header - 컴팩트한 디자인 */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-white/[0.05]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-medium text-white/90 
                     hover:text-white transition-all duration-200 group"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/[0.06] border border-white/[0.08] 
                           rounded-md flex items-center justify-center
                           group-hover:bg-white/[0.08] transition-colors duration-200">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
            </div>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <div className="px-1.5 py-0.5 bg-white/90 text-gray-900 rounded text-xs font-semibold min-w-[1.25rem] text-center">
                {activeFiltersCount}
              </div>
            )}
            <div className="transition-transform duration-200">
              {isCollapsed ? (
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/50" />
              ) : (
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-white/50" />
              )}
            </div>
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 
                       bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12]
                       rounded-md text-xs sm:text-sm font-medium text-white/70 hover:text-white/90
                       transition-all duration-200"
            >
              <X className="w-3 h-3" />
              Clear ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Collapsible Filters Content */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${
          isCollapsed ? 'max-h-0' : 'max-h-[800px]'
        }`}>
          <div className="p-3 sm:p-4">
            {/* Filters Grid - 더 컴팩트한 간격 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Search - 미니멀한 스타일 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-white/70 tracking-wide uppercase">
                  <Search className="w-3 h-3 text-white/50" />
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchValue.trim()) {
                        console.log('🔍 Enter key pressed with query:', searchValue.trim());
                        performVectorSearch();
                      }
                    }}
                    placeholder="Company, CEO, description..."
                    className="w-full px-3 py-2 sm:px-3 sm:py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-md
                             text-sm text-white/90 placeholder-white/40 backdrop-blur-sm
                             focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.03]
                             transition-all duration-200"
                  />
                  <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 
                                   w-3.5 h-3.5 text-white/30" />
                </div>
              </div>

              {/* Location Tags - 컴팩트한 디자인 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-white/70 tracking-wide uppercase">
                  <MapPin className="w-3 h-3 text-white/50" />
                  Location ({locations.length})
                </label>
                <div className="flex flex-wrap gap-1">
                  {locations.length === 0 ? (
                    <div className="text-white/40 text-xs py-2">No locations available</div>
                  ) : (
                    locations.slice(0, 6).map((location) => (
                      <FilterTag
                        key={location}
                        label={location}
                        active={filters.locations.has(location)}
                        onClick={() => handleLocationToggle(location)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Year Range - 미니멀한 슬라이더 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-white/70 tracking-wide uppercase">
                  <Calendar className="w-3 h-3 text-white/50" />
                  Founded
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="range"
                      min="2010"
                      max="2025"
                      value={filters.yearFrom}
                      onChange={(e) => onFiltersChange({ 
                        ...filters, 
                        yearFrom: parseInt(e.target.value) 
                      })}
                      className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer
                               focus:outline-none
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                               [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                               [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm"
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">2010</span>
                    <span className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.08] 
                                   rounded text-white/90 font-medium text-xs">
                      {filters.yearFrom}+
                    </span>
                    <span className="text-white/40">2025</span>
                  </div>
                </div>
              </div>

              {/* Category Tags - 컴팩트한 디자인 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-white/70 tracking-wide uppercase">
                  <Bot className="w-3 h-3 text-white/50" />
                  Category ({categories.length})
                </label>
                <div className="flex flex-wrap gap-1">
                  {categories.length === 0 ? (
                    <div className="text-white/40 text-xs py-2">No categories available</div>
                  ) : (
                    categories.slice(0, 8).map((category) => (
                      <FilterTag
                        key={category}
                        label={category}
                        active={filters.categories.has(category)}
                        onClick={() => handleCategoryToggle(category)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Tag Component - 더 미니멀하고 세련된 디자인
interface FilterTagProps {
  label: string;
  active: boolean;
  onClick: () => void;
  key?: string;
}

function FilterTag({ label, active, onClick }: FilterTagProps) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-medium border transition-all duration-200 
                 backdrop-blur-sm hover:scale-[1.02] ${active 
                   ? 'bg-white/90 text-gray-900 border-white/90 shadow-sm' 
                   : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08] hover:text-white/90 hover:border-white/[0.12]'
                 }`}
    >
      {label}
    </button>
  );
} 