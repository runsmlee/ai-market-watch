import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchStartups } from '@/lib/api'
import { Startup } from '@/types/startup'
import StructuredData from '@/components/seo/StructuredData'

interface Props {
  params: { id: string }
}

// Generate metadata for each company page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const data = await fetchStartups({}, { useCache: true })
    const startups = data.transformedData || data.data || []
    
    const startup = startups.find((s: any) => 
      s.id === params.id || 
      s.companyName?.toLowerCase().replace(/\s+/g, '-') === params.id.toLowerCase()
    )

    if (!startup) {
      return {
        title: 'Company Not Found | AI Market Watch',
        description: 'The requested company profile could not be found.',
      }
    }

    const title = `${startup.companyName} - AI Startup Profile | AI Market Watch`
    const description = `${startup.description} Founded in ${startup.yearFounded} by ${startup.ceo}. Total funding: ${startup.totalFundingRaised}. Category: ${startup.category}. Get detailed insights into this ${startup.category} startup.`

    return {
      title,
      description,
      keywords: `${startup.companyName}, ${startup.category}, ${startup.ceo}, AI startup, artificial intelligence, funding, venture capital, tech company`,
      openGraph: {
        title,
        description,
        type: 'article',
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

// Force dynamic rendering for all company pages
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function CompanyPage({ params }: Props) {
  try {
    const data = await fetchStartups({}, { useCache: true })
    const startups = data.transformedData || data.data || []
    
    const startup = startups.find((s: any) => 
      s.id === params.id || 
      s.companyName?.toLowerCase().replace(/\s+/g, '-') === params.id.toLowerCase()
    )

    if (!startup) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-black">
        <StructuredData startup={startup} type="organization" />
        <StructuredData startup={startup} type="article" />
        
        {/* Company Profile Page */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                {startup.companyName}
              </h1>
              <p className="text-xl text-gray-400 mb-6">
                {startup.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>Founded: {startup.yearFounded}</span>
                <span>CEO: {startup.ceo}</span>
                <span>Location: {startup.location}</span>
                <span>Category: {startup.category}</span>
              </div>
            </header>

            {/* Company Details */}
            <section className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    Company Overview
                  </h2>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>Value Proposition:</strong> {startup.mainValueProposition}</p>
                    <p><strong>Key Products:</strong> {startup.keyProducts}</p>
                    <p><strong>Target Customer:</strong> {startup.targetCustomer}</p>
                    <p><strong>Team Size:</strong> {startup.teamSize}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Technology & Advantage
                  </h3>
                  <p className="text-gray-300">{startup.technologicalAdvantage}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    Funding & Investment
                  </h2>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>Total Funding:</strong> {startup.totalFundingRaised}</p>
                    <p><strong>Latest Round:</strong> {startup.latestFundingRound}</p>
                    <p><strong>Key Investors:</strong> {startup.keyInvestors}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Market Position
                  </h3>
                  <div className="space-y-3 text-gray-300">
                    <p><strong>Competitors:</strong> {startup.competitors}</p>
                    <p><strong>Partnerships:</strong> {startup.keyPartnerships}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Milestones */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-3">
                Major Milestones
              </h2>
              <p className="text-gray-300">{startup.majorMilestones}</p>
            </section>

            {/* External Links */}
            {startup.webpage && (
              <section className="mb-8">
                <a
                  href={startup.webpage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Visit Company Website
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </section>
            )}

            {/* Last Updated */}
            <footer className="text-sm text-gray-500 border-t border-gray-800 pt-4">
              Last updated: {new Date(startup.updatedDate || Date.now()).toISOString().split('T')[0]}
            </footer>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading company page:', error)
    notFound()
  }
} 