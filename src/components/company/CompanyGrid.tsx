'use client';

import { useState } from 'react';
import { Startup } from '@/types/startup';
import CompanyCard from './CompanyCard';
import CompanyModal from './CompanyModal';
import { Grid3X3, List, Search, LayoutGrid } from 'lucide-react';

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
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent rounded-2xl"></div>
        
        {/* Main container */}
        <div className="relative glass-strong rounded-2xl border-white/[0.08] overflow-hidden">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0 p-6 lg:p-8 border-b border-white/[0.06]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-lg rounded-xl"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 
                               rounded-xl border border-white/10 flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-white/80" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-1">
                  Startups Directory
                </h1>
                <p className="text-sm lg:text-base text-white/60 font-medium">
                  Discover and explore innovative AI startups
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/[0.02] border border-white/[0.08] 
                             rounded-xl p-1 backdrop-blur-sm w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 sm:flex-none px-4 py-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-black shadow-glow' 
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 mx-auto sm:mx-0" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-none px-4 py-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white text-black shadow-glow' 
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <List className="w-4 h-4 mx-auto sm:mx-0" />
                </button>
              </div>
              
              {/* Company Count */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] 
                             border border-white/[0.1] rounded-full backdrop-blur-sm w-full sm:w-auto justify-center sm:justify-start">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-subtle"></div>
                <span className="text-sm font-medium text-white/70">
                  {companies.length} companies
                </span>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="p-4 lg:p-8">
            {companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 
                                 rounded-2xl border border-white/10 flex items-center justify-center">
                    <Search className="w-10 h-10 text-white/60" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white/80 mb-3">
                  No companies found
                </h3>
                <p className="text-white/50 text-lg">
                  Try adjusting your filters to see more results
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {companies.map((company, index) => (
                  <div
                    key={company.id}
                    className="stagger-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CompanyCard
                      company={company}
                      onClick={() => setSelectedCompany(company)}
                    />
                  </div>
                ))}
              </div>
            )}
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

// Loading Skeleton Component
function CompanyGridSkeleton() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent rounded-2xl"></div>
      
      <div className="relative glass-strong rounded-2xl border-white/[0.08] overflow-hidden">
        {/* Header skeleton */}
        <div className="flex items-center justify-between p-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/[0.08] rounded-xl animate-pulse"></div>
            <div>
              <div className="h-8 bg-white/[0.08] rounded-lg w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-white/[0.05] rounded-lg w-48 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-12 bg-white/[0.08] rounded-xl w-24 animate-pulse"></div>
            <div className="h-10 bg-white/[0.08] rounded-full w-32 animate-pulse"></div>
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-8 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="h-6 bg-white/[0.08] rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-white/[0.05] rounded w-1/2"></div>
                </div>
                <div className="w-3 h-3 bg-white/[0.08] rounded-full"></div>
              </div>
              <div className="h-4 bg-white/[0.05] rounded mb-6 w-full"></div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="h-16 bg-white/[0.05] rounded-xl"></div>
                <div className="h-16 bg-white/[0.05] rounded-xl"></div>
              </div>
              <div className="h-12 bg-white/[0.05] rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 