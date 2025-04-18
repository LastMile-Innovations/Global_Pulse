import { logger } from "../utils/logger"
import { getLlmPerceptionAppraisal } from "./llm-assistance"
import type { PInstanceData, RuleVariables, BootstrappedEP } from "../types/pce-types"
import { inferMhhVariablesHeuristic } from "./variable-inference"
import { getLlmVariableInference } from "./llm-assistance"
import type { KgCulturalContextProfile, KgPersonalityProfile } from "../types/kg-types"

/**
 * Appraises perception using a combination of LLM assistance and heuristic methods
 *
 * @param utteranceText The raw utterance text
 * @param keywords Keywords extracted from the utterance
 * @param sentiment Sentiment analysis result
 * @param ruleVariables Inferred MHH variables
 * @param activeBootstrappedEPs Active bootstrapped emotional patterns
 * @param useLlmAssistance Whether to use LLM assistance (defaults to true)
 * @returns Promise resolving to PInstanceData containing appraisal results
 */
export async function appraisePerception(
  utteranceText: string,
  nlpFeatures: any,
  activeBootstrappedEPs: BootstrappedEP[],
  context: any,
  useLlmAssistance = true,
  state?: { moodEstimate: number; stressEstimate: number },
  culturalContext?: KgCulturalContextProfile,
  personality?: KgPersonalityProfile,
): Promise<PInstanceData | null> {
  try {
    let ruleVariables: RuleVariables | null = null

    // If LLM assistance is enabled, try to use it first
    if (useLlmAssistance) {
      try {
        ruleVariables = await getLlmVariableInference(utteranceText)
        if (!ruleVariables) {
          logger.warn("LLM-assisted MHH variable inference failed, falling back to heuristic appraisal")
        }
      } catch (error) {
        logger.warn(`LLM-assisted MHH variable inference failed, falling back to heuristic appraisal: ${error}`)
      }
    }

    // Fallback to heuristic appraisal if LLM assistance is disabled or fails
    if (!ruleVariables) {
      ruleVariables = await inferMhhVariablesHeuristic(utteranceText, nlpFeatures.entities, nlpFeatures.sentiment)
      logger.info("Using heuristic MHH variable inference")
    }

    // If LLM assistance is enabled, try to use it first
    if (useLlmAssistance) {
      try {
        const llmAppraisal = await getLlmPerceptionAppraisal(
          utteranceText,
          nlpFeatures.sentiment,
          ruleVariables,
          activeBootstrappedEPs,
        )
        if (llmAppraisal) {
          logger.info("Using LLM-assisted perception appraisal")
          return {
            mhhSource: ruleVariables.source.value,
            mhhPerspective: ruleVariables.perspective.value,
            mhhTimeframe: ruleVariables.timeframe.value,
            mhhAcceptanceState: ruleVariables.acceptanceState.value,
            pValuationShiftEstimate: llmAppraisal.pValuationShiftEstimate,
            pPowerLevel: llmAppraisal.pPowerLevel,
            pAppraisalConfidence: llmAppraisal.pAppraisalConfidence,
          }
        }
      } catch (error) {
        logger.warn(`LLM assistance failed, falling back to heuristic appraisal: ${error}`)
      }
    }

    // Fall back to heuristic appraisal if LLM assistance is disabled or fails
    return calculateHeuristicImpactScores(
      utteranceText,
      nlpFeatures,
      ruleVariables,
      activeBootstrappedEPs,
      state,
      culturalContext,
      personality,
    )
  } catch (error) {
    logger.error(`Error appraising perception: ${error}`)
    return null
  }
}

/**
 * Calculates heuristic impact scores based on basic inputs
 *
 * @param utteranceText The raw utterance text
 * @param keywords Keywords extracted from the utterance
 * @param sentiment Sentiment analysis result
 * @param ruleVariables Inferred MHH variables
 * @param activeBootstrappedEPs Active bootstrapped emotional patterns
 * @returns PInstanceData containing heuristic appraisal results
 */
export function calculateHeuristicImpactScores(
  utteranceText: string,
  nlpFeatures: any,
  ruleVariables: RuleVariables,
  activeBootstrappedEPs: BootstrappedEP[],
  state?: { moodEstimate: number; stressEstimate: number },
  culturalContext?: KgCulturalContextProfile,
  personality?: KgPersonalityProfile,
): PInstanceData {
  // Implementation details here (using P_APPRAISER_CONFIG for thresholds)
  return {
    mhhSource: ruleVariables.source.value,
    mhhPerspective: ruleVariables.perspective.value,
    mhhTimeframe: ruleVariables.timeframe.value,
    mhhAcceptanceState: ruleVariables.acceptanceState.value,
    pValuationShiftEstimate: 0.0,
    pPowerLevel: 0.5,
    pAppraisalConfidence: 0.5,
  }
}
