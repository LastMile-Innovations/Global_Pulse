import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"

// Session TTL in seconds (24 hours)
export const SESSION_TTL = 86400

// Session state keys
const SESSION_KEY_DISTRESS_CHECK_PERFORMED = "distressCheckPerformed"
const SESSION_KEY_AWAITING_DISTRESS_RESPONSE = "awaitingDistressCheckResponse"

/**
 * Get the Redis key for a session state property.
 * @param sessionId Session ID
 * @param key State key
 */
function getSessionStateKey(sessionId: string, key: string): string {
  return `session:${sessionId}:${key}`
}

/**
 * Check if a distress check has been performed for this session
 * @param sessionId Session ID
 * @returns Promise resolving to true if a distress check has been performed
 */
export async function isDistressCheckPerformed(sessionId: string): Promise<boolean> {
  let redis
  try {
    redis = getRedisClient()
  } catch (error) {
    logger.error(`Failed to get Redis client in isDistressCheckPerformed: ${error}`)
    return false
  }
  try {
    const performed = await redis.get(getSessionStateKey(sessionId, SESSION_KEY_DISTRESS_CHECK_PERFORMED))
    // Accept only "true" as true, everything else as false
    return performed === "true"
  } catch (error) {
    logger.error(`Error checking if distress check performed for sessionId=${sessionId}: ${error}`)
    return false
  }
}

/**
 * Set the distress check performed flag for this session
 * @param sessionId Session ID
 * @param performed Whether a distress check has been performed
 */
export async function setDistressCheckPerformed(
  sessionId: string,
  performed: boolean = true
): Promise<boolean> {
  let redis
  try {
    redis = getRedisClient()
  } catch (error) {
    logger.error(`Failed to get Redis client in setDistressCheckPerformed: ${error}`)
    return false
  }
  try {
    await redis.set(
      getSessionStateKey(sessionId, SESSION_KEY_DISTRESS_CHECK_PERFORMED),
      performed.toString(),
      { ex: SESSION_TTL }
    )
    logger.info(`Set distress check performed flag to ${performed} for session ${sessionId}`)
    return true
  } catch (error) {
    logger.error(`Error setting distress check performed flag for sessionId=${sessionId}: ${error}`)
    return false
  }
}

/**
 * Check if we're awaiting a response to a distress check
 * @param sessionId Session ID
 * @returns Promise resolving to true if awaiting a distress check response
 */
export async function isAwaitingDistressCheckResponse(sessionId: string): Promise<boolean> {
  let redis
  try {
    redis = getRedisClient()
  } catch (error) {
    logger.error(`Failed to get Redis client in isAwaitingDistressCheckResponse: ${error}`)
    return false
  }
  try {
    const awaiting = await redis.get(getSessionStateKey(sessionId, SESSION_KEY_AWAITING_DISTRESS_RESPONSE))
    // Accept only "true" as true, everything else as false
    return awaiting === "true"
  } catch (error) {
    logger.error(`Error checking if awaiting distress check response for sessionId=${sessionId}: ${error}`)
    return false
  }
}

/**
 * Set the awaiting distress check response flag for this session
 * @param sessionId Session ID
 * @param awaiting Whether we're awaiting a distress check response
 */
export async function setAwaitingDistressCheckResponse(
  sessionId: string,
  awaiting: boolean = true
): Promise<boolean> {
  let redis
  try {
    redis = getRedisClient()
  } catch (error) {
    logger.error(`Failed to get Redis client in setAwaitingDistressCheckResponse: ${error}`)
    return false
  }
  try {
    await redis.set(
      getSessionStateKey(sessionId, SESSION_KEY_AWAITING_DISTRESS_RESPONSE),
      awaiting.toString(),
      { ex: SESSION_TTL }
    )
    logger.info(`Set awaiting distress check response flag to ${awaiting} for session ${sessionId}`)
    return true
  } catch (error) {
    logger.error(`Error setting awaiting distress check response flag for sessionId=${sessionId}: ${error}`)
    return false
  }
}
