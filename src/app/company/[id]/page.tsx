import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CompanyModal from '@/components/company/CompanyModal'
import { fetchStartups } from '@/lib/api'
import { Startup } from '@/types/startup'
import StructuredData from '@/components/seo/StructuredData'

interface Props {
  params: { id: string }
}

// Generate metadata for each company page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const startupsData = await fetchStartups({}, { useCache: true })
    const startups = startupsData.transformedData || startupsData.data || []
    
    const company = startups.find((startup: Startup) => 
      startup.id === params.id || 
      startup.companyName?.toLowerCase().replace(/\s+/g, '-') === params.id
    )

    if (!company) {
      return {
        title: 'Company Not Found - AI Market Watch',
        description: 'The requested AI startup company could not be found in our database.',
      }
    }

    const title = `${company.companyName} - AI Startup Profile | AI Market Watch`
    const description = `${company.description || 'AI startup company'} Founded in ${company.yearFounded || 'N/A'} by ${company.ceo || 'N/A'}. ${company.totalFundingRaised ? `Total funding: ${company.totalFundingRaised}.` : ''} Category: ${company.category || 'AI'}.`

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
            url: '/page_image.png',
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
        images: ['/page_image.png'],
      },
      alternates: {
        canonical: `/company/${params.id}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'AI Market Watch',
      description: 'AI Startups Intelligence Platform',
    }
  }
}

// Generate static params for known companies
export async function generateStaticParams() {
  try {
    const data = await fetchStartups({}, { useCache: true })
    const startups = data.transformedData || data.data || []
    
    return startups.map((startup: any) => ({
      id: startup.id || startup.companyName?.toLowerCase().replace(/\s+/g, '-'),
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function CompanyPage({ params }: Props) {
  try {
    const startupsData = await fetchStartups({}, { useCache: true })
    const startups = startupsData.transformedData || startupsData.data || []
    
    const company = startups.find((startup: Startup) => 
      startup.id === params.id || 
      startup.companyName?.toLowerCase().replace(/\s+/g, '-') === params.id
    )

    if (!company) {
      notFound()
    }

          return (
        <div className="min-h-screen bg-gray-950 text-white">
          <CompanyModal 
            company={company} 
            isOpen={true} 
            onClose={() => window.history.back()} 
          />
        </div>
      )
  } catch (error) {
    console.error('Error loading company:', error)
    notFound()
  }
} 