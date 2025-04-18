import { checkConsent } from "@/lib/ethics/consent"
import { getRedisClient, SESSION_TTL } from "../redis/client"
import { getTemplatedResponse } from "../responses/template-filler"
import { logger } from "../utils/logger"
import {
  SOMATIC_PROMPT_AROUSAL_THRESHOLD,
  SOMATIC_PROMPT_MIN_CONFIDENCE,
  SOMATIC_PROMPT_MIN_TURNS_BETWEEN,
  SOMATIC_PROMPT_NEG_AROUSAL_THRESHOLD,
  SOMATIC_PROMPT_NEG_VALENCE_THRESHOLD,
  SOMATIC_PROMPT_PROBABILITY,
} from "./somatic-config"
import type { VADOutput } from "../types/pce-types"

/**
 * Session state keys for somatic prompting
 */
const SESSION_KEY_LAST_SOMATIC_PROMPT = "lastSomaticPromptTurn"
const SESSION_KEY_AWAITING_SOMATIC_RESPONSE = "awaitingSomaticResponse"

/**
 * Check if a somatic prompt should be triggered based on VAD values and user consent
 * @param userId User ID
 * @param sessionId Session ID
 * @param vad VAD output from PCE
 * @param currentTurn Current turn number in the conversation
 * @returns Promise resolving to true if a somatic prompt should be triggered
 */
export async function shouldTriggerSomaticPrompt(
  userId: string,
  sessionId: string,
  vad: VADOutput,
  currentTurn: number,
): Promise<boolean> {
  try {
    // 1. Check user consent for somatic prompts
    const hasConsent = await checkConsent(userId, "allowSomaticPrompts")
    if (!hasConsent) {
      logger.info(`Somatic prompt not triggered: User ${userId} has not consented to somatic prompts`)
      return false
    }

    // 2. Check VAD confidence
    if (vad.confidence < SOMATIC_PROMPT_MIN_CONFIDENCE) {
      logger.info(`Somatic prompt not triggered: VAD confidence too low (${vad.confidence})`)
      return false
    }

    // 3. Check VAD thresholds
    const meetsThreshold =
      vad.arousal > SOMATIC_PROMPT_AROUSAL_THRESHOLD ||
      (vad.valence < SOMATIC_PROMPT_NEG_VALENCE_THRESHOLD && vad.arousal > SOMATIC_PROMPT_NEG_AROUSAL_THRESHOLD)

    if (!meetsThreshold) {
      logger.info(
        `Somatic prompt not triggered: VAD thresholds not met (v:${vad.valence}, a:${vad.arousal}, d:${vad.dominance})`,
      )
      return false
    }

    // 4. Check frequency limit
    const redis = getRedisClient()
    const lastPromptTurnStr = await redis.get(`${userId}:${sessionId}:${SESSION_KEY_LAST_SOMATIC_PROMPT}`)

    if (lastPromptTurnStr) {
      const lastPromptTurn = Number.parseInt(lastPromptTurnStr, 10)
      const turnsSinceLastPrompt = currentTurn - lastPromptTurn

      if (turnsSinceLastPrompt < SOMATIC_PROMPT_MIN_TURNS_BETWEEN) {
        logger.info(
          `Somatic prompt not triggered: Too soon since last prompt (${turnsSinceLastPrompt} turns, min ${SOMATIC_PROMPT_MIN_TURNS_BETWEEN})`,
        )
        return false
      }
    }

    // 5. Apply probability factor
    if (Math.random() > SOMATIC_PROMPT_PROBABILITY) {
      logger.info(`Somatic prompt not triggered: Random probability check failed`)
      return false
    }

    // All checks passed
    logger.info(`Somatic prompt should be triggered for user ${userId}`)
    return true
  } catch (error) {
    logger.error(`Error in shouldTriggerSomaticPrompt: ${error}`)
    return false
  }
}

/**
 * Generate a somatic prompt based on the user's emotional state
 * @param userId User ID
 * @param sessionId Session ID
 * @param userMessage User's message
 * @param vad VAD output from PCE
 * @param currentTurn Current turn number in the conversation
 * @returns Promise resolving to the somatic prompt text, or null if no prompt should be triggered
 */
