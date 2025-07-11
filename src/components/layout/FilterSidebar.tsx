'use client';

import { useState, useEffect } from 'react';
import { StartupFilters } from '@/types/startup';
import { Search, MapPin, Calendar, Bot, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useDashboardStore } from '@/store/dashboardStore';

interface FilterSidebarProps {
  filters: StartupFilters;
  onFiltersChange: (filters: StartupFilters) => void;
  categories: string[];
  locations: string[];
  isOpen?: boolean;
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, icon, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-white/90">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({ 
  filters, 
  onFiltersChange, 
  categories, 
  locations,
  isOpen = true 
}: FilterSidebarProps) {
  const [textSearch, setTextSearch] = useState(filters.search);
  const debouncedTextSearch = useDebounce(textSearch, 300);
  const { stats, isVectorSearchActive } = useDashboardStore();

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedTextSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedTextSearch });
    }
  }, [debouncedTextSearch, filters, onFiltersChange]);

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
    setTextSearch('');
    onFiltersChange({
      search: '',
      categories: new Set(),
      locations: new Set(),
      yearFrom: 2010,
      yearTo: 2025,
      sortBy: 'recent' as const,
    });
  };

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    filters.categories.size +
    filters.locations.size +
    (filters.yearFrom > 2010 || filters.yearTo < 2025 ? 1 : 0);

  return (
    <aside className={`
      fixed left-0 top-16 bottom-0 w-64 bg-black/40 backdrop-blur-xl 
      border-r border-white/[0.08] overflow-y-auto
      transform transition-transform duration-300 z-30
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}>
      {/* Header */}
      <div className="sticky top-0 bg-black/60 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/70" />
            <h2 className="text-sm font-semibold text-white">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 bg-white/90 text-gray-900 rounded text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-white/60 hover:text-white/90 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        {/* Vector Search Indicator */}
        {isVectorSearchActive && (
          <div className="mt-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
            🔍 Semantic search active
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="text-xs text-white/60">
          Showing <span className="font-semibold text-white/90">{stats.filteredCount}</span> of{' '}
          <span className="font-semibold text-white/90">{stats.totalCompanies}</span> companies
        </div>
      </div>

      {/* Filter Sections */}
      <div className="py-2">
        {/* Text Search */}
        <FilterSection 
          title="Text Search" 
          icon={<Search className="w-4 h-4 text-white/60" />}
          defaultOpen={true}
        >
          <input
            type="text"
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            placeholder="Company, CEO, keywords..."
            className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] 
                     rounded-lg text-sm text-white/90 placeholder-white/40
                     focus:bg-white/[0.06] focus:border-white/[0.12] focus:outline-none
                     transition-all duration-200"
          />
        </FilterSection>

        {/* Categories */}
        <FilterSection 
          title={`Categories (${categories.length})`}
          icon={<Bot className="w-4 h-4 text-white/60" />}
          defaultOpen={true}
        >
          <div className="space-y-1.5">
            {categories.slice(0, 10).map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/[0.04] 
                         cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.has(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-3.5 h-3.5 bg-white/10 border border-white/20 rounded 
                           text-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-white/70 group-hover:text-white/90 truncate">
                  {category}
                </span>
              </label>
            ))}
            {categories.length > 10 && (
              <div className="text-xs text-white/40 pl-2 pt-1">
                +{categories.length - 10} more
              </div>
            )}
          </div>
        </FilterSection>

        {/* Locations */}
        <FilterSection 
          title={`Locations (${locations.length})`}
          icon={<MapPin className="w-4 h-4 text-white/60" />}
          defaultOpen={false}
        >
          <div className="space-y-1.5">
            {locations.slice(0, 10).map((location) => (
              <label
                key={location}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/[0.04] 
                         cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={filters.locations.has(location)}
                  onChange={() => handleLocationToggle(location)}
                  className="w-3.5 h-3.5 bg-white/10 border border-white/20 rounded 
                           text-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-white/70 group-hover:text-white/90 truncate">
                  {location}
                </span>
              </label>
            ))}
            {locations.length > 10 && (
              <div className="text-xs text-white/40 pl-2 pt-1">
                +{locations.length - 10} more
              </div>
            )}
          </div>
        </FilterSection>

        {/* Year Range */}
        <FilterSection 
          title="Founded Year"
          icon={<Calendar className="w-4 h-4 text-white/60" />}
          defaultOpen={false}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                From {filters.yearFrom}
              </label>
              <input
                type="range"
                min="2010"
                max="2025"
                value={filters.yearFrom}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  yearFrom: parseInt(e.target.value) 
                })}
                className="w-full h-1.5 bg-white/[0.1] rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>2010</span>
              <span>2025</span>
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}