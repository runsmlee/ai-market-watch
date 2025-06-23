import React from 'react'
import Head from 'next/head'
import { Startup } from '@/types/startup'

interface MetaTagsProps {
  title?: string
  description?: string
  keywords?: string[]
  startup?: Startup
  canonical?: string
  image?: string
}

export function MetaTags({
  title,
  description,
  keywords = [],
  startup,
  canonical,
  image,
}: MetaTagsProps) {
  const baseUrl = 'https://ai-market-watch.com'
  
  const metaTitle = startup 
    ? `${startup.companyName} - AI Startup Profile | AI Market Watch`
    : title || 'AI Market Watch - AI Startups Intelligence Platform'
  
  const metaDescription = startup
    ? `${startup.description} Founded in ${startup.yearFounded} by ${startup.ceo}. Total funding: ${startup.totalFundingRaised}. Category: ${startup.category}.`
    : description || 'Comprehensive intelligence platform tracking global AI startups, funding rounds, and market trends. Get real-time insights into the AI ecosystem.'
  
  const metaKeywords = startup
    ? [
        startup.companyName,
        startup.category,
        startup.ceo,
        'AI startup',
        'artificial intelligence',
        'funding',
        ...keywords
      ]
    : [
        'AI startups',
        'artificial intelligence',
        'startup funding',
        'VC analysis',
        'tech investment',
        ...keywords
      ]

  const metaImage = image || `${baseUrl}/og-image.png`
  const metaCanonical = canonical || baseUrl
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords.join(', ')} />
      <meta name="author" content="AI Market Watch Team" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={metaCanonical} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaCanonical} />
      <meta property="og:site_name" content="AI Market Watch" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:creator" content="@aimarketwatch" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content="AI Market Watch" />
      <meta name="apple-mobile-web-app-title" content="AI Market Watch" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Startup-specific meta tags */}
      {startup && (
        <>
          <meta property="business:contact_data:locality" content={startup.location} />
          <meta property="business:contact_data:region" content={startup.location?.split(',')[1]?.trim()} />
          <meta property="business:contact_data:website" content={startup.webpage} />
          <meta name="business:founded" content={startup.yearFounded?.toString()} />
          <meta name="business:industry" content={startup.category} />
        </>
      )}
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
    </Head>
  )
}

export default MetaTags 