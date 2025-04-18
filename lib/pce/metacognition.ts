import { logger } from "../utils/logger"
import type { EWEFAnalysisOutput, VADOutput, RuleVariables, EmotionCategorization } from "../types/pce-types"

/**
 * Generates an explanation for the EWEF analysis
 * @param ewefAnalysis The EWEF analysis output
 * @returns The explanation text
 */
export async function generateExplanation(ewefAnalysis: EWEFAnalysisOutput): Promise<string> {
  try {
    // Extract relevant information from the EWEF analysis
    const { vad, pInstance, ruleVariables, activeEPs, emotionCategorization } = ewefAnalysis

    // Format the active EPs for the explanation
    const activeEPsText =
      activeEPs.length > 0
        ? activeEPs.map((ep) => `${ep.name} (${ep.type}, PL: ${ep.powerLevel.toFixed(1)})`).join(", ")
        : "None"

    // Generate VAD description
    const vadDescription = getVADDescription(vad)

    // Get the primary emotion category and its probability
    let primaryCategory = "Unknown"
    let primaryCategoryProb = 0
    let emotionGroupText = ""

    if (emotionCategorization) {
      primaryCategory = emotionCategorization.primaryLabel
      primaryCategoryProb = emotionCategorization.categoryDistribution[primaryCategory] || 0
      emotionGroupText = emotionCategorization.emotionGroup ? ` (${emotionCategorization.emotionGroup})` : ""
    }

    // Identify key MHH variables that influenced the categorization
    const keyMHHVariables = getKeyMHHVariables(ruleVariables, emotionCategorization)

    // Construct the explanation text with integrated reasoning
    const explanation = `The predicted core affect is ${vadDescription} [V:${vad.valence.toFixed(2)}, A:${vad.arousal.toFixed(
      2,
    )}, D:${vad.dominance.toFixed(2)}], categorized as ${primaryCategory}${emotionGroupText} (${(
      primaryCategoryProb * 100
    ).toFixed(
      1,
    )}% confidence) because the appraisal indicated ${keyMHHVariables.join(", ")}. Active attachments: ${activeEPsText}`

    logger.info(`Generated explanation: ${explanation}`)
    return explanation
  } catch (error) {
    logger.error(`Error generating explanation: ${error}`)
    return "An error occurred while generating the explanation."
  }
}

/**
 * Generates a descriptive text for VAD values
 * @param vad VAD output
 * @returns Descriptive text
 */
function getVADDescription(vad: VADOutput): string {
  // Enhanced VAD description with more nuanced thresholds and descriptions
  const valenceDesc =
    vad.valence > 0.6
      ? "highly positive"
      : vad.valence > 0.3
        ? "positive"
        : vad.valence < -0.6
          ? "highly negative"
          : vad.valence < -0.3
            ? "negative"
            : "neutral"

  const arousalDesc =
    vad.arousal > 0.8
      ? "intensely activated"
      : vad.arousal > 0.6
        ? "highly activated"
        : vad.arousal > 0.4
          ? "moderately activated"
          : vad.arousal > 0.2
            ? "slightly activated"
            : "low activation"

  const dominanceDesc =
    vad.dominance > 0.8
      ? "strongly in control"
      : vad.dominance > 0.6
        ? "in control"
        : vad.dominance < 0.3
          ? "feeling controlled"
          : vad.dominance < 0.2
            ? "strongly controlled"
            : "neutral control"

  return `${valenceDesc}, ${arousalDesc}, and ${dominanceDesc}`
}

/**
 * Identifies key MHH variables that influenced the categorization
 * @param ruleVariables Rule variables
 * @param emotionCategorization Emotion categorization
 * @returns Array of key MHH variable descriptions
 */
function getKeyMHHVariables(ruleVariables: RuleVariables, emotionCategorization?: EmotionCategorization): string[] {
  const keyVariables = []
  const confidenceThreshold = 0.7

  // Add variables with high confidence that are relevant to the emotion category
  if (ruleVariables.source.confidence > confidenceThreshold) {
    keyVariables.push(`Source=${ruleVariables.source.value}`)
  }

  if (ruleVariables.perspective.confidence > confidenceThreshold) {
    keyVariables.push(`Perspective=${ruleVariables.perspective.value}`)
  }

  if (ruleVariables.timeframe.confidence > confidenceThreshold) {
    keyVariables.push(`Timeframe=${ruleVariables.timeframe.value}`)
  }

  if (ruleVariables.acceptanceState.confidence > confidenceThreshold) {
    keyVariables.push(`Acceptance=${ruleVariables.acceptanceState.value}`)
  }

  // If no high-confidence variables, include the most relevant ones
  if (keyVariables.length === 0) {
    keyVariables.push(`Source=${ruleVariables.source.value}`, `Acceptance=${ruleVariables.acceptanceState.value}`)
  }

  // If we have emotion categorization, add emotion-specific variables
  if (emotionCategorization) {
    const primaryCategory = emotionCategorization.primaryLabel

    // Add emotion-specific variables based on the primary category
    if (primaryCategory === "Anger" || primaryCategory === "Frustration" || primaryCategory === "Rage") {
      if (ruleVariables.source.value === "external") {
        keyVariables.push("External Trigger")
      }
      if (ruleVariables.acceptanceState.value === "resisted") {
        keyVariables.push("Resistance to Situation")
      }
    } else if (primaryCategory === "Sadness" || primaryCategory === "Grief" || primaryCategory === "Despair") {
      if (ruleVariables.timeframe.value === "past") {
        keyVariables.push("Past Loss")
      }
      if (ruleVariables.source.value === "internal") {
        keyVariables.push("Internal Attribution")
      }
    } else if (primaryCategory === "Anxiety" || primaryCategory === "Fear" || primaryCategory === "Panic") {
      if (ruleVariables.timeframe.value === "future") {
        keyVariables.push("Future Uncertainty")
      }
      if (ruleVariables.dominance < 0.4) {
        keyVariables.push("Low Control")
      }
    } else if (primaryCategory === "Joy" || primaryCategory === "Happiness") {
      if (ruleVariables.acceptanceState.value === "accepted") {
        keyVariables.push("Acceptance of Situation")
      }
      if (ruleVariables.source.value === "internal") {
        keyVariables.push("Internal Achievement")
      }
    } else if (primaryCategory === "Confusion") {
      keyVariables.push("Uncertainty in Understanding")
      if (ruleVariables.acceptanceState.value === "uncertain") {
        keyVariables.push("Acceptance Uncertainty")
      }
    }
  }

  return keyVariables
}
