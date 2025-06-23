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
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Market Watch',
  description: 'Comprehensive intelligence platform tracking global AI startups, funding rounds, and market trends.',
  url: 'https://ai-market-watch.com',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
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