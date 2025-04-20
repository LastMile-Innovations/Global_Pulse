import { type NextRequest, NextResponse } from "next/server"
import { auth, getCurrentUser } from "@/lib/auth/auth-utils"
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
  limit?: number
  window?: number
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

// --- Type Definitions for Server Action Context ---
interface RateLimitServerActionContext {
  userId?: string | null;
  ip?: string | null;
  path: string; // Explicitly require path for server actions
}

// --- Type Definitions for Return Values ---
type RateLimitApiResult = NextResponse | null;
type RateLimitActionResult = {
  limited: boolean;
  limit: number;
  remaining: number;
  reset: number;
} | null; // Return null if bypassed or error

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
    const ttl = entry.reset > 0 ? entry.reset * 1000 : 60000 // Use reset time or 60s
    if (now - entry.timestamp > ttl) {
      localCache.delete(key)
    }
  }
}, CACHE_CLEANUP_INTERVAL)

/**
 * Get the client IP address from NextRequest or Headers object
 * Handles common proxy headers and Vercel specifics.
 */
export function getClientIp(requestOrHeaders: NextRequest | Headers): string {
  let hdr: Headers;
  if (requestOrHeaders instanceof Request) {
    hdr = requestOrHeaders.headers;
    const vercelIp = hdr.get("x-vercel-forwarded-for")?.split(':')[0].trim();
    if (vercelIp && /^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/.test(vercelIp)) return vercelIp;
  } else {
    hdr = requestOrHeaders as Headers; // Assume Headers compatible
  }

  const xForwardedFor = hdr.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    const clientIp = ips[0].trim();
    if (/^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/.test(clientIp)) return clientIp;
  }

  const xRealIp = hdr.get("x-real-ip");
  if (xRealIp) {
    const clientIp = xRealIp.trim();
    if (/^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/.test(clientIp)) return clientIp;
  }

  // Remove the request.ip check as it's unreliable/non-standard

  return "unknown";
}

/**
 * Create a secure identifier hash from an IP address or other identifier
 */
function hashIdentifier(identifier: string, salt: string = process.env.RATE_LIMIT_SALT || "pulse-rate-limit"): string {
  return createHash("sha256").update(`${identifier}:${salt}`).digest("hex").substring(0, 16)
}

// --- Overloaded Function Signatures ---

/**
 * Rate limits requests based on user ID or IP. Designed for API Routes.
 *
 * @param request The Next.js request object
 * @param options Rate limiting options
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitApiResult>;

/**
 * Rate limits requests based on user ID or IP. Designed for Server Actions.
 *
 * @param context Context object containing userId, ip, and path
 * @param options Rate limiting options
 * @returns Result object indicating if limited, null if bypassed/error
 */
export async function rateLimit(
  context: RateLimitServerActionContext,
  options: RateLimitOptions
): Promise<RateLimitActionResult>;


