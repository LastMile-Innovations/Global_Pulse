import { logger } from "../utils/logger"
import { calculateLinearVad } from "../pce/ewef-core-engine/linear-model"
import { getTemplatedResponse } from "../responses/template-filler"
import type { KgService } from "../db/graph/kg-service"
import {
  GUARDRAIL_VAD_VALENCE_MIN,
  GUARDRAIL_VAD_AROUSAL_MAX,
  GUARDRAIL_VAD_DOMINANCE_MIN,
  GUARDRAIL_MANIPULATION_KEYWORDS,
  GuardrailAlertType,
} from "./guardrails-config"
import type { PInstanceData, RuleVariables, BootstrappedEP } from "../types/pce-types"

/**
 * Interface for the guardrail check result
 */
export interface GuardrailCheckResult {
  /**
   * Whether the response passed the guardrail checks
   */
  passed: boolean

  /**
   * The final response text (original if passed, fallback if failed)
   */
  finalResponseText: string

  /**
   * Alert data if the check failed
   */
  alertData?: {
    alertType: GuardrailAlertType
    triggeringData: string
    candidateResponseSnippet: string
  }
}

/**
 * Interface for the guardrail check context
 */
export interface GuardrailCheckContext {
  /**
   * User ID
   */
  userID: string

  /**
   * Session ID
   */
  sessionID: string

  /**
   * Interaction ID
   */
  interactionID: string

  /**
   * User's current mood estimate (0.0 to 1.0)
   */
  moodEstimate: number

  /**
   * User's current stress estimate (0.0 to 1.0)
   */
  stressEstimate: number
}

/**
 * Guardrails service for ethical checks on AI responses
 */
export class GuardrailsService {
  private kgService: KgService

  constructor(kgService: KgService) {
    this.kgService = kgService
  }

  /**
   * Apply guardrail checks to a candidate response
   * @param candidateResponseText The candidate response text from the LLM
   * @param context The context for the guardrail checks
   * @returns The guardrail check result
   */
  async applyGuardrails(candidateResponseText: string, context: GuardrailCheckContext): Promise<GuardrailCheckResult> {
    try {
      // 1. Check for well-being risk
      const wellbeingResult = await this.checkWellbeingRisk(candidateResponseText, context)
      if (wellbeingResult.riskDetected) {
        return this.handleRiskDetected(
          candidateResponseText,
          context,
          GuardrailAlertType.WELLBEING_RISK_MVP,
          JSON.stringify(wellbeingResult.triggeringData),
        )
      }

      // 2. Check for manipulation risk
      const manipulationResult = this.checkManipulationRisk(candidateResponseText)
      if (manipulationResult.riskDetected) {
        return this.handleRiskDetected(
          candidateResponseText,
          context,
          GuardrailAlertType.MANIPULATION_RISK_MVP,
          JSON.stringify(manipulationResult.triggeringData),
        )
      }

      // All checks passed
      return {
        passed: true,
        finalResponseText: candidateResponseText,
      }
    } catch (error) {
      logger.error(`Error applying guardrails: ${error}`)

      // In case of error, fail safe by returning the fallback response
      const fallbackText = await this.getFallbackResponse(context)
      return {
        passed: false,
        finalResponseText: fallbackText,
        alertData: {
          alertType: GuardrailAlertType.WELLBEING_RISK_MVP,
          triggeringData: JSON.stringify({ error: "Error applying guardrails" }),
          candidateResponseSnippet: this.truncateResponseForLogging(candidateResponseText),
        },
      }
    }
  }

