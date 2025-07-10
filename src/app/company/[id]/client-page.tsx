'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import CompanyModal from '@/components/company/CompanyModal';
import { fetchStartups } from '@/lib/api';
import { fetchCompanyFromSupabase, convertSupabaseToStartup } from '@/lib/supabase';
import { Startup } from '@/types/startup';

interface CompanyClientPageProps {
  id: string;
}

export default function CompanyClientPage({ id }: CompanyClientPageProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        let companyData: Startup | null = null;
        
        // Check if ID is numeric (Supabase ID)
        if (/^\d+$/.test(id)) {
          try {
            const supabaseData = await fetchCompanyFromSupabase(id);
            if (supabaseData) {
              companyData = convertSupabaseToStartup(id, supabaseData);
            }
          } catch (err) {
            console.error('Error fetching from Supabase:', err);
          }
        }
        
        // If not found in Supabase or not numeric ID, try Apps Script
        if (!companyData) {
          try {
            const startupsData = await fetchStartups({}, { useCache: true });
            const startups = startupsData.transformedData || startupsData.data || [];
            
            companyData = startups.find((startup: Startup) => 
              startup.id === id || 
              startup.companyName?.toLowerCase().replace(/\s+/g, '-') === id
            );
          } catch (err) {
            console.error('Error fetching from Apps Script:', err);
          }
        }

        if (companyData) {
          console.log('✅ Company data loaded:', {
            id: companyData.id,
            name: companyData.companyName,
            source: /^\d+$/.test(id) ? 'Supabase' : 'Apps Script'
          });
          setCompany(companyData);
        } else {
          setError('Company not found');
        }
      } catch (err) {
        console.error('Error loading company:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [id]);

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The requested company could not be found.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: company.companyName,
            description: company.description,
            url: company.webpage,
            foundingDate: company.yearFounded?.toString(),
            industry: 'Artificial Intelligence',
          }, null, 2),
        }}
      />
      <div className="min-h-screen bg-gray-950 text-white">
        <CompanyModal 
          company={company} 
          isOpen={true} 
          onClose={handleClose} 
        />
      </div>
    </>
  );
}