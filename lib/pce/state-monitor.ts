import { logger } from "../utils/logger"
import type { MinimalStateS, VADOutput } from "../types/pce-types"
import { getRedisClient } from "../db/redis/redis-client"
import {
  INERTIA_DECAY_RATE,
  MOOD_DECAY_FACTOR,
  STRESS_DECAY_FACTOR,
  VALENCE_INERTIA_WEIGHT,
  AROUSAL_INERTIA_WEIGHT,
} from "./temporal-config"

/**
 * Calculates weighted inertia based on recent ERs and a decay rate
 */
function calculateWeightedInertia(
  recentERs: Array<{ timestamp: number; value: number }>,
  decayRate: number,
  now: number,
): number {
  let weightedSum = 0
  let totalWeight = 0

  for (const er of recentERs) {
    const timeDiffSeconds = (now - er.timestamp) / 1000
    const weight = Math.exp(-decayRate * timeDiffSeconds)
    weightedSum += er.value * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

/**
 * Updates the minimal state based on the latest VAD output
 *
 * @param userId The user's ID
 * @param sessionID The session ID
 * @param vadOutput The VAD output from the EWEF analysis
 * @param previousState The last state that was persisted
 * @returns MinimalStateS containing the updated state
 */
export async function updateMinimalState(
  userId: string,
  sessionID: string,
  vadOutput: VADOutput,
  previousState: MinimalStateS,
): Promise<MinimalStateS> {
  try {
    const redis = getRedisClient()
    const stateKey = `state:${userId}:${sessionID}`

    // Fetch recent ERs from the KG
    // const recentERs = await kgService.getRecentUserERs(
    //   userId,
    //   RECENT_ER_TIME_WINDOW_MINUTES,
    //   RECENT_ER_LIMIT
    // );

    const recentERs = []

    const now = Date.now()

    // Calculate recent inertia
    const recentValenceInertia = calculateWeightedInertia(
      recentERs.map((er) => ({ timestamp: er.timestamp, value: er.vadV })),
      INERTIA_DECAY_RATE,
      now,
    )

    const recentArousalInertia = calculateWeightedInertia(
      recentERs.map((er) => ({ timestamp: er.timestamp, value: er.vadA })),
      INERTIA_DECAY_RATE,
      now,
    )

    // Calculate mood and stress incorporating inertia
    const moodEstimate = previousState.moodEstimate * MOOD_DECAY_FACTOR + recentValenceInertia * VALENCE_INERTIA_WEIGHT
    const stressEstimate =
      previousState.stressEstimate * STRESS_DECAY_FACTOR + recentArousalInertia * AROUSAL_INERTIA_WEIGHT

    // Create the minimal state object
    const minimalState: MinimalStateS = {
      timestamp: now,
      moodEstimate: moodEstimate,
      stressEstimate: stressEstimate,
    }

    // Store the state in Redis for immediate use by other components
    await storeStateInRedis(userId, sessionID, minimalState)

    return minimalState
  } catch (error) {
    logger.error(`Error updating minimal state: ${error}`)

    // Return default values on error
    return {
      timestamp: Date.now(),
      moodEstimate: 0.0,
      stressEstimate: 0.1,
    }
  }
}

/**
 * Stores the minimal state in Redis for immediate use by other components
 */
async function storeStateInRedis(userID: string, sessionID: string, minimalState: MinimalStateS): Promise<void> {
  try {
    const redis = getRedisClient()

    // Store the state with a TTL of 1 hour
    const key = `state:${userID}:${sessionID}`
    await redis.set(key, JSON.stringify(minimalState), { ex: 3600 })

    logger.info(`Stored minimal state in Redis for user ${userID}, session ${sessionID}`)
  } catch (error) {
    logger.error(`Error storing minimal state in Redis: ${error}`)
  }
}

/**
 * Retrieves the minimal state from Redis
 *
 * @param userID The user's ID
 * @param sessionID The session ID
 * @returns MinimalStateS containing the state, or null if not found
 */
export async function getMinimalState(userID: string, sessionID: string): Promise<MinimalStateS | null> {
  try {
    const redis = getRedisClient()

    // Retrieve the state
    const key = `state:${userID}:${sessionID}`
    const stateJson = await redis.get(key)

    if (!stateJson) {
      return null
    }

    return JSON.parse(stateJson) as MinimalStateS
  } catch (error) {
    logger.error(`Error retrieving minimal state from Redis: ${error}`)
    return null
  }
}
