import { checkConsent } from "../ethics/consent"
import { logger } from "../utils/logger"
import {
  isDistressCheckPerformed,
  setDistressCheckPerformed,
  setAwaitingDistressCheckResponse,
} from "../session/session-state"
import { getTemplatedResponse } from "../responses/template-filler"
import type { VADOutput } from "../types/pce-types"

// Thresholds for high distress detection
const HIGH_DISTRESS_VALENCE_THRESHOLD = -0.5 // Negative valence threshold
const HIGH_DISTRESS_AROUSAL_THRESHOLD = 0.7 // High arousal threshold
const CONSECUTIVE_TURNS_THRESHOLD = 2 // Number of consecutive turns with high distress

// Cache for recent VAD values
const recentVadCache: Record<string, Array<VADOutput>> = {}

/**
 * Check if user is in high distress based on VAD values
 * @param userId User ID
 * @param sessionId Session ID
 * @param vad Current VAD output
 * @param currentTurn Current turn number
 * @returns Promise resolving to true if user is in high distress
 */
export async function detectHighDistress(
  userId: string,
  sessionId: string,
  vad: VADOutput,
  currentTurn: number,
): Promise<boolean> {
  try {
    // Get cache key
    const cacheKey = `${userId}:${sessionId}`

    // Initialize cache if needed
    if (!recentVadCache[cacheKey]) {
      recentVadCache[cacheKey] = []
    }

    // Add current VAD to cache
    recentVadCache[cacheKey].push(vad)

    // Keep only the most recent N turns
    if (recentVadCache[cacheKey].length > CONSECUTIVE_TURNS_THRESHOLD) {
      recentVadCache[cacheKey].shift()
    }

    // Check if we have enough turns to analyze
    if (recentVadCache[cacheKey].length < CONSECUTIVE_TURNS_THRESHOLD) {
      return false
    }

    // Check if all recent turns show high distress
    const allHighDistress = recentVadCache[cacheKey].every(
      (v) =>
        v.valence < HIGH_DISTRESS_VALENCE_THRESHOLD &&
        v.arousal > HIGH_DISTRESS_AROUSAL_THRESHOLD &&
        v.confidence >= 0.6, // Only consider high confidence VAD values
    )

    return allHighDistress
  } catch (error) {
    logger.error(`Error detecting high distress: ${error}`)
    return false
  }
}

/**
 * Check if distress check-in should be triggered
 * @param userId User ID
 * @param sessionId Session ID
 * @param vad Current VAD output
 * @param currentTurn Current turn number
 * @param shouldLogDetails Whether detailed logging is enabled
 * @returns Promise resolving to true if distress check-in should be triggered
 */
export async function shouldTriggerDistressCheckin(
  userId: string,
  sessionId: string,
  vad: VADOutput,
  currentTurn: number,
  shouldLogDetails: boolean,
): Promise<boolean> {
  try {
    // Check if detailed logging is enabled
    if (!shouldLogDetails) {
      logger.info(`Skipping distress check-in for user ${userId}: Detailed logging not enabled`)
      return false
    }

    // Check if distress check-in has already been performed for this session
    const alreadyPerformed = await isDistressCheckPerformed(sessionId)
    if (alreadyPerformed) {
      logger.info(`Skipping distress check-in for user ${userId}: Already performed this session`)
      return false
    }

    // Check if user has opted in to distress check-ins
    const hasConsent = await checkConsent(userId, "allowDistressConsentCheck")
    if (!hasConsent) {
      logger.info(`Skipping distress check-in for user ${userId}: User has not opted in`)
      return false
    }

    // Check if user is in high distress
    const isHighDistress = await detectHighDistress(userId, sessionId, vad, currentTurn)
    if (!isHighDistress) {
      logger.info(`Skipping distress check-in for user ${userId}: Not in high distress`)
      return false
    }

    logger.info(`Triggering distress check-in for user ${userId}`)
    return true
  } catch (error) {
    logger.error(`Error checking if distress check-in should be triggered: ${error}`)
    return false
  }
}

