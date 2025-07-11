'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Globe, TrendingUp, Calendar, Users, MapPin, DollarSign } from 'lucide-react';
import { getDashboardStatistics } from '@/lib/supabase';
import { formatFunding } from '@/lib/api';

interface DashboardStats {
  total_companies: number;
  total_funding: number;
  avg_year_founded: number;
  category_distribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  location_distribution: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  year_distribution: Array<{
    year: number;
    count: number;
  }>;
  funding_stage_distribution: Array<{
    stage: string;
    count: number;
  }>;
  last_updated: string;
}

export default function AnalyticsSidebar() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStatistics();
        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="relative w-full">
        <p className="text-gray-500">Failed to load statistics</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const recentCompanies = stats.year_distribution
    ?.filter(item => item.year >= 2020)
    ?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="relative w-full">
      {/* Main Dashboard Container */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/[0.15]">
        
        <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
          <div className="p-2 bg-white/[0.06] border border-white/[0.12] rounded-lg">
            <BarChart3 className="w-6 h-6 text-white/70" />
          </div>
          Market Analytics
        </h2>


        {/* Category Distribution */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-white/60" />
            Top Categories
          </h3>
          <div className="space-y-3">
            {stats.category_distribution?.slice(0, 5).map(({ category, count, percentage }, index) => {
              const topPercentage = stats.category_distribution?.[0]?.percentage || 1;
              const relativeWidth = (percentage / topPercentage) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60 truncate max-w-[180px]">{category}</span>
                    <span className="text-white/90 font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-white/30 rounded-full transition-all duration-500"
                      style={{ width: `${relativeWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Distribution */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white/60" />
            Top Locations
          </h3>
          <div className="space-y-3">
            {stats.location_distribution?.slice(0, 5).map(({ location, count, percentage }, index) => {
              const topPercentage = stats.location_distribution?.[0]?.percentage || 1;
              const relativeWidth = (percentage / topPercentage) * 100;
              return (
                <div key={location}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60 truncate max-w-[180px]">{location}</span>
                    <span className="text-white/90 font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-white/40 rounded-full transition-all duration-500"
                      style={{ width: `${relativeWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-white/60" />
            Key Insights
          </h3>
          <ul className="space-y-2 text-xs text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-white/40 mt-1">•</span>
              <span>
                <span className="text-white/90 font-medium">{stats.category_distribution?.[0]?.percentage || 0}%</span> of companies are in {stats.category_distribution?.[0]?.category || 'Unknown'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/40 mt-1">•</span>
              <span>
                Most companies based in <span className="text-white/90 font-medium">{stats.location_distribution?.[0]?.location || 'Unknown'}</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white/40 mt-1">•</span>
              <span>
                <span className="text-white/90 font-medium">{((recentCompanies / stats.total_companies) * 100).toFixed(1)}%</span> founded since 2020
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}