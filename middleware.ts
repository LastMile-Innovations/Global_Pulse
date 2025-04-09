import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

/**
 * IMPORTANT: Rate limiting has been moved to individual API routes
 * 
 * This significantly reduces middleware bundle size and improves TTFB.
 * Rate limiting is now applied in each API route handler using:
 * 
 * import { rateLimit } from "@/lib/redis/rate-limit"
 * 
 * // In your API route handler:
 * const rateLimitResult = await rateLimit(request, { limit: 20, window: 60 })
 * if (rateLimitResult instanceof NextResponse) return rateLimitResult
 */

/**
 * High-performance Edge Runtime middleware
 * 
 * Optimized for:
 * - Fast authentication checks (Supabase session)
 * - Enhanced rate limiting using Redis with ephemeral caching
 * - Minimal bundle size
 * - Resilient error handling
 */
/**
 * Lightweight middleware that only handles authentication and security headers
 * Rate limiting has been moved to individual API routes for better performance
 */
export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname
    let response: NextResponse
    
    // Only run authentication for non-API routes or API routes that need auth
    // This prevents the Supabase client from being initialized for all API requests
    if (!path.startsWith('/api/') || 
        path.includes('/api/auth') || 
        path.includes('/api/user') || 
        path.includes('/api/chat')) {
      // Update Supabase session (handles cookie refresh)
      response = await updateSession(request)
    } else {
      // For API routes that don't need auth, just continue
      response = NextResponse.next()
    }

    // Apply security headers to all responses
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
  } catch (error) {
    console.error('Middleware critical error:', error)
    // For critical errors, still return a response so the site functions
    return NextResponse.next()
  }
}

/**
 * Optimized matcher configuration
 * 
 * This precisely targets only routes that need middleware processing,
 * excluding all static assets and images to minimize middleware invocations.
 */
export const config = {
  matcher: [
    // Only process routes that need authentication
    // Exclude static assets and API routes that don't need auth
    "/((?!_next/static|_next/image|assets|favicon|robots.txt|sitemap.xml|api/(?!auth|user|chat)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
