import { logger } from "./logger"
import type { KgService } from "../db/graph/kg-service"
import { getUserConsent } from "../ethics/consent"

/**
 * Conditionally logs detailed analysis data based on user consent and current mode
 */
export async function conditionallyLogDetailedAnalysis({
  userId,
  sessionId,
  interactionId,
  currentMode,
  kgService,
  stateData,
  perceptionData,
  reactionData,
}: {
  userId: string
  sessionId: string
  interactionId: string
  currentMode: string
  kgService: KgService
  stateData: {
    moodEstimate: number
    stressEstimate: number
  }
  perceptionData: {
    pValuationShiftEstimate: number
    pPowerLevel: number
    pAppraisalConfidence: number
    mhhSource: string
    mhhPerspective: string
    mhhTimeframe: string
    mhhAcceptanceState: string
  }
  reactionData: {
    valence: number
    arousal: number
    dominance: number
    confidence: number
  }
}): Promise<void> {
  try {
    // Check if user has consented to detailed logging
    const userConsent = await getUserConsent(userId)

    // Only log detailed analysis if user has consented and we're in insight mode
    if (userConsent?.allowDetailedLogging && currentMode === "insight") {
      logger.info(`Logging detailed EWEF analysis for user ${userId}, session ${sessionId}`)

      // Log to knowledge graph
      await kgService.logDetailedAnalysis({
        userID: userId,
        sessionID: sessionId,
        interactionID: interactionId,
        stateData,
        perceptionData,
        reactionData,
      })
    } else {
      logger.info(
        `Skipping detailed EWEF analysis logging for user ${userId} (consent: ${userConsent?.allowDetailedLogging}, mode: ${currentMode})`,
      )
    }
  } catch (error) {
    logger.error(`Error in conditionallyLogDetailedAnalysis: ${error}`)
  }
}
