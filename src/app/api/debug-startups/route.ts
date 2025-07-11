import { NextRequest, NextResponse } from 'next/server';
import { fetchAllStartupsFromSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🐛 Debug endpoint called');
    
    // Get raw data from Supabase
    const supabaseData = await fetchAllStartupsFromSupabase();
    
    if (!supabaseData) {
      return NextResponse.json({
        error: 'Failed to fetch from Supabase',
        count: 0
      });
    }
    
    // Count companies with empty names
    let emptyNames = 0;
    const sampleProblems: any[] = [];
    
    supabaseData.forEach((startup, index) => {
      const companyName = String(startup.companyName || '').trim();
      if (!companyName) {
        emptyNames++;
        if (sampleProblems.length < 5) {
          sampleProblems.push({
            index,
            id: startup.id,
            companyName: startup.companyName,
            companyNameType: typeof startup.companyName,
            description: startup.description?.substring(0, 50)
          });
        }
      }
    });
    
    return NextResponse.json({
      totalFromSupabase: supabaseData.length,
      validCompanies: supabaseData.length - emptyNames,
      emptyNames,
      sampleProblems,
      message: `Found ${supabaseData.length} companies, ${emptyNames} have empty names`
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}