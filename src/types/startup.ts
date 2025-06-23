export interface Startup {
  id: string;
  companyName: string;
  ceo: string;
  previousExperience?: string;
  keyMembers?: string;
  teamSize?: string;
  webpage?: string;
  location: string;
  yearFounded: number;
  description: string;
  currentStage?: string;
  targetCustomer?: string;
  mainValueProposition?: string;
  keyProducts?: string;
  industryVerticals?: string;
  uvp?: string;
  technologicalAdvantage?: string;
  patents?: string;
  keyPartnerships?: string;
  competitors?: string;
  differentiation?: string;
  marketPositioning?: string;
  geographicFocus?: string;
  totalFundingRaised?: string;
  latestFundingRound?: string;
  keyInvestors?: string;
  growthMetrics?: string;
  notableCustomers?: string;
  majorMilestones?: string;
  category: string;
  updatedDate: string;
  postingStatus?: string;
}

export type SortOption = 'recent' | 'name' | 'founded' | 'category';

export interface StartupFilters {
  search: string;
  categories: Set<string>;
  locations: Set<string>;
  yearFrom: number;
  yearTo: number;
  sortBy: SortOption;
}

export interface DashboardStats {
  totalCompanies: number;
  totalCategories: number;
  totalFunding: number;
  filteredCount: number;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}

export interface ApiResponse {
  lastUpdated: string;
  totalCompanies: number;
  data: any[];
  transformedData?: Startup[];
  summary?: {
    categoriesCount: number;
    topCategories: [string, number][];
    topLocations: [string, number][];
    averageFunding: number;
  };
  filteredCount?: number;
  error?: boolean;
  message?: string;
} 