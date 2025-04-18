import { getRedisClient } from "@/lib/redis/client"
import { logger } from "@/lib/utils/logger"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

// Session state keys
const SESSION_KEY_DISTRESS_CHECK_PERFORMED = "distressCheckPerformed"
const SESSION_KEY_AWAITING_DISTRESS_RESPONSE = "awaitingDistressCheckResponse"

/**
 * Check if a distress check has been performed for this session
 * @param sessionId Session ID
 * @returns Promise resolving to true if a distress check has been performed
 */
export async function isDistressCheckPerformed(sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const performed = await redis.get(`session:${sessionId}:${SESSION_KEY_DISTRESS_CHECK_PERFORMED}`)
    return performed === "true"
  } catch (error) {
    logger.error(`Error checking if distress check performed: ${error}`)
    return false
  }
}

/**
 * Set the distress check performed flag for this session
 * @param sessionId Session ID
 * @param performed Whether a distress check has been performed
 */
export async function setDistressCheckPerformed(sessionId: string, performed = true): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.set(`session:${sessionId}:${SESSION_KEY_DISTRESS_CHECK_PERFORMED}`, performed.toString(), {
      ex: SESSION_TTL,
    })
    logger.info(`Set distress check performed flag to ${performed} for session ${sessionId}`)
  } catch (error) {
    logger.error(`Error setting distress check performed flag: ${error}`)
  }
}

/**
 * Check if we're awaiting a response to a distress check
 * @param sessionId Session ID
 * @returns Promise resolving to true if awaiting a distress check response
 */
export async function isAwaitingDistressCheckResponse(sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const awaiting = await redis.get(`session:${sessionId}:${SESSION_KEY_AWAITING_DISTRESS_RESPONSE}`)
    return awaiting === "true"
  } catch (error) {
    logger.error(`Error checking if awaiting distress check response: ${error}`)
    return false
  }
}

/**
 * Set the awaiting distress check response flag for this session
 * @param sessionId Session ID
 * @param awaiting Whether we're awaiting a distress check response
 */
export async function setAwaitingDistressCheckResponse(sessionId: string, awaiting = true): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.set(`session:${sessionId}:${SESSION_KEY_AWAITING_DISTRESS_RESPONSE}`, awaiting.toString(), {
      ex: SESSION_TTL,
    })
    logger.info(`Set awaiting distress check response flag to ${awaiting} for session ${sessionId}`)
  } catch (error) {
    logger.error(`Error setting awaiting distress check response flag: ${error}`)
  }
}
