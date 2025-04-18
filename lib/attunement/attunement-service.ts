import { getRedisClient } from "../db/redis/redis-client"
import { getTemplatedResponse, type TemplateContextParams } from "../responses/template-filler"
import { generateLlmResponseViaSdk } from "../llm/llm-gateway"
import { logger } from "../utils/logger"
import {
  BASE_RESPONSE_DELAY_MS,
  COMPLEX_RESPONSE_ADDITIONAL_DELAY_MS,
  FELT_COHERENCE_CHECKIN_PROBABILITY,
  HIGH_DISTRESS_AROUSAL_THRESHOLD,
  HIGH_DISTRESS_VALENCE_THRESHOLD,
  HIGH_STRESS_ADDITIONAL_DELAY_MS,
  HIGH_STRESS_THRESHOLD,
  MAX_RESPONSE_DELAY_MS,
  MIN_RESPONSE_DELAY_MS,
  MIN_TURNS_BETWEEN_CHECKINS,
  MIN_VAD_CONFIDENCE,
} from "./attunement-config"
import type { VADOutput } from "../types/pce-types"
import type { UncertaintyDetectionResult } from "../nlp/uncertainty-detection"

/**
 * Session state keys for attunement
 */
const SESSION_KEY_LAST_CHECKIN = "lastCoherenceCheckinTurn"
const SESSION_KEY_LISTENING_MODE = "listeningMode"
const SESSION_KEY_LAST_UNCERTAINTY_VALIDATION = "lastUncertaintyValidationTurn"

/**
 * User state hint categories
 */
export type UserStateHint =
  | "calm_positive"
  | "calm_neutral"
  | "calm_negative"
  | "activated_positive"
  | "activated_neutral"
  | "activated_negative"
  | "high_distress"

/**
 * Response source options
 */
export type ResponseSource = "template" | "llm"

/**
 * Template intent options
 */
export type TemplateIntent =
  | "validate_uncertainty"
  | "validate_high_distress"
  | "listening_ack"
  | "felt_coherence_checkin"
  | "generic_safe_response"

/**
 * Calculate the appropriate response delay based on user state
 * @param stressEstimate User's stress estimate (0.0 to 1.0)
 * @param isComplexResponse Whether the response is complex
 * @returns Delay in milliseconds
 */
export function calculateResponseDelay(stressEstimate: number, isComplexResponse: boolean): number {
  let delay = BASE_RESPONSE_DELAY_MS

  // Add delay for high stress
  if (stressEstimate > HIGH_STRESS_THRESHOLD) {
    delay += HIGH_STRESS_ADDITIONAL_DELAY_MS
  }

  // Add delay for complex responses
  if (isComplexResponse) {
    delay += COMPLEX_RESPONSE_ADDITIONAL_DELAY_MS
  }

  // Ensure delay is within bounds
  return Math.max(MIN_RESPONSE_DELAY_MS, Math.min(MAX_RESPONSE_DELAY_MS, delay))
}

/**
 * Determine the user state hint based on VAD values
 * @param vad VAD output from PCE
 * @returns User state hint
 */
export function determineUserStateHint(vad: VADOutput): UserStateHint {
  const { valence, arousal, dominance, confidence } = vad

  // If confidence is too low, default to neutral
  if (confidence < MIN_VAD_CONFIDENCE) {
    return "calm_neutral"
  }

  // Check for high distress
  if (valence < HIGH_DISTRESS_VALENCE_THRESHOLD && arousal > HIGH_DISTRESS_AROUSAL_THRESHOLD) {
    return "high_distress"
  }

  // Determine valence category
  const valenceCategory = valence > 0.3 ? "positive" : valence < -0.3 ? "negative" : "neutral"

  // Determine arousal category
  const arousalCategory = arousal > 0.5 ? "activated" : "calm"

  // Combine categories
  if (arousalCategory === "activated" && valenceCategory === "negative") {
    return "activated_negative"
  } else if (arousalCategory === "activated" && valenceCategory === "positive") {
    return "activated_positive"
  } else if (arousalCategory === "activated") {
    return "activated_neutral"
  } else if (valenceCategory === "positive") {
    return "calm_positive"
  } else if (valenceCategory === "negative") {
    return "calm_negative"
  } else {
    return "calm_neutral"
  }
}

