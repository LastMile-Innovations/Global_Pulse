import { Redis } from "@upstash/redis"

// Create a Redis client using environment variables
// The @upstash/redis client requires REST API URLs, not Redis protocol URLs
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Cache key generator for consistent keys
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

// Enhanced caching for Supabase queries with automatic serialization/deserialization
export async function cacheQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: { ttl?: number; tags?: string[] } = {},
): Promise<T> {
  const { ttl = 60, tags = [] } = options

  try {
    // Try to get from cache first
    const cached = await redis.get<string>(key)

    if (cached) {
      return JSON.parse(cached) as T
    }

    // If not in cache, execute the query
    const data = await queryFn()

    // Store in cache with TTL
    await redis.set(key, JSON.stringify(data), { ex: ttl })

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

// Invalidate cache by tag
export async function invalidateByTag(tag: string): Promise<void> {
  try {
    // Get all keys associated with this tag
    const keys = await redis.smembers<string>(`tag:${tag}`)

    if (keys.length > 0) {
      // Delete all the cached data
      await redis.del(keys)
      // Delete the tag set itself
      await redis.del(`tag:${tag}`)
    }
  } catch (error) {
    console.error("Cache invalidation error:", error)
  }
}

// Pub/Sub for real-time updates
export async function publishUpdate(channel: string, data: any): Promise<void> {
  try {
    await redis.publish(channel, JSON.stringify(data))
  } catch (error) {
    console.error("Redis publish error:", error)
  }
}

// Rate limiting utility
export async function rateLimit(
  identifier: string,
  limit = 10,
  window = 60,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`

  try {
    // Increment counter and set expiry if it doesn't exist
    const counter = await redis.incr(key)
    if (counter === 1) {
      await redis.expire(key, window)
    }

    // Get TTL
    const ttl = await redis.ttl(key)
    const reset = Date.now() + ttl * 1000

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
