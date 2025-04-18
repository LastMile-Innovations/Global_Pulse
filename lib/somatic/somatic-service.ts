import { checkConsent } from "@/lib/ethics/consent"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { SESSION_TTL } from "../session/session-state"
import { getTemplatedResponse } from "../responses/template-filler"
import { logger } from "../utils/logger"
import {
  SOMATIC_PROMPT_MIN_CONFIDENCE,
  SOMATIC_PROMPT_MIN_TURNS_BETWEEN,
  shouldTriggerSomaticPrompt as configShouldTriggerSomaticPrompt,
} from "./somatic-config"
import type { VADOutput } from "../types/pce-types"
import { getTypicalVADProfile } from "../pce/vad-profiles"
import { calculateVADDistance } from "../pce/vad-consistency"

/**
 * Session state keys for somatic prompting
 */
const SESSION_KEY_LAST_SOMATIC_PROMPT = "lastSomaticPromptTurn"
const SESSION_KEY_AWAITING_SOMATIC_RESPONSE = "awaitingSomaticResponse"

/**
 * Check if a somatic prompt should be triggered based on VAD values and user consent.
 * Returns true if all criteria are met, false otherwise.
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
      logger.info(`[Somatic] Not triggered: User ${userId} has not consented to somatic prompts`)
      return false
    }

    // 2. Check VAD confidence
    if (typeof vad.confidence !== "number" || vad.confidence < SOMATIC_PROMPT_MIN_CONFIDENCE) {
      logger.info(`[Somatic] Not triggered: VAD confidence too low (${vad.confidence})`)
      return false
    }

    // 3. Check VAD thresholds and turn count using config logic
    const turnsSinceLastPrompt = await getTurnsSinceLastSomaticPrompt(userId, sessionId, currentTurn)
    const meetsConfig = configShouldTriggerSomaticPrompt(
      vad,
      turnsSinceLastPrompt
    )
    if (!meetsConfig) {
      logger.info(
        `[Somatic] Not triggered: VAD/turns/probability criteria not met (v:${vad.valence}, a:${vad.arousal}, d:${vad.dominance}, conf:${vad.confidence}, turnsSinceLastPrompt:${turnsSinceLastPrompt})`
      )
      return false
    }

    logger.info(`[Somatic] Should be triggered for user ${userId} (v:${vad.valence}, a:${vad.arousal}, d:${vad.dominance}, conf:${vad.confidence}, turnsSinceLastPrompt:${turnsSinceLastPrompt})`)
    return true
  } catch (error) {
    logger.error(`[Somatic] Error in shouldTriggerSomaticPrompt: ${error}`)
    return false
  }
}

/**
 * Helper to get turns since last somatic prompt for a session.
 * Returns a large number if no previous prompt or on error.
 */
async function getTurnsSinceLastSomaticPrompt(
  userId: string,
  sessionId: string,
  currentTurn: number
): Promise<number> {
  try {
    const redis = getRedisClient()
    const key = `${userId}:${sessionId}:${SESSION_KEY_LAST_SOMATIC_PROMPT}`
    const lastPromptTurnStr = await redis.get(key)
    if (typeof lastPromptTurnStr === "string" && lastPromptTurnStr.trim() !== "" && !isNaN(Number(lastPromptTurnStr))) {
      const lastPromptTurn = Number.parseInt(lastPromptTurnStr, 10)
      if (!isNaN(lastPromptTurn)) {
        return Math.max(0, currentTurn - lastPromptTurn)
      }
    }
    // If no previous prompt, return a large number to allow prompt
    return SOMATIC_PROMPT_MIN_TURNS_BETWEEN + 100
  } catch (err) {
    logger.warn(`[Somatic] Could not get last somatic prompt turn: ${err}`)
    // On error, allow prompt
    return SOMATIC_PROMPT_MIN_TURNS_BETWEEN + 100
  }
}

/**
 * Generate a somatic prompt based on the user's emotional state.
 * Returns the prompt string if triggered, or null otherwise.
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
      logger.debug(`[Somatic] generateSomaticPrompt: Not triggered for user ${userId}`)
      return null
    }

    // Determine feeling name based on VAD values using closest typical VAD profile
    let feelingName = "feeling"
    let minDistance = Number.POSITIVE_INFINITY

    // Find the closest typical VAD profile label
    const typicalLabels = Object.keys(getTypicalVADProfile)
    for (const label of typicalLabels) {
      const typical = getTypicalVADProfile(label)
      if (!typical) continue
      const distance = calculateVADDistance(vad, typical)
      if (distance < minDistance) {
        minDistance = distance
        feelingName = label
      }
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

    logger.info(`[Somatic] Generated somatic prompt for user ${userId}: ${prompt}`)
    return prompt
  } catch (error) {
    logger.error(`[Somatic] Error in generateSomaticPrompt: ${error}`)
    return null
  }
}

/**
 * Check if we're awaiting a response to a somatic prompt.
 * Returns true if awaiting, false otherwise.
 */
export async function isAwaitingSomaticResponse(userId: string, sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const key = `${userId}:${sessionId}:${SESSION_KEY_AWAITING_SOMATIC_RESPONSE}`
    const awaitingResponse = await redis.get(key)
    return awaitingResponse === "true"
  } catch (error) {
    logger.error(`[Somatic] Error in isAwaitingSomaticResponse: ${error}`)
    return false
  }
}

/**
 * Generate an acknowledgment for a somatic response and reset the awaiting flag.
 * Returns the acknowledgment text.
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

    logger.info(`[Somatic] Generated somatic acknowledgment for user ${userId}: ${acknowledgment}`)
    return acknowledgment
  } catch (error) {
    logger.error(`[Somatic] Error in generateSomaticAcknowledgment: ${error}`)
    // Fallback acknowledgment
    return "Thank you for that observation."
  }
}

/**
 * Reset the somatic prompting state for a session.
 * Clears both the last prompt turn and awaiting response flags.
 */
export async function resetSomaticState(userId: string, sessionId: string): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.del(`${userId}:${sessionId}:${SESSION_KEY_LAST_SOMATIC_PROMPT}`)
    await redis.del(`${userId}:${sessionId}:${SESSION_KEY_AWAITING_SOMATIC_RESPONSE}`)

    logger.info(`[Somatic] Reset somatic state for user ${userId}, session ${sessionId}`)
  } catch (error) {
    logger.error(`[Somatic] Error in resetSomaticState: ${error}`)
  }
}
