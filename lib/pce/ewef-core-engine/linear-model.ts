import { logger } from "../../utils/logger"
import type {
  PInstanceData,
  RuleVariables,
  BootstrappedEP,
  VADOutput,
  WeightedEngineInputFeatures,
  LinearModelWeights,
} from "../../types/pce-types"

// Import profile types
import type { KgCulturalContextProfile, KgPersonalityProfile } from "../../types/kg-types"

// Default weights for the linear model
import { defaultWeights } from "./default-weights"

/**
 * Calculates VAD using a linear model with the provided inputs
 *
 * @param pInstanceData Perception instance data from appraisal
 * @param ruleVariables Inferred MHH variables
 * @param activeBootstrappedEPs Active bootstrapped emotional patterns
 * @param sentimentScore Sentiment score from NLP analysis
 * @param weights Optional custom weights for the linear model
 * @returns VADOutput containing valence, arousal, dominance, and confidence
 */
export function calculateLinearVad(
  pInstanceData: PInstanceData,
  ruleVariables: RuleVariables,
  activeBootstrappedEPs: BootstrappedEP[],
  sentimentScore: number,
  state?: { moodEstimate: number; stressEstimate: number },
  culturalContext?: KgCulturalContextProfile,
  personality?: KgPersonalityProfile,
  weights: LinearModelWeights = defaultWeights,
): VADOutput {
  try {
    // Prepare input features for the linear model
    const features = prepareFeatures(
      pInstanceData,
      ruleVariables,
      activeBootstrappedEPs,
      sentimentScore,
      state,
      culturalContext,
      personality,
    )

    // Calculate valence
    const valence = calculateValence(features, weights)

    // Calculate arousal
    const arousal = calculateArousal(features, weights)

    // Calculate dominance
    const dominance = calculateDominance(features, weights)

    // Calculate confidence based on pAppraisalConfidence and MHH variable confidences
    const confidence = calculateConfidence(pInstanceData.pAppraisalConfidence, ruleVariables)

    return {
      valence,
      arousal,
      dominance,
      confidence,
    }
  } catch (error) {
    logger.error(`Error calculating linear VAD: ${error}`)

    // Return default values on error
    return {
      valence: 0.0,
      arousal: 0.1,
      dominance: 0.0,
      confidence: 0.5,
    }
  }
}

/**
 * Prepares input features for the linear model
 */
function prepareFeatures(
  pInstanceData: PInstanceData,
  ruleVariables: RuleVariables,
  activeBootstrappedEPs: BootstrappedEP[],
  sentimentScore: number,
  state?: { moodEstimate: number; stressEstimate: number },
  culturalContext?: KgCulturalContextProfile,
  personality?: KgPersonalityProfile,
): WeightedEngineInputFeatures {
  // Convert sentiment score from 0-1 to -1 to 1 range if needed
  const normalizedSentimentScore = sentimentScore > 0.5 ? (sentimentScore - 0.5) * 2 : (sentimentScore - 0.5) * 2

  // Count active EPs by type
  const activeValueCount = activeBootstrappedEPs.filter((ep) => ep.type === "VALUE").length
  const activeGoalCount = activeBootstrappedEPs.filter((ep) => ep.type === "GOAL").length
  const activeNeedCount = activeBootstrappedEPs.filter((ep) => ep.type === "NEED").length

  // Convert categorical variables to binary features, applying confidence weighting
  const isSourceInternal = pInstanceData.mhhSource === "internal" ? ruleVariables.source.confidence : 0.0
  const isSourceExternal = pInstanceData.mhhSource === "external" ? ruleVariables.source.confidence : 0.0
  const isSourceValueSelf = pInstanceData.mhhSource === "valueSelf" ? ruleVariables.source.confidence : 0.0

  const isPerspectiveSelf = pInstanceData.mhhPerspective === "self" ? ruleVariables.perspective.confidence : 0.0
  const isPerspectiveOther = pInstanceData.mhhPerspective === "other" ? ruleVariables.perspective.confidence : 0.0
  const isPerspectiveBoth = pInstanceData.mhhPerspective === "both" ? ruleVariables.perspective.confidence : 0.0

  const isTimeframePast = pInstanceData.mhhTimeframe === "past" ? ruleVariables.timeframe.confidence : 0.0
  const isTimeframePresent = pInstanceData.mhhTimeframe === "present" ? ruleVariables.timeframe.confidence : 0.0
  const isTimeframeFuture = pInstanceData.mhhTimeframe === "future" ? ruleVariables.timeframe.confidence : 0.0

  const isAcceptanceAccepted =
    pInstanceData.mhhAcceptanceState === "accepted" ? ruleVariables.acceptanceState.confidence : 0.0
  const isAcceptanceResisted =
    pInstanceData.mhhAcceptanceState === "resisted" ? ruleVariables.acceptanceState.confidence : 0.0
  const isAcceptanceUncertain =
    pInstanceData.mhhAcceptanceState === "uncertain" ? ruleVariables.acceptanceState.confidence : 0.0

  return {
    // Core features from P-Instance
    pValuationShift: pInstanceData.pValuationShiftEstimate,
    pPowerLevel: pInstanceData.pPowerLevel,

    // MHH variables as binary features with confidence weighting
    isSourceInternal,
    isSourceExternal,
    isSourceValueSelf,

    isPerspectiveSelf,
    isPerspectiveOther,
    isPerspectiveBoth,

    isTimeframePast,
    isTimeframePresent,
    isTimeframeFuture,

    isAcceptanceAccepted,
    isAcceptanceResisted,
    isAcceptanceUncertain,

    // EP activation features
    activeValueCount,
    activeGoalCount,
    activeNeedCount,

    // Sentiment features
    sentimentScore: normalizedSentimentScore,

    // Default placeholder for MVP (these would be populated in future versions)
    networkContextInfluence: 0.0,
    profileModulation: 0.0,

    // State features
    s_MoodEstimate: state?.moodEstimate || 0.0,
    s_StressEstimate: state?.stressEstimate || 0.0,

    // Cultural features
    c_IndividualismScore: culturalContext?.individualismScore || 0.5,
    c_PowerDistanceScore: culturalContext?.powerDistanceScore || 0.5,
    c_UncertaintyAvoidanceScore: culturalContext?.uncertaintyAvoidanceScore || 0.5,

    // Personality features
    t_OCEAN_O: personality?.OCEAN_O || 0.5,
    t_OCEAN_C: personality?.OCEAN_C || 0.5,
    t_OCEAN_E: personality?.OCEAN_E || 0.5,
    t_OCEAN_A: personality?.OCEAN_A || 0.5,
    t_OCEAN_N: personality?.OCEAN_N || 0.5,
  }
}

