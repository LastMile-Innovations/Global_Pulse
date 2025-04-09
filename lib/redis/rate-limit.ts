// Dynamically import dependencies only when needed
import { type NextRequest, NextResponse } from "next/server"

export interface RateLimitConfig {
  limit: number
  window: number // in seconds
  identifierFn?: (request: NextRequest) => string // Custom identifier function
  useEphemeral?: boolean // Whether to use ephemeral caching
}

/**
 * High-performance rate limiting middleware for Next.js Edge Runtime
 * 
 * Features:
 * - Uses ephemeral cache to minimize Redis calls for repeated requests
 * - Efficient identifier extraction with customization options
 * - Built-in error handling with graceful fallback
 * - Optimized header handling
 */
// Cache rate limiters to avoid recreating them for each request
// This will be initialized when the module is first loaded
// Define proper types for the rate limiter components
interface RatelimitClass {
  new(options: {
    redis: any; // Using any here as we can't easily import the Redis type
    limiter: any;
    analytics: boolean;
    prefix: string;
    ephemeralCache?: Map<string, any>;
  }): {
    limit(identifier: string): Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
      pending: Promise<unknown>;
    }>;
  };
  slidingWindow(limit: number, window: string): any;
}

let rateLimiters: Map<string, ReturnType<RatelimitClass['prototype']['limit']>> | null = null;
let Ratelimit: RatelimitClass = null as unknown as RatelimitClass;
let redisPrimary: any = null; // Using any for Redis client as it's complex to type properly

/**
 * Initialize the rate limiter dependencies
 * This is called only when needed, reducing the initial load time
 */
async function initRateLimiting() {
  if (rateLimiters !== null) return;
  
  // Dynamically import dependencies
  const [upstashRatelimit, redisClient] = await Promise.all([
    import("@upstash/ratelimit"),
    import("./client")
  ]);
  
  Ratelimit = upstashRatelimit.Ratelimit;
  redisPrimary = redisClient.redisPrimary;
  rateLimiters = new Map();
}

/**
 * Get or create a rate limiter for the specified configuration
 */
async function getRateLimiter(config: RateLimitConfig) {
  await initRateLimiting();
  
  const { limit, window: windowSeconds } = config;
  const key = `${limit}:${windowSeconds}`;
  
  if (!rateLimiters!.has(key)) {
    rateLimiters!.set(key, new Ratelimit({
      redis: redisPrimary,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: true,
      prefix: `ratelimit:${key}`,
      ephemeralCache: new Map(), // Use ephemeral cache for better performance
    }));
  }
  
  return rateLimiters!.get(key)!;
}

/**
 * High-performance rate limiting middleware for Next.js Edge Runtime
 * 
 * Features:
 * - Uses @upstash/ratelimit with sliding window algorithm
 * - Efficient identifier extraction with customization options
 * - Built-in error handling with graceful fallback
 * - Optimized header handling
 */
export async function rateLimit(
  request: NextRequest, 
  config: RateLimitConfig = { limit: 10, window: 60 }
) {
  const { identifierFn } = config;
  
  // Get identifier (IP by default, but customizable)
  let identifier: string;
  try {
    if (identifierFn) {
      identifier = identifierFn(request);
    } else {
      // Default identifier extraction
      // Order: CF-Connecting-IP (Cloudflare) -> X-Forwarded-For -> fallback
      const cfIp = request.headers.get('cf-connecting-ip');
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      identifier = 
        cfIp ? cfIp : 
        forwardedFor ? forwardedFor.split(',')[0].trim() : 
        realIp ? realIp : '127.0.0.1';
    }
  } catch (error) {
    console.error('Error extracting rate limit identifier:', error);
    identifier = '127.0.0.1'; // Fallback
  }

  try {
    // Get or create the rate limiter for this configuration
    const limiter = await getRateLimiter(config);
    
    // Apply rate limiting
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    
    // Set headers for rate limiting info
    const headers = new Headers({
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    });

    // If over the limit, return a 429 response
    if (!success) {
      return NextResponse.json(
        { error: "Too Many Requests", message: "Rate limit exceeded" }, 
        { status: 429, headers }
      );
    }

    // Otherwise, return the headers to be used in the actual response
    return headers;

  } catch (error) {
    console.error(`Rate limit error for ${identifier}:`, error);
    // On error, allow the request but without rate limit headers
    // This ensures the site stays functional even if Redis is down
    return new Headers();
  }
}
