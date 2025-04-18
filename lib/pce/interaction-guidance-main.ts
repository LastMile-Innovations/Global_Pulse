import type { VADOutput } from "./vad"
import type { EmotionCategorization } from "./emotion-categorization"
import type { PInstanceData } from "./p-instance-data"
import type { RuleVariables } from "./rule-variables"
import type { InteractionGuidance } from "./interaction-guidance-interface"
import { logger } from "./logger"

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

      // Low confidence in categorization - prioritize clarification
      if (primaryCategoryProb < 0.4 && vad.confidence < 0.6) {
        primaryDialogueAct = "ASK_CLARIFY"
        suggestedFocus.push("User's Current State")
        suggestedFocus.push("Clarification Needs")
        return { primaryDialogueAct, parameters, suggestedFocus }
      }

      // Determine primary dialogue act based on combined VAD and emotion category
      if (vad.valence < -0.5) {
        if (primaryCategory === "Sadness" || primaryCategory === "Grief" || primaryCategory === "Despair") {
          primaryDialogueAct = "VALIDATE_EMOTION"
          suggestedFocus.push("Emotional Support")
          suggestedFocus.push("Coping Strategies")

          // Add MHH-specific focus based on rule variables
          if (ruleVariables && ruleVariables.timeframe.value === "past" && ruleVariables.timeframe.confidence > 0.6) {
            suggestedFocus.push("Past Loss Processing")
          }
          if (pInstance && pInstance.pPowerLevel < 0.4) {
            suggestedFocus.push("Rebuilding Sense of Control")
          }
        } else if (primaryCategory === "Anger" || primaryCategory === "Frustration" || primaryCategory === "Rage") {
          primaryDialogueAct = "VALIDATE_EMOTION"
          suggestedFocus.push("Source of Frustration")

          // Add MHH-specific focus based on rule variables
          if (ruleVariables && ruleVariables.source.value === "external" && ruleVariables.source.confidence > 0.6) {
            suggestedFocus.push("External Triggers")
          }
          if (
            ruleVariables &&
            ruleVariables.acceptanceState.value === "resisted" &&
            ruleVariables.acceptanceState.confidence > 0.6
          ) {
            suggestedFocus.push("Resistance Processing")
          }

          // High arousal anger needs different handling than low arousal frustration
          if (vad.arousal > 0.7) {
            primaryDialogueAct = "DE_ESCALATE"
            suggestedFocus.push("Calming Strategies")
          }
        } else if (primaryCategory === "Anxiety" || primaryCategory === "Fear" || primaryCategory === "Panic") {
          // High arousal fear/anxiety needs more active support
          if (vad.arousal > 0.7) {
            primaryDialogueAct = "PROVIDE_REASSURANCE"
          } else {
            primaryDialogueAct = "OFFER_SUPPORT"
          }

          suggestedFocus.push("Safety Concerns")
          suggestedFocus.push("Uncertainty Reduction")

          // Add MHH-specific focus based on rule variables
          if (ruleVariables && ruleVariables.timeframe.value === "future" && ruleVariables.timeframe.confidence > 0.6) {
            suggestedFocus.push("Future Planning")
            suggestedFocus.push("Uncertainty Management")
          }
        } else if (primaryCategory === "Confusion") {
          primaryDialogueAct = "ASK_CLARIFY"
          suggestedFocus.push("Information Needs")
          suggestedFocus.push("Conceptual Clarification")

          if (vad.arousal > 0.6) {
            // High arousal confusion may indicate frustration with not understanding
            suggestedFocus.push("Frustration Management")
          }
        } else {
          primaryDialogueAct = "VALIDATE_EMOTION"
          suggestedFocus.push("Emotional State")
        }
      } else if (vad.valence > 0.3) {
        // Positive valence states
        if (primaryCategory === "Joy" || primaryCategory === "Happiness") {
          primaryDialogueAct = "AMPLIFY_POSITIVE"
          suggestedFocus.push("Positive Experiences")
          suggestedFocus.push("Gratitude")

          if (ruleVariables && ruleVariables.source.value === "internal" && ruleVariables.source.confidence > 0.6) {
            suggestedFocus.push("Personal Achievements")
          }
        } else if (primaryCategory === "Excitement" || primaryCategory === "Anticipation") {
          primaryDialogueAct = "AMPLIFY_POSITIVE"
          suggestedFocus.push("Future Plans")
          suggestedFocus.push("Enthusiasm")

          if (ruleVariables && ruleVariables.timeframe.value === "future" && ruleVariables.timeframe.confidence > 0.6) {
            suggestedFocus.push("Upcoming Events")
          }
        } else if (primaryCategory === "Pride") {
          primaryDialogueAct = "ACKNOWLEDGE_ACHIEVEMENT"
          suggestedFocus.push("Personal Accomplishments")
          suggestedFocus.push("Self-Efficacy")
        } else if (primaryCategory === "Contentment" || primaryCategory === "Calm") {
          primaryDialogueAct = "EXPLORE_TOPIC"
          suggestedFocus.push("Current Interests")
          suggestedFocus.push("Reflective Discussion")
        } else {
          primaryDialogueAct = "AMPLIFY_POSITIVE"
          suggestedFocus.push("Positive Aspects")
        }
      } else {
        // Neutral valence states
        if (primaryCategoryProb < 0.4 || primaryCategory === "Neutral") {
          primaryDialogueAct = "EXPLORE_TOPIC"
          suggestedFocus.push("User Goals")
          suggestedFocus.push("Current Interests")
        } else {
          // Use the mapped dialogue act for the category
          primaryDialogueAct = mapCategoryToDialogueAct(primaryCategory)

          // Add category-specific focus suggestions
          const categorySuggestions = getFocusSuggestions(primaryCategory, ruleVariables)
          suggestedFocus.push(...categorySuggestions)
        }
      }

      // Add MHH-specific focus suggestions based on rule variables
      if (ruleVariables) {
        const category = emotionCategorization.primaryLabel

        if (ruleVariables.timeframe.value === "future" && ruleVariables.timeframe.confidence > 0.6) {
          suggestedFocus.push("Future Planning")

          if (category === "Anxiety" || category === "Fear") {
            suggestedFocus.push("Future Uncertainty")
          }

          if (category === "Excitement") {
            suggestedFocus.push("Anticipation")
          }
        }

        if (ruleVariables.timeframe.value === "past" && ruleVariables.timeframe.confidence > 0.6) {
          suggestedFocus.push("Past Experiences")

          if (category === "Sadness" || category === "Grief") {
            suggestedFocus.push("Past Loss")
          }
        }

        if (ruleVariables.acceptanceState.value === "resisted" && ruleVariables.acceptanceState.confidence > 0.6) {
          suggestedFocus.push("Acceptance Challenges")

          if (category === "Anger" || category === "Frustration") {
            suggestedFocus.push("Resistance Processing")
          }
        }

        if (ruleVariables.perspective.value === "other" && ruleVariables.perspective.confidence > 0.6) {
          suggestedFocus.push("Other-Focused Perspective")

          if (category === "Anger") {
            suggestedFocus.push("Interpersonal Conflict")
          }
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

        if (vad.arousal > 0.7) {
          suggestedFocus.push("Intense Emotions")
        }
      } else if (vad.arousal > 0.7) {
        primaryDialogueAct = "OFFER_SUPPORT"
        suggestedFocus.push("Coping Strategies")

        if (vad.valence > 0.3) {
          primaryDialogueAct = "AMPLIFY_POSITIVE"
          suggestedFocus.push("Excitement Management")
        }
      } else {
        primaryDialogueAct = "EXPLORE_TOPIC"
        suggestedFocus.push("User Goals")

        if (vad.dominance < 0.3) {
          suggestedFocus.push("Empowerment")
        }
      }
    }

    // Remove duplicate focus suggestions
    const uniqueFocus = [...new Set(suggestedFocus)]

    logger.info(`Generated interaction guidance: ${primaryDialogueAct}`)
    return {
      primaryDialogueAct,
      parameters,
      suggestedFocus: uniqueFocus,
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
    Rage: "DE_ESCALATE",
    Frustration: "VALIDATE_EMOTION",
    Sadness: "VALIDATE_EMOTION",
    Grief: "VALIDATE_EMOTION",
    Despair: "OFFER_SUPPORT",
    Anxiety: "OFFER_SUPPORT",
    Fear: "OFFER_SUPPORT",
    Panic: "PROVIDE_REASSURANCE",
    Confusion: "ASK_CLARIFY",
    Joy: "AMPLIFY_POSITIVE",
    Happiness: "AMPLIFY_POSITIVE",
    Excitement: "AMPLIFY_POSITIVE",
    Pride: "ACKNOWLEDGE_ACHIEVEMENT",
    Contentment: "EXPLORE_TOPIC",
    Calm: "EXPLORE_TOPIC",
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
    Rage: ["De-escalation", "Safety Planning"],
    Frustration: ["Obstacles", "Alternative Approaches"],
    Sadness: ["Emotional Support", "Self-Care"],
    Grief: ["Loss Processing", "Coping Strategies"],
    Despair: ["Crisis Support", "Hope Building"],
    Anxiety: ["Safety Concerns", "Uncertainty Reduction"],
    Fear: ["Threat Assessment", "Safety Planning"],
    Panic: ["Immediate Grounding", "Breathing Techniques"],
    Confusion: ["Information Needs", "Clarification"],
    Joy: ["Positive Experiences", "Gratitude"],
    Happiness: ["Well-being", "Positive Reinforcement"],
    Excitement: ["Future Plans", "Enthusiasm"],
    Pride: ["Achievements", "Self-efficacy"],
    Contentment: ["Present Moment", "Appreciation"],
    Calm: ["Mindfulness", "Reflection"],
    Neutral: ["User Goals", "Current Interests"],
  }

  const categorySuggestions = categoryToFocusMap[category] || ["User Needs"]
  suggestions.push(...categorySuggestions)

  // Add MHH-specific suggestions if available
  if (ruleVariables) {
    if (ruleVariables.source.value === "external" && ruleVariables.source.confidence > 0.6) {
      suggestions.push("External Factors")

      if (category === "Anger" || category === "Frustration" || category === "Rage") {
        suggestions.push("External Attribution")
      }
    }

    if (ruleVariables.source.value === "internal" && ruleVariables.source.confidence > 0.6) {
      suggestions.push("Internal Factors")

      if (category === "Sadness" || category === "Grief") {
        suggestions.push("Self-Reflection")
      }

      if (category === "Pride" || category === "Joy") {
        suggestions.push("Self-Achievement")
      }
    }

    if (ruleVariables.timeframe.value === "future" && ruleVariables.timeframe.confidence > 0.6) {
      suggestions.push("Future Planning")

      if (category === "Anxiety" || category === "Fear") {
        suggestions.push("Future Uncertainty")
      }

      if (category === "Excitement") {
        suggestions.push("Anticipation")
      }
    }

    if (ruleVariables.timeframe.value === "past" && ruleVariables.timeframe.confidence > 0.6) {
      suggestions.push("Past Experiences")

      if (category === "Sadness" || category === "Grief") {
        suggestions.push("Past Loss")
      }
    }

    if (ruleVariables.acceptanceState.value === "resisted" && ruleVariables.acceptanceState.confidence > 0.6) {
      suggestions.push("Acceptance Challenges")

      if (category === "Anger" || category === "Frustration") {
        suggestions.push("Resistance Processing")
      }
    }

    if (ruleVariables.perspective.value === "other" && ruleVariables.perspective.confidence > 0.6) {
      suggestions.push("Other-Focused Perspective")

      if (category === "Anger") {
        suggestions.push("Interpersonal Conflict")
      }
    }
  }

  return suggestions
}
