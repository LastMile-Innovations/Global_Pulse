import { getRedisClient } from "../db/redis/redis-client"
import { logger } from "../utils/logger"

/**
 * Check if a user is in Insight Mode
 * This is used by the PCE service to determine if detailed logging should occur
 */
export async function isInsightModeActive(userId: string, sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient()

    // Check session state
    const key = `session:${sessionId}:insightMode`
    const value = await redis.get(key)

    // If not explicitly set, default to true for MVP
    if (value === null) {
      // Set default value
      await redis.set(key, "true", { ex: 86400 }) // 24 hour TTL
      return true
    }

    return value === "true"
  } catch (error) {
    logger.error(`Error checking insight mode: ${error}`)
    return true // Default to true for MVP on error
  }
}

/**
 * Set the Insight Mode status for a user's session
 */
export async function setInsightModeActive(userId: string, sessionId: string, active: boolean): Promise<boolean> {
  try {
    const redis = getRedisClient()

    // Set session state
    const key = `session:${sessionId}:insightMode`
    await redis.set(key, active.toString(), { ex: 86400 }) // 24 hour TTL

    return true
  } catch (error) {
    logger.error(`Error setting insight mode: ${error}`)
    return false
  }
}
