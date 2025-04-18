import { determineWebbEmotionGroup, type WebbRuleEngineInput, type WebbRuleEngineOutput } from "./webb-rules"
import { determineWebbSeverityLabel } from "./webb-severity"
import { checkVADConsistency } from "./vad-consistency"
import { findAlternativeEmotions } from "./alternative-emotions"
import {
  normalizeProbabilities,
  capAndRedistributeProbabilities,
  type EmotionCategoryProb,
} from "./probability-normalization"
import { getTypicalVADProfile } from "./vad-profiles"
import { logger } from "../utils/logger"
import type { VADOutput } from "./vad-consistency"

// Define interfaces for the module
export interface ContextualAnalysisOutput {
  activeEPs: BootstrappedEP[]
  socialContext?: SocialContext
  // Other fields not used in this implementation
}

export interface BootstrappedEP {
  id: string
  name: string
  type: string
  powerLevel: number
  valuation: number
  activationWeight: number
}

export interface SocialContext {
  isPotentialGuiltScenario: boolean
  isPotentialPrideScenario: boolean
  isPotentialEmbarrassmentScenario: boolean
  involvedHarmToOther: boolean
  involvedNormViolation: boolean
  involvedAchievement: boolean
  involvedCompetence: boolean
  involvedGoalAttainment: boolean
  involvedPublicExposure: boolean
  involvedSocialRuleViolation: boolean
  perspectiveConfidence: number
}

export interface PInstanceData {
  mhhSource: string
  mhhPerspective: string
  mhhTimeframe: string
  mhhAcceptanceState: string
  pValuationShiftEstimate: number
  pPowerLevel: number
  pAppraisalConfidence: number
}

export interface RuleVariables {
  source: { value: string; confidence: number }
  perspective: { value: string; confidence: number }
  timeframe: { value: string; confidence: number }
  acceptanceState: { value: string; confidence: number }
}

export interface EmotionCategorizationOutput {
  primaryLabel: string
  emotionGroup: string
  webbConfidence: number
  vad: VADOutput
  categoryDistribution: EmotionCategoryProb[]
  consistencyScore: number
}

/**
 * Main function to categorize emotions based on Webb rules and VAD consistency
 *
 * @param context Contextual analysis output containing active EPs
 * @param ruleVariables MHH variables with confidence scores
 * @param pInstanceData P-Instance data from perception appraisal
 * @param vadOutput VAD output from core affect calculation
 * @returns Emotion categorization output with probability distribution
 */
