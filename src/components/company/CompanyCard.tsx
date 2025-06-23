'use client';

import React from 'react';
import { MapPin, DollarSign, Calendar, Users, ExternalLink } from 'lucide-react';
import { Startup } from '../../types/startup';

interface CompanyCardProps {
  company: Startup;
  onClick: () => void;
}

const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const CompanyCard = ({ company, onClick }: CompanyCardProps) => {
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
          <div className="flex-1 pr-3">
            <h3 className="text-base font-semibold text-white mb-2 
                          group-hover:text-white/90 transition-colors duration-300 leading-tight
                          line-clamp-2 min-h-[2.5rem]" 
                title={safeString(company.companyName)}>
              {safeString(company.companyName)}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-white/[0.08] border border-white/[0.12] 
                              rounded text-xs font-medium text-white/80 
                              backdrop-blur-sm truncate max-w-[120px]"
                    title={safeString(company.category)}>
                {truncateText(safeString(company.category), 15)}
              </span>
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
          <p className="text-sm text-white/70 line-clamp-3 leading-relaxed min-h-[3.5rem]"
             title={safeString(company.description)}>
            {safeString(company.description)}
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
            <div className="text-sm font-semibold text-white/90 truncate"
                 title={safeString(company.yearFounded)}>
              {safeString(company.yearFounded)}
            </div>
          </div>
          
          <div className="bg-white/[0.03] border border-white/[0.1] rounded p-3
                         hover:bg-white/[0.05] transition-colors duration-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs text-white/60 font-medium">Team</span>
            </div>
            <div className="text-sm font-semibold text-white/90 truncate"
                 title={safeString(company.teamSize)}>
              {truncateText(safeString(company.teamSize), 20)}
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
                     title={safeString(company.totalFundingRaised)}>
                  {truncateText(safeString(company.totalFundingRaised), 25)}
                </div>
                <div className="text-xs text-white/60 truncate"
                     title={safeString(company.latestFundingRound)}>
                  {truncateText(safeString(company.latestFundingRound), 20)}
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
                  title={safeString(company.location)}>
              {truncateText(safeString(company.location), 30)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard; 