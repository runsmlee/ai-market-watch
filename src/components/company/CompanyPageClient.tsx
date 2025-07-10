'use client';

import { useRouter } from 'next/navigation';
import CompanyModal from './CompanyModal';
import { Startup } from '@/types/startup';

interface CompanyPageClientProps {
  company: Startup;
}

export default function CompanyPageClient({ company }: CompanyPageClientProps) {
  const router = useRouter();

  const handleClose = () => {
    // Check if we came from DNA match or main page
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <CompanyModal 
        company={company} 
        isOpen={true} 
        onClose={handleClose} 
      />
    </div>
  );
}