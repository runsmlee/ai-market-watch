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

const CompanyCard = ({ company, onClick }: CompanyCardProps) => {
  return (
    <div 
      className="group relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent 
                     rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Main card */}
      <div className="relative glass rounded-2xl p-6 hover:bg-white/[0.02] 
                     transition-all duration-500 hover:scale-[1.02] hover:shadow-glow
                     border-white/[0.06] group-hover:border-white/[0.1]">
        
        {/* Header section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-3">
            <h3 className="text-lg font-semibold text-white mb-2 
                          group-hover:text-gradient transition-all duration-300 leading-tight">
              {safeString(company.companyName)}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-white/10 border border-white/10 
                              rounded-full text-xs font-medium text-white/70 
                              backdrop-blur-sm">
                {safeString(company.category)}
              </span>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-subtle"></div>
              <div className="absolute inset-0 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs text-white/50 font-medium">Active</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/60 mb-4 line-clamp-2 leading-relaxed">
          {safeString(company.description)}
        </p>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-3
                         hover:bg-white/[0.04] transition-colors duration-300">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/50 font-medium uppercase tracking-wide">Founded</span>
            </div>
            <div className="text-base font-semibold text-white">
              {safeString(company.yearFounded)}
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-3
                         hover:bg-white/[0.04] transition-colors duration-300">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/50 font-medium uppercase tracking-wide">Team</span>
            </div>
            <div className="text-base font-semibold text-white">
              {safeString(company.teamSize)}
            </div>
          </div>
        </div>

        {/* Footer section */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            {/* Funding info */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-md rounded-lg"></div>
                <div className="relative w-8 h-8 bg-gradient-to-br from-white/10 to-white/5 
                               rounded-lg border border-white/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white/70" />
                </div>
              </div>
              <div>
                <div className="text-sm text-white font-semibold">
                  {safeString(company.totalFundingRaised)}
                </div>
                <div className="text-xs text-white/50">
                  {safeString(company.latestFundingRound)}
                </div>
              </div>
            </div>

            {/* Action indicator */}
            <div className="flex items-center gap-1.5 text-white/40 
                           group-hover:text-white/70 transition-colors duration-300">
              <span className="text-xs font-medium">View Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-white/50">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm">
              {safeString(company.location)}
            </span>
          </div>
        </div>

        {/* Subtle hover underline */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r 
                       from-transparent via-white/20 to-transparent 
                       scale-x-0 group-hover:scale-x-100 
                       transition-transform duration-500 origin-center"></div>
      </div>
    </div>
  );
};

export default CompanyCard; 