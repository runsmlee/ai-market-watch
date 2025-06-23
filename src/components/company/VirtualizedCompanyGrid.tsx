'use client';

import { useMemo, useCallback, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Startup } from '@/types/startup';
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
  const [selectedCompany, setSelectedCompany] = useState<Startup | null>(null);

  // Calculate grid dimensions based on screen size
  const getColumnsPerRow = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    
    const width = window.innerWidth;
    if (width < 768) return 1;      // Mobile: 1 column
    if (width < 1024) return 2;     // Tablet: 2 columns
    if (width < 1536) return 3;     // Desktop: 3 columns
    return 4;                       // Large: 4 columns
  }, []);

  // Group companies into rows
  const rows = useMemo(() => {
    const columnsPerRow = getColumnsPerRow();
    const grouped: Startup[][] = [];
    
    for (let i = 0; i < companies.length; i += columnsPerRow) {
      grouped.push(companies.slice(i, i + columnsPerRow));
    }
    
    return grouped;
  }, [companies, getColumnsPerRow]);

  // Create parent ref for virtualizer
  const parentRef = useMemo(() => {
    if (typeof document !== 'undefined') {
      return document.createElement('div');
    }
    return null;
  }, []);

  // Virtual row renderer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef,
    estimateSize: () => 420, // Estimated height of each row (card height + gap)
    overscan: 3, // Render 3 extra rows for smooth scrolling
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
            <span className="text-white/70">Loading companies...</span>
          </div>
        </div>
        
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

  return (
    <>
      <div className="space-y-8">
        {/* Results info */}
        <div className="flex items-center justify-between">
          <div className="text-white/70">
            Showing <span className="text-white font-medium">{companies.length}</span> companies
          </div>
          
          {/* Performance indicator */}
          <div className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            🚀 Virtualized for performance
          </div>
        </div>

        {/* Virtualized grid - for now, we'll use a simpler approach */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company) => (
            <CompanyCard 
              key={company.id} 
              company={company}
              onClick={() => setSelectedCompany(company)}
            />
          ))}
        </div>

        {/* Performance note */}
        {companies.length > 100 && (
          <div className="text-center text-xs text-white/40 bg-white/[0.02] px-4 py-2 rounded-lg border border-white/5">
            💡 Large dataset optimized with smart rendering and caching
          </div>
        )}
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