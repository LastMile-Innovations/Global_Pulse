import { logger } from "../utils/logger"
import { checkConsent } from "../ethics/consent"
import { getEngagementMode } from "../session/mode-manager"
import type { KgService } from "../db/graph/kg-service"

/**
 * Conditionally logs detailed EWEF analysis data based on user consent and current mode
 *
 * @param params Object containing all necessary parameters for conditional logging
 * @returns Promise<boolean> indicating if logging was performed
 */
export async function conditionallyLogDetailedAnalysis(params: {
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
    mhhSource: string
    mhhPerspective: string
    mhhTimeframe: string
    mhhAcceptanceState: string
    pValuationShiftEstimate: number
    pPowerLevel: number
    pAppraisalConfidence: number
  }
  reactionData: {
    valence: number
    arousal: number
    dominance: number
    confidence: number
  }
}): Promise<boolean> {
  const { userId, interactionId, currentMode, kgService, stateData, perceptionData, reactionData } = params

  try {
    // 1. Perform the Dual Condition Check
    const logDetailsConsent = await checkConsent(userId, "consentDetailedAnalysisLogging", kgService)
    const shouldLogDetails = currentMode === "insight" && logDetailsConsent

    // 2. Conditionally Call Instance Creation
    if (shouldLogDetails) {
      logger.info(`[Conditional Logging] Conditions met for Interaction ${interactionId}. Logging details.`)

      // Check for training consent before creating instances
      const trainingConsent = await checkConsent(userId, "consentAnonymizedPatternTraining", kgService)

      try {
        // Pass training consent directly to createEWEFProcessingInstances
        await kgService.createEWEFProcessingInstances(
          userId,
          interactionId,
          {
            moodEstimate: stateData.moodEstimate,
            stressEstimate: stateData.stressEstimate,
          },
          {
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
          },
          trainingConsent, // Pass training consent directly
        )

        if (trainingConsent) {
          logger.info(
            `[Conditional Logging] Consent OK: Instances created with eligibleForTraining=true for Interaction ${interactionId}.`,
          )
        } else {
          logger.info(
            `[Conditional Logging] Training consent denied: Instances created with eligibleForTraining=false for Interaction ${interactionId}.`,
          )
        }

        return true
      } catch (error) {
        logger.error(`[Conditional Logging] Error during KG update for Interaction ${interactionId}:`, error)
        return false
      }
    } else {
      logger.info(
        `[Conditional Logging] Conditions NOT met for Interaction ${interactionId}. ` +
          `Skipping detailed logging. (Mode: ${currentMode}, Consent: ${logDetailsConsent})`,
      )
      return false
    }
  } catch (error) {
    logger.error(`[Conditional Logging] Unexpected error during conditional logging check:`, error)
    return false
  }
}

/**
 * Checks if detailed EWEF logging should be performed
 *
 * @param userId User ID
 * @param sessionId Session ID
 * @param kgService Optional KgService instance
 * @returns Promise<boolean> indicating if detailed logging should be performed
 */
export async function shouldLogDetailedEwef(
  userId: string,
  sessionId: string,
  kgService?: KgService,
): Promise<boolean> {
  try {
    // Get the current engagement mode
    const currentMode = await getEngagementMode(userId, sessionId)

    // Check if the user has consented to detailed analysis logging
    const logDetailsConsent = await checkConsent(userId, "consentDetailedAnalysisLogging", kgService)

    // Only log details if in insight mode and user has consented
    return currentMode === "insight" && logDetailsConsent
  } catch (error) {
    logger.error(`[Conditional Logging] Error checking if detailed EWEF should be logged: ${error}`)
    return false
  }
}

/**
 * Checks if data should be flagged for training
 *
 * @param userId User ID
 * @param sessionId Session ID
 * @param kgService Optional KgService instance
 * @returns Promise<boolean> indicating if data should be flagged for training
 */
export async function shouldFlagForTraining(
  userId: string,
  sessionId: string,
  kgService?: KgService,
): Promise<boolean> {
  try {
    // Check if the user has consented to anonymized pattern training
    return await checkConsent(userId, "consentAnonymizedPatternTraining", kgService)
  } catch (error) {
    logger.error(`[Conditional Logging] Error checking if data should be flagged for training: ${error}`)
    return false
  }
}

/**
 * Checks if data should be flagged for aggregation
 *
 * @param userId User ID
 * @param sessionId Session ID
 * @param kgService Optional KgService instance
 * @returns Promise<boolean> indicating if data should be flagged for aggregation
 */
export async function shouldFlagForAggregation(
  userId: string,
  sessionId: string,
  kgService?: KgService,
): Promise<boolean> {
  try {
    // Check if the user has consented to data aggregation
    return await checkConsent(userId, "consentAggregation", kgService)
  } catch (error) {
    logger.error(`[Conditional Logging] Error checking if data should be flagged for aggregation: ${error}`)
    return false
  }
}
