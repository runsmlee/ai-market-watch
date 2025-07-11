'use client';

import { Home, Search, Filter, BarChart3, Dna } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'filters', label: 'Filters', icon: Filter },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'dna', label: 'DNA', icon: Dna },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-t border-white/[0.08]">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center gap-1 relative
                transition-all duration-200
                ${isActive 
                  ? 'text-white' 
                  : 'text-white/40 hover:text-white/70'
                }
              `}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}