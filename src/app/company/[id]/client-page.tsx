'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import CompanyModal from '@/components/company/CompanyModal';
import { fetchCompanyFromSupabase, fetchCompanyBySlug, findCompanyByName, convertStartupDetailsToStartup } from '@/lib/supabase';
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
        let supabaseData = null;
        
        // Check if ID is a UUID (Supabase ID)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isUUID) {
          // Fetch by ID
          supabaseData = await fetchCompanyFromSupabase(id);
        } else if (/^\d+$/.test(id)) {
          // Legacy numeric ID (vector_id)
          supabaseData = await fetchCompanyFromSupabase(id);
        } else {
          // Try as slug first
          console.log('🔍 Attempting to fetch by slug:', id);
          supabaseData = await fetchCompanyBySlug(id);
          
          // If not found as slug, try as company name
          if (!supabaseData) {
            console.log('❌ Not found by slug, trying as company name');
            const decodedName = decodeURIComponent(id);
            supabaseData = await findCompanyByName(decodedName);
          }
        }
        
        // Convert to Startup type
        if (supabaseData) {
          companyData = convertStartupDetailsToStartup(supabaseData);
        }

        if (companyData) {
          console.log('✅ Company data loaded:', {
            id: companyData.id,
            name: companyData.companyName
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