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
  {
    id: '4',
    companyName: 'Perplexity AI',
    ceo: 'Aravind Srinivas',
    location: 'New York, NY',
    yearFounded: 2022,
    description: 'AI-powered search engine that provides accurate answers with citations.',
    category: 'AI Search',
    mainValueProposition: 'Conversational search with accurate, cited answers',
    keyProducts: 'Perplexity Search, Perplexity Pro',
    technologicalAdvantage: 'Real-time web search with LLM reasoning',
    targetCustomer: 'General consumers, researchers, professionals',
    totalFundingRaised: '$100M',
    latestFundingRound: 'Series B',
    keyInvestors: 'NEA, IVP, Databricks Ventures',
    competitors: 'Google Search, Bing Chat, You.com',
    keyPartnerships: 'Various content providers and publishers',
    majorMilestones: 'Reaching 10M monthly users, mobile app launch',
    teamSize: '50+',
    webpage: 'https://perplexity.ai',
    updatedDate: '2024-01-01',
  },
  {
    id: '5',
    companyName: 'Hugging Face',
    ceo: 'Clement Delangue',
    location: 'Paris, France',
    yearFounded: 2016,
    description: 'Open-source platform for machine learning models and datasets.',
    category: 'ML Platform',
    mainValueProposition: 'Democratizing machine learning through open-source tools',
    keyProducts: 'Transformers library, Model Hub, Datasets',
    technologicalAdvantage: 'Largest open-source ML community and model repository',
    targetCustomer: 'ML researchers, developers, enterprises',
    totalFundingRaised: '$235M',
    latestFundingRound: 'Series C',
    keyInvestors: 'Coatue, Sequoia, Google',
    competitors: 'GitHub, GitLab, AWS SageMaker',
    keyPartnerships: 'AWS, Google Cloud, Microsoft Azure',
    majorMilestones: '100K+ models, 1M+ monthly users',
    teamSize: '200+',
    webpage: 'https://huggingface.co',
    updatedDate: '2024-01-01',
  },
  {
    id: '6',
    companyName: 'Midjourney',
    ceo: 'David Holz',
    location: 'Boston, MA',
    yearFounded: 2021,
    description: 'AI image generation platform creating high-quality art from text prompts.',
    category: 'AI Art',
    mainValueProposition: 'Professional-quality AI-generated artwork and images',
    keyProducts: 'Midjourney Bot, Midjourney Web App',
    technologicalAdvantage: 'Superior image quality and artistic style',
    targetCustomer: 'Artists, designers, content creators',
    totalFundingRaised: 'Bootstrapped',
    latestFundingRound: 'Self-funded',
    keyInvestors: 'Self-funded',
    competitors: 'DALL-E, Stable Diffusion, Adobe Firefly',
    keyPartnerships: 'Discord integration',
    majorMilestones: '15M+ users, profitable operations',
    teamSize: '20+',
    webpage: 'https://midjourney.com',
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
        
        if (startups && startups.length > 0) {
          setStartups(startups, data.lastUpdated, !!data.transformedData);
          console.log(`✅ Loaded ${startups.length} companies from API`);
        } else {
          throw new Error('No data received from API');
        }
      } catch (error) {
        console.warn('Failed to fetch real data, using demo data:', error);
        // Fallback to demo data
        setStartups(demoData, new Date().toISOString(), false);
        console.log(`✅ Loaded ${demoData.length} demo companies`);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    }

    if (!isInitialized) {
      initializeData();
    }
  }, [isInitialized, setStartups, setLoading, setError]);

  // Get filter metadata efficiently (only after data is loaded)
  const { categories, locations } = isInitialized ? getFilterMetadata() : { categories: [], locations: [] };
  
  console.log('🏠 Dashboard render - Filter metadata:', {
    categoriesCount: categories.length,
    locationsCount: locations.length,
    categories: categories.slice(0, 5),
    locations: locations.slice(0, 5),
    filteredStartupsCount: filteredStartups.length,
    isInitialized,
    loading
  });

  // Show loading state only if we haven't initialized and there's no error
  if (loading && !isInitialized && !error) {
    return (
      <div className="min-h-screen bg-primary-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading AI Market Data...</p>
        </div>
      </div>
    );
  }

  // Show error state only if there's a critical error AND no data at all
  if (error && filteredStartups.length === 0) {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <Header />
        
        {/* Stats Grid */}
        <StatsGrid stats={stats} />
        
        {/* Filters */}
        <AdvancedFilters 
          filters={filters}
          onFiltersChange={updateFilters}
          categories={getFilterMetadata().categories}
          locations={getFilterMetadata().locations}
        />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Companies Grid - Takes up 3 columns on xl screens */}
          <div className="xl:col-span-3">
            <VirtualizedCompanyGrid 
              companies={filteredStartups} 
              loading={loading}
            />
          </div>
          
          {/* Analytics Sidebar - Takes up 1 column on xl screens */}
          <div className="xl:col-span-1">
            <AnalyticsSidebar 
              companies={filteredStartups}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 