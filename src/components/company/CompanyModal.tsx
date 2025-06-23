'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, Building2 } from 'lucide-react';
import { Startup } from '@/types/startup';
import { getCachedLogo, setCachedLogo } from '@/lib/logoCache';

interface CompanyModalProps {
  company: Startup | null;
  isOpen: boolean;
  onClose: () => void;
}

// Logo loading hook
function useCompanyLogo(webpage: string | undefined, companyName: string) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!webpage) return;

    setIsLoading(true);
    setHasError(false);
    setLogoUrl(null);

    const domain = extractDomain(webpage);
    if (!domain) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // Check cache first
    const cachedLogo = getCachedLogo(domain);
    if (cachedLogo) {
      setLogoUrl(cachedLogo);
      setIsLoading(false);
      return;
    }

    // Try multiple logo sources with fallbacks
    tryMultipleLogoSources(domain, companyName)
      .then(url => {
        setLogoUrl(url);
        setCachedLogo(domain, url); // Cache the successful result
        setIsLoading(false);
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  }, [webpage, companyName]);

  return { logoUrl, isLoading, hasError };
}

// Extract domain from URL
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

// Try multiple logo sources with fallbacks
async function tryMultipleLogoSources(domain: string, companyName: string): Promise<string> {
  const sources = [
    // Google's high-quality favicon service (most reliable)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    // DuckDuckGo favicon service (good fallback)
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    // Direct favicon from domain
    `https://${domain}/favicon.ico`,
    // Alternative favicon paths
    `https://${domain}/favicon.png`,
    `https://${domain}/apple-touch-icon.png`,
  ];

  for (const source of sources) {
    try {
      const isValid = await validateImageUrl(source);
      if (isValid) return source;
    } catch {
      continue;
    }
  }

  throw new Error('No valid logo found');
}

// Validate if image URL is accessible and valid
function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 3000); // 3 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img.width > 16 && img.height > 16); // Ensure it's not a tiny placeholder
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    img.src = url;
  });
}

export default function CompanyModal({ company, isOpen, onClose }: CompanyModalProps) {
  const { logoUrl, isLoading: logoLoading, hasError: logoError } = useCompanyLogo(
    company?.webpage, 
    company?.companyName || ''
  );

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !company) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative glass-strong rounded-2xl border-white/[0.1] max-w-5xl w-full max-h-[90vh] 
                   overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 glass-strong border-b border-white/[0.08] p-8 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/15 blur-lg rounded-xl"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-white/15 to-white/8 
                             rounded-xl border border-white/15 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white/90" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gradient">Company Details</h2>
          </div>
          
          <button
            onClick={onClose}
            className="btn-secondary w-12 h-12 !p-0 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Company Header */}
          <div className="flex items-start gap-8 mb-10">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-2xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 
                             rounded-2xl border border-white/15 flex items-center justify-center 
                             backdrop-blur-sm overflow-hidden">
                {logoLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                ) : logoUrl && !logoError ? (
                  <img 
                    src={logoUrl} 
                    alt={`${company.companyName} logo`}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {/* Fallback to letter */}
                <div className={`text-4xl font-bold text-white ${logoUrl && !logoError ? 'hidden' : ''}`}>
                  {company.companyName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                {company.companyName}
              </h1>
              <p className="text-xl text-white/70 mb-6 leading-relaxed">
                {company.description || 'No description available'}
              </p>
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStat label="Founded" value={company.yearFounded.toString()} />
                <QuickStat label="Category" value={company.category} />
                <QuickStat label="Location" value={company.location.split(',')[0]} />
                <QuickStat label="CEO" value={company.ceo} />
              </div>
            </div>
          </div>

          {/* Company Details Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {company.mainValueProposition && (
                <Section 
                  title="Value Proposition" 
                  content={company.mainValueProposition} 
                />
              )}
              
              {company.keyProducts && (
                <Section 
                  title="Key Products" 
                  content={company.keyProducts} 
                />
              )}
              
              {company.technologicalAdvantage && (
                <Section 
                  title="Technology Advantage" 
                  content={company.technologicalAdvantage} 
                />
              )}
              
              {company.targetCustomer && (
                <Section 
                  title="Target Customer" 
                  content={company.targetCustomer} 
                />
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {company.totalFundingRaised && (
                <Section 
                  title="Funding Information" 
                  content={`Total Raised: ${company.totalFundingRaised}${company.latestFundingRound ? `\nLatest Round: ${company.latestFundingRound}` : ''}${company.keyInvestors ? `\nKey Investors: ${company.keyInvestors}` : ''}`} 
                />
              )}
              
              {company.competitors && (
                <Section 
                  title="Competitors" 
                  content={company.competitors} 
                />
              )}
              
              {company.keyPartnerships && (
                <Section 
                  title="Key Partnerships" 
                  content={company.keyPartnerships} 
                />
              )}
              
              {company.majorMilestones && (
                <Section 
                  title="Major Milestones" 
                  content={company.majorMilestones} 
                />
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(company.teamSize || company.webpage || company.patents) && (
            <div className="mt-10 pt-8 border-t border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-6">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {company.teamSize && (
                  <InfoCard title="Team Size" content={company.teamSize} />
                )}
                {company.webpage && (
                  <InfoCard 
                    title="Website" 
                    content={
                      <a 
                        href={company.webpage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white/80 hover:text-white 
                                 transition-colors duration-300 group"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      </a>
                    }
                  />
                )}
                {company.patents && (
                  <InfoCard title="Patents/IP" content={company.patents} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick Stat Component
interface QuickStatProps {
  label: string;
  value: string;
}

function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-center
                   hover:bg-white/[0.06] transition-all duration-300">
      <div className="text-lg font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/50 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

// Section Component
interface SectionProps {
  title: string;
  content: string;
}

function Section({ title, content }: SectionProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl"></div>
      <div className="relative glass rounded-xl p-6 border-white/[0.06] 
                     hover:bg-white/[0.02] transition-all duration-300">
        <h4 className="font-semibold text-white mb-3 text-lg">{title}</h4>
        <p className="text-white/70 leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}

// Info Card Component
interface InfoCardProps {
  title: string;
  content: string | React.ReactNode;
}

function InfoCard({ title, content }: InfoCardProps) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6
                   hover:bg-white/[0.06] transition-all duration-300">
      <div className="font-semibold text-white mb-3">{title}</div>
      <div className="text-white/70">
        {typeof content === 'string' ? content : content}
      </div>
    </div>
  );
} 