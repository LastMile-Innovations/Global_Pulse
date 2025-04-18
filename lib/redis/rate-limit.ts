import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"
import { createHash } from "crypto"

/**
 * Rate limiting algorithms
 */
export enum RateLimitAlgorithm {
  FIXED_WINDOW = "fixed-window",
  TOKEN_BUCKET = "token-bucket",
  SLIDING_WINDOW = "sliding-window",
  SLIDING_WINDOW_LOGS = "sliding-window-logs",
}

/**
 * Rate limiting options
 */
export interface RateLimitOptions {
  limit: number
  window: number
  keyPrefix?: string
  bypassCheck?: () => Promise<boolean> | boolean
  ipFallback?: {
    enabled?: boolean
    limit?: number
    window?: number
  }
  algorithm?: RateLimitAlgorithm
  tokenBucket?: {
    bucketSize?: number
    refillRate?: number
  }
  slidingWindow?: {
    precision?: number
  }
  includeHeaders?: boolean
  useLocalCache?: boolean
  localCacheTtl?: number
}

interface CacheEntry {
  result: boolean
  remaining: number
  reset: number
  timestamp: number
}

const localCache = new Map<string, CacheEntry>()

const CACHE_CLEANUP_INTERVAL = 60000 // 1 minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of localCache.entries()) {
    // Use the TTL for cache expiry, fallback to 60s if reset is 0
    const ttl = entry.reset > 0 ? entry.reset * 1000 : 60000
    if (now - entry.timestamp > ttl) {
      localCache.delete(key)
    }
  }
}, CACHE_CLEANUP_INTERVAL)

/**
 * Get the client IP address from the request with enhanced security
 */
function getClientIp(request: NextRequest): string {
  // Check for Vercel-specific headers first
  const xForwardedFor = request.headers.get("x-forwarded-for")

  if (xForwardedFor) {
    const ips = xForwardedFor.split(",")
    const clientIp = ips[0].trim()
    if (/^[\d.a-f:]+$/i.test(clientIp)) {
      return clientIp
    }
  }

  // If header is not present or invalid, return unknown
  return "unknown"
}

/**
 * Create a secure identifier hash from an IP address
 * This prevents storing raw IPs in Redis for privacy/security reasons
 */
function hashIdentifier(identifier: string, salt: string = process.env.RATE_LIMIT_SALT || "pulse-rate-limit"): string {
  return createHash("sha256").update(`${identifier}:${salt}`).digest("hex").substring(0, 16)
}

