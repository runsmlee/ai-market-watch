import { NextRequest, NextResponse } from 'next/server';
import { fetchAllStartupsFromSupabase, filterStartupsRPC } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API Route called');
    
    // Check for query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const locations = searchParams.get('locations')?.split(',').filter(Boolean);
    const yearFrom = searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : undefined;
    const yearTo = searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : undefined;
    
    // If any filters are present, use filterStartupsRPC
    if (search || categories?.length || locations?.length || yearFrom || yearTo) {
      console.log('🔍 Using filterStartupsRPC with filters:', { search, categories, locations, yearFrom, yearTo });
      
      const result = await filterStartupsRPC({
        searchTerm: search || undefined,
        categories: categories || undefined,
        locations: locations || undefined,
        yearFrom: yearFrom,
        yearTo: yearTo,
        limit: 1000
      });
      
      if (!result) {
        throw new Error('Failed to filter data from Supabase');
      }
      
      console.log(`✅ Successfully filtered ${result.startups.length} startups from ${result.totalCount} total`);
      
      return NextResponse.json({
        success: true,
        data: result.startups,
        source: 'supabase-filtered',
        totalCount: result.totalCount,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes for filtered results
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // Otherwise, fetch all startups
    console.log('📊 Fetching all startups from Supabase');
    const supabaseData = await fetchAllStartupsFromSupabase();
    
    if (!supabaseData) {
      throw new Error('Failed to fetch data from Supabase');
    }
    
    console.log(`✅ Successfully fetched ${supabaseData.length} startups from Supabase`);
    

    
    // Return data
    return NextResponse.json({
      success: true,
      data: supabaseData,
      source: 'supabase',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Error fetching startups:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: true, 
        message: errorMessage,
        type: 'fetch_error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 