  /**
   * Check for well-being risk using predictive VAD
   * @param candidateResponseText The candidate response text
   * @param context The context for the check
   * @returns The check result
   */
  private async checkWellbeingRisk(
    candidateResponseText: string,
    context: GuardrailCheckContext,
  ): Promise<{
    riskDetected: boolean
    triggeringData?: {
      predictedVAD: { valence: number; arousal: number; dominance: number; confidence: number }
      thresholdBreached: string[]
    }
  }> {
    try {
      // Create a minimal PInstanceData for the predictive VAD calculation
      const pInstanceData: PInstanceData = {
        mhhSource: "external", // Response is coming from external source (the AI)
        mhhPerspective: "self", // From user's perspective
        mhhTimeframe: "present", // Present timeframe for immediate reaction
        mhhAcceptanceState: "uncertain", // Uncertain acceptance state
        pValuationShiftEstimate: 0, // Will be calculated by the model
        pPowerLevel: 0.5, // Neutral power level
        pAppraisalConfidence: 0.7, // Moderate confidence
      }

      // Minimal rule variables
      const ruleVariables: RuleVariables = {
        source: { value: "external", confidence: 1.0 },
        perspective: { value: "self", confidence: 1.0 },
        timeframe: { value: "present", confidence: 1.0 },
        acceptanceState: { value: "uncertain", confidence: 0.5 },
      }

      // No bootstrapped EPs for MVP
      const activeBootstrappedEPs: BootstrappedEP[] = []

      // Use sentiment from the candidate response as a proxy
      // In a real implementation, this would be a more sophisticated analysis
      const sentimentScore = 0.5 // Neutral sentiment for MVP

      // Calculate predicted VAD
      const predictedVAD = calculateLinearVad(pInstanceData, ruleVariables, activeBootstrappedEPs, sentimentScore)

      // Check against thresholds
      const thresholdBreached: string[] = []

      if (predictedVAD.valence < GUARDRAIL_VAD_VALENCE_MIN) {
        thresholdBreached.push(`Valence < ${GUARDRAIL_VAD_VALENCE_MIN}`)
      }

      if (predictedVAD.arousal > GUARDRAIL_VAD_AROUSAL_MAX) {
        thresholdBreached.push(`Arousal > ${GUARDRAIL_VAD_AROUSAL_MAX}`)
      }

      if (predictedVAD.dominance < GUARDRAIL_VAD_DOMINANCE_MIN) {
        thresholdBreached.push(`Dominance < ${GUARDRAIL_VAD_DOMINANCE_MIN}`)
      }

      return {
        riskDetected: thresholdBreached.length > 0,
        triggeringData: {
          predictedVAD,
          thresholdBreached,
        },
      }
    } catch (error) {
      logger.error(`Error checking well-being risk: ${error}`)

      // Fail safe by returning risk detected
      return {
        riskDetected: true,
        triggeringData: {
          predictedVAD: { valence: 0, arousal: 0, dominance: 0, confidence: 0 },
          thresholdBreached: ["Error in well-being check"],
        },
      }
    }
  }

  /**
   * Check for manipulation risk using keyword/pattern matching
   * @param candidateResponseText The candidate response text
   * @returns The check result
   */
  private checkManipulationRisk(candidateResponseText: string): {
    riskDetected: boolean
    triggeringData?: {
      matchedPatterns: string[]
    }
  } {
    try {
      const lowerCaseText = candidateResponseText.toLowerCase()
      const matchedPatterns: string[] = []

      // Check for each keyword/pattern
      for (const keyword of GUARDRAIL_MANIPULATION_KEYWORDS) {
        if (lowerCaseText.includes(keyword.toLowerCase())) {
          matchedPatterns.push(keyword)
        }
      }

      return {
        riskDetected: matchedPatterns.length > 0,
        triggeringData: {
          matchedPatterns,
        },
      }
    } catch (error) {
      logger.error(`Error checking manipulation risk: ${error}`)

      // Fail safe by returning risk detected
      return {
        riskDetected: true,
        triggeringData: {
          matchedPatterns: ["Error in manipulation check"],
        },
      }
    }
  }

  /**
   * Handle a detected risk
   * @param candidateResponseText The original candidate response text
   * @param context The context for the check
   * @param alertType The type of alert
   * @param triggeringData The triggering data as a JSON string
   * @returns The guardrail check result
   */
  private async handleRiskDetected(
    candidateResponseText: string,
    context: GuardrailCheckContext,
    alertType: GuardrailAlertType,
    triggeringData: string,
  ): Promise<GuardrailCheckResult> {
    // Get the fallback response
    const fallbackText = await this.getFallbackResponse(context)

    // Truncate the candidate response for logging
    const candidateResponseSnippet = this.truncateResponseForLogging(candidateResponseText)

    // Log the guardrail alert
    try {
      await this.kgService.logGuardrailAlert({
        userID: context.userID,
        interactionID: context.interactionID,
        alertType,
        triggeringData,
        candidateResponseSnippet,
      })
    } catch (error) {
      logger.error(`Error logging guardrail alert: ${error}`)
    }

    // Return the fallback response
    return {
      passed: false,
      finalResponseText: fallbackText,
      alertData: {
        alertType,
        triggeringData,
        candidateResponseSnippet,
      },
    }
  }

  /**
   * Get the fallback response
   * @param context The context for the response
   * @returns The fallback response text
   */
  private async getFallbackResponse(context: GuardrailCheckContext): Promise<string> {
    try {
      // Get the generic safe response template
      return await getTemplatedResponse("generic_safe_response", {
        userId: context.userID,
        sessionId: context.sessionID,
        user_message: "", // No user message needed for generic response
      })
    } catch (error) {
      logger.error(`Error getting fallback response: ${error}`)

      // Hardcoded fallback in case of error
      return "I understand. Let's continue our conversation."
    }
  }

  /**
   * Truncate the candidate response for logging
   * @param text The text to truncate
   * @param maxLength The maximum length (default: 100)
   * @returns The truncated text
   */
  private truncateResponseForLogging(text: string, maxLength = 100): string {
    if (text.length <= maxLength) {
      return text
    }
    return text.substring(0, maxLength) + "..."
  }
}
