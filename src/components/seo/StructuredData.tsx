import React from 'react'
import { Startup } from '@/types/startup'

interface StructuredDataProps {
  startup?: Startup
  type?: 'website' | 'organization' | 'article'
}

export function StructuredData({ startup, type = 'website' }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseUrl = 'https://ai-market-watch.com'

    if (startup && type === 'organization') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: startup.companyName,
        description: startup.description,
        url: startup.webpage,
        foundingDate: startup.yearFounded?.toString(),
        industry: 'Artificial Intelligence',
        employee: startup.teamSize,
        location: {
          '@type': 'Place',
          name: startup.location,
        },
        founder: {
          '@type': 'Person',
          name: startup.ceo,
          jobTitle: 'CEO',
        },
        sameAs: [
          startup.webpage,
        ].filter(Boolean),
        keywords: [
          startup.category,
          'AI',
          'Artificial Intelligence',
          'Startup',
          'Technology',
        ].filter(Boolean),
        aggregateRating: startup.totalFundingRaised ? {
          '@type': 'AggregateRating',
          ratingValue: '4.5',
          ratingCount: '100',
          bestRating: '5',
          worstRating: '1',
        } : undefined,
      }
    }

    if (type === 'article') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: startup ? `${startup.companyName} - AI Startup Profile` : 'AI Market Watch - Latest AI Startups',
        description: startup?.description || 'Comprehensive analysis of AI startups and market trends',
        author: {
          '@type': 'Organization',
          name: 'AI Market Watch',
          url: baseUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'AI Market Watch',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        },
        datePublished: startup?.updatedDate || new Date().toISOString(),
        dateModified: startup?.updatedDate || new Date().toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': startup ? `${baseUrl}/company/${startup.id}` : baseUrl,
        },
        keywords: [
          'AI Startups',
          'Artificial Intelligence',
          'Funding',
          'Technology',
          startup?.category,
        ].filter(Boolean).join(', '),
      }
    }

    // Default website schema
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AI Market Watch',
      description: 'Comprehensive intelligence platform tracking global AI startups, funding rounds, and market trends.',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'AI Startups Directory',
        description: 'Curated list of AI startups and companies',
        itemListElement: startup ? [{
          '@type': 'Organization',
          name: startup.companyName,
          description: startup.description,
          url: startup.webpage,
        }] : [],
      },
    }
  }

  const structuredData = generateStructuredData()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

export default StructuredData 