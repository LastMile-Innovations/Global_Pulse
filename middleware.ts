import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { rateLimit } from "@/lib/redis/client"

// Define the expected shape of the rate limit result
interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining: number;
  reset: number;
}

// Cache for rate limiting results to reduce Redis calls
// Stores the result and timestamp for a given identifier (IP + pathname)
const rateLimitCache = new Map<
  string,
  { result: RateLimitResult; timestamp: number }
>()
const CACHE_TTL = 5000 // Cache results for 5 seconds

export async function middleware(request: NextRequest) {
  // 1. Handle Supabase auth session updates
  const response = await updateSession(request)

  // Apply rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    try {
      const forwardedFor = request.headers.get('x-forwarded-for');
      // Use the first IP if multiple exist (common proxy setup), fallback to a default
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";
      const identifier = `${ip}:${request.nextUrl.pathname}`

      // Determine the rate limit based on the path *before* checking cache
      let limit = 50; // Default limit
      const window = 60; // Default window in seconds
      if (request.nextUrl.pathname.includes("/api/surveys")) {
        limit = 20; // Stricter limit for survey submissions
      }

      // Check cache first to reduce Redis calls
      const cachedResult = rateLimitCache.get(identifier)
      const now = Date.now()

      let result: RateLimitResult

      // Use cached result if valid and within TTL
      if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
        result = cachedResult.result
      } else {
        // Re-fetch from Redis if not cached or expired
        // Note: 'limit' and 'window' are already defined above
        result = await rateLimit(identifier, limit, window)

        // Cache the new result
        rateLimitCache.set(identifier, { result, timestamp: now })

        // Periodically clean up old cache entries (1% chance per request)
        if (Math.random() < 0.01) {
          // Remove entries older than 2x TTL
          for (const [key, value] of rateLimitCache.entries()) {
            if (now - value.timestamp > CACHE_TTL * 2) {
              rateLimitCache.delete(key)
            }
          }
        }
      }

      // Add rate limit headers
      response.headers.set(
        "X-RateLimit-Limit",
        result.limit?.toString() ?? limit.toString(),
      )
      response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
      response.headers.set("X-RateLimit-Reset", result.reset.toString())

      // If rate limit exceeded, return 429 Too Many Requests
      if (!result.success) {
        console.warn(`Rate limit exceeded for identifier: ${identifier}`) // Log when limit is hit
        return NextResponse.json(
          { error: "Too Many Requests", message: "Rate limit exceeded" },
          { status: 429, headers: response.headers }, // Include rate limit headers in 429 response
        )
      }
    } catch (error) {
      console.error("Rate limiting error:", error)
      // Continue without rate limiting if there's an error
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any file extension like .svg, .png, .jpg, etc.
     * This ensures middleware runs on page routes and API routes,
     * but not on static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
