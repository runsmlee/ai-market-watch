// lib/dna-analysis.ts

interface DNAFormData {
  companyName: string;
  description: string;
  category: string;
  problem: string;
  solution: string;
  targetMarket: string;
  businessModel: string;
  teamSize: string;
  fundingStage: string;
  location: string;
  yearFounded: string;
}

interface DNAAnalysisResult {
  userStartup: {
    id: string;
    embedding: number[];
  };
  matches: Array<{
    id: string;
    companyName: string;
    similarity: number;
    category: string;
    description: string;
    fundingRaised: string;
    yearFounded: number;
  }>;
  insights: {
    commonPatterns: string[];
    differentiators: string[];
    opportunities: string[];
    recommendations: string[];
  };
}

export async function analyzeDNA(formData: DNAFormData): Promise<DNAAnalysisResult> {
  try {
    // Send to your n8n webhook endpoint
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '/api/analyze-dna', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'web-app'
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Validate response structure
    if (!result.userStartup || !result.matches || !result.insights) {
      throw new Error('Invalid response structure from analysis service');
    }

    return result;
  } catch (error) {
    console.error('DNA Analysis error:', error);
    throw error;
  }
}

// Helper function to format funding amount
export function formatFunding(amount: string | number): string {
  if (typeof amount === 'number') {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    } else if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount}`;
  }
  return amount;
}

// Mock analysis function for development
export async function mockAnalyzeDNA(formData: DNAFormData): Promise<DNAAnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  return {
    userStartup: {
      id: `user-${Date.now()}`,
      embedding: Array(1536).fill(0).map(() => Math.random()),
    },
    matches: [
      {
        id: 'openai',
        companyName: 'OpenAI',
        similarity: 0.92,
        category: 'Generative AI',
        description: 'Creating safe AGI that benefits all of humanity through cutting-edge research.',
        fundingRaised: '$11.3B',
        yearFounded: 2015,
      },
      {
        id: 'anthropic',
        companyName: 'Anthropic',
        similarity: 0.89,
        category: 'AI Safety',
        description: 'AI safety company building reliable, interpretable, and steerable AI systems.',
        fundingRaised: '$7.3B',
        yearFounded: 2021,
      },
      {
        id: 'cohere',
        companyName: 'Cohere',
        similarity: 0.87,
        category: 'NLP',
        description: 'Making NLP part of every developer\'s toolkit with powerful language models.',
        fundingRaised: '$445M',
        yearFounded: 2019,
      },
      {
        id: 'hugging-face',
        companyName: 'Hugging Face',
        similarity: 0.85,
        category: 'ML Platform',
        description: 'The AI community building the future through open-source collaboration.',
        fundingRaised: '$395M',
        yearFounded: 2016,
      },
      {
        id: 'runway',
        companyName: 'Runway',
        similarity: 0.83,
        category: 'Creative AI',
        description: 'Next generation creative tools powered by machine learning.',
        fundingRaised: '$237M',
        yearFounded: 2018,
      },
    ],
    insights: {
      commonPatterns: [
        'Focus on developer-first products with strong API offerings',
        'Heavy investment in research and open-source contributions',
        'Building platform ecosystems rather than single-point solutions',
        'Strong emphasis on responsible AI and safety measures',
      ],
      differentiators: [
        'Your focus on ' + formData.targetMarket + ' is unique among similar companies',
        'The combination of ' + formData.category + ' with your specific use case is underserved',
        'Your business model approach differs from the typical SaaS playbook',
      ],
      opportunities: [
        'Partner with complementary AI infrastructure companies for distribution',
        'Explore enterprise adoption through pilot programs with design partners',
        'Build a developer community around your core technology',
        'Consider open-sourcing non-core components to accelerate adoption',
      ],
      recommendations: [
        'Study Hugging Face\'s community-building playbook for developer engagement',
        'Consider a freemium model similar to Cohere to drive initial adoption',
        'Focus on building strong technical moats through proprietary datasets',
        'Prioritize SOC2 compliance early to unlock enterprise customers',
      ],
    },
  };
}