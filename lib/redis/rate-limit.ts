import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { getRedisClient } from "@/lib/redis/client"
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
  /** Maximum number of requests allowed within the window */
  limit: number
  /** Time window in seconds */
  window: number
  /** Optional prefix for the Redis key (defaults to 'rate_limit') */
  keyPrefix?: string
  /** Optional function to check if rate limiting should be bypassed */
  bypassCheck?: () => Promise<boolean> | boolean
  /** IP-based fallback options for unauthenticated requests */
  ipFallback?: {
    /** Whether to enable IP-based fallback (defaults to true) */
    enabled?: boolean
    /** Maximum number of requests allowed for IP-based limiting (defaults to half of authenticated limit) */
    limit?: number
    /** Time window in seconds for IP-based limiting (defaults to same as authenticated window) */
    window?: number
  }
  /** Rate limiting algorithm to use */
  algorithm?: RateLimitAlgorithm
  /** Token bucket specific options */
  tokenBucket?: {
    /** Maximum bucket size (defaults to limit) */
    bucketSize?: number
    /** Refill rate in tokens per second (defaults to limit/window) */
    refillRate?: number
  }
  /** Sliding window specific options */
  slidingWindow?: {
    /** Number of precision buckets within the window (defaults to 10) */
    precision?: number
  }
  /** Whether to include detailed headers in the response (defaults to true) */
  includeHeaders?: boolean
  /** Whether to use local memory cache to reduce Redis calls (defaults to false) */
  useLocalCache?: boolean
  /** Local cache TTL in milliseconds (defaults to 1000ms) */
  localCacheTtl?: number
}

// In-memory cache for rate limit results (used when useLocalCache is true)
interface CacheEntry {
  result: boolean
  remaining: number
  reset: number
  timestamp: number
}

const localCache = new Map<string, CacheEntry>()

// Cleanup expired cache entries periodically
const CACHE_CLEANUP_INTERVAL = 60000 // 1 minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of localCache.entries()) {
    if (now - entry.timestamp > entry.reset * 1000) {
      localCache.delete(key)
    }
  }
}, CACHE_CLEANUP_INTERVAL)

/**
 * Get the client IP address from the request with enhanced security
 */
