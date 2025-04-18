import { logger } from "../../utils/logger"
import type {
  PInstanceData,
  RuleVariables,
  BootstrappedEP,
  VADOutput,
  WeightedEngineInputFeatures,
} from "../../types/pce-types"
import type { KgCulturalContextProfile, KgPersonalityProfile } from "../../types/kg-types"
import { defaultWeights, type LinearModelWeights } from "../core-engine/default-weights"

/**
 * Calculates VAD using a linear model with the provided inputs.
 * This function is robust, extensible, and logs errors gracefully.
 *
 * @param pInstanceData Perception instance data from appraisal
 * @param ruleVariables Inferred MHH variables
 * @param activeBootstrappedEPs Active bootstrapped emotional patterns
 * @param sentimentScore Sentiment score from NLP analysis
 * @param state Optional state features (moodEstimate, stressEstimate)
 * @param culturalContext Optional cultural context profile
 * @param personality Optional personality profile
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

    // Calculate valence, arousal, dominance
    const valence = calculateValence(features, weights)
    const arousal = calculateArousal(features, weights)
    const dominance = calculateDominance(features, weights)

    // Calculate confidence based on pAppraisalConfidence and MHH variable confidences
    const confidence = calculateConfidence(pInstanceData.pAppraisalConfidence, ruleVariables, features)

    return {
      valence,
      arousal,
      dominance,
      confidence,
    }
  } catch (error) {
    logger.error(`Error calculating linear VAD: ${error instanceof Error ? error.stack || error.message : error}`)

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
 * Prepares input features for the linear model.
 * This function is extensible and can be expanded with new features as needed.
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
  // Normalize sentiment score from 0-1 to -1 to 1
  const normalizedSentimentScore = (sentimentScore - 0.5) * 2

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

  // Additional extensible features (future-proofing)
  // Placeholders for future context, network, or modulation features
  const networkContextInfluence = 0.0
  const profileModulation = 0.0

  // State features
  const s_MoodEstimate = state?.moodEstimate ?? 0.0
  const s_StressEstimate = state?.stressEstimate ?? 0.0

  // Cultural features
  const c_IndividualismScore = culturalContext?.individualismScore ?? 0.5
  const c_PowerDistanceScore = culturalContext?.powerDistanceScore ?? 0.5
  const c_UncertaintyAvoidanceScore = culturalContext?.uncertaintyAvoidanceScore ?? 0.5

  // Personality features
  const t_OCEAN_O = personality?.OCEAN_O ?? 0.5
  const t_OCEAN_C = personality?.OCEAN_C ?? 0.5
  const t_OCEAN_E = personality?.OCEAN_E ?? 0.5
  const t_OCEAN_A = personality?.OCEAN_A ?? 0.5
  const t_OCEAN_N = personality?.OCEAN_N ?? 0.5

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

    // Placeholders for future features
    networkContextInfluence,
    profileModulation,

    // State features
    s_MoodEstimate,
    s_StressEstimate,

    // Cultural features
    c_IndividualismScore,
    c_PowerDistanceScore,
    c_UncertaintyAvoidanceScore,

    // Personality features
    t_OCEAN_O,
    t_OCEAN_C,
    t_OCEAN_E,
    t_OCEAN_A,
    t_OCEAN_N,
  }
}

/**
 * Calculates valence using the linear model.
 * All relevant features and weights are included for extensibility.
 */
function calculateValence(features: WeightedEngineInputFeatures, weights: LinearModelWeights): number {
  let valence = weights.valence_bias

  // Core features
  valence += features.pValuationShift * weights.valence_pValuationShift
  valence += features.pPowerLevel * weights.valence_pPowerLevel

  // MHH variables
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

  // EP activation
  valence += features.activeValueCount * weights.valence_activeValueCount
  valence += features.activeGoalCount * weights.valence_activeGoalCount
  valence += features.activeNeedCount * weights.valence_activeNeedCount

  // Sentiment
  valence += features.sentimentScore * weights.valence_sentimentScore

  // State
  valence += features.s_MoodEstimate * weights.valence_s_MoodEstimate

  // Cultural
  valence += features.c_IndividualismScore * weights.valence_c_IndividualismScore

  // Personality
  valence += features.t_OCEAN_O * weights.valence_t_OCEAN_O

  // Future extensibility: add more features as weights are defined

  // Clamp to -1.0 to 1.0
  return Math.max(-1.0, Math.min(1.0, valence))
}

