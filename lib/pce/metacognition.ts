import { logger } from "../utils/logger"
import type {
  EWEFAnalysisOutput,
  VADOutput,
  RuleVariables,
  EmotionCategorization,
  BootstrappedEP,
} from "../types/pce-types"
import { getTypicalVADProfile } from "./vad-profiles"
import { calculateVADDistance, mapDistanceToConsistency } from "./vad-consistency"

/**
 * Generates a concise, user-friendly explanation for the EWEF analysis, including VAD-typicality consistency.
 * @param ewefAnalysis The EWEF analysis output
 * @returns The explanation text
 */
export async function generateExplanation(ewefAnalysis: EWEFAnalysisOutput): Promise<string> {
  try {
    // Extract relevant information from the EWEF analysis
    const { vad, pInstance, ruleVariables, activeEPs, emotionCategorization } = ewefAnalysis

    // Format the active EPs for the explanation (show count and names)
    let activeEPsText = "None"
    if (activeEPs && activeEPs.length > 0) {
      activeEPsText = activeEPs.map((ep: BootstrappedEP) =>
        ep.name ? ep.name : ep.type
      ).join(", ")
    }

    // Generate VAD description
    const vadDescription = getVADDescription(vad)

    // Get the primary emotion category and its probability
    let primaryCategory = "Unknown"
    let primaryCategoryProb = 0
    let emotionGroupText = ""

    if (emotionCategorization) {
      primaryCategory = emotionCategorization.primaryLabel
      primaryCategoryProb = emotionCategorization.categoryDistribution
        ? (emotionCategorization.categoryDistribution[primaryCategory] || 0)
        : 0
      emotionGroupText = emotionCategorization.emotionGroup
        ? ` (${emotionCategorization.emotionGroup})`
        : ""
    }

    // VAD Consistency with typical profile for the primary category
    let vadConsistencyText = ""
    if (primaryCategory !== "Unknown") {
      const typicalVAD = getTypicalVADProfile(primaryCategory)
      const vadDistance = calculateVADDistance(vad, typicalVAD)
      const vadConsistency = mapDistanceToConsistency(vadDistance)
      let consistencyLabel = "typical"
      if (vadConsistency >= 0.8) {
        consistencyLabel = "very typical"
      } else if (vadConsistency >= 0.5) {
        consistencyLabel = "somewhat typical"
      } else if (vadConsistency >= 0.2) {
        consistencyLabel = "atypical"
      } else {
        consistencyLabel = "very atypical"
      }
      vadConsistencyText = `\nVAD match: ${consistencyLabel} for ${primaryCategory} (consistency: ${(vadConsistency * 100).toFixed(0)}%).`
    }

    // Identify key MHH variables that influenced the categorization
    const keyMHHVariables = getKeyMHHVariables(ruleVariables, emotionCategorization)

    // Compose a readable explanation
    let explanation = `Your core affect is ${vadDescription} [V:${vad.valence.toFixed(2)}, A:${vad.arousal.toFixed(2)}, D:${vad.dominance.toFixed(2)}].`
    explanation += `\nLikely emotion: ${primaryCategory}${emotionGroupText} (${(primaryCategoryProb * 100).toFixed(1)}% confidence).`
    if (vadConsistencyText) {
      explanation += vadConsistencyText
    }
    if (keyMHHVariables.length > 0) {
      explanation += `\nKey factors: ${keyMHHVariables.join(", ")}.`
    }
    explanation += `\nActive attachments: ${activeEPsText}.`

    logger.info(`Generated explanation: ${explanation}`)
    return explanation
  } catch (error) {
    logger.error(`Error generating explanation: ${error}`)
    return "Sorry, I couldn't generate an explanation for your state."
  }
}

/**
 * Generates a descriptive text for VAD values (simple, clear language)
 * @param vad VAD output
 * @returns Descriptive text
 */