/**
 * Determine the appropriate response source and template intent
 * @param userStateHint User state hint
 * @param uncertaintyResult Uncertainty detection result
 * @param isListeningMode Whether the user is in listening mode
 * @returns Response source and template intent (if applicable)
 */
export function determineResponseSource(
  userStateHint: UserStateHint,
  uncertaintyResult: UncertaintyDetectionResult,
  isListeningMode: boolean,
): { source: ResponseSource; templateIntent?: TemplateIntent } {
  // Check for uncertainty first (highest priority)
  if (uncertaintyResult.isExpressingUncertainty) {
    return { source: "template", templateIntent: "validate_uncertainty" }
  }

  // Check for high distress
  if (userStateHint === "high_distress") {
    return { source: "template", templateIntent: "validate_high_distress" }
  }

  // Check for listening mode
  if (isListeningMode) {
    return { source: "template", templateIntent: "listening_ack" }
  }

  // Default to LLM
  return { source: "llm" }
}

/**
 * Get the appropriate system prompt based on user state hint
 * @param userStateHint User state hint
 * @param wasLastTurnUncertaintyValidation Whether the last turn was an uncertainty validation
 * @returns System prompt for LLM
 */
export function getSystemPromptForState(
  userStateHint: UserStateHint,
  wasLastTurnUncertaintyValidation = false,
): string {
  // If the last turn was an uncertainty validation, use a gentler follow-up prompt
  if (wasLastTurnUncertaintyValidation) {
    return `You are Pulse, an AI companion focused on supporting users through moments of uncertainty.
When responding after a user has expressed uncertainty:
- Maintain a gentle, supportive tone
- Avoid asking demanding or probing questions
- Don't push for specific answers they might not have
- Offer space for reflection without pressure
- Consider shifting to a slightly different aspect if helpful
- Prioritize creating a safe space over gathering information`
  }

  // Otherwise, use the standard prompts based on state
  switch (userStateHint) {
    case "high_distress":
      return `You are Pulse, an AI companion focused on supporting users through difficult moments. 
When responding to users in distress:
- Keep responses brief and supportive
- Validate their feelings without minimizing them
- Avoid giving advice or trying to fix their problems
- Use a calm, steady tone
- Focus on listening and understanding rather than problem-solving
- Prioritize safety and emotional support above all else`

    case "activated_negative":
      return `You are Pulse, an AI companion focused on supporting users through challenging moments.
When responding to users experiencing difficult emotions:
- Validate their feelings and experiences
- Maintain a balanced, supportive tone
- Listen attentively and reflect their concerns
- Respond with empathy and patience
- Allow space for their emotions without rushing to solutions`

    case "calm_negative":
      return `You are Pulse, an AI companion focused on supporting users through reflective moments.
When responding to users in a contemplative or slightly negative state:
- Match their thoughtful pace
- Acknowledge their perspective
- Ask gentle questions that encourage reflection
- Maintain a calm, supportive presence
- Allow space for nuanced exploration of their thoughts`

    case "activated_positive":
      return `You are Pulse, an AI companion focused on supporting users through energetic moments.
When responding to users in an enthusiastic state:
- Match their energy while maintaining thoughtfulness
- Acknowledge their positive feelings
- Ask questions that help explore their excitement
- Maintain a warm, engaged presence
- Support their momentum while encouraging reflection`

    case "calm_positive":
      return `You are Pulse, an AI companion focused on supporting users through positive reflective moments.
When responding to users in a content, reflective state:
- Match their thoughtful, positive pace
- Acknowledge their perspective with warmth
- Ask questions that deepen their reflection
- Maintain a gentle, supportive presence
- Allow space for savoring positive experiences`

    default:
      return `You are Pulse, an AI companion focused on supporting users through self-discovery.
When responding to users:
- Be curious and attentive to their experiences
- Ask thoughtful questions that encourage reflection
- Maintain a balanced, supportive tone
- Respond with empathy and patience
- Focus on understanding rather than advising`
  }
}

/**
 * Check if a felt coherence check-in should be triggered
 * @param userId User ID
 * @param sessionId Session ID
 * @param currentTurn Current turn number
 * @returns Promise resolving to true if a check-in should be triggered
 */
