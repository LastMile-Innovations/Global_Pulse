import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { rateLimit } from "@/lib/redis/client"

// Cache for rate limiting results to reduce Redis calls
const rateLimitCache = new Map<string, { result: any; timestamp: number }>()
const CACHE_TTL = 5000 // 5 seconds

export async function middleware(request: NextRequest) {
  // First, handle Supabase auth session
  const response = await updateSession(request)

  // Apply rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    try {
      const ip = request.ip || "127.0.0.1"
      const identifier = `${ip}:${request.nextUrl.pathname}`

      // Check cache first to reduce Redis calls
      const cachedResult = rateLimitCache.get(identifier)
      const now = Date.now()

      let result

      if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
        result = cachedResult.result
      } else {
        // Different limits for different endpoints
        let limit = 50 // Default
        const window = 60 // Default window in seconds

        if (request.nextUrl.pathname.includes("/api/surveys")) {
          limit = 20 // Stricter limit for survey submissions
        }

        result = await rateLimit(identifier, limit, window)

        // Cache the result
        rateLimitCache.set(identifier, { result, timestamp: now })

        // Clean up old cache entries periodically
        if (Math.random() < 0.01) {
          // 1% chance to clean up on each request
          for (const [key, value] of rateLimitCache.entries()) {
            if (now - value.timestamp > CACHE_TTL * 2) {
              rateLimitCache.delete(key)
            }
          }
        }
      }

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", result.limit?.toString() || "50")
      response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
      response.headers.set("X-RateLimit-Reset", result.reset.toString())

      // If rate limit exceeded, return 429 Too Many Requests
      if (!result.success) {
        return NextResponse.json(
          { error: "Too Many Requests", message: "Rate limit exceeded" },
          { status: 429, headers: response.headers },
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
    // Only run on specific paths to improve performance
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
