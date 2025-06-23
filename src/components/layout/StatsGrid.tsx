'use client';

import { DashboardStats } from '@/types/startup';
import { formatFunding } from '@/lib/api';
import { Building2, Tag, DollarSign, Filter } from 'lucide-react';

interface StatsGridProps {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    { 
      value: stats.totalCompanies.toLocaleString(), 
      label: 'Total Companies',
      icon: Building2,
      gradient: 'from-white/10 to-white/5',
    },
    { 
      value: stats.totalCategories, 
      label: 'AI Categories',
      icon: Tag,
      gradient: 'from-white/8 to-white/3',
    },
    { 
      value: formatFunding(stats.totalFunding), 
      label: 'Total Funding',
      icon: DollarSign,
      gradient: 'from-white/12 to-white/4',
    },
    { 
      value: stats.filteredCount.toLocaleString(), 
      label: 'Filtered Results',
      icon: Filter,
      gradient: 'from-white/9 to-white/2',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
      {statItems.map((item, index) => (
        <div
          key={item.label}
          className="group relative overflow-hidden"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl"></div>
          
          {/* Glass card */}
          <div className="relative glass-strong rounded-2xl p-8 hover:bg-white/[0.02] 
                         transition-all duration-500 hover:scale-[1.02] hover:shadow-glow
                         border-white/[0.08] group-hover:border-white/[0.12]">
            
            {/* Icon container */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-md rounded-xl"></div>
                <div className={`relative w-14 h-14 bg-gradient-to-br ${item.gradient} 
                               rounded-xl border border-white/10 flex items-center justify-center
                               group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7 text-white/80" />
                </div>
              </div>
              
              {/* Decorative dots */}
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/5 rounded-full"></div>
              </div>
            </div>
            
            {/* Value */}
            <div className="mb-3">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 
                             tracking-tight leading-none">
                {item.value}
              </div>
            </div>
            
            {/* Label */}
            <div className="text-white/60 font-medium text-sm tracking-wide uppercase">
              {item.label}
            </div>

            {/* Subtle hover line */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r 
                           from-white/20 via-white/40 to-white/20 
                           scale-x-0 group-hover:scale-x-100 
                           transition-transform duration-500 origin-center"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 