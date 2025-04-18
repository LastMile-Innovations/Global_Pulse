"use server"

import { redis } from "@/lib/redis/client"
import { rateLimit } from "@/lib/redis/rate-limit"
import { type NextRequest } from "next/server"

/**
 * Increments the engagement count for a specific topic in Redis, with rate limiting.
 * @param topicId The ID of the topic to increment engagement for.
 * @param request The Next.js request object (for rate limiting).
 * @returns An object indicating success and the new count, or success false on error or if rate limited.
 */
export async function incrementTopicEngagement(
  topicId: string,
  request?: NextRequest
): Promise<{ success: boolean; count: number; rateLimited?: boolean }> {
  if (!topicId || typeof topicId !== "string" || topicId.trim() === "") {
    console.error("incrementTopicEngagement: topicId is required and must be a non-empty string.")
    return { success: false, count: 0 }
  }

  // Optional: Apply a per-user or per-IP rate limit for engagement increments
  if (request) {
    const rateLimitResult = await rateLimit(request, {
      limit: 10, // e.g., 10 increments per minute per user/IP
      window: 60,
      keyPrefix: "topic_engagement",
      ipFallback: { enabled: true, limit: 5, window: 60 },
      includeHeaders: false,
    })
    if (rateLimitResult) {
      // Rate limited
      return { success: false, count: 0, rateLimited: true }
    }
  }

  const key = `topic:${topicId}:engagement`

  try {
    // Increment the counter in Redis
    const newCount = await redis.incr(key)

    // Optionally set an expiration so counts reset every 30 days
    await redis.expire(key, 60 * 60 * 24 * 30) // 30 days

    return { success: true, count: typeof newCount === "number" ? newCount : Number(newCount) }
  } catch (error) {
    console.error(`Error incrementing topic engagement for ${topicId}:`, error)
    // Attempt to get the current count even if increment failed, otherwise return 0
    try {
      const currentCount = await redis.get(key)
      return { success: false, count: currentCount ? Number(currentCount) : 0 }
    } catch (getCountError) {
      console.error(`Error fetching count after increment failure for ${topicId}:`, getCountError)
      return { success: false, count: 0 }
    }
  }
}

/**
 * Gets the current engagement count for a specific topic in Redis.
 * @param topicId The ID of the topic to get engagement for.
 * @returns An object indicating success and the current count, or success false on error.
 */
export async function getTopicEngagementCount(
  topicId: string
): Promise<{ success: boolean; count: number }> {
  if (!topicId || typeof topicId !== "string" || topicId.trim() === "") {
    console.error("getTopicEngagementCount: topicId is required and must be a non-empty string.")
    return { success: false, count: 0 }
  }

  const key = `topic:${topicId}:engagement`

  try {
    const count = await redis.get(key)
    return { success: true, count: count ? Number(count) : 0 }
  } catch (error) {
    console.error(`Error getting topic engagement count for ${topicId}:`, error)
    return { success: false, count: 0 }
  }
}

/**
 * Resets the engagement count for a specific topic in Redis.
 * @param topicId The ID of the topic to reset engagement for.
 * @returns An object indicating success.
 */
export async function resetTopicEngagement(
  topicId: string
): Promise<{ success: boolean }> {
  if (!topicId || typeof topicId !== "string" || topicId.trim() === "") {
    console.error("resetTopicEngagement: topicId is required and must be a non-empty string.")
    return { success: false }
  }

  const key = `topic:${topicId}:engagement`

  try {
    await redis.del(key)
    return { success: true }
  } catch (error) {
    console.error(`Error resetting topic engagement for ${topicId}:`, error)
    return { success: false }
  }
}
