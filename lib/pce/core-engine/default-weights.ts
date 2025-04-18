export interface LinearModelWeights {
  // Valence weights
  valence_pValuationShift: number
  valence_pPowerLevel: number
  valence_isSourceInternal: number
  valence_isSourceExternal: number
  valence_isSourceValueSelf: number
  valence_isPerspectiveSelf: number
  valence_isPerspectiveOther: number
  valence_isPerspectiveBoth: number
  valence_isTimeframePast: number
  valence_isTimeframePresent: number
  valence_isTimeframeFuture: number
  valence_isAcceptanceAccepted: number
  valence_isAcceptanceResisted: number
  valence_isAcceptanceUncertain: number
  valence_activeValueCount: number
  valence_activeGoalCount: number
  valence_activeNeedCount: number
  valence_sentimentScore: number
  valence_networkContextInfluence: number
  valence_profileModulation: number
  valence_bias: number

  // Arousal weights
  arousal_pValuationShift: number
  arousal_pPowerLevel: number
  arousal_isSourceInternal: number
  arousal_isSourceExternal: number
  arousal_isSourceValueSelf: number
  arousal_isPerspectiveSelf: number
  arousal_isPerspectiveOther: number
  arousal_isPerspectiveBoth: number
  arousal_isTimeframePast: number
  arousal_isTimeframePresent: number
  arousal_isTimeframeFuture: number
  arousal_isAcceptanceAccepted: number
  arousal_isAcceptanceResisted: number
  arousal_isAcceptanceUncertain: number
  arousal_activeValueCount: number
  arousal_activeGoalCount: number
  arousal_activeNeedCount: number
  arousal_sentimentScore: number
  arousal_networkContextInfluence: number
  arousal_profileModulation: number
  arousal_bias: number

  // Dominance weights
  dominance_pValuationShift: number
  dominance_pPowerLevel: number
  dominance_isSourceInternal: number
  dominance_isSourceExternal: number
  dominance_isSourceValueSelf: number
  dominance_isPerspectiveSelf: number
  dominance_isPerspectiveOther: number
  dominance_isPerspectiveBoth: number
  dominance_isTimeframePast: number
  dominance_isTimeframePresent: number
  dominance_isTimeframeFuture: number
  dominance_isAcceptanceAccepted: number
  dominance_isAcceptanceResisted: number
  dominance_isAcceptanceUncertain: number
  dominance_activeValueCount: number
  dominance_activeGoalCount: number
  dominance_activeNeedCount: number
  dominance_sentimentScore: number
  dominance_networkContextInfluence: number
  dominance_profileModulation: number
  dominance_bias: number

  // State weights
  valence_s_MoodEstimate: number
  arousal_s_StressEstimate: number
  dominance_s_MoodEstimate: number

  // Cultural weights
  valence_c_IndividualismScore: number
  arousal_c_PowerDistanceScore: number
  dominance_c_UncertaintyAvoidanceScore: number

  // Personality weights
  valence_t_OCEAN_O: number
  arousal_t_OCEAN_C: number
  dominance_t_OCEAN_E: number
}