/**
 * Calculates valence using the linear model
 */
function calculateValence(features: WeightedEngineInputFeatures, weights: LinearModelWeights): number {
  let valence = weights.valence_bias

  // Apply weights to features
  valence += features.pValuationShift * weights.valence_pValuationShift
  valence += features.pPowerLevel * weights.valence_pPowerLevel

  valence += features.isSourceInternal * weights.valence_isSourceInternal
  valence += features.isSourceExternal * weights.valence_isSourceExternal
  valence += features.isSourceValueSelf * weights.valence_isSourceValueSelf

  valence += features.isPerspectiveSelf * weights.valence_isPerspectiveSelf
  valence += features.isPerspectiveOther * weights.valence_isPerspectiveOther
  valence += features.isPerspectiveBoth * weights.valence_isPerspectiveBoth

  valence += features.isTimeframePast * weights.valence_isTimeframePast
  valence += features.isTimeframePresent * weights.valence_isTimeframePresent
  valence += features.isTimeframeFuture * weights.valence_isTimeframeFuture

  valence += features.isAcceptanceAccepted * weights.valence_isAcceptanceAccepted
  valence += features.isAcceptanceResisted * weights.valence_isAcceptanceResisted
  valence += features.isAcceptanceUncertain * weights.valence_isAcceptanceUncertain

  valence += features.activeValueCount * weights.valence_activeValueCount
  valence += features.activeGoalCount * weights.valence_activeGoalCount
  valence += features.activeNeedCount * weights.valence_activeNeedCount

  valence += features.sentimentScore * weights.valence_sentimentScore

  // Add state features
  valence += features.s_MoodEstimate * weights.valence_s_MoodEstimate

  // Add cultural features
  valence += features.c_IndividualismScore * weights.valence_c_IndividualismScore

  // Add personality features
  valence += features.t_OCEAN_O * weights.valence_t_OCEAN_O

  // Ensure the result is within -1.0 to 1.0 range
  return Math.max(-1.0, Math.min(1.0, valence))
}

/**
 * Calculates arousal using the linear model
 */
