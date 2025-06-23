'use client';

import { DashboardStats } from '@/types/startup';
import { formatFunding } from '@/lib/api';
import { Building2, Tag, DollarSign, Filter } from 'lucide-react';

interface StatsGridProps {
  stats: DashboardStats;
}

// Safe number formatting (consistent across server/client)
const formatNumber = (num: number): string => {
  try {
    return new Intl.NumberFormat('en-US').format(num);
  } catch (error) {
    // Fallback for environments without Intl support
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

export default function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    { 
      value: formatNumber(stats.totalCompanies), 
      label: 'Total Companies',
      icon: Building2,
    },
    { 
      value: stats.totalCategories.toString(), 
      label: 'AI Categories',
      icon: Tag,
    },
    { 
      value: formatFunding(stats.totalFunding), 
      label: 'Total Funding',
      icon: DollarSign,
    },
    { 
      value: formatNumber(stats.filteredCount), 
      label: 'Filtered Results',
      icon: Filter,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8 lg:mb-12">
      {statItems.map((item, index) => (
        <div
          key={item.label}
          className="group relative"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Minimal glass card */}
          <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-lg sm:rounded-xl p-3 sm:p-5 
                         hover:bg-white/[0.03] hover:border-white/[0.08]
                         transition-all duration-300 backdrop-blur-sm">
            
            {/* Header with icon and value */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1 min-w-0">
                {/* Value - more restrained size */}
                <div className="text-lg sm:text-2xl font-semibold text-white tracking-tight mb-1">
                  {item.value}
                </div>
                {/* Label - subtle and elegant */}
                <div className="text-xs font-medium text-white/50 tracking-wide uppercase leading-tight">
                  {item.label}
                </div>
              </div>
              
              {/* Minimal icon */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/[0.04] border border-white/[0.08] 
                             rounded-md sm:rounded-lg flex items-center justify-center ml-2 sm:ml-3
                             group-hover:bg-white/[0.06] transition-colors duration-300 flex-shrink-0">
                <item.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              </div>
            </div>
            
            {/* Subtle accent line */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r 
                           from-transparent via-white/10 to-transparent"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 