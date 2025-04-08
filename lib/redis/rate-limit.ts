import { redis } from "./client"
import { type NextRequest, NextResponse } from "next/server"

export interface RateLimitConfig {
  limit: number
  window: number // in seconds
}

export async function rateLimit(request: NextRequest, config: RateLimitConfig = { limit: 10, window: 60 }) {
  const ip = request.ip || "127.0.0.1"
  const key = `rate-limit:${ip}`

  // Get the existing count and time
  const [count, reset] = (await redis.pipeline().incr(key).ttl(key).exec()) as [number, number]

  // If this is the first request, set an expiration
  if (count === 1) {
    await redis.expire(key, config.window)
  }

  // Calculate remaining requests and time until reset
  const remaining = Math.max(0, config.limit - count)
  const resetAt = Date.now() + (reset > 0 ? reset * 1000 : config.window * 1000)

  // Set headers for rate limiting info
  const headers = new Headers({
    "X-RateLimit-Limit": config.limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetAt.toString(),
  })

  // If over the limit, return a 429 response
  if (count > config.limit) {
    return NextResponse.json({ error: "Too Many Requests", message: "Rate limit exceeded" }, { status: 429, headers })
  }

  // Otherwise, return the headers to be used in the actual response
  return headers
}
