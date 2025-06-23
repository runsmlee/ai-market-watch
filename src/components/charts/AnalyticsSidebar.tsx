'use client';

import { Startup } from '@/types/startup';
import { BarChart3, Globe, TrendingUp, Calendar, Users, MapPin } from 'lucide-react';

interface AnalyticsSidebarProps {
  companies: Startup[];
}

export default function AnalyticsSidebar({ companies }: AnalyticsSidebarProps) {
  // Calculate category distribution
  const categoryStats = companies.reduce((acc, company) => {
    acc[company.category] = (acc[company.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Calculate location distribution
  const locationStats = companies.reduce((acc, company) => {
    const location = company.location.split(',')[0].trim();
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Calculate year insights
  const currentYear = new Date().getFullYear();
  const recentCompanies = companies.filter(c => c.yearFounded >= 2020).length;
  const avgYear = companies.length > 0 
    ? Math.round(companies.reduce((sum, c) => sum + c.yearFounded, 0) / companies.length)
    : 0;

  // Calculate team size insights
  const companiesWithTeamSize = companies.filter(c => c.teamSize && c.teamSize !== 'N/A');
  const avgTeamSize = companiesWithTeamSize.length > 0
    ? Math.round(companiesWithTeamSize.reduce((sum, c) => {
        const teamMatch = c.teamSize?.match(/\d+/);
        return sum + (teamMatch ? parseInt(teamMatch[0]) : 0);
      }, 0) / companiesWithTeamSize.length)
    : 0;

  // Calculate unique insights (non-duplicated)
  const uniqueLocations = Object.keys(locationStats).length;
  const scaleUpCompanies = companies.filter(c => {
    const teamMatch = c.teamSize?.match(/\d+/);
    const teamSize = teamMatch ? parseInt(teamMatch[0]) : 0;
    return teamSize >= 100;
  }).length;

  return (
    <div className="relative w-full">
      {/* Main Dashboard Container */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4 w-full min-w-0">
        
        {/* Dashboard Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/[0.06] border border-white/[0.1] 
                         rounded flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-white/80" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-white truncate">Market Intelligence</h2>
            <p className="text-white/60 text-sm truncate">
              Deep insights • {companies.length} companies
            </p>
          </div>
        </div>

        {/* Unique Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricCard 
            icon={<Calendar className="w-4 h-4" />}
            label="Recent"
            value={recentCompanies.toString()}
            trend="since 2020"
          />
          <MetricCard 
            icon={<Users className="w-4 h-4" />}
            label="Avg Team"
            value={avgTeamSize > 0 ? avgTeamSize.toString() : 'N/A'}
            trend="employees"
          />
          <MetricCard 
            icon={<MapPin className="w-4 h-4" />}
            label="Cities"
            value={uniqueLocations.toString()}
            trend="worldwide"
          />
          <MetricCard 
            icon={<TrendingUp className="w-4 h-4" />}
            label="Scale-ups"
            value={scaleUpCompanies.toString()}
            trend="100+ staff"
          />
        </div>

        {/* Analytics Charts Grid */}
        <div className="space-y-4">
          
          {/* Top Categories */}
          <AnalyticsChart
            icon={<BarChart3 className="w-4 h-4" />}
            title="Leading Categories"
            subtitle="Market distribution"
            data={topCategories.slice(0, 4).map(([category, count]) => ({
              label: category,
              value: count,
              percentage: Math.round((count / companies.length) * 100)
            }))}
          />

          {/* Top Locations */}
          <AnalyticsChart
            icon={<Globe className="w-4 h-4" />}
            title="Innovation Hubs"
            subtitle="Geographic concentration"
            data={topLocations.slice(0, 4).map(([location, count]) => ({
              label: location,
              value: count,
              percentage: Math.round((count / companies.length) * 100)
            }))}
          />

          {/* Innovation Timeline */}
          <AnalyticsChart
            icon={<TrendingUp className="w-4 h-4" />}
            title="Innovation Timeline"
            subtitle="Founding trends"
            data={[
              { label: '2020-2024', value: companies.filter(c => c.yearFounded >= 2020).length, percentage: 0 },
              { label: '2015-2019', value: companies.filter(c => c.yearFounded >= 2015 && c.yearFounded < 2020).length, percentage: 0 },
              { label: '2010-2014', value: companies.filter(c => c.yearFounded >= 2010 && c.yearFounded < 2015).length, percentage: 0 },
              { label: 'Pre-2010', value: companies.filter(c => c.yearFounded < 2010).length, percentage: 0 }
            ].map(item => ({
              ...item,
              percentage: Math.round((item.value / companies.length) * 100)
            }))}
          />
        </div>
      </div>
    </div>
  );
}

// Enhanced Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}

function MetricCard({ icon, label, value, trend }: MetricCardProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.1] rounded p-3
                   hover:bg-white/[0.05] transition-colors duration-200">
      
      {/* Header with icon and value */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0">
          {/* Value */}
          <div className="text-base font-semibold text-white/90">
            {value}
          </div>
          {/* Label */}
          <div className="text-xs text-white/60 truncate">
            {label}
          </div>
        </div>
        
        {/* Icon */}
        <div className="text-white/60 flex-shrink-0 ml-2">
          {icon}
        </div>
      </div>
      
      {/* Trend indicator */}
      {trend && (
        <div className="text-xs text-white/50 mt-1">
          {trend}
        </div>
      )}
    </div>
  );
}

// Enhanced Analytics Chart Component
interface AnalyticsChartProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  data: Array<{ label: string; value: number; percentage: number }>;
}

function AnalyticsChart({ icon, title, subtitle, data }: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white/[0.03] border border-white/[0.1] rounded p-4">
      
      {/* Chart Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="text-white/60 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/90 truncate">{title}</h3>
          <p className="text-xs text-white/60 truncate">{subtitle}</p>
        </div>
      </div>

      {/* Chart Data */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="group">
            {/* Label and Value */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/70 truncate flex-1 mr-2"
                    title={item.label}>
                {item.label}
              </span>
              <span className="text-xs font-medium text-white/80 flex-shrink-0">
                {item.value}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/[0.05] rounded-full h-1.5">
              <div 
                className="bg-white/[0.2] h-1.5 rounded-full transition-all duration-300
                          group-hover:bg-white/[0.3]"
                style={{ 
                  width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 