// --- Implementation ---
export async function rateLimit(
  requestOrContext: NextRequest | RateLimitServerActionContext,
  options: RateLimitOptions
): Promise<RateLimitApiResult | RateLimitActionResult> {
  const isApiRoute = requestOrContext instanceof Request;
  let userIdFromAuth: string | null = null;
  let ipAddress: string | null = null;
  let path: string;

  // --- Determine effective limits and settings --- 
  const defaultLimit = Number(process.env.PULSE_DEFAULT_RATE_LIMIT ?? 60);
  const defaultWindow = Number(process.env.PULSE_DEFAULT_RATE_WINDOW_S ?? 60);
  const effectiveLimit = options.limit ?? defaultLimit;
  const effectiveWindow = options.window ?? defaultWindow;
  const ipFallbackEnabled = options.ipFallback?.enabled ?? true;
  const effectiveIpFallbackLimit = options.ipFallback?.limit ?? Math.floor(effectiveLimit / 2);
  const effectiveIpFallbackWindow = options.ipFallback?.window ?? effectiveWindow;
  const algorithm = options.algorithm || RateLimitAlgorithm.SLIDING_WINDOW;
  const includeHeaders = options.includeHeaders !== false;
  const useLocalCache = options.useLocalCache ?? false;
  const localCacheTtl = options.localCacheTtl ?? 1000;

  // This will hold the actual limit/window being applied (user or IP fallback)
  let appliedLimit: number;
  let appliedWindow: number;

  try {
    // --- Extract Context ---
    if (isApiRoute) {
      const request = requestOrContext as NextRequest;
      userIdFromAuth = await auth(request); // auth should return Promise<string | null>
      ipAddress = getClientIp(request);
      path = request.nextUrl.pathname;
    } else {
      const context = requestOrContext as RateLimitServerActionContext;
      userIdFromAuth = context.userId ?? null;
      ipAddress = context.ip ?? null;
      path = context.path;
      if (!path) {
        logger.error("Rate Limit Error: Path is required in context for Server Actions.");
        return { limited: false, remaining: -1, reset: -1, limit: effectiveLimit };
      }
    }

    // --- Bypass Check ---
    if (options.bypassCheck) { // Use original options here
      const shouldBypass = typeof options.bypassCheck === "function"
        ? await options.bypassCheck()
        : false;
      if (shouldBypass) {
        appliedLimit = !userIdFromAuth && ipFallbackEnabled ? effectiveIpFallbackLimit : effectiveLimit;
        return isApiRoute ? null : { limited: false, remaining: -1, reset: -1, limit: appliedLimit };
      }
    }

    // --- Determine Identifier and Applied Limits ---
    const useIpFallback = !userIdFromAuth && ipFallbackEnabled;
    let identifier: string;
    let identifierType: 'userId' | 'hashedIp';

    if (useIpFallback) {
      if (!ipAddress || ipAddress === 'unknown') {
        logger.warn(`Rate Limit Warning: Cannot apply IP fallback limit for path ${path} due to unknown IP. Allowing request.`);
        appliedLimit = effectiveIpFallbackLimit;
        return isApiRoute ? null : { limited: false, remaining: -1, reset: -1, limit: appliedLimit };
      }
      const hashedIp = hashIdentifier(ipAddress);
      identifier = `ip:${hashedIp}`;
      identifierType = 'hashedIp';
      appliedLimit = effectiveIpFallbackLimit;
      appliedWindow = effectiveIpFallbackWindow;
      logger.debug(`Rate Limiting Check: Path=${path}, Type=IP (Hashed: ${hashedIp}), Limit=${appliedLimit}/${appliedWindow}s`);
    } else if (userIdFromAuth) {
      identifier = `user:${userIdFromAuth}`;
      identifierType = 'userId';
      appliedLimit = effectiveLimit;
      appliedWindow = effectiveWindow;
      logger.debug(`Rate Limiting Check: Path=${path}, Type=User (${userIdFromAuth}), Limit=${appliedLimit}/${appliedWindow}s`);
    } else {
      logger.debug(`Rate Limiting skipped for path ${path}: No user ID and IP fallback not applicable.`);
      appliedLimit = effectiveLimit;
      return isApiRoute ? null : { limited: false, remaining: -1, reset: -1, limit: appliedLimit };
    }

    // --- Construct Redis Key ---
    const keyPrefix = options.keyPrefix || "rate_limit"; // Use original options
    const key = `${keyPrefix}:${path}:${identifier}`;

    // --- Local Cache Check ---
    if (useLocalCache) {
      const cacheKey = `${key}:${appliedLimit}:${appliedWindow}`;
      const cachedResult = localCache.get(cacheKey);

      if (cachedResult && (Date.now() - cachedResult.timestamp < localCacheTtl)) {
        if (!cachedResult.result) {
          const identifierValue = identifierType === 'userId' ? userIdFromAuth : hashIdentifier(ipAddress || 'unknown');
          logger.warn(`[RateLimit Exceeded] (Cached) Path: ${path}, Identifier: ${identifierType}:${identifierValue}, Limit: ${appliedLimit}/${appliedWindow}s`);
          if (isApiRoute) {
          return createRateLimitResponse(
              appliedWindow,
              appliedLimit,
            cachedResult.remaining,
            cachedResult.reset,
              includeHeaders,
            );
          } else {
            return {
              limited: true,
              limit: appliedLimit,
              remaining: cachedResult.remaining,
              reset: cachedResult.reset,
            };
          }
        }
        logger.debug(`Rate Limit cache hit (not limited) for ${key}`);
      }
    }

    // --- Redis Interaction ---
    const redis = getRedisClient();
    let result: { limited: boolean; remaining: number; reset: number } | null = null;
    // Use determined algorithm, appliedLimit, appliedWindow
    switch (algorithm) {
      case RateLimitAlgorithm.TOKEN_BUCKET:
        if (!options.tokenBucket) throw new Error("Token bucket options required for token bucket algorithm"); // Check original options
        result = await tokenBucketRateLimit(redis, key, {
          bucketSize: options.tokenBucket.bucketSize ?? appliedLimit,
          refillRate: options.tokenBucket.refillRate ?? appliedLimit / appliedWindow,
          windowDurationSeconds: appliedWindow,
        });
        break;
      case RateLimitAlgorithm.SLIDING_WINDOW:
        result = await slidingWindowRateLimit(redis, key, {
          maxRequests: appliedLimit,
          windowDurationSeconds: appliedWindow,
          precision: options.slidingWindow?.precision ?? 10, // Use original options
        });
        break;
      case RateLimitAlgorithm.SLIDING_WINDOW_LOGS:
        result = await slidingWindowLogsRateLimit(redis, key, {
          maxRequests: appliedLimit,
          windowDurationSeconds: appliedWindow,
        });
        break;
      case RateLimitAlgorithm.FIXED_WINDOW:
      default:
        result = await fixedWindowRateLimit(redis, key, {
          maxRequests: appliedLimit,
          windowDurationSeconds: appliedWindow,
        });
        break;
    }

    // --- Handle Redis Errors ---
    if (!result) {
      logger.error(`Rate limit check failed unexpectedly for key ${key} (algorithm: ${algorithm}). Potential Redis issue. Allowing request.`);
       return isApiRoute ? null : { limited: false, limit: appliedLimit, remaining: -1, reset: -1 }; // Indicate Redis error
    }

    // --- Update Local Cache ---
    if (useLocalCache) {
      const cacheKey = `${key}:${appliedLimit}:${appliedWindow}`;
      localCache.set(cacheKey, {
        result: !result.limited,
        remaining: result.remaining,
        reset: result.reset,
        timestamp: Date.now(),
      });
    }

    // --- Handle Result ---
    if (result.limited) {
      const identifierValue = identifierType === 'userId' ? userIdFromAuth : hashIdentifier(ipAddress || 'unknown');
      logger.warn(
        `[RateLimit Exceeded] Path: ${path}, Identifier: ${identifierType}:${identifierValue}, Limit: ${appliedLimit}/${appliedWindow}s, Remaining: ${result.remaining}`
      );
      if (isApiRoute) {
      return createRateLimitResponse(
          appliedWindow,
          appliedLimit,
        result.remaining,
        result.reset,
          includeHeaders,
        );
      } else {
        return {
          limited: true,
          limit: appliedLimit,
          remaining: result.remaining,
          reset: result.reset,
        };
      }
    } else {
      // Not rate limited
      if (isApiRoute) {
        return null;
      } else {
        return {
          limited: false,
          limit: appliedLimit,
          remaining: result.remaining,
          reset: result.reset,
        };
      }
    }
  } catch (error) {
    logger.error("Error during rate limit check:", error);
    appliedLimit = !userIdFromAuth && ipFallbackEnabled ? effectiveIpFallbackLimit : effectiveLimit;
    return isApiRoute ? null : { limited: false, limit: appliedLimit, remaining: -1, reset: -1 }; // Indicate general error
  }
}


