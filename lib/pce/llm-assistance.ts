import { generateLlmJson } from "../ai-sdk/llm-interaction"
import { logger } from "../utils/logger"
import type { RuleVariables } from "../types/pce-types"
import type { SentimentResult } from "../types/nlp-types"
import type { BootstrappedEP } from "../types/pce-types"

/**
 * Generates an LLM-assisted MHH variable inference
 * @param text The raw utterance text
 * @returns Promise resolving to RuleVariables containing MHH variables and confidence scores
 */
export async function getLlmVariableInference(text: string): Promise<RuleVariables | null> {
  try {
    // Construct the prompt for the LLM
    const prompt = `Analyze the following text and infer the speaker's source, perspective, timeframe, and acceptance state.
      Text: "${text}"
      Respond ONLY with a JSON object conforming to the MhhVariablesSchema.`

    // Call the LLM to generate the MHH variables
    const result = await generateLlmJson<RuleVariables>(prompt, {
      modelId: "openai:gpt-4o",
      temperature: 0.2,
      maxTokens: 500,
      system: "You are an expert in psychological analysis. Infer MHH variables accurately.",
    })

    // If the LLM call fails, return null
    if (!result) {
      logger.warn("LLM failed to return a valid response for variable inference")
      return null
    }

    // Return the parsed output
    logger.info("Successfully obtained LLM-assisted MHH variable inference")
    return result
  } catch (error) {
    logger.error(`Error in LLM variable inference: ${error}`)
    return null
  }
}

/**
 * Generates an LLM-assisted perception appraisal
 * @param utteranceText The raw utterance text
 * @param sentiment Sentiment analysis result
 * @param ruleVariables Inferred MHH variables
 * @param activeBootstrappedEPs Active bootstrapped emotional patterns
 * @returns Promise resolving to PInstanceData containing appraisal results
 */
export async function getLlmPerceptionAppraisal(
  utteranceText: string,
  sentiment: SentimentResult,
  ruleVariables: RuleVariables,
  activeBootstrappedEPs: BootstrappedEP[],
): Promise<{
  pValuationShiftEstimate: number
  pPowerLevel: number
  pAppraisalConfidence: number
} | null> {
  try {
    // Construct the prompt for the LLM
    const prompt = `Analyze the following text and provide estimates for valuation shift, power level, and appraisal confidence.
      Text: "${utteranceText}"
      Sentiment: ${sentiment.label} (score: ${sentiment.score})
      Source: ${ruleVariables.source.value}
      Perspective: ${ruleVariables.perspective.value}
      Timeframe: ${ruleVariables.timeframe.value}
      Acceptance State: ${ruleVariables.acceptanceState.value}
      Active EPs: ${activeBootstrappedEPs.map((ep) => ep.name).join(", ")}
      Respond ONLY with a JSON object conforming to the PerceptionAppraisalSchema.`

    // Call the LLM to generate the appraisal
    const result = await generateLlmJson<{
      pValuationShiftEstimate: number
      pPowerLevel: number
      pAppraisalConfidence: number
    }>(prompt, {
      modelId: "openai:gpt-4o",
      temperature: 0.2,
      maxTokens: 500,
      system: "You are an expert in psychological analysis. Provide accurate perception appraisals.",
    })

    // If the LLM call fails, return null
    if (!result) {
      logger.warn("LLM failed to return a valid response for perception appraisal")
      return null
    }

    // Return the parsed output
    logger.info("Successfully obtained LLM-assisted perception appraisal")
    return result
  } catch (error) {
    logger.error(`Error in LLM perception appraisal: ${error}`)
    return null
  }
}