export async function generateSomaticPrompt(
  userId: string,
  sessionId: string,
  userMessage: string,
  vad: VADOutput,
  currentTurn: number,
): Promise<string | null> {
  try {
    // Check if we should trigger a somatic prompt
    const shouldTrigger = await shouldTriggerSomaticPrompt(userId, sessionId, vad, currentTurn)
    if (!shouldTrigger) {
      return null
    }

    // Determine feeling name based on VAD values
    let feelingName = "feeling"

    // Simple mapping of VAD to feeling names for MVP
    if (vad.valence < -0.5 && vad.arousal > 0.7) {
      feelingName = "distress"
    } else if (vad.valence < -0.3 && vad.arousal > 0.5) {
      feelingName = "tension"
    } else if (vad.valence < -0.3 && vad.arousal < 0.4) {
      feelingName = "heaviness"
    } else if (vad.valence > 0.5 && vad.arousal > 0.7) {
      feelingName = "excitement"
    } else if (vad.valence > 0.5 && vad.arousal < 0.4) {
      feelingName = "contentment"
    } else if (vad.arousal > 0.6) {
      feelingName = "intensity"
    }

    // Generate the somatic prompt using the template system
    const prompt = await getTemplatedResponse(
      "somatic_body_cue_prompt",
      {
        userId,
        sessionId,
        user_message: userMessage,
        feeling_name: feelingName,
        valence: vad.valence,
        arousal: vad.arousal,
      },
      { useLlmAssistance: true },
    )

    // Update session state
    const redis = getRedisClient()
    await redis.set(`${userId}:${sessionId}:${SESSION_KEY_LAST_SOMATIC_PROMPT}`, currentTurn.toString(), {
      ex: SESSION_TTL,
    })
    await redis.set(`${userId}:${sessionId}:${SESSION_KEY_AWAITING_SOMATIC_RESPONSE}`, "true", { ex: SESSION_TTL })

    logger.info(`Generated somatic prompt for user ${userId}: ${prompt}`)
    return prompt
  } catch (error) {
    logger.error(`Error in generateSomaticPrompt: ${error}`)
    return null
  }
}

/**
 * Check if we're awaiting a response to a somatic prompt
 * @param userId User ID
 * @param sessionId Session ID
 * @returns Promise resolving to true if awaiting a somatic response
 */
export async function isAwaitingSomaticResponse(userId: string, sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const awaitingResponse = await redis.get(`${userId}:${sessionId}:${SESSION_KEY_AWAITING_SOMATIC_RESPONSE}`)
    return awaitingResponse === "true"
  } catch (error) {
    logger.error(`Error in isAwaitingSomaticResponse: ${error}`)
    return false
  }
}

/**
 * Generate an acknowledgment for a somatic response
 * @param userId User ID
 * @param sessionId Session ID
 * @returns Promise resolving to the acknowledgment text
 */
export async function generateSomaticAcknowledgment(userId: string, sessionId: string): Promise<string> {
  try {
    // Generate the acknowledgment using the template system
    const acknowledgment = await getTemplatedResponse("somatic_response_ack", {
      userId,
      sessionId,
      user_message: "", // Intentionally empty - we don't process this message
    })

    // Reset the awaiting response flag
    const redis = getRedisClient()
    await redis.del(`${userId}:${sessionId}:${SESSION_KEY_AWAITING_SOMATIC_RESPONSE}`)

    logger.info(`Generated somatic acknowledgment for user ${userId}: ${acknowledgment}`)
    return acknowledgment
  } catch (error) {
    logger.error(`Error in generateSomaticAcknowledgment: ${error}`)

    // Fallback acknowledgment
    return "Thank you for that observation."
  }
}

/**
 * Reset the somatic prompting state for a session
 * @param userId User ID
 * @param sessionId Session ID
 */
export async function resetSomaticState(userId: string, sessionId: string): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.del(`${userId}:${sessionId}:${SESSION_KEY_LAST_SOMATIC_PROMPT}`)
    await redis.del(`${userId}:${sessionId}:${SESSION_KEY_AWAITING_SOMATIC_RESPONSE}`)

    logger.info(`Reset somatic state for user ${userId}, session ${sessionId}`)
  } catch (error) {
    logger.error(`Error in resetSomaticState: ${error}`)
  }
}
