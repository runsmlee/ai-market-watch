'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import StatsGrid from '@/components/layout/StatsGrid';
import AdvancedFilters from '@/components/filters/AdvancedFilters';
import VirtualizedCompanyGrid from '@/components/company/VirtualizedCompanyGrid';
import AnalyticsSidebar from '@/components/charts/AnalyticsSidebar';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchStartups, transformApiDataToStartups } from '@/lib/api';
import { Startup } from '@/types/startup';
import { AlertTriangle } from 'lucide-react';

// Demo data for development
const demoData: Startup[] = [
  {
    id: '1',
    companyName: 'OpenAI',
    ceo: 'Sam Altman',
    location: 'San Francisco, CA',
    yearFounded: 2015,
    description: 'AI research and deployment company focused on ensuring that artificial general intelligence benefits all of humanity.',
    category: 'AI Research',
    mainValueProposition: 'Leading AI research with GPT models and ChatGPT',
    keyProducts: 'ChatGPT, GPT-4, DALL-E, Codex',
    technologicalAdvantage: 'Advanced large language models and generative AI',
    targetCustomer: 'Developers, businesses, consumers',
    totalFundingRaised: '$11.3B',
    latestFundingRound: 'Series C',
    keyInvestors: 'Microsoft, Khosla Ventures, Reid Hoffman',
    competitors: 'Google DeepMind, Anthropic, Cohere',
    keyPartnerships: 'Microsoft Azure, various enterprise partners',
    majorMilestones: 'GPT-4 launch, ChatGPT reaching 100M users',
    teamSize: '500+',
    webpage: 'https://openai.com',
    updatedDate: '2024-01-01',
  },
  {
    id: '2',
    companyName: 'Anthropic',
    ceo: 'Dario Amodei',
    location: 'San Francisco, CA',
    yearFounded: 2021,
    description: 'AI safety company building reliable, interpretable, and steerable AI systems.',
    category: 'AI Safety',
    mainValueProposition: 'Safe and beneficial AI systems with Constitutional AI',
    keyProducts: 'Claude AI assistant, Constitutional AI',
    technologicalAdvantage: 'Constitutional AI training methodology',
    targetCustomer: 'Enterprise customers, developers',
    totalFundingRaised: '$7.3B',
    latestFundingRound: 'Series C',
    keyInvestors: 'Google, Spark Capital, various VCs',
    competitors: 'OpenAI, Google, Microsoft',
    keyPartnerships: 'Google Cloud, enterprise integrations',
    majorMilestones: 'Claude 2 launch, Google partnership',
    teamSize: '200+',
    webpage: 'https://anthropic.com',
    updatedDate: '2024-01-01',
  },
  {
    id: '3',
    companyName: 'Stability AI',
    ceo: 'Emad Mostaque',
    location: 'London, UK',
    yearFounded: 2020,
    description: 'Open-source generative AI company democratizing access to AI technology.',
    category: 'Generative AI',
    mainValueProposition: 'Open-source generative AI models for everyone',
    keyProducts: 'Stable Diffusion, StableLM, various AI models',
    technologicalAdvantage: 'Open-source approach to generative AI',
    targetCustomer: 'Developers, creators, businesses',
    totalFundingRaised: '$101M',
    latestFundingRound: 'Series A',
    keyInvestors: 'Coatue, Lightspeed, O\'Shaughnessy Ventures',
    competitors: 'OpenAI, Midjourney, Adobe',
    keyPartnerships: 'AWS, Hugging Face, various cloud providers',
    majorMilestones: 'Stable Diffusion viral adoption, open-source community',
    teamSize: '100+',
    webpage: 'https://stability.ai',
    updatedDate: '2024-01-01',
  },
];

export default function Dashboard() {
  const {
    filteredStartups,
    stats,
    filters,
    updateFilters,
    clearFilters,
    loading,
    error,
    setStartups,
    setLoading,
    setError,
    lastUpdated,
    isFromCache,
    refreshData,
    getFilterMetadata,
  } = useDashboardStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data with caching
  useEffect(() => {
    async function initializeData() {
      setLoading(true);
      try {
        console.log('🚀 Initializing dashboard data...');
        
        // Try to fetch real data with caching
        const data = await fetchStartups({}, { 
          useCache: true, 
          includeStats: true 
        });
        
        const startups = data.transformedData || transformApiDataToStartups(data.data);
        setStartups(startups, data.lastUpdated, !!data.transformedData);
        
        console.log(`✅ Loaded ${startups.length} companies`);
      } catch (error) {
        console.warn('Failed to fetch real data, using demo data:', error);
        // Fallback to demo data
        setStartups(demoData, new Date().toISOString(), false);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    }

    if (!isInitialized) {
      initializeData();
    }
  }, [isInitialized, setStartups, setLoading, setError]);

  // Get filter metadata efficiently
  const { categories, locations } = getFilterMetadata();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12">
            <AlertTriangle className="w-16 h-16 text-gray-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600
                         rounded-lg transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Header />
        
        {/* Integrated Analytics Dashboard */}
        <div className="mb-16">
          <AnalyticsSidebar companies={filteredStartups} />
        </div>
        
        <AdvancedFilters
          filters={filters}
          onFiltersChange={updateFilters}
          categories={categories}
          locations={locations}
        />
        
        {/* Full width company grid */}
        <VirtualizedCompanyGrid companies={filteredStartups} loading={loading} />
      </div>
    </div>
  );
} 