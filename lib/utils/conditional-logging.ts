import { logger } from "./logger"
import type { KgService } from "../db/graph/kg-service"
import { checkConsent } from "../ethics/consent"
import type { PInstanceData } from "../types/pce-types"

/**
 * Conditionally logs detailed EWEF analysis data based on user consent and current mode.
 * Returns true if logging occurred, false otherwise.
 */
export async function conditionallyLogDetailedAnalysis(params: {
  userId: string
  sessionId: string
  interactionId: string
  currentMode: string
  kgService: KgService
  stateData: { moodEstimate: number; stressEstimate: number }
  perceptionData: PInstanceData
  reactionData: {
    valence: number
    arousal: number
    dominance: number
    confidence: number
  }
}): Promise<boolean> {
  const {
    userId,
    sessionId,
    interactionId,
    currentMode,
    kgService,
    stateData,
    perceptionData,
    reactionData,
  } = params

  try {
    const hasConsent = await checkConsent(userId, "consentDetailedAnalysisLogging")

    if (!hasConsent) {
      logger.debug(
        `User ${userId} has not consented to detailed analysis logging (session: ${sessionId}).`
      )
      return false
    }

    if (currentMode !== "insight") {
      logger.debug(
        `Detailed EWEF analysis logging skipped for user ${userId} (mode: ${currentMode}, session: ${sessionId}).`
      )
      return false
    }

    logger.info(
      `Logging detailed EWEF analysis for user ${userId}, session ${sessionId}, interaction ${interactionId}`
    )

    // Compose perception and reaction data more robustly
    const perception = {
      mhhSource: perceptionData.mhhSource,
      mhhPerspective: perceptionData.mhhPerspective,
      mhhTimeframe: perceptionData.mhhTimeframe,
      mhhAcceptanceState: perceptionData.mhhAcceptanceState,
      pValuationShift: perceptionData.pValuationShiftEstimate,
      pPowerLevel: perceptionData.pPowerLevel,
      pAppraisalConfidence: perceptionData.pAppraisalConfidence,
    }

    const reaction = {
      vadV: reactionData.valence,
      vadA: reactionData.arousal,
      vadD: reactionData.dominance,
      confidence: reactionData.confidence,
    }

    await kgService.createEWEFProcessingInstances(
      userId,
      interactionId,
      stateData,
      perception,
      reaction,
      true // eligibleForTraining
    )

    return true
  } catch (error) {
    logger.error(
      `[Conditional Logging] Error during KG update for Interaction ${params.interactionId}:`,
      error
    )
    return false
  }
}

/**
 * Checks if detailed EWEF logging should occur for a user/session.
 * Returns true if consent is present, false otherwise.
 */
export async function shouldLogDetailedEwef(userId: string, sessionId: string): Promise<boolean> {
  try {
    const hasConsent = await checkConsent(userId, "consentDetailedAnalysisLogging")
    if (!hasConsent) {
      logger.debug(
        `User ${userId} does not have consent for detailed analysis logging in session ${sessionId}`
      )
      return false
    }
    return true
  } catch (error) {
    logger.error(
      `[shouldLogDetailedEwef] Error checking consent for user ${userId}, session ${sessionId}:`,
      error
    )
    return false
  }
}