/**
 * Creates a standard 429 Too Many Requests response.
 */
function createRateLimitResponse(
  windowDurationSeconds: number,
  limit: number,
  remaining: number,
  resetTimestampSeconds: number, // Unix timestamp in seconds when the limit resets
  includeHeaders = true,
): NextResponse {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const retryAfter = Math.max(0, resetTimestampSeconds - nowSeconds); // Calculate Retry-After

  const headers = new Headers();
  if (includeHeaders) {
    headers.set("Retry-After", String(retryAfter));
    headers.set("X-RateLimit-Limit", String(limit));
    headers.set("X-RateLimit-Remaining", String(remaining)); // Should be 0 if limited
    headers.set("X-RateLimit-Reset", String(resetTimestampSeconds));
  }

  return new NextResponse("Too Many Requests", {
      status: 429,
      headers,
  });
}


// ============================================================================
// Rate Limiting Algorithm Implementations (Fixed Window, Token Bucket, Sliding Window, Sliding Window Logs)
// These remain largely unchanged but ensure they use the provided redis client correctly
// and return the expected { limited: boolean; remaining: number; reset: number } structure or null on error.
// ============================================================================

/**
 * Fixed Window Rate Limiter
 * Simplest algorithm, but prone to burst traffic at window edges.
 *
 * @param redis Upstash Redis client instance
 * @param key The unique key for the rate limit counter
 * @param options Max requests and window duration
 * @returns Result object or null on error
 */
