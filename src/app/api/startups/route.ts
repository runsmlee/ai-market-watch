import { NextRequest, NextResponse } from 'next/server';
import { fetchAllStartupsFromSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API Route called - Fetching from Supabase');
    
    // Fetch from Supabase
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