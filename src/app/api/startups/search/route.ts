import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, convertStartupDetailsToStartup } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const locations = searchParams.get('locations')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '50');
    const forceVectorSearch = searchParams.get('forceVector') === 'true';

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Search requested:', { query, categories, locations, forceVectorSearch });

    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Perform text search unless vector search is forced
    let textResults: any[] = [];
    if (!forceVectorSearch) {
      console.log('📝 Performing text search...');
      textResults = await performTextSearch(supabase, query, categories, locations, limit);
      console.log(`📝 Text search found ${textResults.length} results`);
    }

    // Try vector search if forced or if we have OpenAI key and text results are limited
    let vectorResults: any[] = [];
    let embedding = null;
    
    const useVectorSearch = process.env.OPENAI_API_KEY && 
                          process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    if (useVectorSearch && (forceVectorSearch || textResults.length < 10)) {
      try {
        if (forceVectorSearch) {
          console.log('🚀 Performing forced vector search...');
        } else {
          console.log('🚀 Attempting vector search (limited text results)...');
        }
        
        // Step 1: Generate embedding for the search query
        const embeddingResponse = await fetch(
          new URL('/api/embeddings', request.url).toString(),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: query }),
          }
        );

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          embedding = embeddingData.embedding;
          console.log('✅ Embedding generated successfully');
          
          // Step 2: Perform vector search
          vectorResults = await performVectorSearch(supabase, embedding, query, categories, locations, limit);
          console.log(`🚀 Vector search found ${vectorResults.length} results`);
        } else {
          console.log('⚠️ Embedding generation failed, using text search only');
        }
      } catch (error) {
        console.error('⚠️ Vector search failed, continuing with text results:', error);
        // Don't throw error - continue with text results
      }
    } else if (!useVectorSearch) {
      console.log('⚠️ Vector search disabled - no OpenAI API key');
    } else {
      console.log('ℹ️ Text search returned sufficient results, skipping vector search');
    }

    // Combine results: text matches first, then vector matches (excluding duplicates)
    const textResultIds = new Set(textResults.map(r => r.id));
    const uniqueVectorResults = vectorResults.filter(r => !textResultIds.has(r.id));
    const combinedResults = [...textResults, ...uniqueVectorResults].slice(0, limit);

    console.log(`✅ Search completed: ${combinedResults.length} total results (${textResults.length} text + ${uniqueVectorResults.length} vector)`);

    // Determine search type
    let searchType: 'combined' | 'text-only' | 'vector-only';
    if (forceVectorSearch && embedding) {
      searchType = 'vector-only';
    } else if (embedding && textResults.length > 0) {
      searchType = 'combined';
    } else {
      searchType = 'text-only';
    }

    return NextResponse.json({
      success: true,
      data: combinedResults,
      count: combinedResults.length,
      textMatchCount: textResults.length,
      vectorMatchCount: uniqueVectorResults.length,
      searchType,
      query,
    });
  } catch (error) {
    console.error('❌ Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Simple text search function with improved error handling
async function performTextSearch(
  supabase: any,
  query: string,
  categories: string[] | undefined,
  locations: string[] | undefined,
  limit: number
) {
  try {
    // Build the query
    let queryBuilder = supabase
      .from('startup_details')
      .select('*')
      .or(`company_name.ilike.%${query}%,one_line_description.ilike.%${query}%,ceo.ilike.%${query}%`);

    // Apply filters
    if (categories?.length) {
      queryBuilder = queryBuilder.in('category', categories);
    }
    if (locations?.length) {
      // Use flexible location matching
      const locationConditions = locations.map(loc => `location.ilike.%${loc}%`).join(',');
      queryBuilder = queryBuilder.or(locationConditions);
    }

    queryBuilder = queryBuilder.limit(limit);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Text search error:', error);
      return [];
    }

    // Use the same conversion function as regular startup fetch for consistency
    return (data || []).map((item: any) => {
      const convertedStartup = convertStartupDetailsToStartup(item);
      if (convertedStartup) {
        // Add text-specific properties
        return {
          ...convertedStartup,
          matchType: 'text' as const,
        };
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error('Text search failed:', error);
    return [];
  }
}

// Vector similarity search function with graceful fallback
async function performVectorSearch(
  supabase: any,
  embedding: number[],
  query: string,
  categories: string[] | undefined,
  locations: string[] | undefined,
  limit: number
) {
  try {
    console.log('🔍 Calling search_companies_hybrid RPC function...');
    
    console.log('📊 Embedding prepared:', { 
      originalLength: embedding.length, 
      firstFewValues: embedding.slice(0, 5)
    });
    
    const { data, error } = await supabase.rpc('search_companies_hybrid', {
      query_embedding: embedding, // Changed: pass array directly instead of JSON string
      search_text: null, // Don't use text matching in vector search
      p_categories: categories || null,
      p_locations: locations || null,
      p_limit: limit,
    });

    if (error) {
      console.error('Vector search RPC error:', error);
      
      // If the function doesn't exist, log but don't crash
      if (error.message?.includes('function "search_companies_hybrid" does not exist')) {
        console.log('⚠️ Vector search function not found - please run the vector search migration');
        return [];
      }
      
      // Log other specific errors for debugging
      if (error.message?.includes('structure of query does not match')) {
        console.log('⚠️ Vector function parameter mismatch - check function signature');
        console.log('📝 Attempted parameters:', {
          query_embedding: embedding.slice(0, 5),
          p_categories: categories,
          p_locations: locations,
          p_limit: limit
        });
      }
      
      throw error;
    }

    console.log(`✅ Vector search RPC completed: ${data?.length || 0} results`);
    
    // Log sample results for debugging
    if (data && data.length > 0) {
      console.log('📊 Sample vector results:', data.slice(0, 2).map(item => ({
        company_name: item.company_name,
        vector_similarity: item.vector_similarity,
        category: item.category
      })));
    }

    // Use the same conversion function as regular startup fetch for consistency
    return (data || []).map((item: any) => {
      const convertedStartup = convertStartupDetailsToStartup(item);
      if (convertedStartup) {
        // Add vector-specific properties
        return {
          ...convertedStartup,
          vectorSimilarity: item.vector_similarity,
          matchType: 'vector' as const,
        };
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error('Vector search failed:', error);
    return [];
  }
}