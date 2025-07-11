'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useDebounce } from '@/hooks/useDebounce';

const PLACEHOLDER_EXAMPLES = [
  "AI companies building autonomous driving solutions...",
  "Startups using LLMs for healthcare diagnostics...",
  "Computer vision companies in retail analytics...",
  "B2B AI tools for sales automation...",
  "Natural language processing for customer service...",
  "AI-powered cybersecurity platforms...",
  "Machine learning for financial forecasting...",
  "Generative AI for creative industries..."
];

export default function HeroSearch() {
  const [searchValue, setSearchValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const debouncedSearch = useDebounce(searchValue, 300);
  
  const { 
    updateFilters, 
    performVectorSearch, 
    loading,
    searchQuery
  } = useDashboardStore();

  // Rotate placeholder examples
  useEffect(() => {
    if (!isTyping && !isFocused) {
      const interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isTyping, isFocused]);

  // Update filters and perform search when debounced search changes
  useEffect(() => {
    if (debouncedSearch) {
      // Perform vector search, which will update filters internally
      performVectorSearch(debouncedSearch);
    } else {
      // Only update filters when search is cleared
      updateFilters({ search: '' });
    }
  }, [debouncedSearch, updateFilters]); // Remove performVectorSearch from deps to prevent loops

  // Remove pulse effect after first interaction
  useEffect(() => {
    if (searchValue || isFocused) {
      setShowPulse(false);
    }
  }, [searchValue, isFocused]);

  const handleSearch = () => {
    const trimmedQuery = searchValue.trim();
    if (trimmedQuery) {
      console.log('🔍 Enter pressed - performing immediate vector search with query:', trimmedQuery);
      // Pass the current value directly to bypass debounce
      performVectorSearch(trimmedQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="relative mb-8 sm:mb-12">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent blur-3xl" />
      
      <div className="relative">
        {/* Marketing copy */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/[0.12] rounded-full mb-4 animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-white/80" />
            <span className="text-sm font-medium text-white/90 tracking-wide">🚀 Vector-Based Semantic Search</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4">
            Discover <span className="text-gradient-elegant font-medium">AI companies</span> with natural language
          </h2>
          
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto font-light">
            Describe what you're looking for in plain English - our AI understands context, not just keywords
          </p>
        </div>

        {/* Search container */}
        <div className="max-w-4xl mx-auto">
          <div className={`
            relative group transition-all duration-300
            ${isFocused ? 'scale-[1.03]' : ''}
            ${showPulse ? 'animate-pulse-border' : ''}
          `}>
            {/* Enhanced glow effect on focus */}
            <div className={`
              absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl 
              opacity-0 group-hover:opacity-100 transition-opacity duration-500
              ${isFocused ? 'opacity-100 animate-gradient-x' : ''}
            `} />
            
            {/* Search input container with enhanced styling */}
            <div className="relative bg-gradient-to-r from-white/[0.06] to-white/[0.03] border border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center">
                <div className="pl-7 pr-5">
                  <Search className="w-6 h-6 text-white/50" />
                </div>
                
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                  className="flex-1 py-6 sm:py-7 pr-4 bg-transparent text-lg sm:text-xl text-white 
                           placeholder-white/40 focus:outline-none transition-all duration-200 font-light"
                />
                
                <button
                  onClick={handleSearch}
                  disabled={!searchValue.trim() || loading}
                  className={`
                    mr-4 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-base sm:text-lg
                    flex items-center gap-2.5 transition-all duration-200
                    ${searchValue.trim() && !loading
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105' 
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Discover</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search hints with enhanced styling */}
          <div className="mt-6 text-center">
            {searchQuery && !loading ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/70">AI is analyzing companies similar to:</span>
                <span className="font-medium text-white">"{searchQuery}"</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1 text-sm text-white/50">
                  <Sparkles className="w-4 h-4 text-purple-400/60" />
                  <span>Example searches:</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button 
                    onClick={() => setSearchValue("AI for sustainable energy")}
                    className="px-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-full hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white transition-all"
                  >
                    "AI for sustainable energy"
                  </button>
                  <button 
                    onClick={() => setSearchValue("Computer vision in manufacturing")}
                    className="px-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-full hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white transition-all"
                  >
                    "Computer vision in manufacturing"
                  </button>
                  <button 
                    onClick={() => setSearchValue("LLMs for healthcare diagnostics")}
                    className="px-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-full hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white transition-all"
                  >
                    "LLMs for healthcare"
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}