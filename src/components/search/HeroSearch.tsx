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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs font-medium text-white/70 tracking-wide">AI-Powered Discovery</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white mb-3">
            Describe the <span className="text-gradient-elegant font-normal">AI company</span> you're looking for
          </h2>
          
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto">
            Use natural language to find AI startups - powered by semantic search
          </p>
        </div>

        {/* Search container */}
        <div className="max-w-3xl mx-auto">
          <div className={`
            relative group transition-all duration-300
            ${isFocused ? 'scale-[1.02]' : ''}
          `}>
            {/* Glow effect on focus */}
            <div className={`
              absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-xl 
              opacity-0 group-hover:opacity-100 transition-opacity duration-500
              ${isFocused ? 'opacity-100' : ''}
            `} />
            
            {/* Search input container */}
            <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="flex items-center">
                <div className="pl-6 pr-4">
                  <Search className="w-5 h-5 text-white/40" />
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
                  className="flex-1 py-5 sm:py-6 pr-4 bg-transparent text-base sm:text-lg text-white/90 
                           placeholder-white/30 focus:outline-none transition-all duration-200"
                />
                
                <button
                  onClick={handleSearch}
                  disabled={!searchValue.trim() || loading}
                  className={`
                    mr-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                    flex items-center gap-2 transition-all duration-200
                    ${searchValue.trim() && !loading
                      ? 'bg-white text-gray-900 hover:bg-white/90 hover:scale-105' 
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>Search</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search hints */}
          <div className="mt-4 text-center">
            {searchQuery && !loading ? (
              <div className="inline-flex items-center gap-2 text-sm text-white/60">
                <span>Finding AI companies similar to:</span>
                <span className="font-medium text-white/80">"{searchQuery}"</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                <span>Try searching for:</span>
                <button 
                  onClick={() => setSearchValue("AI for sustainable energy")}
                  className="hover:text-white/70 transition-colors"
                >
                  "AI for sustainable energy"
                </button>
                <span className="text-white/20">•</span>
                <button 
                  onClick={() => setSearchValue("Computer vision in manufacturing")}
                  className="hover:text-white/70 transition-colors"
                >
                  "Computer vision in manufacturing"
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}