function calculateArousal(features: WeightedEngineInputFeatures, weights: LinearModelWeights): number {
  let arousal = weights.arousal_bias

  // Apply weights to features
  arousal += Math.abs(features.pValuationShift) * weights.arousal_pValuationShift
  arousal += features.pPowerLevel * weights.arousal_pPowerLevel

  arousal += features.isSourceInternal * weights.arousal_isSourceInternal
  arousal += features.isSourceExternal * weights.arousal_isSourceExternal
  arousal += features.isSourceValueSelf * weights.arousal_isSourceValueSelf

  arousal += features.isPerspectiveSelf * weights.arousal_isPerspectiveSelf
  arousal += features.isPerspectiveOther * weights.arousal_isPerspectiveOther
  arousal += features.isPerspectiveBoth * weights.arousal_isPerspectiveBoth

  arousal += features.isTimeframePast * weights.arousal_isTimeframePast
  arousal += features.isTimeframePresent * weights.arousal_isTimeframePresent
  arousal += features.isTimeframeFuture * weights.arousal_isTimeframeFuture

  arousal += features.isAcceptanceAccepted * weights.arousal_isAcceptanceAccepted
  arousal += features.isAcceptanceResisted * weights.arousal_isAcceptanceResisted
  arousal += features.isAcceptanceUncertain * weights.arousal_isAcceptanceUncertain

  arousal += features.activeValueCount * weights.arousal_activeValueCount
  arousal += features.activeGoalCount * weights.arousal_activeGoalCount
  arousal += features.activeNeedCount * weights.arousal_activeNeedCount

  arousal += Math.abs(features.sentimentScore) * weights.arousal_sentimentScore

  // Add state features
  arousal += features.s_StressEstimate * weights.arousal_s_StressEstimate

  // Add cultural features
  arousal += features.c_PowerDistanceScore * weights.arousal_c_PowerDistanceScore

  // Add personality features
  arousal += features.t_OCEAN_C * weights.arousal_t_OCEAN_C

  // Ensure the result is within 0.0 to 1.0 range
  return Math.max(0.0, Math.min(1.0, arousal))
}

/**
 * Calculates dominance using the linear model
 */
function calculateDominance(features: WeightedEngineInputFeatures, weights: LinearModelWeights): number {
  let dominance = weights.dominance_bias

  // Apply weights to features
  dominance += features.pValuationShift * weights.dominance_pValuationShift
  dominance += features.pPowerLevel * weights.dominance_pPowerLevel

  dominance += features.isSourceInternal * weights.dominance_isSourceInternal
  dominance += features.isSourceExternal * weights.dominance_isSourceExternal
  dominance += features.isSourceValueSelf * weights.dominance_isSourceValueSelf

  dominance += features.isPerspectiveSelf * weights.dominance_isPerspectiveSelf
  dominance += features.isPerspectiveOther * weights.dominance_isPerspectiveOther
  dominance += features.isPerspectiveBoth * weights.dominance_isPerspectiveBoth

  dominance += features.isTimeframePast * weights.dominance_isTimeframePast
  dominance += features.isTimeframePresent * weights.dominance_isTimeframePresent
  dominance += features.isTimeframeFuture * weights.dominance_isTimeframeFuture

  dominance += features.isAcceptanceAccepted * weights.dominance_isAcceptanceAccepted
  dominance += features.isAcceptanceResisted * weights.dominance_isAcceptanceResisted
  dominance += features.isAcceptanceUncertain * weights.dominance_isAcceptanceUncertain

  dominance += features.activeValueCount * weights.dominance_activeValueCount
  dominance += features.activeGoalCount * weights.dominance_activeGoalCount

  dominance += features.activeGoalCount * weights.dominance_activeGoalCount

  dominance += features.activeNeedCount * weights.dominance_activeNeedCount

  dominance += features.sentimentScore * weights.dominance_sentimentScore

  // Add state features
  dominance += features.s_MoodEstimate * weights.dominance_s_MoodEstimate

  // Add cultural features
  dominance += features.c_UncertaintyAvoidanceScore * weights.dominance_c_UncertaintyAvoidanceScore

  // Add personality features
  dominance += features.t_OCEAN_E * weights.dominance_t_OCEAN_E

  // Ensure the result is within 0.0 to 1.0 range
  return Math.max(0.0, Math.min(1.0, dominance))
}

/**
 * Calculates the initial confidence based on input confidences
 */
function calculateConfidence(appraisalConfidence: number, ruleVariables: RuleVariables): number {
  // For V1, a simple average of appraisal confidence and MHH variable confidences
  const avgRuleConfidence =
    (ruleVariables.source.confidence +
      ruleVariables.perspective.confidence +
      ruleVariables.timeframe.confidence +
      ruleVariables.acceptanceState.confidence) /
    4.0

  // Weighted average (60% appraisal, 40% MHH)
  const confidence = appraisalConfidence * 0.6 + avgRuleConfidence * 0.4

  // Ensure the result is within 0.0 to 1.0 range
  return Math.max(0.0, Math.min(1.0, confidence))
}
