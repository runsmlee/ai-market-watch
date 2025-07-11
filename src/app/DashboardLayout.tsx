'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import NavigationBar from '@/components/layout/NavigationBar';
import FilterSidebar from '@/components/layout/FilterSidebar';
import MobileNavigation from '@/components/layout/MobileNavigation';
import Footer from '@/components/layout/Footer';
import VirtualizedCompanyGrid from '@/components/company/VirtualizedCompanyGrid';
import DNAMatchFloatingButton from '@/components/dna/DNAMatchFloatingButton';
import DNAMatchModalWithCompany from '@/components/dna/DNAMatchModalWithCompany';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchStartups } from '@/lib/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const AnalyticsSidebar = dynamic(() => import('@/components/charts/AnalyticsSidebar'), {
  loading: () => <div className="p-6 animate-pulse">Loading analytics...</div>
});

export default function DashboardLayout() {
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(true);
  const [mobileTab, setMobileTab] = useState('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    allStartups,
    filteredStartups,
    filters,
    updateFilters,
    loading,
    error,
    setStartups,
    setLoading,
    setError,
    refreshData,
    getFilterMetadata,
    sidebarCollapsed,
    toggleSidebar,
    isVectorSearchActive,
  } = useDashboardStore();

  // Initialize data
  useEffect(() => {
    if (!mounted) return;

    const initializeData = async () => {
      // Don't reload if we already have data (e.g., from vector search)
      const currentState = useDashboardStore.getState();
      
      // Block initialization if vector search is active
      if (currentState.isVectorSearchActive) {
        return;
      }
      
      // Skip if already initialized
      if (isInitialized) {
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

  const filterMetadata = React.useMemo(() => {
    return getFilterMetadata();
  }, [getFilterMetadata]);

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
      {/* Fixed Navigation Bar */}
      <NavigationBar onMenuClick={() => setShowFilterSidebar(!showFilterSidebar)} />

      {/* Main Layout */}
      <div className="pt-16 flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={updateFilters}
          categories={filterMetadata.categories}
          locations={filterMetadata.locations}
          isOpen={showFilterSidebar}
        />

        {/* Main Content Area */}
        <main className={`
          flex-1 transition-all duration-300 layout-stable
          ${showFilterSidebar ? 'lg:ml-64' : 'ml-0'}
          ${sidebarCollapsed ? 'lg:mr-0' : 'lg:mr-80'}
          pb-16 md:pb-0
        `}>
          <div className="p-4 sm:p-6 lg:p-8">
            <VirtualizedCompanyGrid 
              companies={filteredStartups} 
              loading={loading}
            />
          </div>

          {/* Footer */}
          <Footer />
        </main>

        {/* Analytics Sidebar */}
        <aside className={`
          fixed top-16 right-0 bottom-0 w-80 bg-black/40 backdrop-blur-xl 
          border-l border-white/[0.08] overflow-y-auto z-30
          transform transition-transform duration-300
          ${sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'}
        `}>
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -left-10 top-8 w-8 h-16 
                     bg-black/40 backdrop-blur-xl border border-white/[0.08] border-r-0
                     rounded-l-lg flex items-center justify-center
                     hover:bg-black/50 transition-colors duration-200
                     text-white/70 hover:text-white/90"
            aria-label={sidebarCollapsed ? 'Open analytics' : 'Close analytics'}
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Sidebar Content */}
          <div className="p-6 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-white/70" />
              <h2 className="text-lg font-semibold text-white">Analytics</h2>
            </div>
            
            <AnalyticsSidebar />
          </div>
        </aside>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation 
        activeTab={mobileTab} 
        onTabChange={(tab) => {
          setMobileTab(tab);
          if (tab === 'filters') setShowFilterSidebar(true);
          if (tab === 'analytics') toggleSidebar();
          if (tab === 'dna') setShowDNAModal(true);
        }} 
      />

      {/* Floating Actions (hidden on mobile) */}
      <div className="hidden md:block">
        <DNAMatchFloatingButton onClick={() => setShowDNAModal(true)} />
      </div>
      
      {/* DNA Modal */}
      <DNAMatchModalWithCompany isOpen={showDNAModal} onClose={() => setShowDNAModal(false)} />
    </div>
  );
}