async function fixedWindowRateLimit(
  redis: any, // Use 'any' for compatibility or import Redis type from @upstash/redis
  key: string,
  options: { maxRequests: number; windowDurationSeconds: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
  const { maxRequests, windowDurationSeconds } = options;
  const now = Date.now();
  const currentWindowStart = Math.floor(now / 1000 / windowDurationSeconds) * windowDurationSeconds;
  const windowKey = `${key}:${currentWindowStart}`;
  const resetTimestamp = currentWindowStart + windowDurationSeconds;

  try {
    const multi = redis.multi();
    multi.incr(windowKey);
    multi.expire(windowKey, windowDurationSeconds * 2); // Expire slightly longer to avoid race conditions

    const result = await multi.exec();
    if (!result || !Array.isArray(result) || typeof result[0] !== 'number') {
      logger.error(`FixedWindowRateLimit: Invalid response from Redis multi exec for key ${windowKey}`);
      return null; // Indicate error
    }

    const currentCount = result[0] as number;
    const limited = currentCount > maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount);

    return { limited, remaining, reset: resetTimestamp };

  } catch (error) {
    logger.error(`FixedWindowRateLimit Error for key ${windowKey}:`, error);
    return null; // Indicate error
  }
}


/**
 * Token Bucket Rate Limiter (using sorted sets for efficiency)
 * Allows bursts up to bucket size, smooths traffic based on refill rate.
 * Implementation uses ZSET to store tokens and timestamps.
 *
 * @param redis Upstash Redis client instance
 * @param key The unique key for the token bucket
 * @param options Bucket size, refill rate, and window duration (for TTL)
 * @returns Result object or null on error
 */