export const defaultWeights: LinearModelWeights = {
  // Valence weights
  valence_pValuationShift: 0.6,
  valence_pPowerLevel: 0.1,
  valence_isSourceInternal: 0.05,
  valence_isSourceExternal: -0.05,
  valence_isSourceValueSelf: 0.0,
  valence_isPerspectiveSelf: 0.05,
  valence_isPerspectiveOther: -0.05,
  valence_isPerspectiveBoth: 0.0,
  valence_isTimeframePast: -0.05,
  valence_isTimeframePresent: 0.05,
  valence_isTimeframeFuture: 0.1,
  valence_isAcceptanceAccepted: 0.1,
  valence_isAcceptanceResisted: -0.1,
  valence_isAcceptanceUncertain: 0.0,
  valence_activeValueCount: 0.05,
  valence_activeGoalCount: 0.05,
  valence_activeNeedCount: 0.05,
  valence_sentimentScore: 0.3,
  valence_networkContextInfluence: 0.0, // Not used in MVP
  valence_profileModulation: 0.0, // Not used in MVP
  valence_bias: 0.0,

  // Arousal weights
  arousal_pValuationShift: 0.1,
  arousal_pPowerLevel: 0.5,
  arousal_isSourceInternal: 0.05,
  arousal_isSourceExternal: 0.1,
  arousal_isSourceValueSelf: 0.1,
  arousal_isPerspectiveSelf: 0.0,
  arousal_isPerspectiveOther: 0.05,
  arousal_isPerspectiveBoth: 0.1,
  arousal_isTimeframePast: -0.1,
  arousal_isTimeframePresent: 0.1,
  arousal_isTimeframeFuture: 0.2,
  arousal_isAcceptanceAccepted: -0.1,
  arousal_isAcceptanceResisted: 0.2,
  arousal_isAcceptanceUncertain: 0.1,
  arousal_activeValueCount: 0.1,
  arousal_activeGoalCount: 0.1,
  arousal_activeNeedCount: 0.1,
  arousal_sentimentScore: 0.2,
  arousal_networkContextInfluence: 0.0, // Not used in MVP
  arousal_profileModulation: 0.0, // Not used in MVP
  arousal_bias: 0.2,

  // Dominance weights
  dominance_pValuationShift: 0.2,
  dominance_pPowerLevel: 0.3,
  dominance_isSourceInternal: 0.2,
  dominance_isSourceExternal: -0.1,
  dominance_isSourceValueSelf: 0.1,
  dominance_isPerspectiveSelf: 0.1,
  dominance_isPerspectiveOther: -0.1,
  dominance_isPerspectiveBoth: 0.0,
  dominance_isTimeframePast: 0.0,
  dominance_isTimeframePresent: 0.1,
  dominance_isTimeframeFuture: 0.1,
  dominance_isAcceptanceAccepted: 0.2,
  dominance_isAcceptanceResisted: -0.2,
  dominance_isAcceptanceUncertain: 0.0,
  dominance_activeValueCount: 0.1,
  dominance_activeGoalCount: 0.1,
  dominance_activeNeedCount: 0.05,
  dominance_sentimentScore: 0.1,
  dominance_networkContextInfluence: 0.0, // Not used in MVP
  dominance_profileModulation: 0.0, // Not used in MVP
  dominance_bias: 0.0,

  // State weights
  valence_s_MoodEstimate: 0.1,
  arousal_s_StressEstimate: 0.2,
  dominance_s_MoodEstimate: 0.1,

  // Cultural weights
  valence_c_IndividualismScore: 0.05,
  arousal_c_PowerDistanceScore: 0.05,
  dominance_c_UncertaintyAvoidanceScore: 0.05,

  // Personality weights
  valence_t_OCEAN_O: 0.02,
  arousal_t_OCEAN_C: 0.02,
  dominance_t_OCEAN_E: 0.02,
}

/**
 * Configuration for temporal dynamics
 */

/**
 * Time window for recent ERs in minutes
 */
export const RECENT_ER_TIME_WINDOW_MINUTES = 30

/**
 * Maximum number of recent ERs to consider
 */
export const RECENT_ER_LIMIT = 7

/**
 * Inertia decay rate
 * Higher values mean faster decay (per second)
 */
export const INERTIA_DECAY_RATE = 0.0001

/**
 * How much previous mood persists
 */
export const MOOD_DECAY_FACTOR = 0.95

/**
 * How much previous stress persists
 */
export const STRESS_DECAY_FACTOR = 0.85

/**
 * How much recent valence affects mood
 */
export const VALENCE_INERTIA_WEIGHT = 0.1

/**
 * How much recent arousal affects stress
 */
export const AROUSAL_INERTIA_WEIGHT = 0.15
