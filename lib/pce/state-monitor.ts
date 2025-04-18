import { logger } from "../utils/logger"
import type { MinimalStateS, VADOutput } from "../types/pce-types"
import { getRedisClient } from "../db/redis/redis-client"
import {
  INERTIA_DECAY_RATE,
  MOOD_DECAY_FACTOR,
  STRESS_DECAY_FACTOR,
  VALENCE_INERTIA_WEIGHT,
  AROUSAL_INERTIA_WEIGHT,
  RECENT_ER_TIME_WINDOW_MINUTES,
  RECENT_ER_LIMIT,
} from "./temporal-config"

// --- MVP: In-memory ER store for recent events per user/session (replace with KG/DB in production) ---
type MinimalER = {
  timestamp: number
  vadV: number
  vadA: number
}
const inMemoryERStore: Map<string, MinimalER[]> = new Map()

/**
 * Add a new ER to the in-memory store for a user/session.
 * Keeps only the most recent RECENT_ER_LIMIT events within the time window.
 */
function addRecentER(userId: string, sessionID: string, vadOutput: VADOutput) {
  const key = `${userId}:${sessionID}`
  const now = Date.now()
  // Defensive: support both vadV/vadA and valence/arousal property names
  const vadV = (vadOutput as any).vadV ?? (vadOutput as any).valence
  const vadA = (vadOutput as any).vadA ?? (vadOutput as any).arousal
  if (typeof vadV !== "number" || typeof vadA !== "number") {
    logger.error(
      `addRecentER: Invalid vadOutput, missing vadV/vadA or valence/arousal: ${JSON.stringify(vadOutput)}`
    )
    return
  }
  const er: MinimalER = {
    timestamp: now,
    vadV,
    vadA,
  }
  let arr = inMemoryERStore.get(key) ?? []
  // Remove ERs outside the time window
  const windowMs = RECENT_ER_TIME_WINDOW_MINUTES * 60 * 1000
  arr = arr.filter(er => now - er.timestamp <= windowMs)
  arr.push(er)
  // Keep only the most recent RECENT_ER_LIMIT
  if (arr.length > RECENT_ER_LIMIT) {
    arr = arr.slice(arr.length - RECENT_ER_LIMIT)
  }
  inMemoryERStore.set(key, arr)
}

/**
 * Get recent ERs for a user/session from the in-memory store.
 */
function getRecentERs(userId: string, sessionID: string): MinimalER[] {
  const key = `${userId}:${sessionID}`
  const arr = inMemoryERStore.get(key) ?? []
  const now = Date.now()
  const windowMs = RECENT_ER_TIME_WINDOW_MINUTES * 60 * 1000
  // Only return ERs within the time window
  return arr.filter(er => now - er.timestamp <= windowMs)
}

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
    // Defensive: support both vadV/vadA and valence/arousal property names
    const vadV = (vadOutput as any).vadV ?? (vadOutput as any).valence
    const vadA = (vadOutput as any).vadA ?? (vadOutput as any).arousal
    if (typeof vadV !== "number" || typeof vadA !== "number") {
      logger.error(
        `updateMinimalState: Invalid vadOutput, missing vadV/vadA or valence/arousal: ${JSON.stringify(vadOutput)}`
      )
      // Return default values on error
      return {
        timestamp: Date.now(),
        moodEstimate: 0.0,
        stressEstimate: 0.1,
      }
    }

    // Add the new ER to the in-memory store (MVP)
    addRecentER(userId, sessionID, { valence: vadV, arousal: vadA, dominance: 0, confidence: 0 })

    // Get recent ERs for inertia calculation
    const recentERs = getRecentERs(userId, sessionID)

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

    // Calculate mood and stress incorporating inertia and current VAD
    // MVP: Blend previous state, inertia, and current VAD
    const moodEstimate =
      previousState.moodEstimate * MOOD_DECAY_FACTOR +
      recentValenceInertia * VALENCE_INERTIA_WEIGHT +
      vadV * (1 - MOOD_DECAY_FACTOR - VALENCE_INERTIA_WEIGHT)

    const stressEstimate =
      previousState.stressEstimate * STRESS_DECAY_FACTOR +
      recentArousalInertia * AROUSAL_INERTIA_WEIGHT +
      vadA * (1 - STRESS_DECAY_FACTOR - AROUSAL_INERTIA_WEIGHT)

    // Clamp values to [0, 1] for safety
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

    const minimalState: MinimalStateS = {
      timestamp: now,
      moodEstimate: clamp01(moodEstimate),
      stressEstimate: clamp01(stressEstimate),
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

    // Defensive: ensure stateJson is a string
    if (typeof stateJson !== "string") {
      logger.error(`State JSON from Redis is not a string: ${typeof stateJson}`)
      return null
    }

    return JSON.parse(stateJson) as MinimalStateS
  } catch (error) {
    logger.error(`Error retrieving minimal state from Redis: ${error}`)
    return null
  }
}
