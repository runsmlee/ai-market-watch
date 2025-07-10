import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyClientPage from './client-page';
import { fetchStartups } from '@/lib/api';
import { fetchCompanyFromSupabase, convertSupabaseToStartup } from '@/lib/supabase';
import { Startup } from '@/types/startup';

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    let company: Startup | null = null;
    
    // Check if ID is numeric (Supabase ID)
    if (/^\d+$/.test(params.id)) {
      const supabaseData = await fetchCompanyFromSupabase(params.id);
      if (supabaseData) {
        company = convertSupabaseToStartup(params.id, supabaseData);
      }
    }
    
    // If not found in Supabase or not numeric ID, try Apps Script
    if (!company) {
      const startupsData = await fetchStartups({}, { useCache: true });
      const startups = startupsData.transformedData || startupsData.data || [];
      
      company = startups.find((startup: Startup) => 
        startup.id === params.id || 
        startup.companyName?.toLowerCase().replace(/\s+/g, '-') === params.id
      );
    }

    if (!company) {
      return {
        title: 'Company Not Found - AI Market Watch',
        description: 'The requested AI startup company could not be found in our database.',
      };
    }

    const title = `${company.companyName} - AI Startup Profile | AI Market Watch`;
    const description = `${company.description || 'AI startup company'} Founded in ${company.yearFounded || 'N/A'} by ${company.ceo || 'N/A'}. ${company.totalFundingRaised ? `Total funding: ${company.totalFundingRaised}.` : ''} Category: ${company.category || 'AI'}.`;

    return {
      title,
      description,
      keywords: [
        company.companyName,
        company.category,
        company.ceo,
        'AI startup',
        'artificial intelligence',
        'funding',
        'tech company',
        company.location,
      ].filter(Boolean).join(', '),
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://ai-market-watch.com/company/${params.id}`,
        siteName: 'AI Market Watch',
        images: [
          {
            url: '/main-og-image.png',
            width: 1200,
            height: 630,
            alt: `${company.companyName} - AI Startup Profile`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/main-og-image.png'],
      },
      alternates: {
        canonical: `/company/${params.id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'AI Market Watch',
      description: 'AI Startups Intelligence Platform',
    };
  }
}

export default async function CompanyPage({ params }: Props) {
  return <CompanyClientPage id={params.id} />;
} 