import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'AI Market Watch - AI Startups Intelligence Platform',
  description: 'Comprehensive intelligence platform tracking global AI startups, funding rounds, and market trends. Get real-time insights into the AI ecosystem with detailed company profiles, VC analysis, and investment data.',
  keywords: 'AI startups, artificial intelligence, startup funding, VC analysis, tech investment, AI companies, startup intelligence, market research, funding rounds, AI ecosystem, venture capital, technology trends',
  authors: [{ name: 'AI Market Watch Team' }],
  creator: 'AI Market Watch',
  publisher: 'AI Market Watch',
  metadataBase: new URL('https://ai-market-watch.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: '32x32' },
      { url: '/icon.svg', sizes: '16x16' },
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180' },
    ],
    shortcut: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-market-watch.com',
    title: 'AI Market Watch - AI Startups Intelligence Platform',
    description: 'Lively insights into the global AI startup ecosystem. Real-time intelligence, market analysis, and startup tracking.',
    siteName: 'AI Market Watch',
    images: [
      {
        url: '/page_image.png',
        width: 1200,
        height: 630,
        alt: 'AI Market Watch - AI Startups Intelligence Platform Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Market Watch - AI Startups Intelligence Platform',
    description: 'Lively insights into the global AI startup ecosystem. Real-time intelligence, market analysis, and startup tracking.',
    creator: '@aimarketwatch',
    images: ['/page_image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // 실제 Google Search Console 인증 코드로 교체 필요
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Market Watch',
  description: 'Comprehensive intelligence platform tracking global AI startups, funding rounds, and market trends.',
  url: 'https://ai-market-watch.com',
  image: 'https://ai-market-watch.com/page_image.png',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://ai-market-watch.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AI Market Watch',
    url: 'https://ai-market-watch.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://ai-market-watch.com/logo.png',
      width: 200,
      height: 200,
    },
    sameAs: [
      'https://twitter.com/aimarketwatch',
      'https://linkedin.com/company/ai-market-watch',
    ],
  },
  mainEntity: {
    '@type': 'Dataset',
    name: 'AI Startups Database',
    description: 'Comprehensive database of AI startups with funding information, company profiles, and market analysis.',
    keywords: ['AI', 'startups', 'funding', 'artificial intelligence', 'venture capital'],
    creator: {
      '@type': 'Organization',
      name: 'AI Market Watch',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Market Watch" />
        <meta name="application-name" content="AI Market Watch" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 