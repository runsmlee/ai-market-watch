interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (default: 1 hour)
  key: string;
}

class DataCache {
  private static readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour

  static set<T>(config: CacheConfig, data: T): void {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return; // Skip caching on server side
    }

    const ttl = config.ttl || this.DEFAULT_TTL;
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };

    try {
      localStorage.setItem(config.key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static get<T>(config: CacheConfig): T | null {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return null; // No cache on server side
    }

    try {
      const cached = localStorage.getItem(config.key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiry) {
        this.remove(config.key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      this.remove(config.key);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  static clear(): void {
    try {
      // Remove only our app's cache items
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ai-market-watch-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static isExpired(key: string): boolean {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return true;

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      return Date.now() > cacheItem.expiry;
    } catch {
      return true;
    }
  }
}

export { DataCache, type CacheConfig };

// Cache keys for different data types
export const CACHE_KEYS = {
  STARTUPS: 'ai-market-watch-startups',
  STATS: 'ai-market-watch-stats',
  FILTERS_META: 'ai-market-watch-filters-meta',
  LAST_UPDATE: 'ai-market-watch-last-update'
} as const; 