function getVADDescription(vad: VADOutput): string {
  let valenceDesc = "neutral"
  if (vad.valence > 0.5) valenceDesc = "positive"
  else if (vad.valence < -0.5) valenceDesc = "negative"

  let arousalDesc = "calm"
  if (vad.arousal > 0.7) arousalDesc = "very energized"
  else if (vad.arousal > 0.4) arousalDesc = "alert"
  else if (vad.arousal < 0.2) arousalDesc = "very calm"

  let dominanceDesc = "balanced"
  if (vad.dominance > 0.7) dominanceDesc = "in control"
  else if (vad.dominance < 0.3) dominanceDesc = "not in control"

  return `${valenceDesc}, ${arousalDesc}, and ${dominanceDesc}`
}

/**
 * Identifies key MHH variables that influenced the categorization (simple logic)
 * @param ruleVariables Rule variables
 * @param emotionCategorization Emotion categorization
 * @returns Array of key MHH variable descriptions
 */
function getKeyMHHVariables(
  ruleVariables: RuleVariables,
  emotionCategorization?: EmotionCategorization
): string[] {
  const keyVariables: string[] = []
  const confidenceThreshold = 0.7

  // Only include variables with high confidence, or fallback to all
  if (ruleVariables.source && ruleVariables.source.confidence > confidenceThreshold) {
    keyVariables.push(`Source: ${ruleVariables.source.value}`)
  }
  if (ruleVariables.perspective && ruleVariables.perspective.confidence > confidenceThreshold) {
    keyVariables.push(`Perspective: ${ruleVariables.perspective.value}`)
  }
  if (ruleVariables.timeframe && ruleVariables.timeframe.confidence > confidenceThreshold) {
    keyVariables.push(`Timeframe: ${ruleVariables.timeframe.value}`)
  }
  if (ruleVariables.acceptanceState && ruleVariables.acceptanceState.confidence > confidenceThreshold) {
    keyVariables.push(`Acceptance: ${ruleVariables.acceptanceState.value}`)
  }

  // If no high-confidence variables, show all (fallback)
  if (keyVariables.length === 0) {
    if (ruleVariables.source) keyVariables.push(`Source: ${ruleVariables.source.value}`)
    if (ruleVariables.perspective) keyVariables.push(`Perspective: ${ruleVariables.perspective.value}`)
    if (ruleVariables.timeframe) keyVariables.push(`Timeframe: ${ruleVariables.timeframe.value}`)
    if (ruleVariables.acceptanceState) keyVariables.push(`Acceptance: ${ruleVariables.acceptanceState.value}`)
  }

  // Add simple emotion-specific cues if available
  if (emotionCategorization) {
    const primaryCategory = emotionCategorization.primaryLabel

    if (
      primaryCategory === "Anger" ||
      primaryCategory === "Frustration" ||
      primaryCategory === "Rage"
    ) {
      if (ruleVariables.source?.value === "external") keyVariables.push("External trigger")
      if (ruleVariables.acceptanceState?.value === "resisted") keyVariables.push("Resisting situation")
    } else if (
      primaryCategory === "Sadness" ||
      primaryCategory === "Grief" ||
      primaryCategory === "Despair"
    ) {
      if (ruleVariables.timeframe?.value === "past") keyVariables.push("Related to past")
      if (ruleVariables.source?.value === "internal") keyVariables.push("Internal attribution")
    } else if (
      primaryCategory === "Anxiety" ||
      primaryCategory === "Fear" ||
      primaryCategory === "Panic"
    ) {
      if (ruleVariables.timeframe?.value === "future") keyVariables.push("Future uncertainty")
      // No dominance in RuleVariables, so skip "Low Control"
    } else if (
      primaryCategory === "Joy" ||
      primaryCategory === "Happiness"
    ) {
      if (ruleVariables.acceptanceState?.value === "accepted") keyVariables.push("Acceptance of situation")
      if (ruleVariables.source?.value === "internal") keyVariables.push("Internal achievement")
    } else if (primaryCategory === "Confusion") {
      keyVariables.push("Uncertainty in understanding")
      if (ruleVariables.acceptanceState?.value === "uncertain") keyVariables.push("Acceptance uncertain")
    }
  }

  return keyVariables
}
