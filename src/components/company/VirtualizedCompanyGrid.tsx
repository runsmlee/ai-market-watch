'use client';

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Startup } from '@/types/startup';
import { useDashboardStore } from '@/store/dashboardStore';
import CompanyCard from './CompanyCard';
import CompanyModal from './CompanyModal';

interface VirtualizedCompanyGridProps {
  companies: Startup[];
  loading?: boolean;
}

export default function VirtualizedCompanyGrid({ 
  companies, 
  loading = false 
}: VirtualizedCompanyGridProps) {
  // Component is ready
  const [selectedCompany, setSelectedCompany] = useState<Startup | null>(null);
  
  const handleCompanyClick = (company: Startup) => {
    console.log('🖱️ Company clicked:', {
      id: company.id,
      companyName: company.companyName,
      hasAllFields: !!company.id && !!company.companyName
    });
    setSelectedCompany(company);
  };
  const [isClient, setIsClient] = useState(false);
  const { sidebarCollapsed } = useDashboardStore();
  const parentRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('🎨 VirtualizedCompanyGrid received companies:', companies.length);
    if (companies.length > 0) {
      console.log('🎨 First 3 companies:', companies.slice(0, 3).map(c => ({
        companyName: c.companyName,
        category: c.category,
        vectorSimilarity: c.vectorSimilarity
      })));
    }
  }, [companies]);

  // Ensure client-side only rendering for responsive behavior
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate grid dimensions based on screen size and sidebar state
  const getColumnsPerRow = useCallback(() => {
    if (!isClient || typeof window === 'undefined') {
      return sidebarCollapsed ? 3 : 2;
    }
    
    const width = window.innerWidth;
    
    // Mobile: always 1 column
    if (width < 768) return 1;
    
    // Tablet: 2 columns regardless of sidebar
    if (width < 1024) return 2;
    
    // Desktop: More generous spacing with sidebar open
    if (width < 1280) {
      return sidebarCollapsed ? 3 : 2; // Keep 2 columns when sidebar is open for better readability
    } else if (width < 1536) {
      return sidebarCollapsed ? 4 : 3; // Allow 3 columns on larger screens
    } else {
      return sidebarCollapsed ? 5 : 4; // Even more columns on very large screens
    }
  }, [sidebarCollapsed, isClient]);

  // Group companies into rows for virtualization
  const rows = useMemo(() => {
    const columnsPerRow = getColumnsPerRow();
    const grouped: Startup[][] = [];
    
    for (let i = 0; i < companies.length; i += columnsPerRow) {
      grouped.push(companies.slice(i, i + columnsPerRow));
    }
    
    return grouped;
  }, [companies, getColumnsPerRow]);

  // Virtual row renderer with proper scroll element
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420,
    overscan: 3,
  });

  // Dynamic grid classes based on sidebar state
  const getGridClasses = () => {
    const baseClasses = "grid gap-6";
    
    if (sidebarCollapsed) {
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`;
    } else {
      // More generous spacing when sidebar is open - prioritize card readability
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
            <span className="text-white/70">Loading companies...</span>
          </div>
        </div>
        
        {/* Loading skeletons with dynamic grid */}
        <div className="relative">
          {/* Loading indicator */}
          <div className="absolute top-2 right-2 z-10 text-xs text-white/40 bg-black/30 px-2 py-1 rounded-full border border-white/10">
            ⏳ Loading...
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm border border-white/[0.05] rounded-xl p-4 sm:p-6 lg:p-8">
            <div className={getGridClasses()}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No companies found</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Try adjusting your filters or search terms to find more companies.
        </p>
      </div>
    );
  }

  // Use virtualization for large datasets
  if (companies.length > 50) {
    return (
      <>
        <div className="space-y-8">
          {/* Results info with grid status */}
          <div className="flex items-center justify-between">
            <div className="text-white/70">
              Showing <span className="text-white font-medium">{companies.length}</span> companies
              {isClient && (
                <span className="text-white/50 text-sm ml-2">
                  • {getColumnsPerRow()} columns • Virtualized
                </span>
              )}
            </div>
            
            {/* Performance indicator */}
            <div className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              🚀 Virtualized rendering
            </div>
          </div>

          {/* Virtualized container */}
          <div className="relative">
            {/* Scroll hint indicator */}
            <div className="absolute top-2 right-2 z-10 text-xs text-white/40 bg-black/30 px-2 py-1 rounded-full border border-white/10">
              ↕ Scroll to explore
            </div>
            
            <div
              ref={parentRef}
              className="h-[80vh] overflow-auto bg-black/20 backdrop-blur-sm border border-white/[0.05] rounded-xl p-4 sm:p-6 lg:p-8
                         custom-scrollbar relative"
              style={{
                contain: 'strict',
              }}
            >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) return null;

                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className={getGridClasses()}>
                      {row.map((company) => (
                        <CompanyCard 
                          key={company.id} 
                          company={company}
                          onClick={() => handleCompanyClick(company)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
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

  // Regular grid for smaller datasets
  return (
    <>
      <div className="space-y-8">
        {/* Results info with grid status */}
        <div className="flex items-center justify-between">
          <div className="text-white/70">
            Showing <span className="text-white font-medium">{companies.length}</span> companies
            {isClient && (
              <span className="text-white/50 text-sm ml-2">
                • {getColumnsPerRow()} columns
              </span>
            )}
          </div>
          
          {/* Performance indicator */}
          <div className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            🚀 Optimized grid
          </div>
        </div>

        {/* Dynamic grid based on sidebar state */}
        <div className="relative">
          {/* Visual indicator for grid container */}
          <div className="absolute top-2 right-2 z-10 text-xs text-white/40 bg-black/30 px-2 py-1 rounded-full border border-white/10">
            📋 {companies.length} companies
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm border border-white/[0.05] rounded-xl p-4 sm:p-6 lg:p-8">
            <div className={getGridClasses()}>
              {companies.map((company) => (
                <CompanyCard 
                  key={company.id} 
                  company={company}
                  onClick={() => handleCompanyClick(company)}
                />
              ))}
            </div>
          </div>
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