export async function shouldTriggerCoherenceCheckin(
  userId: string,
  sessionId: string,
  currentTurn: number,
): Promise<boolean> {
  try {
    // Check if we're in a special mode that should prevent check-ins
    const redis = getRedisClient()
    const isListeningMode = await redis.get(`${userId}:${sessionId}:${SESSION_KEY_LISTENING_MODE}`)

    if (isListeningMode === "true") {
      return false
    }

    // Check when the last check-in occurred
    const lastCheckinTurnStr = await redis.get(`${userId}:${sessionId}:${SESSION_KEY_LAST_CHECKIN}`)

    if (lastCheckinTurnStr) {
      const lastCheckinTurn = Number.parseInt(lastCheckinTurnStr as string, 10)
      const turnsSinceLastCheckin = currentTurn - lastCheckinTurn

      if (turnsSinceLastCheckin < MIN_TURNS_BETWEEN_CHECKINS) {
        return false
      }
    }

    // Apply probability factor
    if (Math.random() > FELT_COHERENCE_CHECKIN_PROBABILITY) {
      return false
    }

    return true
  } catch (error) {
    logger.error(`Error in shouldTriggerCoherenceCheckin: ${error}`)
    return false
  }
}

/**
 * Generate a felt coherence check-in prompt
 * @param userId User ID
 * @param sessionId Session ID
 * @param currentTurn Current turn number
 * @returns Promise resolving to the check-in prompt text, or null if no check-in should be triggered
 */
export async function generateCoherenceCheckin(
  userId: string,
  sessionId: string,
  currentTurn: number,
): Promise<string | null> {
  try {
    // Check if we should trigger a check-in
    const shouldTrigger = await shouldTriggerCoherenceCheckin(userId, sessionId, currentTurn)

    if (!shouldTrigger) {
      return null
    }

    // Generate the check-in prompt using the template system
    const prompt = await getTemplatedResponse("felt_coherence_checkin", {
      userId,
      sessionId,
      user_message: "", // Not needed for this template
    })

    // Update session state
    const redis = getRedisClient()
    await redis.set(`${userId}:${sessionId}:${SESSION_KEY_LAST_CHECKIN}`, currentTurn.toString(), { ex: 3600 }) // 1 hour TTL

    logger.info(`Generated coherence check-in for user ${userId}`)
    return prompt
  } catch (error) {
    logger.error(`Error in generateCoherenceCheckin: ${error}`)
    return null
  }
}

/**
 * Check if the last turn was an uncertainty validation
 * @param userId User ID
 * @param sessionId Session ID
 * @param currentTurn Current turn number
 * @returns Promise resolving to true if the last turn was an uncertainty validation
 */
export async function wasLastTurnUncertaintyValidation(
  userId: string,
  sessionId: string,
  currentTurn: number,
): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const lastUncertaintyTurnStr = await redis.get(`${userId}:${sessionId}:${SESSION_KEY_LAST_UNCERTAINTY_VALIDATION}`)

    if (!lastUncertaintyTurnStr) {
      return false
    }

    const lastUncertaintyTurn = Number.parseInt(lastUncertaintyTurnStr as string, 10)
    return lastUncertaintyTurn === currentTurn - 1
  } catch (error) {
    logger.error(`Error in wasLastTurnUncertaintyValidation: ${error}`)
    return false
  }
}

/**
 * Record that an uncertainty validation was sent
 * @param userId User ID
 * @param sessionId Session ID
 * @param currentTurn Current turn number
 */
export async function recordUncertaintyValidation(
  userId: string,
  sessionId: string,
  currentTurn: number,
): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.set(
      `${userId}:${sessionId}:${SESSION_KEY_LAST_UNCERTAINTY_VALIDATION}`,
      currentTurn.toString(),
      { ex: 3600 }, // 1 hour TTL
    )

    logger.info(`Recorded uncertainty validation for user ${userId} at turn ${currentTurn}`)
  } catch (error) {
    logger.error(`Error in recordUncertaintyValidation: ${error}`)
  }
}

/**
 * Generate a response using the appropriate source
 * @param userId User ID
 * @param sessionId Session ID
 * @param userMessage User's message
 * @param vad VAD output from PCE
 * @param uncertaintyResult Uncertainty detection result
 * @param isListeningMode Whether the user is in listening mode
 * @param currentTurn Current turn number
 * @returns Promise resolving to the response text and metadata
 */
