import DashboardLayout from './DashboardLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Market Watch - Lively insights into the global AI startup ecosystem',
  description: 'Real-time intelligence • Market analysis • Startup tracking. Discover 800+ AI companies across 168 categories with $3.2B+ total funding tracked.',
  openGraph: {
    title: 'AI Market Watch - AI Startups Intelligence Platform',
    description: 'Lively insights into the global AI startup ecosystem. Real-time intelligence, market analysis, and startup tracking.',
    images: [
      {
        url: 'https://www.ai-market-watch.xyz/main-og-image.png',
        width: 2852,
        height: 1362,
        alt: 'AI Market Watch Dashboard - AI Startups Intelligence Platform',
      },
    ],
  },
  twitter: {
    title: 'AI Market Watch - AI Startups Intelligence Platform',
    description: 'Lively insights into the global AI startup ecosystem. Real-time intelligence, market analysis, and startup tracking.',
    images: ['https://www.ai-market-watch.xyz/main-og-image.png'],
  },
};

export default function HomePage() {
  return <DashboardLayout />;
} 