'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import Image from 'next/image';

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const { lastUpdated, isFromCache, loading, refreshData } = useDashboardStore();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRefresh = async () => {
    await refreshData();
  };

  const formatLastUpdated = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="relative mb-20 text-center">
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
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <Image 
            src="/ai-market-watch-logo.png" 
            alt="AI Market Watch Logo" 
            width={150} 
            height={150}
            className="opacity-100"
          />
        </div>
          
        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          <span className="text-gradient">AI Market Watch</span>
        </h1>
        
        {/* Description */}
        <p className="text-xl md:text-2xl text-white/60 font-light mb-8 max-w-2xl mx-auto leading-relaxed">
          Lively insights into the global 
          <span className="text-white/80 font-medium"> AI startup ecosystem</span>
        </p>

        {/* Data status and refresh */}
        <div className="flex items-center justify-center gap-6 text-sm text-white/50 mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            {isFromCache ? (
              <Wifi className="w-4 h-4 text-orange-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-green-400" />
            )}
            <span className={isFromCache ? 'text-orange-400' : 'text-green-400'}>
              {isFromCache ? 'Cached Data' : 'Fresh Data'}
            </span>
          </div>
          
          <div className="w-px h-4 bg-white/20"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-subtle"></div>
            <span>Updated {formatLastUpdated(lastUpdated)}</span>
          </div>
          
          <div className="w-px h-4 bg-white/20"></div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 
                       rounded-full hover:bg-white/10 hover:border-white/20 
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">
              {loading ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>

        {/* WeeklyVentures Credit */}
        <div className="flex items-center justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-white/[0.02] 
                           blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <a 
              href="https://weeklyventures.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative flex items-center gap-3 px-6 py-3 bg-white/[0.02] 
                         border border-white/[0.08] rounded-full backdrop-blur-sm
                         hover:bg-white/[0.05] hover:border-white/[0.15] 
                         transition-all duration-300 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">
                  Provided by
                </span>
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                  WeeklyVentures
                </span>
              </div>
              <div className="w-3 h-3 text-white/40 group-hover:text-white/60 transition-colors">
                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M3.5 3L8.5 8M8.5 8V4M8.5 8H4.5" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
} 