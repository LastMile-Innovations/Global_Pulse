import { logger } from "./logger"
import type { KgService } from "../db/graph/kg-service"
import { checkConsent } from "../ethics/consent"
import { getEngagementMode } from "../session/mode-manager"
import type { PInstanceData } from "../types/pce-types"

/**
 * Conditionally logs detailed analysis data based on user consent and current mode
 */
export async function conditionallyLogDetailedAnalysis(params: {
  userId: string
  sessionId: string
  interactionId: string
  currentMode: string
  kgService: KgService
  stateData: { moodEstimate: number; stressEstimate: number }
  perceptionData: PInstanceData // Use the full PInstanceData type
  reactionData: {
    valence: number
    arousal: number
    dominance: number
    confidence: number
  }
}): Promise<void> {
  const { userId, sessionId, interactionId, currentMode, kgService, stateData, perceptionData, reactionData } = params

  try {
    // Check if user has consented to detailed logging
    const hasConsent = await checkConsent(userId, "consentDetailedAnalysisLogging")

    // Only log detailed analysis if user has consented and we're in insight mode
    if (hasConsent && currentMode === "insight") {
      logger.info(`Logging detailed EWEF analysis for user ${userId}, session ${sessionId}`)

      // Call the correct KgService method
      await kgService.createEWEFProcessingInstances(
        userId,
        interactionId,
        stateData, // Pass moodEstimate and stressEstimate
        { // Explicitly spread properties to match expected structure
          mhhSource: perceptionData.mhhSource,
          mhhPerspective: perceptionData.mhhPerspective,
          mhhTimeframe: perceptionData.mhhTimeframe,
          mhhAcceptanceState: perceptionData.mhhAcceptanceState,
          pValuationShift: perceptionData.pValuationShiftEstimate,
          pPowerLevel: perceptionData.pPowerLevel,
          pAppraisalConfidence: perceptionData.pAppraisalConfidence,
        },
        {
          vadV: reactionData.valence,
          vadA: reactionData.arousal,
          vadD: reactionData.dominance,
          confidence: reactionData.confidence,
        }, // Pass reaction data
        true, // Mark as eligibleForTraining (or adjust based on logic)
      )
    } else {
      logger.debug(
        `Skipping detailed EWEF analysis logging for user ${userId} (consent: ${hasConsent}, mode: ${currentMode})`,
      )
    }
  } catch (error) {
    logger.error(`[Conditional Logging] Error during KG update check/call for Interaction ${interactionId}: ${error}`)
  }
}

export async function shouldLogDetailedEwef(userId: string, sessionId: string): Promise<boolean> {
  // Check 1: User Consent (e.g., for detailed analysis logging)
  const hasConsent = await checkConsent(userId, "consentDetailedAnalysisLogging")
  if (!hasConsent) {
    logger.debug(
      `User ${userId} does not have consent for detailed analysis logging in session ${sessionId}`,
    )
    return false
  }
  return true
}
