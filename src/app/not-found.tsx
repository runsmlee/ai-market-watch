import { Metadata } from 'next'
import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 - Page Not Found | AI Market Watch',
  description: 'The page you are looking for could not be found. Explore our AI startup database or return to the homepage.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8">
          <p className="text-gray-300 mb-6">
            You might be interested in exploring our AI startup database:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Homepage
            </Link>
            
            <Link 
              href="/?search=AI"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
            >
              <Search className="w-4 h-4" />
              Search AI Startups
            </Link>
            
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Link>
          </div>
        </div>

        <div className="text-gray-500">
          <p className="mb-2">Need help? Contact us at:</p>
          <a 
            href="mailto:support@ai-market-watch.xyz" 
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            support@ai-market-watch.xyz
          </a>
        </div>
      </div>
    </div>
  )
}