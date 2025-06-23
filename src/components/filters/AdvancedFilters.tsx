'use client';

import { useState, useCallback, useEffect } from 'react';
import { StartupFilters } from '@/types/startup';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, MapPin, Calendar, Bot, ChevronDown, ChevronUp, X, Settings } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false); // Start expanded to see filters
  const debouncedSearch = useDebounce(searchValue, 300);

  console.log('🎛️ AdvancedFilters render:', {
    categoriesCount: categories.length,
    locationsCount: locations.length,
    categories: categories.slice(0, 3),
    locations: locations.slice(0, 3),
    isCollapsed
  });

  // Update filters when debounced search changes
  useEffect(() => {
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
    });
  };

  return (
    <div className="relative mb-16">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent rounded-2xl"></div>
      
      {/* Main container */}
      <div className="relative glass-strong rounded-2xl border-white/[0.08] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/[0.06]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-4 text-2xl font-semibold text-white 
                     hover:text-gradient transition-all duration-300 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 blur-lg rounded-xl"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 
                             rounded-xl border border-white/10 flex items-center justify-center
                             group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-6 h-6 text-white/80" />
              </div>
            </div>
            <span>Advanced Filters</span>
            <div className="transition-transform duration-300">
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronUp className="w-5 h-5 text-white/60" />
              )}
            </div>
          </button>
          
          <button
            onClick={clearAllFilters}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Collapsible Filters Content */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${
          isCollapsed ? 'max-h-0' : 'max-h-[1000px]'
        }`}>
          <div className="p-8">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              
              {/* Search */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white font-semibold text-lg">
                  <Search className="w-5 h-5 text-white/60" />
                  Search Companies
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search by name, CEO, description..."
                    className="w-full px-4 py-4 bg-white/[0.02] border border-white/[0.08] rounded-xl
                             text-white placeholder-white/40 backdrop-blur-sm
                             focus:outline-none focus:border-white/20 focus:bg-white/[0.04]
                             transition-all duration-300"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                   w-5 h-5 text-white/40" />
                </div>
              </div>

              {/* Location Tags */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white font-semibold text-lg">
                  <MapPin className="w-5 h-5 text-white/60" />
                  Location ({locations.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.length === 0 ? (
                    <div className="text-white/50 text-sm">No locations available</div>
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

              {/* Year Range */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white font-semibold text-lg">
                  <Calendar className="w-5 h-5 text-white/60" />
                  Founded Year
                </label>
                <div className="space-y-4">
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
                      className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer
                               focus:outline-none
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                               [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white 
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                               [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">2010</span>
                    <span className="text-white font-semibold px-3 py-1 bg-white/[0.08] 
                                   rounded-full border border-white/[0.1]">
                      {filters.yearFrom}+
                    </span>
                    <span className="text-white/50">2025</span>
                  </div>
                </div>
              </div>

              {/* Category Tags */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white font-semibold text-lg">
                  <Bot className="w-5 h-5 text-white/60" />
                  AI Categories ({categories.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.length === 0 ? (
                    <div className="text-white/50 text-sm">No categories available</div>
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

// Filter Tag Component
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
      className={`group relative px-4 py-2 rounded-full text-sm font-medium 
                 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        active
          ? 'bg-white text-black border border-white/20 shadow-glow'
          : 'bg-white/[0.05] border border-white/[0.1] text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15]'
      }`}
    >
      {/* Background glow for active state */}
      {active && (
        <div className="absolute inset-0 bg-white/20 blur-lg rounded-full opacity-30"></div>
      )}
      <span className="relative">{label}</span>
    </button>
  );
} 