// Simple in-memory cache for development
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  if (process.env.NODE_ENV === 'production') return null;
  
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCache<T>(key: string, data: T): void {
  if (process.env.NODE_ENV === 'production') return;
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}