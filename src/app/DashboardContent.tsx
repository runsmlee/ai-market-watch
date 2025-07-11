'use client';

import React, { useEffect, useState, Suspense, lazy, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StatsGrid from '@/components/layout/StatsGrid';
import HeroSearch from '@/components/search/HeroSearch';
import AdvancedFilters from '@/components/filters/AdvancedFilters';
import DNAMatchFloatingButton from '@/components/dna/DNAMatchFloatingButton';
import DNAMatchModalWithCompany from '@/components/dna/DNAMatchModalWithCompany';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchStartups, transformApiDataToStartups } from '@/lib/api';
import { Startup } from '@/types/startup';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Lazy load heavy components
import VirtualizedCompanyGrid from '@/components/company/VirtualizedCompanyGrid';
const AnalyticsSidebar = lazy(() => import('@/components/charts/AnalyticsSidebar'));
const PerformanceMonitor = lazy(() => import('@/components/layout/PerformanceMonitor'));

// Loading components
const GridSkeleton = () => (
  <div className="space-y-8">
    <div className="text-center">
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
        <span className="text-white/70">Loading components...</span>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
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

const SidebarSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 bg-gray-700 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

export default function DashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDNAModal, setShowDNAModal] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    filteredStartups,
    stats,
    filters,
    updateFilters,
    loading,
    error,
    setStartups,
    setLoading,
    setError,
    lastUpdated,
    isFromCache,
    refreshData,
    getFilterMetadata,
    sidebarCollapsed,
    toggleSidebar,
  } = useDashboardStore();

  // Initialize data
  useEffect(() => {
    if (!mounted || isInitialized) return;

    const initializeData = async () => {
      // Don't reload if we already have data (e.g., from vector search)
      const currentState = useDashboardStore.getState();
      if (currentState.allStartups.length > 0 || currentState.filteredStartups.length > 0) {
        console.log('📊 Data already loaded, skipping initialization');
        setIsInitialized(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Initializing dashboard data...');
        
        const response = await fetchStartups(undefined, { 
          useCache: false, 
          forceRefresh: true,
          includeStats: true 
        });

        if (response.error) {
          throw new Error(response.message || 'Failed to fetch data');
        }

        const startups = response.transformedData || [];
        setStartups(startups, response.lastUpdated, false);
        setIsInitialized(true);
        
        console.log('✅ Dashboard initialized successfully');
        
      } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [mounted, isInitialized, setStartups, setLoading, setError]);

  // Log current state for debugging
  useEffect(() => {
    console.log('🔄 Dashboard state changed:', {
      allStartupsCount: filteredStartups.length,
      loading,
      error,
      isInitialized,
      stats
    });
  }, [filteredStartups.length, loading, error, isInitialized, stats]);

  // Memoize filter metadata to prevent infinite loops
  const filterMetadata = useMemo(() => {
    return getFilterMetadata();
  }, [filteredStartups.length]);

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Data</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 
                     border border-white/20 rounded-lg text-white font-medium
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-950">
      {/* Header, Stats, Filters - Keep container margins */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <Header />
        
        {/* Stats Grid */}
        <StatsGrid stats={stats} />
        
        {/* Hero Search - Moved below stats for better flow */}
        <HeroSearch />
        
        {/* Advanced Filters - Renamed from Filters */}
        <AdvancedFilters 
          filters={filters}
          onFiltersChange={updateFilters}
          categories={filterMetadata.categories}
          locations={filterMetadata.locations}
        />
      </div>

      {/* Main Content - Full width with internal padding */}
      <div className={`w-full transition-all duration-300 ${
        sidebarCollapsed ? 'pr-0' : 'pr-80'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <VirtualizedCompanyGrid 
            companies={filteredStartups} 
            loading={loading}
          />
        </div>
      </div>
      
      {/* Footer - Keep container margins */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'mr-0' : 'mr-80'
        }`}>
          <Footer />
        </div>
      </div>

      {/* Fixed Sliding Analytics Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 z-40 
                      transform transition-transform duration-300 ease-in-out
                      ${sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'}`}>
        
        {/* Sidebar Background with Blur */}
        <div className="h-full bg-black/40 backdrop-blur-xl border-l border-white/[0.15]">
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-16 
                     bg-black/40 backdrop-blur-xl border border-white/[0.15] border-r-0
                     rounded-l-lg flex items-center justify-center
                     hover:bg-black/50 transition-colors duration-200
                     text-white/70 hover:text-white/90"
            aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
          
          {/* Sidebar Content */}
          <div className="h-full overflow-y-auto p-6 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-white/70" />
              <h2 className="text-lg font-semibold text-white">Analytics</h2>
            </div>
            
            <Suspense fallback={<SidebarSkeleton />}>
              <AnalyticsSidebar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden
                      transition-opacity duration-300
                      ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
           onClick={toggleSidebar}
      />

      {/* Performance Monitor (Development Only) */}
      <Suspense fallback={null}>
        <PerformanceMonitor />
      </Suspense>
      
      {/* DNA Match Floating Button & Modal */}
      <DNAMatchFloatingButton onClick={() => setShowDNAModal(true)} />
      <DNAMatchModalWithCompany isOpen={showDNAModal} onClose={() => setShowDNAModal(false)} />
    </div>
  );
}