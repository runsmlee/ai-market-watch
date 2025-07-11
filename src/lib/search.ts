import { Startup } from '@/types/startup';

export interface SearchResult extends Partial<Startup> {
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
  searchType: 'combined' | 'text-only';
  query: string;
}

export async function searchCompanies(
  query: string,
  options?: {
    categories?: string[];
    locations?: string[];
    limit?: number;
  }
): Promise<SearchResponse> {
  if (!query.trim()) {
    return {
      success: true,
      data: [],
      count: 0,
      searchType: 'text',
      query: '',
    };
  }

  try {
    const params = new URLSearchParams({
      q: query,
      ...(options?.limit && { limit: options.limit.toString() }),
    });

    if (options?.categories?.length) {
      params.append('categories', options.categories.join(','));
    }
    if (options?.locations?.length) {
      params.append('locations', options.locations.join(','));
    }

    const response = await fetch(`/api/startups/search?${params}`);
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}