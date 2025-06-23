'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsGrid from '@/components/layout/StatsGrid';
import AdvancedFilters from '@/components/filters/AdvancedFilters';
import VirtualizedCompanyGrid from '@/components/company/VirtualizedCompanyGrid';
import AnalyticsSidebar from '@/components/charts/AnalyticsSidebar';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchStartups, transformApiDataToStartups } from '@/lib/api';
import { Startup } from '@/types/startup';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initialize with real API data
  useEffect(() => {
    async function initializeData() {
      console.log('🚀 Starting data initialization...');
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching data from Google Apps Script API...');
        
        const data = await fetchStartups({}, { 
          useCache: true, 
          includeStats: true 
        });
        
        console.log('📥 API Response received:', {
          hasData: !!data.data,
          hasTransformedData: !!data.transformedData,
          dataLength: data.data?.length || 0,
          transformedDataLength: data.transformedData?.length || 0
        });
        
        const startups = data.transformedData || transformApiDataToStartups(data.data || []);
        
        if (startups && startups.length > 0) {
          setStartups(startups, data.lastUpdated, !!data.transformedData);
          console.log(`✅ Successfully loaded ${startups.length} companies from API`);
        } else {
          throw new Error('API에서 데이터를 받아올 수 없습니다');
        }
      } catch (error) {
        console.error('❌ API fetch failed:', error);
        setError(`API 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
        setIsInitialized(true);
        console.log('🏁 Data initialization completed');
      }
    }

    if (mounted && !isInitialized) {
      initializeData();
    }
  }, [mounted, isInitialized, setStartups, setLoading, setError]);

  const handleRetry = async () => {
    setIsInitialized(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading AI Market Data...</p>
        </div>
      </div>
    );
  }

  // Show loading state during data initialization
  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading AI Market Data...</p>
          <p className="text-white/40 text-sm mt-2">Fetching from Google Apps Script...</p>
        </div>
      </div>
    );
  }

  // Show error state if API failed and no data available
  if (error && filteredStartups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">API 연결 실패</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">{error}</p>
            <button 
              onClick={handleRetry}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 
                       disabled:bg-gray-600 disabled:cursor-not-allowed
                       text-white font-medium rounded-lg transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              다시 시도
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Google Apps Script 연결을 확인해주세요
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO를 위한 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'AI Market Watch - Dashboard',
            description: 'Real-time dashboard tracking AI startups, funding, and market trends',
            url: 'https://ai-market-watch.com',
            mainEntity: {
              '@type': 'ItemList',
              name: 'AI Startups Directory',
              numberOfItems: filteredStartups.length,
              itemListElement: filteredStartups.slice(0, 10).map((startup, index) => ({
                '@type': 'Organization',
                position: index + 1,
                name: startup.companyName,
                description: startup.description,
                url: startup.webpage,
                foundingDate: startup.yearFounded?.toString(),
                location: startup.location
              }))
            }
          })
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <Header />
          
          {/* Stats Grid */}
          <StatsGrid stats={stats} />
          

          
          {/* Filters */}
          <AdvancedFilters 
            filters={filters}
            onFiltersChange={updateFilters}
            categories={getFilterMetadata().categories}
            locations={getFilterMetadata().locations}
          />
          
          {/* Main Content - Responsive to Sidebar */}
          <div className={`transition-all duration-300 ${
            sidebarCollapsed ? 'mr-0' : 'mr-96'
          }`}>
            <VirtualizedCompanyGrid 
              companies={filteredStartups} 
              loading={loading}
            />
          </div>
        </div>

        {/* Fixed Sliding Analytics Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-96 z-40 
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'}`}>
          
          {/* Sidebar Background with Blur */}
          <div className="h-full bg-black/20 backdrop-blur-xl border-l border-white/10">
            
            {/* Sidebar Content */}
            <div className="h-full overflow-y-auto p-6 pt-8">
              <AnalyticsSidebar 
                companies={filteredStartups}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Overlay for Mobile */}
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden
                        transition-opacity duration-300
                        ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
             onClick={toggleSidebar}
        />

        {/* Enhanced Floating Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`fixed bottom-8 z-50 group
                     bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30
                     backdrop-blur-md rounded-2xl p-4 
                     transition-all duration-300 hover:scale-105 active:scale-95
                     animate-pulse-gentle shadow-lg shadow-white/5 hover:shadow-white/10
                     ${sidebarCollapsed ? 'right-8' : 'right-[25.5rem]'}`}
        >
          <BarChart3 className="w-6 h-6 text-white/80 group-hover:text-white transition-colors
                              animate-bounce-subtle" />
          
          {/* 은은한 글로우 효과 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          
          {/* 펄스 링 효과 */}
          <div className="absolute inset-0 rounded-2xl border border-white/10 
                        animate-ping-slow opacity-20"></div>
        </button>
      </div>
    </>
  );
}