/**
 * Calculates arousal using the linear model.
 * All relevant features and weights are included for extensibility.
 */
function calculateArousal(features: WeightedEngineInputFeatures, weights: LinearModelWeights): number {
  let arousal = weights.arousal_bias

  // Core features
  arousal += Math.abs(features.pValuationShift) * weights.arousal_pValuationShift
  arousal += features.pPowerLevel * weights.arousal_pPowerLevel

  // MHH variables
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

  // EP activation
  arousal += features.activeValueCount * weights.arousal_activeValueCount
  arousal += features.activeGoalCount * weights.arousal_activeGoalCount
  arousal += features.activeNeedCount * weights.arousal_activeNeedCount

  // Sentiment
  arousal += Math.abs(features.sentimentScore) * weights.arousal_sentimentScore

  // State
  arousal += features.s_StressEstimate * weights.arousal_s_StressEstimate

  // Cultural
  arousal += features.c_PowerDistanceScore * weights.arousal_c_PowerDistanceScore

  // Personality
  arousal += features.t_OCEAN_C * weights.arousal_t_OCEAN_C

  // Future extensibility: add more features as weights are defined

  // Clamp to 0.0 to 1.0
  return Math.max(0.0, Math.min(1.0, arousal))
}

/**
 * Calculates dominance using the linear model.
 * All relevant features and weights are included for extensibility.
 */
function calculateDominance(features: WeightedEngineInputFeatures, weights: LinearModelWeights): number {
  let dominance = weights.dominance_bias

  // Core features
  dominance += features.pValuationShift * weights.dominance_pValuationShift
  dominance += features.pPowerLevel * weights.dominance_pPowerLevel

  // MHH variables
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

  // EP activation
  dominance += features.activeValueCount * weights.dominance_activeValueCount
  dominance += features.activeGoalCount * weights.dominance_activeGoalCount
  dominance += features.activeNeedCount * weights.dominance_activeNeedCount

  // Sentiment
  dominance += features.sentimentScore * weights.dominance_sentimentScore

  // State
  dominance += features.s_MoodEstimate * weights.dominance_s_MoodEstimate

  // Cultural
  dominance += features.c_UncertaintyAvoidanceScore * weights.dominance_c_UncertaintyAvoidanceScore

  // Personality
  dominance += features.t_OCEAN_E * weights.dominance_t_OCEAN_E

  // Future extensibility: add more features as weights are defined

  // Clamp to 0.0 to 1.0
  return Math.max(0.0, Math.min(1.0, dominance))
}

/**
 * Calculates the initial confidence based on input confidences and features.
 * This function can be extended to include more sophisticated confidence estimation.
 */
function calculateConfidence(
  appraisalConfidence: number,
  ruleVariables: RuleVariables,
  features?: WeightedEngineInputFeatures
): number {
  // For V1, a simple average of appraisal confidence and MHH variable confidences
  const avgRuleConfidence =
    (ruleVariables.source.confidence +
      ruleVariables.perspective.confidence +
      ruleVariables.timeframe.confidence +
      ruleVariables.acceptanceState.confidence) /
    4.0

  // Optionally, future: include more sources of confidence (e.g., sentiment, state, etc.)

  // Weighted average (60% appraisal, 40% MHH)
  const confidence = appraisalConfidence * 0.6 + avgRuleConfidence * 0.4

  // Clamp to 0.0 to 1.0
  return Math.max(0.0, Math.min(1.0, confidence))
}
