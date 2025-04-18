import { getRedisClient } from "../db/redis/redis-client"
import { logger } from "../utils/logger"

/**
 * Check if a user is in Insight Mode for a session.
 * Used by the PCE service to determine if detailed logging should occur.
 * For MVP: defaults to true if not set or on error.
 */
export async function isInsightModeActive(userId: string, sessionId: string): Promise<boolean> {
  const key = `session:${sessionId}:insightMode`
  let redis
  try {
    redis = getRedisClient()
  } catch (err) {
    logger.error(`Failed to get Redis client in isInsightModeActive: ${err}`)
    return true // Default to true for MVP on Redis client error
  }

  try {
    const value = await redis.get(key)
    logger.debug(
      `Checked insight mode for userId=${userId}, sessionId=${sessionId}, key=${key}, value=${value}`
    )

    if (value === null) {
      // Not set: default to true for MVP, and set in Redis for future
      await redis.set(key, "true", { ex: 86400 }) // 24 hour TTL
      logger.info(
        `Insight mode not set for sessionId=${sessionId}, defaulting to true and setting in Redis`
      )
      return true
    }

    // Accept only "true" as true, everything else as false
    const isActive = value === "true"
    logger.debug(
      `Insight mode for sessionId=${sessionId} isActive=${isActive}`
    )
    return isActive
  } catch (error) {
    logger.error(
      `Error checking insight mode for userId=${userId}, sessionId=${sessionId}: ${error}`
    )
    return true // Default to true for MVP on error
  }
}

/**
 * Set the Insight Mode status for a user's session.
 * Returns true if set successfully, false otherwise.
 */
export async function setInsightModeActive(
  userId: string,
  sessionId: string,
  active: boolean
): Promise<boolean> {
  const key = `session:${sessionId}:insightMode`
  let redis
  try {
    redis = getRedisClient()
  } catch (err) {
    logger.error(`Failed to get Redis client in setInsightModeActive: ${err}`)
    return false
  }

  try {
    await redis.set(key, active.toString(), { ex: 86400 }) // 24 hour TTL
    logger.info(
      `Set insight mode for userId=${userId}, sessionId=${sessionId} to ${active}`
    )
    return true
  } catch (error) {
    logger.error(
      `Error setting insight mode for userId=${userId}, sessionId=${sessionId}: ${error}`
    )
    return false
  }
}
