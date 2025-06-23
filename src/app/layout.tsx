import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Market Watch - AI Startups Intelligence Platform',
  description: 'Lively insights into the global AI startup ecosystem',
  keywords: 'AI, startups, funding, technology, innovation',
  openGraph: {
    title: 'AI Market Watch - AI Startups Intelligence Platform',
    description: 'Lively insights into the global AI startup ecosystem',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 