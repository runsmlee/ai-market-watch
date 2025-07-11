'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, Wifi, WifiOff, Menu, X } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';

interface NavigationBarProps {
  onMenuClick?: () => void;
}

export default function NavigationBar({ onMenuClick }: NavigationBarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchValue, 300);
  
  const { 
    lastUpdated, 
    isFromCache, 
    loading, 
    refreshData,
    updateFilters,
    performVectorSearch,
    searchQuery
  } = useDashboardStore();

  // Update filters when debounced search changes
  useEffect(() => {
    updateFilters({ search: debouncedSearch });
  }, [debouncedSearch, updateFilters]);

  // Handle clicks outside search area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchValue.trim()) {
      performVectorSearch(searchValue.trim());
      setShowMobileSearch(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatLastUpdated = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="flex items-center justify-between h-14 sm:h-16">
        {/* Left: Logo & Menu */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden px-4 py-4 hover:bg-white/[0.04] transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-white/70" />
          </button>
          
          <div className="flex items-center gap-2.5 px-4 lg:px-8 h-full">
            <Image 
              src="/logo_without_text.png" 
              alt="AI Market Watch" 
              width={28} 
              height={28}
              priority={true}
              className="opacity-90"
            />
            <span className="hidden sm:block text-sm font-medium text-white/90 whitespace-nowrap">
              AI Market Watch
            </span>
          </div>
        </div>

        {/* Center: Search - Absolute centered */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
            <div ref={searchRef} className="relative">
              <div className={`
                relative flex items-center transition-all duration-300
                ${isSearchFocused ? 'scale-[1.02]' : ''}
                ${!isSearchFocused && !searchValue ? 'animate-pulse-orange-subtle' : ''}
              `}>
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg blur-xl 
                  opacity-0 transition-opacity duration-500
                  ${isSearchFocused ? 'opacity-100' : ''}
                `} />
                
                <div className="relative flex items-center w-full">
                  <Search className="absolute left-3 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="🔍 AI semantic search - describe any company..."
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/[0.12] 
                             rounded-xl text-sm text-white/95 placeholder-white/50 font-medium
                             focus:bg-white/[0.08] focus:border-white/[0.16] focus:outline-none
                             transition-all duration-200 hover:bg-white/[0.07]"
                  />
                  {searchValue && (
                    <button
                      onClick={() => setSearchValue('')}
                      className="absolute right-3 p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3 h-3 text-white/40" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search helper text */}
              {isSearchFocused && !searchValue && (
                <div className="absolute top-full left-0 right-0 mt-2 px-4 py-3 bg-black/95 backdrop-blur-xl 
                               border border-white/[0.12] rounded-xl shadow-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-1 animate-pulse"></div>
                    <div className="text-xs space-y-2">
                      <p className="text-white/90 font-semibold">🚀 AI-powered search understands your intent</p>
                      <p className="text-white/70">Describe in natural language: &quot;computer vision for retail&quot;, &quot;LLMs for education&quot;</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search status */}
              {searchQuery && isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 px-3 py-2 bg-black/90 backdrop-blur-xl 
                               border border-white/[0.08] rounded-lg text-xs text-white/60">
                  <span>Finding companies similar to: &quot;{searchQuery}&quot;</span>
                </div>
              )}
            </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-2 px-4 lg:px-8">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            aria-label="Toggle search"
          >
            <Search className="w-4 h-4 text-white/70" />
          </button>

          {/* Data Status */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
            {isFromCache ? (
              <Wifi className="w-3 h-3 text-orange-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-green-400" />
            )}
            <span>{formatLastUpdated(lastUpdated)}</span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-white/20" />

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/[0.04] transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-white/50 group-hover:text-white/70 
                                ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden py-3 border-t border-white/[0.08] px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you're looking for and press Enter..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] 
                       rounded-lg text-sm text-white/90 placeholder-white/40
                       focus:bg-white/[0.06] focus:border-white/[0.12] focus:outline-none
                       transition-all duration-200"
              autoFocus
            />
          </div>
        </div>
      )}
    </nav>
  );
}