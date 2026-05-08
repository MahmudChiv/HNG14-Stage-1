import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 1000);
  },
});

redis.on("error", (err) => {
  // Log but don't crash — app works without cache, just slower
  console.error("Redis connection error:", err.message);
});

export const cache = {
  /**
   * Generates a consistent cache key from query parameters.
   *
   * Why sort the keys? Because { gender: 'male', country_id: 'NG' } and
   * { country_id: 'NG', gender: 'male' } are the same query but would
   * generate different strings if we just JSON.stringify() them directly.
   * Sorting ensures identical queries always produce identical cache keys.
   */
  key: (prefix: string, params: Record<string, unknown>): string => {
    const sorted = Object.keys(params)
      .sort()
      .filter((k) => params[k] !== undefined && params[k] !== "")
      .reduce((acc, k) => ({ ...acc, [k]: params[k] }), {});
    return `${prefix}:${JSON.stringify(sorted)}`;
  },

  /**
   * Get a cached value. Returns null if not found or Redis is down.
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null; // Redis failure = cache miss, not app failure
    }
  },

  /**
   * Store a value in cache with a TTL (time to live).
   * After ttlSeconds, Redis automatically deletes the entry.
   *
   * We use 5 minutes (300s) for profile lists because:
   * - Demographic data doesn't change frequently
   * - Stale data for 5 minutes is acceptable for analytics
   * - Longer TTL = better hit rate = less DB load
   */
  set: async (key: string, value: unknown, ttlSeconds = 300): Promise<void> => {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // Redis failure = just don't cache, app continues normally
    }
  },

  /**
   * Delete all cache entries matching a pattern.
   * Called when data changes so stale results aren't served.
   *
   * Pattern 'profiles:list:*' matches ALL profile list cache entries
   * regardless of what filters were used.
   */
  invalidate: async (pattern: string): Promise<void> => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Silent failure — old cache will expire naturally via TTL
    }
  },
};