export async function generateAttunedResponse(
  userId: string,
  sessionId: string,
  userMessage: string,
  vad: VADOutput,
  uncertaintyResult: UncertaintyDetectionResult,
  isListeningMode: boolean,
  currentTurn: number,
): Promise<{ response: string; source: ResponseSource; delay: number }> {
  try {
    // Check if we should trigger a coherence check-in
    const coherenceCheckin = await generateCoherenceCheckin(userId, sessionId, currentTurn)

    if (coherenceCheckin) {
      // Use a short delay for check-ins
      return {
        response: coherenceCheckin,
        source: "template",
        delay: MIN_RESPONSE_DELAY_MS,
      }
    }

    // Determine user state hint
    const userStateHint = determineUserStateHint(vad)
    logger.info(`Determined user state hint: ${userStateHint}`)

    // Determine response source
    const { source, templateIntent } = determineResponseSource(userStateHint, uncertaintyResult, isListeningMode)
    logger.info(`Selected response source: ${source}${templateIntent ? `, template: ${templateIntent}` : ""}`)

    let response: string
    let isComplexResponse = false

    if (source === "template" && templateIntent) {
      // Generate response from template
      const templateParams: Record<string, any> = {
        userId,
        sessionId,
        user_message: userMessage,
        valence: vad.valence,
        arousal: vad.arousal,
      }

      // Add uncertainty topic if available
      if (templateIntent === "validate_uncertainty" && uncertaintyResult.uncertaintyTopic) {
        templateParams.topic_or_feeling = uncertaintyResult.uncertaintyTopic
      }

      response = await getTemplatedResponse(templateIntent, templateParams as TemplateContextParams, { useLlmAssistance: true })

      // Record if this was an uncertainty validation
      if (templateIntent === "validate_uncertainty") {
        await recordUncertaintyValidation(userId, sessionId, currentTurn)
      }

      // Template responses are generally not complex
      isComplexResponse = false
    } else {
      // Check if the last turn was an uncertainty validation
      const wasUncertaintyValidation = await wasLastTurnUncertaintyValidation(userId, sessionId, currentTurn)

      // Generate response from LLM
      const systemPrompt = getSystemPromptForState(userStateHint, wasUncertaintyValidation)

      const llmResponse = await generateLlmResponseViaSdk(userMessage, {
        systemPrompt,
        temperature: userStateHint === "high_distress" ? 0.2 : 0.5, // Lower temperature for distress
        maxTokens: userStateHint === "high_distress" ? 100 : 200, // Shorter responses for distress
      })

      if (!llmResponse.success || !llmResponse.text) {
        // Fall back to generic safe response if LLM fails
        response = await getTemplatedResponse("generic_safe_response", {
          userId,
          sessionId,
          user_message: userMessage,
        })
        isComplexResponse = false
      } else {
        response = llmResponse.text
        // LLM responses are generally more complex
        isComplexResponse = true
      }
    }

    // Calculate appropriate delay
    const delay = calculateResponseDelay(vad.arousal, isComplexResponse)

    return {
      response,
      source,
      delay,
    }
  } catch (error) {
    logger.error(`Error in generateAttunedResponse: ${error}`)

    // Fall back to generic safe response
    const fallbackResponse = await getTemplatedResponse("generic_safe_response", {
      userId,
      sessionId,
      user_message: userMessage,
    })

    return {
      response: fallbackResponse,
      source: "template",
      delay: BASE_RESPONSE_DELAY_MS,
    }
  }
}

/**
 * Check if the user is in listening mode
 * @param userId User ID
 * @param sessionId Session ID
 * @returns Promise resolving to true if the user is in listening mode
 */
export async function isInListeningMode(userId: string, sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const listeningMode = await redis.get(`${userId}:${sessionId}:${SESSION_KEY_LISTENING_MODE}`)
    return listeningMode === "true"
  } catch (error) {
    logger.error(`Error in isInListeningMode: ${error}`)
    return false
  }
}

/**
 * Set the listening mode state
 * @param userId User ID
 * @param sessionId Session ID
 * @param active Whether listening mode is active
 */
export async function setListeningMode(userId: string, sessionId: string, active: boolean): Promise<void> {
  try {
    const redis = getRedisClient()

    if (active) {
      await redis.set(`${userId}:${sessionId}:${SESSION_KEY_LISTENING_MODE}`, "true", { ex: 3600 }) // 1 hour TTL
    } else {
      await redis.del(`${userId}:${sessionId}:${SESSION_KEY_LISTENING_MODE}`)
    }

    logger.info(`Set listening mode to ${active} for user ${userId}`)
  } catch (error) {
    logger.error(`Error in setListeningMode: ${error}`)
  }
}
