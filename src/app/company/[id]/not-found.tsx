import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Company Not Found | AI Market Watch',
  description: 'The requested company profile could not be found. Browse our directory of AI startups.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Company Not Found
          </h2>
          <p className="text-gray-400 mb-8">
            Sorry, we couldn&apos;t find the company profile you&apos;re looking for. 
            It may have been removed or the URL might be incorrect.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Browse All Companies
          </Link>
          
          <Link
            href="/search"
            className="inline-block w-full px-6 py-3 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Search Companies
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Looking for a specific company?</p>
          <p>Try searching by name or browse our complete directory.</p>
        </div>
      </div>
    </div>
  )
} 