/**
 * Rate limits requests based on user ID and request path
 * Falls back to IP-based limiting for unauthenticated requests
 *
 * @param request The Next.js request object
 * @param options Rate limiting options
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export async function rateLimit(request: NextRequest, options: RateLimitOptions): Promise<NextResponse | null> {
  try {
    // Get user ID from auth
    const userId = await auth(request)

    // Determine if we should use IP-based fallback
    const useIpFallback = !userId && (options.ipFallback?.enabled !== false)

    // If no userId and IP fallback is disabled, skip rate limiting
    if (!userId && !useIpFallback) {
      return null
    }

    // Check if rate limiting should be bypassed
    if (options.bypassCheck) {
      const shouldBypass = typeof options.bypassCheck === "function"
        ? await options.bypassCheck()
        : false
      if (shouldBypass) {
        return null
      }
    }

    // Determine identifier (userId or IP) and limits
    let identifier: string
    let maxRequests: number
    let windowDurationSeconds: number

    if (useIpFallback) {
      // Use IP-based rate limiting with secure hashing
      const clientIp = getClientIp(request)
      identifier = `ip:${hashIdentifier(clientIp)}`

      // Use more restrictive limits for IP-based rate limiting
      maxRequests =
        options.ipFallback?.limit ??
        Math.floor((options.limit ?? Number(process.env.PULSE_DEFAULT_RATE_LIMIT ?? 60)) / 2)
      windowDurationSeconds =
        options.ipFallback?.window ?? options.window ?? Number(process.env.PULSE_DEFAULT_RATE_WINDOW_S ?? 60)

      logger.debug(`Using IP-based rate limiting for ${clientIp} (hashed) on ${request.nextUrl.pathname}`)
    } else {
      // Use user-based rate limiting
      identifier = `user:${userId}`
      maxRequests = options.limit ?? Number(process.env.PULSE_DEFAULT_RATE_LIMIT ?? 60)
      windowDurationSeconds = options.window ?? Number(process.env.PULSE_DEFAULT_RATE_WINDOW_S ?? 60)
    }

    // Construct Redis key: prefix:identifier:pathname
    const path = request.nextUrl.pathname
    const keyPrefix = options.keyPrefix || "rate_limit"
    const key = `${keyPrefix}:${identifier}:${path}`

    // Check local cache if enabled
    if (options.useLocalCache) {
      const cacheKey = `${key}:${maxRequests}:${windowDurationSeconds}`
      const cachedResult = localCache.get(cacheKey)

      if (cachedResult && Date.now() - cachedResult.timestamp < (options.localCacheTtl ?? 1000)) {
        // If rate limited in cache, return 429
        if (!cachedResult.result) {
          return createRateLimitResponse(
            windowDurationSeconds,
            maxRequests,
            cachedResult.remaining,
            cachedResult.reset,
            options.includeHeaders,
          )
        }
        // If not rate limited in cache, proceed with request
        return null
      }
    }

    // Choose algorithm based on options (default to sliding-window)
    const algorithm = options.algorithm || RateLimitAlgorithm.SLIDING_WINDOW

    // Get Redis client
    const redis = getRedisClient()

    // Execute the appropriate rate limiting algorithm
    let result: { limited: boolean; remaining: number; reset: number } | null = null

    switch (algorithm) {
      case RateLimitAlgorithm.TOKEN_BUCKET:
        result = await tokenBucketRateLimit(redis, key, {
          bucketSize: options.tokenBucket?.bucketSize ?? maxRequests,
          refillRate: options.tokenBucket?.refillRate ?? maxRequests / windowDurationSeconds,
          windowDurationSeconds,
        })
        break
      case RateLimitAlgorithm.SLIDING_WINDOW:
        result = await slidingWindowRateLimit(redis, key, {
          maxRequests,
          windowDurationSeconds,
          precision: options.slidingWindow?.precision ?? 10,
        })
        break
      case RateLimitAlgorithm.SLIDING_WINDOW_LOGS:
        result = await slidingWindowLogsRateLimit(redis, key, {
          maxRequests,
          windowDurationSeconds,
        })
        break
      case RateLimitAlgorithm.FIXED_WINDOW:
      default:
        result = await fixedWindowRateLimit(redis, key, {
          maxRequests,
          windowDurationSeconds,
        })
        break
    }

    // Handle Redis errors or unexpected results
    if (!result) {
      logger.warn(`Rate limit check failed for ${key}, potentially Redis issue. Allowing request.`)
      return null // Fail open on Redis error
    }

    // Update local cache if enabled
    if (options.useLocalCache) {
      const cacheKey = `${key}:${maxRequests}:${windowDurationSeconds}`
      localCache.set(cacheKey, {
        result: !result.limited,
        remaining: result.remaining,
        reset: result.reset,
        timestamp: Date.now(),
      })
    }

    // If rate limited, return 429 response
    if (result.limited) {
      logger.warn(`Rate limit exceeded for ${key}: ${maxRequests - result.remaining}/${maxRequests}`)
      return createRateLimitResponse(
        windowDurationSeconds,
        maxRequests,
        result.remaining,
        result.reset,
        options.includeHeaders,
      )
    }

    // Add rate limit headers to the request if enabled (note: NextRequest headers are readonly in edge runtime)
    // This is a no-op in edge runtime, but left for compatibility if running in Node.js
    if (options.includeHeaders !== false && typeof request.headers.set === "function") {
      try {
        request.headers.set("X-RateLimit-Limit", String(maxRequests))
        request.headers.set("X-RateLimit-Remaining", String(result.remaining))
        request.headers.set("X-RateLimit-Reset", String(result.reset))
      } catch (e) {
        // Ignore if headers are readonly
      }
    }

    // Rate limit not exceeded
    return null
  } catch (error) {
    logger.error(`Unexpected error in rate limit function: ${error}`)
    return null // Fail open on any error
  }
}

/**
 * Create a standardized rate limit response
 */
function createRateLimitResponse(
  windowDurationSeconds: number,
  limit: number,
  remaining: number,
  reset: number,
  includeHeaders = true,
): NextResponse {
  const headers: Record<string, string> = {}

  if (includeHeaders) {
    headers["Retry-After"] = String(windowDurationSeconds)
    headers["X-RateLimit-Limit"] = String(limit)
    headers["X-RateLimit-Remaining"] = String(remaining)
    headers["X-RateLimit-Reset"] = String(reset)
  }

  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      retryAfter: windowDurationSeconds,
    },
    {
      status: 429,
      headers,
    },
  )
}

/**
 * Implements fixed-window rate limiting algorithm
 * Simple but can lead to traffic spikes at window boundaries
 */
