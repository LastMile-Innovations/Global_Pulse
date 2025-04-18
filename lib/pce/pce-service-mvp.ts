import { logger } from "../../lib/utils"
import { getCoreNlpFeatures } from "../nlp/nlp-features"
import { getMinimalContext } from "./context-analyzer"
import { inferRuleVariables } from "./variable-inference"
import { appraisePerception } from "./perception-appraisal"
import { calculateLinearVad } from "./ewef-core-engine/linear-model"
import { updateMinimalState } from "./state-monitor"
import type { EWEFAnalysisOutput } from "../types/pce-types"

/**
 * Process a PCE MVP request
 *
 * @param input Input data containing userID, sessionID, and utteranceText
 * @param options Optional processing options
 * @returns EWEFAnalysisOutput containing VAD, state, activeEPs, pInstance, and ruleVariables
 */
export async function processPceMvpRequest(
  input: { userID: string; sessionID: string; utteranceText: string },
  options: { useLlmAssistance?: boolean } = {},
): Promise<EWEFAnalysisOutput> {
  try {
    // Extract options
    const { useLlmAssistance = false } = options

    // Step 1: Get NLP features from the utterance
    const nlpFeatures = await getCoreNlpFeatures(input.utteranceText)

    // Step 2: Get minimal context (bootstrapped EPs)
    const context = await getMinimalContext()
    const activeBootstrappedEPs = context.activeBootstrappedEPs || []

    // Step 3: Infer rule variables
    const ruleVariables = await inferRuleVariables(
      input.utteranceText,
      nlpFeatures.entities,
      nlpFeatures.sentiment,
      useLlmAssistance,
    )

    // Step 4: Appraise perception
    const pInstance = await appraisePerception(
      input.utteranceText,
      nlpFeatures.entities,
      nlpFeatures.sentiment,
      ruleVariables,
      activeBootstrappedEPs,
      useLlmAssistance,
    )

    // Step 5: Calculate VAD using the linear model
    const vad = calculateLinearVad(pInstance, ruleVariables, activeBootstrappedEPs, nlpFeatures.sentiment.score)

    // Step 6: Update minimal state
    const state = await updateMinimalState({
      moodEstimate: vad.valence,
      stressEstimate: vad.arousal,
    })

    // Return the complete EWEF analysis output
    return {
      vad,
      state,
      activeEPs: activeBootstrappedEPs,
      pInstance,
      ruleVariables,
    }
  } catch (error) {
    logger.error(`Error in processPceMvpRequest: ${error}`)

    // Return default values on error
    return {
      vad: {
        valence: 0.0,
        arousal: 0.1,
        dominance: 0.0,
        confidence: 0.5,
      },
      state: {
        timestamp: Date.now(),
        moodEstimate: 0.0,
        stressEstimate: 0.1,
      },
      activeEPs: [],
      pInstance: {
        mhhSource: "external",
        mhhPerspective: "self",
        mhhTimeframe: "present",
        mhhAcceptanceState: "uncertain",
        pValuationShiftEstimate: 0.0,
        pPowerLevel: 0.5,
        pAppraisalConfidence: 0.5,
      },
      ruleVariables: {
        source: { value: "external", confidence: 0.5 },
        perspective: { value: "self", confidence: 0.5 },
        timeframe: { value: "present", confidence: 0.5 },
        acceptanceState: { value: "uncertain", confidence: 0.5 },
      },
    }
  }
}
