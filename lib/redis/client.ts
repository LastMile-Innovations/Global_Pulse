import { Redis } from "@upstash/redis"

/**
 * Enhanced Redis client for Next.js applications
 * 
 * This client provides a comprehensive set of utilities for working with Redis:
 * - Optimized caching with automatic serialization/deserialization
 * - Tag-based cache invalidation
 * - Pub/Sub for real-time updates
 * - Rate limiting with improved performance
 * - Simplified get/set operations with error handling
 */

// Create a Redis client using environment variables
// The @upstash/redis client requires REST API URLs, not Redis protocol URLs
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

/**
 * Generate a consistent cache key with optional parameters
 * Parameters are sorted to ensure consistent keys regardless of object property order
 */
export const createCacheKey = (prefix: string, params: Record<string, any> = {}): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = params[key]
        return result
      },
      {} as Record<string, any>,
    )

  return `${prefix}:${Object.entries(sortedParams).length > 0 ? JSON.stringify(sortedParams) : "default"}`
}

/**
 * Enhanced caching for queries with automatic serialization/deserialization
 * Supports tag-based invalidation for efficient cache management
 */
export async function cacheQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: { ttl?: number; tags?: string[] } = {},
): Promise<T> {
  const { ttl = 60, tags = [] } = options

  try {
    // Try to get from cache first
    const cached = await getCache<T>(key)

    if (cached !== null) {
      return cached
    }

    // If not in cache, execute the query
    const data = await queryFn()

    // Store in cache with TTL
    await setCache(key, data, ttl)

    // Store cache key in tag sets for later invalidation
    if (tags.length > 0) {
      await Promise.all(tags.map((tag) => redis.sadd(`tag:${tag}`, key)))
    }

    return data
  } catch (error) {
    console.error("Redis cache error:", error)
    // Fallback to direct query on cache error
    return queryFn()
  }
}

/**
 * Optimized get cache function with better error handling
 * Automatically handles JSON parsing
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<string>(key)
    return data ? (JSON.parse(data) as T) : null
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error)
    return null
  }
}

/**
 * Optimized set cache function with better error handling
 * Automatically handles JSON serialization
 */
export async function setCache<T>(key: string, data: T, ttl?: number): Promise<boolean> {
  try {
    const options = ttl ? { ex: ttl } : undefined
    await redis.set(key, JSON.stringify(data), options)
    return true
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error)
    return false
  }
}

/**
 * Invalidate cache by tag
 * Efficiently removes all cache entries associated with a specific tag
 */
export async function invalidateByTag(tag: string): Promise<void> {
  try {
    // Get all keys associated with this tag
    const keys = await redis.smembers(`tag:${tag}`)

    if (keys.length > 0) {
      // Delete all the cached data
      if (keys.length === 1) {
        await redis.del(keys[0])
      } else if (keys.length > 1) {
        await Promise.all(keys.map(key => redis.del(key)))
      }
      // Delete the tag set itself
      await redis.del(`tag:${tag}`)
    }
  } catch (error) {
    console.error("Cache invalidation error:", error)
  }
}

/**
 * Pub/Sub for real-time updates
 * Automatically handles JSON serialization
 */
export async function publishUpdate(channel: string, data: any): Promise<void> {
  try {
    await redis.publish(channel, JSON.stringify(data))
  } catch (error) {
    console.error("Redis publish error:", error)
  }
}

/**
 * Rate limiting utility with improved performance using pipelining
 * Reduces network roundtrips for better efficiency
 */
export async function rateLimit(
  identifier: string,
  limit = 10,
  window = 60,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`

  try {
    // Use pipelining to reduce network roundtrips
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.ttl(key)

    const [counter, ttl] = (await pipeline.exec()) as [number, number]

    // Set expiry if it doesn't exist
    if (counter === 1) {
      await redis.expire(key, window)
    }

    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : window * 1000)

    return {
      success: counter <= limit,
      remaining: Math.max(0, limit - counter),
      reset,
    }
  } catch (error) {
    console.error("Rate limit error:", error)
    // Default to allowing the request on error
    return { success: true, remaining: 0, reset: Date.now() + window * 1000 }
  }
}