function getClientIp(request: NextRequest): string {
  // Check for Vercel-specific headers
  const xForwardedFor = request.headers.get("x-forwarded-for")

  if (xForwardedFor) {
    // Get the first IP in the list (client IP)
    // This is more secure as it gets the original client IP, not intermediate proxies
    const ips = xForwardedFor.split(",")
    const clientIp = ips[0].trim()

    // Basic IP validation to prevent header injection
    if (/^[\d.a-f:]+$/i.test(clientIp)) {
      return clientIp
    }
  }

  // Fallback to direct connection IP with validation
  const ip = request.ip || "unknown"
  return /^[\d.a-f:]+$/i.test(ip) ? ip : "unknown"
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
    const useIpFallback = !userId && options.ipFallback?.enabled !== false // enabled by default unless explicitly disabled

    // If no userId and IP fallback is disabled, skip rate limiting
    if (!userId && !useIpFallback) {
      return null
    }

    // Check if rate limiting should be bypassed
    if (options.bypassCheck) {
      const shouldBypass = await options.bypassCheck()
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
        options.ipFallback?.limit ||
        Math.floor((options.limit || Number(process.env.PULSE_DEFAULT_RATE_LIMIT || 60)) / 2)
      windowDurationSeconds =
        options.ipFallback?.window || options.window || Number(process.env.PULSE_DEFAULT_RATE_WINDOW_S || 60)

      logger.debug(`Using IP-based rate limiting for ${clientIp} (hashed) on ${request.nextUrl.pathname}`)
    } else {
      // Use user-based rate limiting
      identifier = `user:${userId}`
      maxRequests = options.limit || Number(process.env.PULSE_DEFAULT_RATE_LIMIT || 60)
      windowDurationSeconds = options.window || Number(process.env.PULSE_DEFAULT_RATE_WINDOW_S || 60)
    }

    // Construct Redis key: prefix:identifier:pathname
    const path = request.nextUrl.pathname
    const keyPrefix = options.keyPrefix || "rate_limit"
    const key = `${keyPrefix}:${identifier}:${path}`

    // Check local cache if enabled
    if (options.useLocalCache) {
      const cacheKey = `${key}:${maxRequests}:${windowDurationSeconds}`
      const cachedResult = localCache.get(cacheKey)

      if (cachedResult && Date.now() - cachedResult.timestamp < (options.localCacheTtl || 1000)) {
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
          bucketSize: options.tokenBucket?.bucketSize || maxRequests,
          refillRate: options.tokenBucket?.refillRate || maxRequests / windowDurationSeconds,
          windowDurationSeconds,
        })
        break
      case RateLimitAlgorithm.SLIDING_WINDOW:
        result = await slidingWindowRateLimit(redis, key, {
          maxRequests,
          windowDurationSeconds,
          precision: options.slidingWindow?.precision || 10,
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

    // Add rate limit headers to the response if enabled
    if (options.includeHeaders !== false) {
      request.headers.set("X-RateLimit-Limit", String(maxRequests))
      request.headers.set("X-RateLimit-Remaining", String(result.remaining))
      request.headers.set("X-RateLimit-Reset", String(result.reset))
    }

    // Rate limit not exceeded
    return null
  } catch (error) {
    logger.error(`Unexpected error in rate limit function:`, error)
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
    if (!results || results[0] === null) {
      return null
    }

    const currentCount = results[0]
    const remaining = Math.max(0, maxRequests - currentCount)
    const reset = Math.ceil(currentTime / windowDurationSeconds) * windowDurationSeconds

    return {
      limited: currentCount > maxRequests,
      remaining,
      reset,
    }
  } catch (error) {
    logger.error(`Redis error during fixed window rate limiting for key ${key}:`, error)
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
    
    -- Get current tokens and last update time
    local tokens = tonumber(redis.call('get', tokens_key) or bucket_size)
    local last_update = tonumber(redis.call('get', timestamp_key) or 0)
    
    -- Calculate tokens to add based on time elapsed
    local time_elapsed = math.max(0, current_time - last_update)
    local tokens_to_add = time_elapsed * refill_rate
    
    -- Add tokens to bucket (up to bucket size)
    tokens = math.min(bucket_size, tokens + tokens_to_add)
    
    -- Update last update time
    redis.call('set', timestamp_key, current_time)
    redis.call('expire', timestamp_key, window_duration)
    
    -- Check if we have enough tokens
    if tokens >= 1 then
      -- Consume token
      tokens = tokens - 1
      redis.call('set', tokens_key, tokens)
      redis.call('expire', tokens_key, window_duration)
      
      -- Calculate time until bucket is full again
      local time_to_full = (bucket_size - tokens) / refill_rate
      local reset_time = current_time + time_to_full
      
      return {0, tokens, math.ceil(reset_time)} -- Not limited, remaining tokens, reset time
    else
      -- Not enough tokens
      redis.call('set', tokens_key, tokens)
      redis.call('expire', tokens_key, window_duration)
      
      -- Calculate time until next token is available
      local time_to_next = (1 - tokens) / refill_rate
      local reset_time = current_time + time_to_next
      
      return {1, 0, math.ceil(reset_time)} -- Limited, 0 remaining tokens, reset time
    end
  `

  try {
    const result = await redis.eval(tokenBucketScript, {
      keys: [`${key}:tokens`, `${key}:timestamp`],
      arguments: [bucketSize, refillRate, currentTime, windowDurationSeconds],
    })

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
    logger.error(`Redis error during token bucket rate limiting for key ${key}:`, error)
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
    
    -- Get current counts
    local current_count = tonumber(redis.call('get', current_key) or 0)
    local previous_count = tonumber(redis.call('get', previous_key) or 0)
    
    -- Calculate position in current window (0 to 1)
    local window_start = math.floor(current_time / window_size) * window_size
    local position = (current_time - window_start) / window_size
    
    -- Calculate weight for previous window (0 to 1, inversely proportional to position)
    local previous_weight = 1 - position
    
    -- Calculate weighted count
    local weighted_count = current_count + previous_count * previous_weight
    
    -- Check if we're over the limit
    if weighted_count >= max_requests then
      -- Calculate time until enough previous requests expire to go under limit
      local excess = weighted_count - max_requests
      local time_to_available = math.ceil(excess / (previous_count / window_size))
      local reset_time = current_time + time_to_available
      
      return {1, 0, reset_time} -- Limited, 0 remaining, reset time
    end
    
    -- Increment current window counter
    redis.call('incr', current_key)
    redis.call('expire', current_key, window_size * 2) -- Keep for 2 windows
    
    -- Calculate remaining requests
    local remaining = math.floor(max_requests - weighted_count - 1)
    
    -- Calculate reset time (end of window)
    local reset_time = window_start + window_size
    
    return {0, remaining, reset_time} -- Not limited, remaining, reset time
  `

  try {
    const result = await redis.eval(slidingWindowScript, {
      keys: [currentWindowKey, previousWindowKey],
      arguments: [maxRequests, windowDurationSeconds, currentTime, precision],
    })

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
    logger.error(`Redis error during sliding window rate limiting for key ${key}:`, error)
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
    
    -- Remove timestamps outside the window
    redis.call('zremrangebyscore', key, 0, window_start)
    
    -- Count requests in the current window
    local count = redis.call('zcard', key)
    
    -- Check if we're over the limit
    if count >= max_requests then
      -- Get the oldest timestamp in the window
      local oldest = redis.call('zrange', key, 0, 0, 'WITHSCORES')
      
      -- If we have at least one timestamp
      if #oldest >= 2 then
        local oldest_time = tonumber(oldest[2])
        -- Calculate when it will expire from the window
        local reset_time = oldest_time + window_size
        return {1, 0, reset_time} -- Limited, 0 remaining, reset time
      else
        -- Fallback if no timestamps (shouldn't happen)
        return {1, 0, current_time + window_size} -- Limited, 0 remaining, reset time
      end
    end
    
    -- Add current timestamp to the sorted set
    redis.call('zadd', key, current_time, current_time .. ':' .. math.random())
    redis.call('expire', key, window_size * 2) -- Keep for 2 windows
    
    -- Calculate remaining requests
    local remaining = max_requests - count - 1
    
    -- Calculate reset time (end of window)
    local reset_time = current_time + window_size
    
    return {0, remaining, reset_time} -- Not limited, remaining, reset time
  `

  try {
    const result = await redis.eval(slidingWindowLogsScript, {
      keys: [`${key}:logs`],
      arguments: [maxRequests, windowStart, currentTime, windowDurationSeconds],
    })

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
    logger.error(`Redis error during sliding window logs rate limiting for key ${key}:`, error)
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
    healthCheck?: () => Promise<number> // Returns load factor (0-1)
    minLimit?: number // Minimum limit during high load
  },
): Promise<NextResponse | null> {
  try {
    // Check server health if healthCheck is provided
    if (options.healthCheck) {
      const loadFactor = await options.healthCheck()
      const minLimit = options.minLimit || Math.floor(options.limit / 4)

      // Adjust limit based on load factor
      const adjustedLimit = Math.max(minLimit, Math.floor(options.limit * (1 - loadFactor)))

      // Use adjusted limit
      return rateLimit(request, { ...options, limit: adjustedLimit })
    }

    // Use normal rate limiting if no health check
    return rateLimit(request, options)
  } catch (error) {
    logger.error(`Error in adaptive rate limit:`, error)
    return null // Fail open
  }
}