async function fixedWindowRateLimit(
  redis: any,
  key: string,
  options: { maxRequests: number; windowDurationSeconds: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
  const { maxRequests, windowDurationSeconds } = options
  const currentTime = Math.floor(Date.now() / 1000)
  const windowKey = `${key}:${Math.floor(currentTime / windowDurationSeconds)}`

  // Use Redis pipeline for atomic operations
  const multi = redis.pipeline()
  multi.incr(windowKey)
  multi.expire(windowKey, windowDurationSeconds)

  try {
    const results = await multi.exec()
    if (!results || !Array.isArray(results) || results[0] == null || results[0][1] == null) {
      return null
    }

    // Redis pipeline returns [[null, value], ...]
    const currentCount = typeof results[0][1] === "number" ? results[0][1] : parseInt(results[0][1], 10)
    const remaining = Math.max(0, maxRequests - currentCount)
    const reset = Math.ceil(currentTime / windowDurationSeconds) * windowDurationSeconds

    return {
      limited: currentCount > maxRequests,
      remaining,
      reset,
    }
  } catch (error) {
    logger.error(`Redis error during fixed window rate limiting for key ${key}: ${error}`)
    return null
  }
}

/**
 * Implements token bucket rate limiting algorithm
 * Allows for bursts of traffic while maintaining average rate
 */
async function tokenBucketRateLimit(
  redis: any,
  key: string,
  options: { bucketSize: number; refillRate: number; windowDurationSeconds: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
  const { bucketSize, refillRate, windowDurationSeconds } = options
  const currentTime = Math.floor(Date.now() / 1000)

  // Optimized Lua script for token bucket algorithm
  const tokenBucketScript = `
    local tokens_key = KEYS[1]
    local timestamp_key = KEYS[2]
    local bucket_size = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local current_time = tonumber(ARGV[3])
    local window_duration = tonumber(ARGV[4])

    local tokens = tonumber(redis.call('get', tokens_key) or bucket_size)
    local last_update = tonumber(redis.call('get', timestamp_key) or 0)

    local time_elapsed = math.max(0, current_time - last_update)
    local tokens_to_add = time_elapsed * refill_rate

    tokens = math.min(bucket_size, tokens + tokens_to_add)

    redis.call('set', timestamp_key, current_time)
    redis.call('expire', timestamp_key, window_duration)

    if tokens >= 1 then
      tokens = tokens - 1
      redis.call('set', tokens_key, tokens)
      redis.call('expire', tokens_key, window_duration)

      local time_to_full = (bucket_size - tokens) / refill_rate
      local reset_time = current_time + time_to_full

      return {0, tokens, math.ceil(reset_time)}
    else
      redis.call('set', tokens_key, tokens)
      redis.call('expire', tokens_key, window_duration)

      local time_to_next = (1 - tokens) / refill_rate
      local reset_time = current_time + time_to_next

      return {1, 0, math.ceil(reset_time)}
    end
  `

  try {
    // Some Redis clients use 'eval', some use 'evalsha', some use 'eval' with different signatures
    // Try to support both ioredis and node-redis v4
    let result
    if (typeof redis.eval === "function") {
      result = await redis.eval(tokenBucketScript, {
        keys: [`${key}:tokens`, `${key}:timestamp`],
        arguments: [bucketSize, refillRate, currentTime, windowDurationSeconds],
      })
    } else if (typeof redis.evalsha === "function") {
      // Not supported in all clients, fallback
      result = await redis.evalsha(tokenBucketScript, 2, `${key}:tokens`, `${key}:timestamp`, bucketSize, refillRate, currentTime, windowDurationSeconds)
    } else {
      throw new Error("Redis client does not support eval")
    }

    if (!result || result.length !== 3) {
      return null
    }

    const [limited, remaining, reset] = result

    return {
      limited: limited === 1,
      remaining: Number(remaining),
      reset: Number(reset),
    }
  } catch (error) {
    logger.error(`Redis error during token bucket rate limiting for key ${key}: ${error}`)
    return null
  }
}

/**
 * Implements sliding window rate limiting algorithm
 * More accurate than fixed window, more efficient than sliding window logs
 */
async function slidingWindowRateLimit(
  redis: any,
  key: string,
  options: { maxRequests: number; windowDurationSeconds: number; precision: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
  const { maxRequests, windowDurationSeconds, precision } = options
  const currentTime = Math.floor(Date.now() / 1000)
  const currentWindowKey = `${key}:${Math.floor(currentTime / windowDurationSeconds)}`
  const previousWindowKey = `${key}:${Math.floor(currentTime / windowDurationSeconds) - 1}`

  // Optimized Lua script for sliding window algorithm
  const slidingWindowScript = `
    local current_key = KEYS[1]
    local previous_key = KEYS[2]
    local max_requests = tonumber(ARGV[1])
    local window_size = tonumber(ARGV[2])
    local current_time = tonumber(ARGV[3])
    local precision = tonumber(ARGV[4])

    local current_count = tonumber(redis.call('get', current_key) or 0)
    local previous_count = tonumber(redis.call('get', previous_key) or 0)

    local window_start = math.floor(current_time / window_size) * window_size
    local position = (current_time - window_start) / window_size

    local previous_weight = 1 - position

    local weighted_count = current_count + previous_count * previous_weight

    if weighted_count >= max_requests then
      local excess = weighted_count - max_requests
      local time_to_available = previous_count > 0 and math.ceil(excess / (previous_count / window_size)) or window_size
      local reset_time = current_time + time_to_available

      return {1, 0, reset_time}
    end

    redis.call('incr', current_key)
    redis.call('expire', current_key, window_size * 2)

    local remaining = math.floor(max_requests - weighted_count - 1)
    local reset_time = window_start + window_size

    return {0, remaining, reset_time}
  `

  try {
    let result
    if (typeof redis.eval === "function") {
      result = await redis.eval(slidingWindowScript, {
        keys: [currentWindowKey, previousWindowKey],
        arguments: [maxRequests, windowDurationSeconds, currentTime, precision],
      })
    } else {
      throw new Error("Redis client does not support eval")
    }

    if (!result || result.length !== 3) {
      return null
    }

    const [limited, remaining, reset] = result

    return {
      limited: limited === 1,
      remaining: Number(remaining),
      reset: Number(reset),
    }
  } catch (error) {
    logger.error(`Redis error during sliding window rate limiting for key ${key}: ${error}`)
    return null
  }
}

/**
 * Implements sliding window logs rate limiting algorithm
 * Most accurate but higher Redis memory usage
 */
async function slidingWindowLogsRateLimit(
  redis: any,
  key: string,
  options: { maxRequests: number; windowDurationSeconds: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
  const { maxRequests, windowDurationSeconds } = options
  const currentTime = Math.floor(Date.now() / 1000)
  const windowStart = currentTime - windowDurationSeconds

  // Optimized Lua script for sliding window logs algorithm
  const slidingWindowLogsScript = `
    local key = KEYS[1]
    local max_requests = tonumber(ARGV[1])
    local window_start = tonumber(ARGV[2])
    local current_time = tonumber(ARGV[3])
    local window_size = tonumber(ARGV[4])

    redis.call('zremrangebyscore', key, 0, window_start)

    local count = redis.call('zcard', key)

    if count >= max_requests then
      local oldest = redis.call('zrange', key, 0, 0, 'WITHSCORES')

      if #oldest >= 2 then
        local oldest_time = tonumber(oldest[2])
        local reset_time = oldest_time + window_size
        return {1, 0, reset_time}
      else
        return {1, 0, current_time + window_size}
      end
    end

    redis.call('zadd', key, current_time, current_time .. ':' .. math.random())
    redis.call('expire', key, window_size * 2)

    local remaining = max_requests - count - 1
    local reset_time = current_time + window_size

    return {0, remaining, reset_time}
  `

  try {
    let result
    if (typeof redis.eval === "function") {
      result = await redis.eval(slidingWindowLogsScript, {
        keys: [`${key}:logs`],
        arguments: [maxRequests, windowStart, currentTime, windowDurationSeconds],
      })
    } else {
      throw new Error("Redis client does not support eval")
    }

    if (!result || result.length !== 3) {
      return null
    }

    const [limited, remaining, reset] = result

    return {
      limited: limited === 1,
      remaining: Number(remaining),
      reset: Number(reset),
    }
  } catch (error) {
    logger.error(`Redis error during sliding window logs rate limiting for key ${key}: ${error}`)
    return null
  }
}

/**
 * Batch rate limiter for checking multiple limits at once
 * More efficient than calling rateLimit multiple times
 */
export async function batchRateLimit(
  request: NextRequest,
  limitConfigs: Array<{ name: string; options: RateLimitOptions }>,
): Promise<{ limited: boolean; name?: string; response?: NextResponse }> {
  for (const config of limitConfigs) {
    const result = await rateLimit(request, config.options)
    if (result instanceof NextResponse) {
      return { limited: true, name: config.name, response: result }
    }
  }
  return { limited: false }
}

/**
 * Circuit breaker for rate limiting
 * Automatically adjusts rate limits based on server health
 */
export async function adaptiveRateLimit(
  request: NextRequest,
  options: RateLimitOptions & {
    healthCheck?: () => Promise<number>
    minLimit?: number
  },
): Promise<NextResponse | null> {
  try {
    if (options.healthCheck) {
      const loadFactor = await options.healthCheck()
      const minLimit = options.minLimit ?? Math.floor(options.limit / 4)
      const adjustedLimit = Math.max(minLimit, Math.floor(options.limit * (1 - loadFactor)))
      return rateLimit(request, { ...options, limit: adjustedLimit })
    }
    return rateLimit(request, options)
  } catch (error) {
    logger.error(`Error in adaptive rate limit: ${error}`)
    return null
  }
}