/**
 * Generate distress check-in prompt
 * @param userId User ID
 * @param sessionId Session ID
 * @returns Promise resolving to the distress check-in prompt
 */
export async function generateDistressCheckin(userId: string, sessionId: string): Promise<string> {
  try {
    // Generate the prompt using the template system
    const prompt = await getTemplatedResponse("distress_consent_checkin", {
      userId,
      sessionId,
      user_message: "", // Not needed for this template
    })

    // Mark that distress check-in has been performed for this session
    await setDistressCheckPerformed(sessionId)

    // Mark that we're awaiting a response
    await setAwaitingDistressCheckResponse(sessionId, true)

    logger.info(`Generated distress check-in prompt for user ${userId}`)
    return prompt
  } catch (error) {
    logger.error(`Error generating distress check-in prompt: ${error}`)
    return "I notice this conversation has touched on some difficult feelings. Would you like to take a moment before continuing with deeper analysis?"
  }
}

/**
 * Parse the user's response to determine their choice
 * @param userResponse User's response text
 * @returns The parsed choice
 */
function parseDistressResponse(userResponse: string): string {
  const normalizedResponse = userResponse.toLowerCase().trim()

  // Check for "pause both" keywords
  if (
    normalizedResponse.includes("pause both") ||
    normalizedResponse.includes("stop both") ||
    normalizedResponse.includes("pause everything") ||
    (normalizedResponse.includes("pause") && !normalizedResponse.includes("only"))
  ) {
    return "Pause Both"
  }

  // Check for "pause insights only" keywords
  if (
    normalizedResponse.includes("pause insights") ||
    normalizedResponse.includes("pause analysis") ||
    normalizedResponse.includes("stop insights") ||
    normalizedResponse.includes("insights only")
  ) {
    return "Pause Insights Only"
  }

  // Check for "pause training only" keywords
  if (
    normalizedResponse.includes("pause training") ||
    normalizedResponse.includes("stop training") ||
    normalizedResponse.includes("training only")
  ) {
    return "Pause Training Only"
  }

  // Check for "continue both" keywords
  if (
    normalizedResponse.includes("continue") ||
    normalizedResponse.includes("proceed") ||
    normalizedResponse.includes("keep going") ||
    normalizedResponse.includes("don't pause") ||
    normalizedResponse.includes("no pause") ||
    normalizedResponse.includes("no need to pause")
  ) {
    return "Continue Both"
  }

  // Default to "Continue Both" if we can't determine the choice
  return "Continue Both"
}

/**
 * Handle the user's response to the distress check-in prompt
 * @param userId User ID
 * @param sessionId Session ID
 * @param userResponse User's response text
 * @returns Acknowledgment message
 */
export async function handleDistressCheckinResponse(
  userId: string,
  sessionId: string,
  userResponse: string,
): Promise<string> {
  try {
    // Parse the user's response to determine their choice
    const pauseChoice = parseDistressResponse(userResponse)

    logger.info(`Parsed distress check-in response for user ${userId}: ${pauseChoice}`)

    // Call the session pause update API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/feedback/session_pause_update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        pauseChoice,
      }),
    })

    if (!response.ok) {
      logger.error(`Error updating session pause flags: ${response.statusText}`)
    }

    // Reset awaiting response flag
    await setAwaitingDistressCheckResponse(sessionId, false)

    // Generate acknowledgment based on the user's choice
    let acknowledgment = "Thank you for your response."

    switch (pauseChoice) {
      case "Pause Both":
        acknowledgment =
          "I understand. I'll pause both insights and training for now. We can continue our conversation without deeper analysis."
        break
      case "Pause Insights Only":
        acknowledgment = "I understand. I'll pause insights for now, but will continue to learn from our conversation."
        break
      case "Pause Training Only":
        acknowledgment =
          "I understand. I'll pause training for now, but will continue to provide insights during our conversation."
        break
      case "Continue Both":
        acknowledgment = "Thank you. We'll continue our conversation with both insights and learning enabled."
        break
    }

    return acknowledgment
  } catch (error) {
    logger.error(`Error handling distress check-in response: ${error}`)
    return "Thank you for your response."
  }
}
