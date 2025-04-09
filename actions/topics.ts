"use server"

import { redis } from "@/lib/redis/client"

/**
 * Increments the engagement count for a specific topic in Redis.
 * @param topicId The ID of the topic to increment engagement for.
 * @returns An object indicating success and the new count, or success false on error.
 */
export async function incrementTopicEngagement(topicId: string): Promise<{ success: boolean; count: number }> {
  if (!topicId) {
    console.error("incrementTopicEngagement: topicId is required.")
    return { success: false, count: 0 }
  }

  const key = `topic:${topicId}:engagement`

  try {
    // Increment the counter in Redis
    const newCount = await redis.incr(key)

    // Optional: Set an expiration if you want counts to decay or reset
    // await redis.expire(key, 60 * 60 * 24) // Example: Expire after 24 hours

    return { success: true, count: newCount }
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
