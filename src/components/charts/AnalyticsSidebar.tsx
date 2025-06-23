'use client';

import { Startup } from '@/types/startup';
import { BarChart3, Globe, TrendingUp, Zap, PieChart, DollarSign, Calendar, Users } from 'lucide-react';

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

  // Calculate funding insights
  const totalFunding = companies.reduce((acc, company) => {
    const funding = company.totalFundingRaised;
    if (funding && funding !== 'N/A') {
      // Extract numeric value from funding string (e.g., "$1.2B" -> 1200000000)
      const numericMatch = funding.match(/[\d.]+/);
      if (numericMatch) {
        let value = parseFloat(numericMatch[0]);
        if (funding.includes('B')) value *= 1000000000;
        else if (funding.includes('M')) value *= 1000000;
        else if (funding.includes('K')) value *= 1000;
        acc += value;
      }
    }
    return acc;
  }, 0);

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

  const formatFunding = (amount: number): string => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent rounded-2xl"></div>
      
      {/* Main Dashboard Container */}
      <div className="relative glass-strong rounded-2xl border-white/[0.08] p-8">
        
        {/* Dashboard Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-white/15 blur-lg rounded-xl"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-white/15 to-white/8 
                           rounded-xl border border-white/15 flex items-center justify-center">
              <PieChart className="w-8 h-8 text-white/90" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gradient">Market Intelligence</h2>
            <p className="text-white/60 font-medium text-lg">
              Lively AI startup ecosystem insights • {companies.length} companies analyzed
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10">
          <MetricCard 
            icon={<Zap className="w-6 h-6" />}
            label="Total Companies"
            value={companies.length.toString()}
            color="from-white/15 to-white/8"
            trend="+12% this month"
          />
          <MetricCard 
            icon={<BarChart3 className="w-6 h-6" />}
            label="AI Categories"
            value={Object.keys(categoryStats).length.toString()}
            color="from-white/12 to-white/6"
            trend="8 new sectors"
          />
          <MetricCard 
            icon={<Globe className="w-6 h-6" />}
            label="Global Presence"
            value={Object.keys(locationStats).length.toString()}
            color="from-white/10 to-white/5"
            trend="cities worldwide"
          />
          <MetricCard 
            icon={<DollarSign className="w-6 h-6" />}
            label="Total Funding"
            value={formatFunding(totalFunding)}
            color="from-white/14 to-white/7"
            trend="aggregated value"
          />
          <MetricCard 
            icon={<Calendar className="w-6 h-6" />}
            label="Recent Startups"
            value={recentCompanies.toString()}
            color="from-white/13 to-white/6"
            trend="since 2020"
          />
          <MetricCard 
            icon={<Users className="w-6 h-6" />}
            label="Avg Team Size"
            value={avgTeamSize > 0 ? avgTeamSize.toString() : 'N/A'}
            color="from-white/11 to-white/5"
            trend="employees"
          />
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Top Categories */}
          <AnalyticsChart
            icon={<BarChart3 className="w-5 h-5" />}
            title="Leading AI Categories"
            subtitle="Market distribution by sector"
            data={topCategories.slice(0, 4).map(([category, count]) => ({
              label: category,
              value: count,
              percentage: Math.round((count / companies.length) * 100)
            }))}
            colorGradient="from-white/30 to-white/20"
          />

          {/* Top Locations */}
          <AnalyticsChart
            icon={<Globe className="w-5 h-5" />}
            title="Global Innovation Hubs"
            subtitle="Geographic concentration"
            data={topLocations.slice(0, 4).map(([location, count]) => ({
              label: location,
              value: count,
              percentage: Math.round((count / companies.length) * 100)
            }))}
            colorGradient="from-white/25 to-white/15"
          />

          {/* Innovation Timeline */}
          <AnalyticsChart
            icon={<TrendingUp className="w-5 h-5" />}
            title="Innovation Timeline"
            subtitle="Founding year trends"
            data={[
              { label: '2020-2024', value: companies.filter(c => c.yearFounded >= 2020).length, percentage: 0 },
              { label: '2015-2019', value: companies.filter(c => c.yearFounded >= 2015 && c.yearFounded < 2020).length, percentage: 0 },
              { label: '2010-2014', value: companies.filter(c => c.yearFounded >= 2010 && c.yearFounded < 2015).length, percentage: 0 },
              { label: 'Pre-2010', value: companies.filter(c => c.yearFounded < 2010).length, percentage: 0 }
            ].map(item => ({
              ...item,
              percentage: Math.round((item.value / companies.length) * 100)
            }))}
            colorGradient="from-white/20 to-white/10"
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
  color: string;
  trend?: string;
}

function MetricCard({ icon, label, value, color, trend }: MetricCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent rounded-xl"></div>
      <div className="relative glass rounded-xl p-6 border-white/[0.06] 
                     hover:bg-white/[0.02] transition-all duration-500 hover:scale-105">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 blur-lg rounded-lg"></div>
            <div className={`relative w-12 h-12 bg-gradient-to-br ${color} 
                           rounded-lg border border-white/10 flex items-center justify-center
                           group-hover:scale-110 transition-transform duration-300`}>
              <div className="text-white/90">
                {icon}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
          {value}
        </div>
        <div className="text-white/60 text-sm font-medium mb-1">
          {label}
        </div>
        {trend && (
          <div className="text-white/40 text-xs font-medium">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Chart Component
interface AnalyticsChartProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  data: Array<{ label: string; value: number; percentage: number }>;
  colorGradient: string;
}

function AnalyticsChart({ icon, title, subtitle, data, colorGradient }: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-white/10 blur-md rounded-lg"></div>
          <div className="relative w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 
                         rounded-lg border border-white/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-white/50 text-sm">{subtitle}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium text-sm">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">{item.value}</span>
                <span className="text-white/40 text-xs">({item.percentage}%)</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${colorGradient} rounded-full
                           transition-all duration-1000 ease-out`}
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  animationDelay: `${index * 0.2}s`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 