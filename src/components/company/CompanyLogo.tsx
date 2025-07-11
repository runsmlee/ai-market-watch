'use client';

import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { Startup } from '../../types/startup';
import { getCachedLogo, setCachedLogo } from '../../lib/logoCache';

interface CompanyLogoProps {
  company: Startup;
  size?: 'sm' | 'md' | 'lg';
}

// Extract domain from company name or website for logo fetching
const getCompanyDomain = (company: Startup): string => {
  if (company.webpage) {
    try {
      const url = new URL(company.webpage.startsWith('http') ? company.webpage : `https://${company.webpage}`);
      return url.hostname.replace('www.', '');
    } catch {
      // If website URL is invalid, fallback to company name
    }
  }
  
  // Generate a domain-like string from company name
  const companyName = company.companyName || 'unknown';
  const domain = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  
  return domain ? `${domain}.com` : 'unknown.com';
};

// Generate logo sources with multiple fallback options
const getLogoSources = (company: Startup, domain: string): string[] => {
  const sources: string[] = [];
  
  // 1. Clearbit (high quality)
  sources.push(`https://logo.clearbit.com/${domain}`);
  
  // 2. Google Favicons (more reliable)
  sources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  
  // 3. DuckDuckGo favicon service
  sources.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  
  // 4. Company specific overrides based on common patterns
  const companyNameLower = company.companyName?.toLowerCase() || '';
  
  // Add GitHub avatars for known AI companies
  if (companyNameLower.includes('openai')) {
    sources.unshift('https://avatars.githubusercontent.com/u/14957082?s=200&v=4');
  } else if (companyNameLower.includes('anthropic')) {
    sources.unshift('https://avatars.githubusercontent.com/u/76263028?s=200&v=4');
  } else if (companyNameLower.includes('hugging face') || companyNameLower.includes('huggingface')) {
    sources.unshift('https://avatars.githubusercontent.com/u/25720743?s=200&v=4');
  }
  
  // 5. Favicon.io service
  sources.push(`https://favicon.io/favicon/${domain}/`);
  
  return sources;
};

// Size configurations
const sizeConfig = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', image: 24 },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5', image: 32 },
  lg: { container: 'w-12 h-12', icon: 'w-6 h-6', image: 40 },
};

const CompanyLogo = memo(({ company, size = 'md' }: CompanyLogoProps) => {
  const domain = getCompanyDomain(company);
  const cachedLogo = getCachedLogo(domain);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const config = sizeConfig[size];
  const logoSources = getLogoSources(company, domain);
  
  // If we have a cached logo, put it first
  if (cachedLogo) {
    logoSources.unshift(cachedLogo);
  }
  
  const currentSource = logoSources[currentSourceIndex];
  
  useEffect(() => {
    // Reset state when company changes
    setCurrentSourceIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [company.id]);
  
  const handleLogoLoad = () => {
    setIsLoading(false);
    setHasError(false);
    
    // Cache the successful logo URL
    if (!cachedLogo && currentSource) {
      setCachedLogo(domain, currentSource);
    }
  };
  
  const handleLogoError = () => {
    // Try next source
    if (currentSourceIndex < logoSources.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      // All sources failed
      setHasError(true);
      setIsLoading(false);
    }
  };
  
  // Fallback icon with company initial
  const renderFallback = () => {
    const initial = company.companyName?.charAt(0).toUpperCase() || '?';
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
    ];
    
    // Generate consistent color based on company name
    const colorIndex = (company.companyName || '').charCodeAt(0) % colors.length;
    const gradientColor = colors[colorIndex];
    
    return (
      <div className={`${config.container} bg-gradient-to-br ${gradientColor} 
                      rounded-lg flex items-center justify-center flex-shrink-0
                      shadow-lg shadow-black/20`}>
        <span className="text-white font-bold text-sm">{initial}</span>
      </div>
    );
  };
  
  // Show fallback if all sources failed or no sources available
  if (hasError || logoSources.length === 0) {
    return renderFallback();
  }
  
  return (
    <div className={`${config.container} bg-white/[0.06] border border-white/[0.1] 
                    rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0
                    ${isLoading ? 'animate-pulse' : ''}`}>
      {!hasError && currentSource && (
        <Image
          src={currentSource}
          alt={`${company.companyName} logo`}
          width={config.image}
          height={config.image}
          className="object-contain"
          onLoad={handleLogoLoad}
          onError={handleLogoError}
          unoptimized // For external logos
          priority={false}
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className={`${config.icon} text-white/30`} />
        </div>
      )}
    </div>
  );
});

CompanyLogo.displayName = 'CompanyLogo';

export default CompanyLogo;