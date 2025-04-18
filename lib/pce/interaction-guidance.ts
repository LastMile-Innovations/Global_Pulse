import { logger } from "../utils/logger"
import type {
  VADOutput,
  InteractionGuidance,
  EmotionCategorization,
  PInstanceData,
  RuleVariables,
} from "../types/pce-types"

/**
 * Generates interaction guidance based on the user's emotional state
 * @param vad VAD output from PCE
 * @param emotionCategorization Emotion categorization from Webb rules
 * @param pInstance Perception instance data
 * @param ruleVariables Rule variables
 * @returns Interaction guidance
 */
export function generateInteractionGuidance(
  vad: VADOutput,
  emotionCategorization?: EmotionCategorization,
  pInstance?: PInstanceData,
  ruleVariables?: RuleVariables,
): InteractionGuidance {
  try {
    let primaryDialogueAct = "ACKNOWLEDGE"
    const parameters: Record<string, any> = {}
    const suggestedFocus: string[] = []

    // Add VAD values to parameters
    parameters.vadValence = vad.valence
    parameters.vadArousal = vad.arousal
    parameters.vadDominance = vad.dominance
    parameters.vadConfidence = vad.confidence

    // If we have emotion categorization, use it to enhance guidance
    if (emotionCategorization) {
      // Get primary emotion category and its probability
      const primaryCategory = emotionCategorization.primaryLabel
      const primaryCategoryProb = emotionCategorization.categoryDistribution[primaryCategory] || 0
      const emotionGroup = emotionCategorization.emotionGroup

      // Add emotion categorization to parameters
      parameters.emotionLabel = primaryCategory
      parameters.emotionGroup = emotionGroup
      parameters.emotionConfidence = primaryCategoryProb

      // Determine primary dialogue act based on combined VAD and emotion category
      if (vad.valence < -0.5) {
        if (primaryCategory === "Sadness" || primaryCategory === "Grief") {
          primaryDialogueAct = "VALIDATE_EMOTION"
          suggestedFocus.push("Emotional Support")
          suggestedFocus.push("Coping Strategies")
        } else if (primaryCategory === "Anger" || primaryCategory === "Frustration") {
          primaryDialogueAct = "VALIDATE_EMOTION"
          suggestedFocus.push("Source of Frustration")

          // Add MHH-specific focus based on rule variables
          if (ruleVariables && ruleVariables.source.value === "external" && ruleVariables.source.confidence > 0.6) {
            suggestedFocus.push("External Triggers")
          }
        } else if (primaryCategory === "Anxiety" || primaryCategory === "Fear") {
          primaryDialogueAct = "OFFER_SUPPORT"
          suggestedFocus.push("Safety Concerns")
          suggestedFocus.push("Uncertainty Reduction")
        } else if (primaryCategory === "Confusion") {
          primaryDialogueAct = "ASK_CLARIFY"
          suggestedFocus.push("Information Needs")
        } else {
          primaryDialogueAct = "VALIDATE_EMOTION"
          suggestedFocus.push("Emotional State")
        }
      } else if (vad.arousal > 0.7 && vad.valence > 0) {
        if (primaryCategory === "Excitement" || primaryCategory === "Joy") {
          primaryDialogueAct = "AMPLIFY_POSITIVE"
          suggestedFocus.push("Positive Experiences")
        } else {
          primaryDialogueAct = "EXPLORE_TOPIC"
          suggestedFocus.push("Current Interests")
        }
      } else if (primaryCategoryProb < 0.4 || primaryCategory === "Neutral") {
        primaryDialogueAct = "EXPLORE_TOPIC"
        suggestedFocus.push("User Goals")
      }

      // Add MHH-specific focus suggestions based on rule variables
      if (ruleVariables) {
        if (ruleVariables.timeframe.value === "future" && ruleVariables.timeframe.confidence > 0.6) {
          suggestedFocus.push("Future Planning")
        }

        if (ruleVariables.acceptanceState.value === "resisted" && ruleVariables.acceptanceState.confidence > 0.6) {
          suggestedFocus.push("Acceptance Challenges")
        }
      }

      if (pInstance && pInstance.pPowerLevel < 0.3) {
        suggestedFocus.push("Empowerment Strategies")
      }
    } else {
      // Fallback to basic VAD-based guidance if no emotion categorization is available
      if (vad.valence < -0.5) {
        primaryDialogueAct = "VALIDATE_EMOTION"
        suggestedFocus.push("Emotional State")
      } else if (vad.arousal > 0.7) {
        primaryDialogueAct = "OFFER_SUPPORT"
        suggestedFocus.push("Coping Strategies")
      } else {
        primaryDialogueAct = "EXPLORE_TOPIC"
        suggestedFocus.push("User Goals")
      }
    }

    logger.info(`Generated interaction guidance: ${primaryDialogueAct}`)
    return {
      primaryDialogueAct,
      parameters,
      suggestedFocus,
    }
  } catch (error) {
    logger.error(`Error generating interaction guidance: ${error}`)
    return {
      primaryDialogueAct: "DEFAULT",
      parameters: {},
      suggestedFocus: [],
    }
  }
}

/**
 * Maps emotion categories to dialogue acts
 * @param category Emotion category
 * @returns Appropriate dialogue act
 */
function mapCategoryToDialogueAct(category: string): string {
  const categoryToActMap: Record<string, string> = {
    Anger: "VALIDATE_EMOTION",
    Frustration: "VALIDATE_EMOTION",
    Sadness: "VALIDATE_EMOTION",
    Grief: "VALIDATE_EMOTION",
    Anxiety: "OFFER_SUPPORT",
    Fear: "OFFER_SUPPORT",
    Confusion: "ASK_CLARIFY",
    Joy: "AMPLIFY_POSITIVE",
    Excitement: "AMPLIFY_POSITIVE",
    Neutral: "EXPLORE_TOPIC",
  }

  return categoryToActMap[category] || "ACKNOWLEDGE"
}

/**
 * Determines focus suggestions based on emotion category and MHH variables
 * @param category Emotion category
 * @param ruleVariables Rule variables
 * @returns Array of focus suggestions
 */
function getFocusSuggestions(category: string, ruleVariables?: RuleVariables): string[] {
  const suggestions: string[] = []

  // Add category-specific suggestions
  const categoryToFocusMap: Record<string, string[]> = {
    Anger: ["Source of Frustration", "Conflict Resolution"],
    Frustration: ["Obstacles", "Alternative Approaches"],
    Sadness: ["Emotional Support", "Self-Care"],
    Grief: ["Loss Processing", "Coping Strategies"],
    Anxiety: ["Safety Concerns", "Uncertainty Reduction"],
    Fear: ["Threat Assessment", "Safety Planning"],
    Confusion: ["Information Needs", "Clarification"],
    Joy: ["Positive Experiences", "Gratitude"],
    Excitement: ["Future Plans", "Enthusiasm"],
    Neutral: ["User Goals", "Current Interests"],
  }

  const categorySuggestions = categoryToFocusMap[category] || ["User Needs"]
  suggestions.push(...categorySuggestions)

  // Add MHH-specific suggestions if available
  if (ruleVariables) {
    if (ruleVariables.source.value === "external" && ruleVariables.source.confidence > 0.6) {
      suggestions.push("External Factors")
    }

    if (ruleVariables.timeframe.value === "future" && ruleVariables.timeframe.confidence > 0.6) {
      suggestions.push("Future Planning")
    }

    if (ruleVariables.acceptanceState.value === "resisted" && ruleVariables.acceptanceState.confidence > 0.6) {
      suggestions.push("Acceptance Challenges")
    }
  }

  return suggestions
}
