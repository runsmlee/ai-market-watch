// Logo caching utility
const CACHE_KEY = 'company_logos_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedLogo {
  url: string;
  timestamp: number;
  domain: string;
}

interface LogoCache {
  [domain: string]: CachedLogo;
}

// Get cached logo
export function getCachedLogo(domain: string): string | null {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;

    const logoCache: LogoCache = JSON.parse(cache);
    const cached = logoCache[domain];

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      deleteCachedLogo(domain);
      return null;
    }

    return cached.url;
  } catch {
    return null;
  }
}

// Set cached logo
export function setCachedLogo(domain: string, url: string): void {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    const logoCache: LogoCache = cache ? JSON.parse(cache) : {};

    logoCache[domain] = {
      url,
      timestamp: Date.now(),
      domain
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(logoCache));
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Delete cached logo
export function deleteCachedLogo(domain: string): void {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return;

    const logoCache: LogoCache = JSON.parse(cache);
    delete logoCache[domain];

    localStorage.setItem(CACHE_KEY, JSON.stringify(logoCache));
  } catch {
    // Silently fail
  }
}

// Clear all cached logos
export function clearLogoCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Silently fail
  }
}

// Get cache size
export function getCacheSize(): number {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return 0;

    const logoCache: LogoCache = JSON.parse(cache);
    return Object.keys(logoCache).length;
  } catch {
    return 0;
  }
} 