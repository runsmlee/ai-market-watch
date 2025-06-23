import { Startup, ApiResponse } from '@/types/startup';

// 기본 Apps Script URL - 실제 환경에서는 환경 변수로 설정
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxxSB7grQucOxewCEFnZIHGVa3NT27bUSwL03nfMbpac9ol5XVoSE-JHlM1Symx9xf/exec';

export async function fetchStartups(params?: Record<string, string>): Promise<ApiResponse> {
  try {
    const url = new URL(APPS_SCRIPT_URL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export function transformApiDataToStartups(apiData: any[]): Startup[] {
  return apiData.map((item, index) => ({
    id: `startup-${index}`,
    companyName: String(item['Company Name'] || ''),
    ceo: String(item['CEO'] || ''),
    previousExperience: String(item['Previous experience of CEO'] || ''),
    keyMembers: String(item['Key members'] || ''),
    teamSize: String(item['Team size'] || ''),
    webpage: String(item['Webpage'] || ''),
    location: String(item['Location'] || ''),
    yearFounded: parseInt(String(item['Year Founded'] || '0')) || 0,
    description: String(item['One-line description'] || ''),
    currentStage: String(item['Current stage/status'] || ''),
    targetCustomer: String(item['Target customer'] || ''),
    mainValueProposition: String(item['Main value proposition'] || ''),
    keyProducts: String(item['Key products/solutions portfolio'] || ''),
    industryVerticals: String(item['Industry verticals served'] || ''),
    uvp: String(item['UVP'] || ''),
    technologicalAdvantage: String(item['Key technological/business advantage'] || ''),
    patents: String(item['Patents/IP (if public)'] || ''),
    keyPartnerships: String(item['Key partnerships/collaborations'] || ''),
    competitors: String(item['2-3 main competitors'] || ''),
    differentiation: String(item['How they differentiate'] || ''),
    marketPositioning: String(item['Market positioning'] || ''),
    geographicFocus: String(item['Geographic competition focus'] || ''),
    totalFundingRaised: String(item['Total funding raised'] || ''),
    latestFundingRound: String(item['Latest funding round'] || ''),
    keyInvestors: String(item['Key investors'] || ''),
    growthMetrics: String(item['Basic growth metrics'] || ''),
    notableCustomers: String(item['Notable customers'] || ''),
    majorMilestones: String(item['Major milestones'] || ''),
    category: String(item['Category'] || 'Other'),
    updatedDate: String(item['Updated Date'] || ''),
    postingStatus: String(item['Posting'] || ''),
  }));
}

export function formatFunding(amount: number): string {
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  } else if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(1)}M`;
  } else if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(1)}K`;
  }
  return `$${amount}`;
} 