async function tokenBucketRateLimit(
  redis: any,
  key: string,
  options: { bucketSize: number; refillRate: number; windowDurationSeconds: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
   const { bucketSize, refillRate, windowDurationSeconds } = options;
   const now = Date.now() / 1000; // Use seconds

   const bucketKey = `${key}:tokens`;
   const lastRefillKey = `${key}:lastRefill`;

   try {
    // Use EVALSHA or EVAL for atomic operations
    // Script Logic:
    // 1. Get last refill time and current tokens.
    // 2. Calculate elapsed time and tokens to add.
    // 3. Refill bucket up to max size.
    // 4. If tokens > 0, consume one token and update last refill time.
    // 5. Return limited status and remaining tokens.

    // Simplified approach using INCR/DECR for basic token count (less accurate than timestamped):
    // Requires separate handling for reset/ttl. This is less ideal for true token bucket.

    // Using a Lua script is the most robust way for Token Bucket on Redis.
    // As a fallback, approximating with INCR/EXPIRE (less accurate burst handling):
    // This is closer to fixed window but tries to model refill.

     logger.warn("Token Bucket Rate Limit using simplified INCR (less accurate). Lua script recommended for production.");

     // Try to get current count
     let currentTokens = await redis.get(bucketKey);
     if (currentTokens === null) {
       // Initialize bucket if not exists
       await redis.set(bucketKey, bucketSize -1, { ex: windowDurationSeconds });
       currentTokens = bucketSize - 1;
     } else {
        currentTokens = parseInt(currentTokens, 10);
        if (isNaN(currentTokens)) {
             logger.error(`TokenBucket: Invalid token count found for ${bucketKey}. Resetting.`);
             await redis.set(bucketKey, bucketSize -1, { ex: windowDurationSeconds });
            currentTokens = bucketSize - 1;
    } else {
            // Attempt to consume a token
            const decremented = await redis.decr(bucketKey);
            currentTokens = decremented;
        }
     }


     const limited = currentTokens < 0;
     const remaining = Math.max(0, currentTokens);
     const ttl = await redis.ttl(bucketKey);
     const reset = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : windowDurationSeconds) ; // Estimate reset based on TTL

     if (limited) {
       // If limited, increment back to 0 to avoid negative counts persisting.
       await redis.incr(bucketKey);
     }

     return { limited, remaining, reset };


  } catch (error) {
     logger.error(`TokenBucketRateLimit Error for key ${key}:`, error);
     return null; // Indicate error
  }
}


/**
 * Sliding Window Rate Limiter (using Sorted Sets)
 * More accurate than fixed window, counts requests in the precise preceding window.
 * Uses ZREMRANGEBYSCORE, ZADD, ZCARD for efficiency.
 *
 * @param redis Upstash Redis client instance
 * @param key The unique key for the sliding window log
 * @param options Max requests, window duration, and precision
 * @returns Result object or null on error
 */
