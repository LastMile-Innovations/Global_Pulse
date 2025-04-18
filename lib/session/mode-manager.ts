import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "../utils/logger"
import { SESSION_TTL } from "./session-state"

/**
 * Engagement mode types
 */
export type EngagementMode = "insight" | "listening"

/**
 * Default engagement mode
 */
export const DEFAULT_ENGAGEMENT_MODE: EngagementMode = "insight"

/**
 * Redis key prefix for engagement mode
 */
const REDIS_KEY_PREFIX = "session:mode:"

/**
 * Get the current engagement mode for a session.
 * If not set, defaults to DEFAULT_ENGAGEMENT_MODE and sets it in Redis.
 * @param userId User ID
 * @param sessionId Session ID
 * @returns The current engagement mode
 */
export async function getEngagementMode(
  userId: string,
  sessionId: string
): Promise<EngagementMode> {
  let redis
  try {
    redis = getRedisClient()
  } catch (err) {
    logger.error(`Failed to get Redis client in getEngagementMode: ${err}`)
    return DEFAULT_ENGAGEMENT_MODE
  }

  const key = `${REDIS_KEY_PREFIX}${sessionId}`
  try {
    const mode = await redis.get(key)
    if (!mode) {
      // Set default mode if not found
      await setEngagementMode(userId, sessionId, DEFAULT_ENGAGEMENT_MODE)
      logger.info(
        `Engagement mode not set for sessionId=${sessionId}, defaulting to ${DEFAULT_ENGAGEMENT_MODE}`
      )
      return DEFAULT_ENGAGEMENT_MODE
    }
    // Only allow valid values
    if (mode === "insight" || mode === "listening") {
      return mode as EngagementMode
    } else {
      logger.warn(
        `Invalid engagement mode "${mode}" found for sessionId=${sessionId}, resetting to default`
      )
      await setEngagementMode(userId, sessionId, DEFAULT_ENGAGEMENT_MODE)
      return DEFAULT_ENGAGEMENT_MODE
    }
  } catch (error) {
    logger.error(`Error getting engagement mode for sessionId=${sessionId}: ${error}`)
    return DEFAULT_ENGAGEMENT_MODE
  }
}

/**
 * Set the engagement mode for a session.
 * @param userId User ID
 * @param sessionId Session ID
 * @param mode The engagement mode to set
 * @returns True if successful, false otherwise
 */
export async function setEngagementMode(
  userId: string,
  sessionId: string,
  mode: EngagementMode
): Promise<boolean> {
  let redis
  try {
    redis = getRedisClient()
  } catch (err) {
    logger.error(`Failed to get Redis client in setEngagementMode: ${err}`)
    return false
  }

  const key = `${REDIS_KEY_PREFIX}${sessionId}`
  try {
    await redis.set(key, mode, { ex: SESSION_TTL })
    logger.info(
      `Set engagement mode to ${mode} for user ${userId}, session ${sessionId}`
    )
    return true
  } catch (error) {
    logger.error(
      `Error setting engagement mode for userId=${userId}, sessionId=${sessionId}: ${error}`
    )
    return false
  }
}

/**
 * Check if a session is in Insight Mode.
 * @param userId User ID
 * @param sessionId Session ID
 * @returns True if in Insight Mode, false otherwise
 */
export async function isInsightModeActive(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const mode = await getEngagementMode(userId, sessionId)
  return mode === "insight"
}

/**
 * Check if a session is in Listening Mode.
 * @param userId User ID
 * @param sessionId Session ID
 * @returns True if in Listening Mode, false otherwise
 */
export async function isListeningModeActive(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const mode = await getEngagementMode(userId, sessionId)
  return mode === "listening"
}

/**
 * Reset the engagement mode to default for a session.
 * @param userId User ID
 * @param sessionId Session ID
 */
export async function resetEngagementMode(
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    await setEngagementMode(userId, sessionId, DEFAULT_ENGAGEMENT_MODE)
    logger.info(
      `Reset engagement mode to default (${DEFAULT_ENGAGEMENT_MODE}) for user ${userId}, session ${sessionId}`
    )
  } catch (error) {
    logger.error(
      `Error resetting engagement mode for userId=${userId}, sessionId=${sessionId}: ${error}`
    )
  }
}

/**
 * Get all supported engagement modes.
 * Useful for UI dropdowns or validation.
 */
export function getSupportedEngagementModes(): EngagementMode[] {
  return ["insight", "listening"]
}
