import { Startup } from '@/types/startup';

export interface SearchResult extends Startup {
  vectorSimilarity?: number;
  textMatchScore?: number;
  combinedScore?: number;
  rank?: number;
  matchType?: 'text' | 'vector';
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  count: number;
  textMatchCount?: number;
  vectorMatchCount?: number;
  searchType: 'combined' | 'text-only' | 'vector-only';
  query: string;
}

export async function searchCompanies(
  query: string,
  options?: {
    categories?: string[];
    locations?: string[];
    limit?: number;
    forceVectorSearch?: boolean;
  }
): Promise<SearchResponse> {
  if (!query.trim()) {
    return {
      success: true,
      data: [],
      count: 0,
      searchType: 'text-only',
      query: '',
    };
  }

  try {
    const params = new URLSearchParams({
      q: query,
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.forceVectorSearch && { forceVector: 'true' }),
    });

    if (options?.categories?.length) {
      params.append('categories', options.categories.join(','));
    }
    if (options?.locations?.length) {
      params.append('locations', options.locations.join(','));
    }

    // GET 요청으로 변경 (API가 GET만 지원)
    const response = await fetch(`/api/startups/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}