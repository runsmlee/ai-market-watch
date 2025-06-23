'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Wifi, WifiOff, ArrowUpDown } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { SortOption } from '@/types/startup';

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const { lastUpdated, isFromCache, loading, refreshData, filters, updateFilters } = useDashboardStore();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleSortChange = (sortBy: SortOption) => {
    updateFilters({ sortBy });
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'name', label: 'Name' },
    { value: 'founded', label: 'Founded' },
    { value: 'category', label: 'Category' },
  ];

  const formatLastUpdated = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    // Use consistent ISO date format for longer periods
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      {/* 구조화된 데이터 추가 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AI Market Watch',
            description: 'AI Startups Intelligence Platform',
            url: 'https://ai-market-watch.com',
            logo: 'https://ai-market-watch.com/logo.png',
            sameAs: [
              'https://twitter.com/aimarketwatch',
              'https://linkedin.com/company/aimarketwatch'
            ]
          })
        }}
      />
      
      <header className="relative mb-16 text-center">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 
                         w-[800px] h-[400px] bg-gradient-to-br 
                         from-white/[0.02] via-white/[0.01] to-transparent 
                         blur-3xl rounded-full animate-float" />
          <div className="absolute -top-20 left-1/4 transform -translate-x-1/2 
                         w-[600px] h-[300px] bg-gradient-to-tr 
                         from-white/[0.01] to-transparent 
                         blur-2xl rounded-full animate-pulse-subtle" />
          <div className="absolute -top-32 right-1/4 transform translate-x-1/2 
                         w-[500px] h-[250px] bg-gradient-to-bl 
                         from-white/[0.015] to-transparent 
                         blur-2xl rounded-full" style={{ animationDelay: '3s' }} />
        </div>
        
        {/* Main content */}
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Logo and subtitle */}
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 pt-8 sm:pt-12">
            <div className="relative group">
              {/* Logo with subtle glow effect */}
              <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Image 
                src="/ai-market-watch-logo.png" 
                alt="AI Market Watch Logo" 
                width={60} 
                height={60}
                className="sm:w-20 sm:h-20 opacity-90 relative z-10 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            
            {/* Elegant subtitle */}
            <div className="text-center space-y-1.5 sm:space-y-2">
              <div className="hero-subtitle text-xs font-extralight text-white/50 tracking-[0.25em]">
                AI Startups Intelligence Platform
              </div>
              <div className="elegant-divider w-8 sm:w-12 mx-auto"></div>
            </div>
          </div>
            
          {/* Main heading with improved typography */}
          <h1 className="hero-title text-3xl sm:text-4xl lg:text-6xl mb-4 sm:mb-6 text-center">
            <div className="text-gradient-elegant font-light">AI Market Watch</div>
          </h1>
          
          {/* Enhanced description */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <p className="text-base sm:text-lg lg:text-xl text-white/70 font-light leading-relaxed mb-3 sm:mb-4">
              Lively insights into the global 
              <span className="text-white/90 font-normal"> AI startup ecosystem</span>
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/40 font-light flex-wrap">
              <span>Real-time intelligence</span>
              <div className="w-1 h-1 bg-white/30 rounded-full"></div>
              <span>Market analysis</span>
              <div className="w-1 h-1 bg-white/30 rounded-full"></div>
              <span>Startup tracking</span>
            </div>
          </div>

          {/* Data status, sorting, and refresh */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-white/50 mb-6">
            <div className="flex items-center gap-2">
              {isFromCache ? (
                <Wifi className="w-3 h-3 text-orange-400" />
              ) : (
                <WifiOff className="w-3 h-3 text-green-400" />
              )}
              <span className={isFromCache ? 'text-orange-400' : 'text-green-400'}>
                {isFromCache ? 'Cached Data' : 'Fresh Data'}
              </span>
            </div>
            
            <div className="hidden sm:block w-px h-3 bg-white/20"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-subtle"></div>
              <span>Updated {formatLastUpdated(lastUpdated)}</span>
            </div>
            
            <div className="hidden sm:block w-px h-3 bg-white/20"></div>
            
            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3 h-3 text-white/40" />
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="bg-transparent border-none text-white/70 text-sm focus:outline-none hover:text-white transition-colors cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="hidden sm:block w-px h-3 bg-white/20"></div>
            
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 
                       text-white/70 hover:text-white transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} 
                                  transition-transform duration-300`} />
              <span className="text-xs font-medium">Refresh</span>
            </button>
          </div>

          {/* Dynamic trending indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-white/30 mb-4">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Live market intelligence</span>
            <div className="flex gap-1 ml-2">
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
} 