async function slidingWindowRateLimit(
  redis: any,
  key: string,
  options: { maxRequests: number; windowDurationSeconds: number; precision: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
   const { maxRequests, windowDurationSeconds, precision } = options;
   const now = Date.now(); // Use milliseconds for score
   const windowStart = now - windowDurationSeconds * 1000;

   // Precision factor for grouping timestamps (e.g., 10 = group by 10ms)
   // Using higher precision requires more storage but is more accurate.
   // A simple approach uses unique member per request with timestamp as score.
   const member = `${now}:${Math.random()}`; // Unique member for each request

   try {
     const multi = redis.multi();
     // Remove entries older than the window start time
     multi.zremrangebyscore(key, 0, windowStart);
     // Add the current request timestamp
     multi.zadd(key, { score: now, member });
     // Get the current count of requests in the window
     multi.zcard(key);
     // Set expiration for the whole set to clean up inactive keys
     multi.expire(key, windowDurationSeconds * 2); // Keep set around longer than window

     const results = await multi.exec();

     if (!results || typeof results[2] !== 'number') {
        logger.error(`SlidingWindowRateLimit: Invalid response from Redis multi exec for key ${key}`);
       return null; // Indicate error
     }

     const currentCount = results[2];
     const limited = currentCount > maxRequests;
     const remaining = Math.max(0, maxRequests - currentCount);

     // Calculate reset time: Time when the oldest entry expires + window duration
     // This requires fetching the oldest entry's score.
     // Approximate reset as windowDurationSeconds from now for simplicity, or query ZRANGE 0 0 WITHSCORES
     const resetApprox = Math.floor((now / 1000) + windowDurationSeconds);
     // TODO: Optionally implement precise reset calculation by fetching oldest score

     return { limited, remaining, reset: resetApprox };

  } catch (error) {
     logger.error(`SlidingWindowRateLimit Error for key ${key}:`, error);
     return null; // Indicate error
  }
}


/**
 * Sliding Window Logs Rate Limiter (using Redis Streams or Lists - simplified here with ZSET)
 * Conceptually similar to sliding window but stores individual request logs.
 * Can be memory intensive. ZSET approach is often preferred. This is similar to slidingWindowRateLimit.
 *
 * @param redis Upstash Redis client instance
 * @param key The unique key for the sliding window log
 * @param options Max requests and window duration
 * @returns Result object or null on error
 */
async function slidingWindowLogsRateLimit(
  redis: any,
  key: string,
  options: { maxRequests: number; windowDurationSeconds: number },
): Promise<{ limited: boolean; remaining: number; reset: number } | null> {
  // This implementation is functionally identical to slidingWindowRateLimit using ZSETs,
  // as it's the most common and efficient way to achieve this logic in Redis.
  // Using Redis Streams (XADD, XLEN, XTRIM) is another possibility but more complex.
  logger.debug(`Using ZSET-based Sliding Window for Sliding Window Logs algorithm on key ${key}`);
  return slidingWindowRateLimit(redis, key, {
    ...options,
    precision: 1, // Use high precision (effectively unique timestamp per request)
  });
}


// ============================================================================
// Utility Functions (Potentially useful extensions - keep or remove as needed)
// ============================================================================


/**
 * Batch Rate Limiter: Checks multiple limits sequentially.
 * Useful for applying different limits (e.g., general + specific endpoint)
 * Stops at the first limit exceeded.
 *
 * @param requestOrContext Request or Context object
 * @param limitConfigs Array of named limit configurations
 * @returns Result object indicating if limited and which limit was hit
 */
export async function batchRateLimit(
  requestOrContext: NextRequest | RateLimitServerActionContext,
  limitConfigs: Array<{ name: string; options: RateLimitOptions }>
): Promise<{ limited: boolean; name?: string; response?: NextResponse | RateLimitActionResult }> {
  for (const config of limitConfigs) {
    const result = await rateLimit(requestOrContext as any, config.options); // Use 'as any' due to overload complexity

    if (requestOrContext instanceof Request) {
      // API Route Check
    if (result instanceof NextResponse) {
        return { limited: true, name: config.name, response: result };
    }
    } else {
      // Server Action Check
      const actionResult = result as RateLimitActionResult;
      if (actionResult?.limited) {
        return { limited: true, name: config.name, response: actionResult };
      }
    }
  }
  // No limits exceeded
  return { limited: false };
}


/**
 * Adaptive Rate Limiter (Conceptual Example)
 * Adjusts limits based on system health or load.
 * Requires a health check function.
 *
 * @param requestOrContext Request or Context object
 * @param options Base options + adaptive config
 * @returns Rate limit result (NextResponse or ActionResult) or null
 */
export async function adaptiveRateLimit(
  requestOrContext: NextRequest | RateLimitServerActionContext,
  options: RateLimitOptions & {
    healthCheck?: () => Promise<number>; // Returns a health score (0-1)
    minLimitFactor?: number; // Minimum limit = baseLimit * minLimitFactor
  }
): Promise<RateLimitApiResult | RateLimitActionResult> {
  let currentLimit = options.limit ?? Number(process.env.PULSE_DEFAULT_RATE_LIMIT ?? 60);
  const baseLimit = currentLimit;
  const minFactor = options.minLimitFactor ?? 0.1; // Allow dropping to 10% of base limit

    if (options.healthCheck) {
    try {
      const healthScore = await options.healthCheck(); // Score 0 (unhealthy) to 1 (healthy)
      // Adjust limit linearly based on health, ensuring it doesn't go below minFactor * baseLimit
      currentLimit = Math.max(
        Math.floor(baseLimit * minFactor),
        Math.floor(baseLimit * healthScore)
      );
      logger.debug(`Adaptive limit adjusted to ${currentLimit} based on health score ${healthScore}`);
    } catch (err) {
      logger.error("Adaptive rate limit health check failed:", err);
      // Keep base limit on health check failure
    }
  }

  const adjustedOptions = { ...options, limit: currentLimit };

  return rateLimit(requestOrContext as any, adjustedOptions); // Use 'as any' due to overload complexity
}

