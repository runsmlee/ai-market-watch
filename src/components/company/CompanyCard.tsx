'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { MapPin, DollarSign, Calendar, Users, ExternalLink, Building2 } from 'lucide-react';
import { Startup } from '../../types/startup';
import { getCachedLogo, setCachedLogo } from '../../lib/logoCache';

interface CompanyCardProps {
  company: Startup;
  onClick: () => void;
}

const safeString = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

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

// Logo component with fallback
const CompanyLogo = memo(({ company }: { company: Startup }) => {
  const domain = getCompanyDomain(company);
  const cachedLogo = getCachedLogo(domain);
  
  // Try to get logo from various sources
  const logoSources = [
    cachedLogo,
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
  ].filter(Boolean);

  const handleLogoLoad = (src: string) => {
    if (!cachedLogo && src) {
      setCachedLogo(domain, src);
    }
  };

  const handleLogoError = () => {
    // Could implement fallback logic here
  };

  if (logoSources.length === 0) {
    return (
      <div className="w-10 h-10 bg-white/[0.06] border border-white/[0.1] 
                     rounded-lg flex items-center justify-center flex-shrink-0">
        <Building2 className="w-5 h-5 text-white/70" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 bg-white/[0.06] border border-white/[0.1] 
                   rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
      <Image
        src={logoSources[0]}
        alt={`${company.companyName} logo`}
        width={32}
        height={32}
        className="object-contain"
        onLoad={() => handleLogoLoad(logoSources[0])}
        onError={handleLogoError}
        unoptimized // For external logos that might not work with Next.js optimization
      />
    </div>
  );
});

CompanyLogo.displayName = 'CompanyLogo';

const CompanyCard = memo(({ company, onClick }: CompanyCardProps) => {
  // Debug log to check received data
  if (!company.companyName || company.companyName === '') {
    console.warn('⚠️ CompanyCard received company with empty name:', {
      id: company.id,
      companyName: company.companyName,
      keys: Object.keys(company),
      sampleData: JSON.stringify(company).substring(0, 200)
    });
  }
  
  return (
    <div 
      className="group relative overflow-hidden cursor-pointer h-[400px]"
      onClick={onClick}
    >
      {/* Main card with unified design */}
      <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-lg p-5 
                     hover:bg-white/[0.04] hover:border-white/[0.12]
                     transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
        
        {/* Header section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 pr-3">
            <CompanyLogo company={company} />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-2 
                            group-hover:text-white/90 transition-colors duration-300 leading-tight
                            line-clamp-2 min-h-[2.5rem]" 
                  title={safeString(company.companyName, 'Unknown Company')}>
                {safeString(company.companyName, 'Unknown Company')}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white/[0.08] border border-white/[0.12] 
                                rounded text-xs font-medium text-white/80 
                                backdrop-blur-sm truncate max-w-[120px]"
                      title={safeString(company.category, 'Uncategorized')}>
                  {truncateText(safeString(company.category, 'Uncategorized'), 15)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
            <span className="text-xs text-white/60 font-medium">Active</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 flex-shrink-0">
          <p className="text-sm text-white/75 line-clamp-3 leading-relaxed min-h-[3.5rem]"
             title={safeString(company.description, 'No description available')}>
            {safeString(company.description, 'No description available')}
          </p>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
          <div className="bg-white/[0.03] border border-white/[0.1] rounded p-3
                         hover:bg-white/[0.05] transition-colors duration-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs text-white/60 font-medium">Founded</span>
            </div>
            <div className="text-sm font-semibold text-white/95 truncate"
                 title={safeString(company.yearFounded, 'N/A')}>
              {safeString(company.yearFounded, 'N/A')}
            </div>
          </div>
          
          <div className="bg-white/[0.03] border border-white/[0.1] rounded p-3
                         hover:bg-white/[0.05] transition-colors duration-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs text-white/60 font-medium">Team</span>
            </div>
            <div className="text-sm font-semibold text-white/90 truncate"
                 title={safeString(company.teamSize, 'Unknown')}>
              {truncateText(safeString(company.teamSize, 'Unknown'), 20)}
            </div>
          </div>
        </div>

        {/* Footer section - push to bottom */}
        <div className="pt-4 border-t border-white/[0.08] mt-auto">
          <div className="flex items-center justify-between mb-3">
            {/* Funding info */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 bg-white/[0.06] border border-white/[0.1] 
                               rounded flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-white/70" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white/90 font-medium truncate"
                     title={safeString(company.totalFundingRaised, 'Undisclosed')}>
                  {truncateText(safeString(company.totalFundingRaised, 'Undisclosed'), 25)}
                </div>
                <div className="text-xs text-white/60 truncate"
                     title={safeString(company.latestFundingRound, 'No funding info')}>
                  {truncateText(safeString(company.latestFundingRound, 'No funding info'), 20)}
                </div>
              </div>
            </div>

            {/* Action indicator */}
            <div className="flex items-center gap-1.5 text-white/50 
                           group-hover:text-white/70 transition-colors duration-300 flex-shrink-0">
              <span className="text-xs font-medium">Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-white/60">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-sm truncate"
                  title={safeString(company.location, 'Location unknown')}>
              {truncateText(safeString(company.location, 'Location unknown'), 30)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

CompanyCard.displayName = 'CompanyCard';

export default CompanyCard; 