export async function categorizeEmotion(
  context: ContextualAnalysisOutput,
  ruleVariables: RuleVariables,
  pInstanceData: PInstanceData,
  vadOutput: VADOutput,
): Promise<EmotionCategorizationOutput> {
  logger.debug("Starting emotion categorization", {
    ruleVariables,
    pInstanceData,
    vadOutput,
  })

  // Step 1: Determine Webb Emotion Group
  const webbInput: WebbRuleEngineInput = {
    mhhVariables: ruleVariables,
    pInstanceData: {
      pValuationShiftEstimate: pInstanceData.pValuationShiftEstimate,
      pPowerLevel: pInstanceData.pPowerLevel,
      pAppraisalConfidence: pInstanceData.pAppraisalConfidence,
    },
  }

  const webbOutput: WebbRuleEngineOutput = determineWebbEmotionGroup(webbInput)
  const { emotionGroup, confidence: webbConfidence, rulePath } = webbOutput

  logger.debug("Webb emotion group determined", {
    emotionGroup,
    webbConfidence,
    rulePath,
  })

  // Step 2: Get the primary active EP for severity calculation
  let primaryEP: BootstrappedEP | undefined
  if (context.activeEPs && context.activeEPs.length > 0) {
    // Sort by activation weight and take the highest
    primaryEP = [...context.activeEPs].sort((a, b) => b.activationWeight - a.activationWeight)[0]
  }

  const epPowerLevel = primaryEP ? primaryEP.powerLevel : 5 // Default to medium if no EP

  // Step 3: Determine Severity Label
  const severityLabel = determineWebbSeverityLabel(emotionGroup, epPowerLevel, pInstanceData.pPowerLevel)

  logger.debug("Webb severity label determined", {
    severityLabel,
    emotionGroup,
    epPowerLevel,
    pPowerLevel: pInstanceData.pPowerLevel,
  })

  // Step 4: Check VAD consistency
  const typicalVAD = getTypicalVADProfile(severityLabel)
  const consistencyScore = checkVADConsistency(vadOutput, typicalVAD)

  logger.debug("VAD consistency checked", {
    severityLabel,
    typicalVAD,
    predictedVAD: vadOutput,
    consistencyScore,
  })

  // Step 5: Generate probability distribution
  const categoryDistribution: EmotionCategoryProb[] = []

  // Calculate average MHH confidence
  const avgMhhConfidence =
    (ruleVariables.source.confidence +
      ruleVariables.perspective.confidence +
      ruleVariables.timeframe.confidence +
      ruleVariables.acceptanceState.confidence) /
    4

  // Calculate primary label probability based on Webb confidence and consistency
  const primaryProb = webbConfidence * 0.7 + consistencyScore * 0.3

  // Add the primary label
  categoryDistribution.push({
    label: severityLabel,
    probability: primaryProb,
  })

  // Calculate confusion probability based on low MHH confidence or low consistency
  const confusionFactor = Math.max((1 - avgMhhConfidence) * 0.7, (1 - consistencyScore) * 0.5)

  const confusionProb = Math.min(0.8, confusionFactor) // Cap at 0.8

  // Only add Confusion if it's significant
  if (confusionProb > 0.1) {
    categoryDistribution.push({
      label: "Confused",
      probability: confusionProb,
    })
  }

  // If consistency is low, add alternative emotions
  if (consistencyScore < 0.7) {
    const alternatives = findAlternativeEmotions(vadOutput, severityLabel, 2)

    // Calculate remaining probability to distribute
    const remainingProb = Math.max(0, 1.0 - primaryProb - confusionProb)

    // Distribute remaining probability among alternatives
    alternatives.forEach((alt, index) => {
      // Weight by inverse distance (closer alternatives get more probability)
      const weight = index === 0 ? 0.7 : 0.3 // First alternative gets more
      const altProb = remainingProb * weight

      categoryDistribution.push({
        label: alt.label,
        probability: altProb,
      })
    })
  }

  // Ensure probabilities sum to 1.0
  normalizeProbabilities(categoryDistribution)

  // Cap maximum probability and redistribute excess
  capAndRedistributeProbabilities(categoryDistribution, 0.9)

  // Sort by probability (highest first)
  categoryDistribution.sort((a, b) => b.probability - a.probability)

  // The primary label is now the one with the highest probability
  const primaryLabel = categoryDistribution[0].label

  logger.debug("Final emotion categorization", {
    primaryLabel,
    emotionGroup,
    webbConfidence,
    consistencyScore,
    categoryDistribution,
  })

  return {
    primaryLabel,
    emotionGroup,
    webbConfidence,
    vad: vadOutput,
    categoryDistribution,
    consistencyScore,
  }
}

/**
 * Calculate social emotion adjustments based on context
 *
 * This is a placeholder for the social sub-models that will be implemented in Epic 3.07
 * For now, it makes minimal adjustments based on social context flags
 *
 * @param distribution Current emotion category distribution
 * @param context Contextual analysis output with social context
 * @returns Updated distribution with social emotion adjustments
 */
function applySocialEmotionAdjustments(
  distribution: EmotionCategoryProb[],
  context: ContextualAnalysisOutput,
): EmotionCategoryProb[] {
  if (!context.socialContext) {
    return distribution // No adjustments if no social context
  }

  const { socialContext } = context

  // Make a copy of the distribution to modify
  const updatedDistribution = [...distribution]

  // Apply adjustments based on social context flags
  if (socialContext.isPotentialGuiltScenario) {
    // Boost Guilt and Shame probabilities
    adjustEmotionProbability(updatedDistribution, "Guilty", 0.2)
    adjustEmotionProbability(updatedDistribution, "Ashamed", 0.1)
  }

  if (socialContext.isPotentialPrideScenario) {
    // Boost Pride probability
    adjustEmotionProbability(updatedDistribution, "Proud", 0.2)
    adjustEmotionProbability(updatedDistribution, "Very Proud", 0.1)
  }

  if (socialContext.isPotentialEmbarrassmentScenario) {
    // Boost Embarrassment probability
    adjustEmotionProbability(updatedDistribution, "Embarrassed", 0.2)
    adjustEmotionProbability(updatedDistribution, "Very Embarrassed", 0.1)
  }

  // Normalize the updated distribution
  return normalizeProbabilities(updatedDistribution)
}

/**
 * Helper function to adjust the probability of a specific emotion
 *
 * @param distribution Emotion category distribution to modify
 * @param label Emotion label to adjust
 * @param boost Amount to boost the probability by
 */
function adjustEmotionProbability(distribution: EmotionCategoryProb[], label: string, boost: number): void {
  // Find the emotion in the distribution
  const index = distribution.findIndex((item) => item.label === label)

  if (index >= 0) {
    // Boost existing probability
    distribution[index].probability += boost
  } else {
    // Add the emotion with the boost probability
    distribution.push({
      label,
      probability: boost,
    })
  }
}
