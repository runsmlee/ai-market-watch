import { Startup, DashboardStats } from '@/types/startup';

// Memoization cache for statistics
const statsCache = new Map<string, DashboardStats>();

// Helper function to create cache key from startups array
function createCacheKey(startups: Startup[]): string {
  // Use array length + first/last company names as a quick hash
  if (startups.length === 0) return 'empty';
  
  const firstCompany = startups[0]?.companyName || '';
  const lastCompany = startups[startups.length - 1]?.companyName || '';
  
  return `${startups.length}-${firstCompany}-${lastCompany}`;
}

// Parse funding amount from string
export function parseFundingAmount(fundingStr: string | any): number {
  // Ensure fundingStr is a string
  const funding = String(fundingStr || '');
  
  if (!funding || funding === '-' || funding === 'N/A' || funding === 'null' || funding === 'undefined') return 0;
  
  // Remove currency symbols and normalize
  const cleanStr = funding.replace(/[$,]/g, '').toLowerCase().trim();
  
  // Extract number and multiplier
  const match = cleanStr.match(/^([\d.]+)([kmb])?/);
  if (!match) return 0;
  
  const number = parseFloat(match[1]);
  const multiplier = match[2];
  
  switch (multiplier) {
    case 'k': return number * 1000;
    case 'm': return number * 1000000;
    case 'b': return number * 1000000000;
    default: return number;
  }
}

// Optimized funding calculation
export function calculateTotalFunding(startups: Startup[]): number {
  return startups.reduce((total, startup) => {
    return total + parseFundingAmount(startup.totalFundingRaised || '0');
  }, 0);
}

  // Calculate lively statistics with memoization
export function calculateDashboardStats(
  allStartups: Startup[], 
  filteredStartups: Startup[]
): DashboardStats {
  const cacheKey = createCacheKey(filteredStartups);
  
  // Check cache first
  if (statsCache.has(cacheKey)) {
    return statsCache.get(cacheKey)!;
  }
  
  // Calculate new stats
  const stats: DashboardStats = {
    totalCompanies: allStartups.length,
    totalCategories: new Set(allStartups.map(s => s.category).filter(Boolean)).size,
    totalFunding: calculateTotalFunding(filteredStartups),
    filteredCount: filteredStartups.length,
  };
  
  // Cache the result
  statsCache.set(cacheKey, stats);
  
  // Limit cache size to prevent memory leaks
  if (statsCache.size > 100) {
    const firstKey = statsCache.keys().next().value;
    statsCache.delete(firstKey);
  }
  
  return stats;
}

// Additional analytics functions
export function calculateCategoryDistribution(startups: Startup[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  startups.forEach(startup => {
    const category = startup.category || 'Uncategorized';
    distribution[category] = (distribution[category] || 0) + 1;
  });
  
  return distribution;
}

export function calculateLocationDistribution(startups: Startup[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  startups.forEach(startup => {
    const location = startup.location ? 
      startup.location.split(',')[0].trim() : 
      'Unknown';
    distribution[location] = (distribution[location] || 0) + 1;
  });
  
  return distribution;
}

export function calculateYearDistribution(startups: Startup[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  startups.forEach(startup => {
    const year = startup.yearFounded || 0;
    if (year > 0) {
      distribution[year] = (distribution[year] || 0) + 1;
    }
  });
  
  return distribution;
}

export function calculateFundingDistribution(startups: Startup[]): {
  unfunded: number;
  seed: number;
  early: number;
  growth: number;
  late: number;
} {
  const distribution = {
    unfunded: 0,
    seed: 0,     // < $1M
    early: 0,    // $1M - $10M
    growth: 0,   // $10M - $100M
    late: 0,     // > $100M
  };
  
  startups.forEach(startup => {
    const funding = parseFundingAmount(startup.totalFundingRaised || '0');
    
    if (funding === 0) {
      distribution.unfunded++;
    } else if (funding < 1000000) {
      distribution.seed++;
    } else if (funding < 10000000) {
      distribution.early++;
    } else if (funding < 100000000) {
      distribution.growth++;
    } else {
      distribution.late++;
    }
  });
  
  return distribution;
}

// Clear statistics cache (useful when data is refreshed)
export function clearStatsCache(): void {
  statsCache.clear();
} 