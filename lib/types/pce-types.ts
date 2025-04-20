export interface VADOutput {
  /**
   * Valence (-1.0 to 1.0)
   * Negative values indicate negative emotions, positive values indicate positive emotions
   */
  valence: number

  /**
   * Arousal (0.0 to 1.0)
   * Higher values indicate higher activation/energy
   */
  arousal: number

  /**
   * Dominance (0.0 to 1.0)
   * Higher values indicate feeling more in control
   */
  dominance: number

  /**
   * Confidence in the VAD assessment (0.0 to 1.0)
   */
  confidence: number
}

/**
 * State output from EWEF analysis
 */
export interface StateOutput {
  /**
   * Timestamp of the state assessment
   */
  timestamp: number

  /**
   * Mood estimate (-1.0 to 1.0)
   */
  moodEstimate: number

  /**
   * Stress estimate (0.0 to 1.0)
   */
  stressEstimate: number
}

/**
 * Perception instance output
 */
export interface PInstanceData {
  /**
   * Mental health hypothesis source
   */
  mhhSource: "internal" | "external" | "valueSelf"

  /**
   * Mental health hypothesis perspective
   */
  mhhPerspective: "self" | "other" | "both"

  /**
   * Mental health hypothesis timeframe
   */
  mhhTimeframe: "past" | "present" | "future"

  /**
   * Mental health hypothesis acceptance state
   */
  mhhAcceptanceState: "accepted" | "resisted" | "uncertain"

  /**
   * Perception valuation shift estimate (-1.0 to 1.0)
   */
  pValuationShiftEstimate: number

  /**
   * Perception power level (0.0 to 1.0)
   */
  pPowerLevel: number

  /**
   * Perception appraisal confidence (0.0 to 1.0)
   */
  pAppraisalConfidence: number
}

/**
 * Rule variable with confidence
 */
export interface RuleVariable<T> {
  /**
   * The value of the variable
   */
  value: T

  /**
   * Confidence in the value (0.0 to 1.0)
   */
  confidence: number
}

/**
 * Rule variables output
 */
export interface RuleVariables {
  source: { value: "internal" | "external" | "valueSelf"; confidence: number }
  perspective: { value: "self" | "other" | "both"; confidence: number }
  timeframe: { value: "past" | "present" | "future"; confidence: number }
  acceptanceState: { value: "accepted" | "resisted" | "uncertain"; confidence: number }
}

/**
 * Bootstrapped Emotional Pattern (EP)
 */
export interface BootstrappedEP {
  id: string
  name: string
  type: "VALUE" | "GOAL" | "NEED"
  powerLevel: number
  valuation: number
  activationWeight: number
}

/**
 * Minimal State S
 */
export interface MinimalStateS {
  timestamp: number
  moodEstimate: number
  stressEstimate: number
}

/**
 * Weighted Engine Input Features
 */
export interface WeightedEngineInputFeatures {
  // Core features from P-Instance
  pValuationShift: number
  pPowerLevel: number

  // MHH variables as binary features
  isSourceInternal: number
  isSourceExternal: number
  isSourceValueSelf: number

  isPerspectiveSelf: number
  isPerspectiveOther: number
  isPerspectiveBoth: number

  isTimeframePast: number
  isTimeframePresent: number
  isTimeframeFuture: number

  isAcceptanceAccepted: number
  isAcceptanceResisted: number
  isAcceptanceUncertain: number

  // EP activation features
  activeValueCount: number
  activeGoalCount: number
  activeNeedCount: number

  // Sentiment features
  sentimentScore: number

  // Default placeholder for MVP (these would be populated in future versions)
  networkContextInfluence: number
  profileModulation: number

  // State features
  s_MoodEstimate: number // Added for state
  s_StressEstimate: number // Added for state

  // Cultural features
  c_IndividualismScore: number // Added for culture
  c_PowerDistanceScore: number // Added for culture
  c_UncertaintyAvoidanceScore: number // Added for culture

  // Personality features
  t_OCEAN_O: number // Added for personality
  t_OCEAN_C: number // Added for personality
  t_OCEAN_E: number // Added for personality
  t_OCEAN_A: number // Added for personality
  t_OCEAN_N: number // Added for personality
}

/**
 * Emotion categorization output
 */
export interface EmotionCategorization {
  /**
   * Primary emotion label
   */
  primaryLabel: string

  /**
   * Emotion group (e.g., "Negative", "Positive", "Neutral")
   */
  emotionGroup: string

  /**
   * Distribution of probabilities across emotion categories
   */
  categoryDistribution: Record<string, number>
}

/**
 * EWEF Analysis Output
 */
export interface EWEFAnalysisOutput {
  vad: VADOutput
  state: StateOutput
  activeEPs: BootstrappedEP[]
  pInstance: PInstanceData
  ruleVariables: RuleVariables
  emotionCategorization?: EmotionCategorization
  analysisConfidence: number
}

/**
 * Attachment type enum
 */
export type AttachmentType = "VALUE" | "GOAL" | "NEED" | "BELIEF" | "INTEREST" | "IDENTITY" | "CONCEPT"

/**
 * Inference method enum
 */
export type InferenceMethod = "ZSC" | "NER" | "EMBEDDING" | "KEYWORD" | "LLM" | "COMBINED"

/**
 * Inferred attachment from text
 */
export interface InferredAttachment {
  /**
   * Name of the attachment
   */
  name: string

  /**
   * Type of attachment
   */
  type: AttachmentType

  /**
   * Estimated power level (0-10)
   */
  estimatedPL: number

  /**
   * Estimated valence (-10 to 10)
   */
  estimatedV: number

  /**
   * Certainty of the inference (0-1)
   */
  certainty: number

  /**
   * Source text that led to this inference
   */
  sourceText?: string

  /**
   * Method used for inference
   */
  inferenceMethod: InferenceMethod
}

/**
 * Interaction guidance parameters
 */
export interface InteractionGuidance {
  /**
   * Primary dialogue act to perform
   */
  primaryDialogueAct: string

  /**
   * Additional parameters for the dialogue act
   */
  parameters: Record<string, any>

  /**
   * Suggested focus areas for the response
   */
  suggestedFocus: string[]
}

/**
 * Social Context
 */
export interface SocialContext {
  // Scenario flags
  isPotentialGuiltScenario: boolean
  isPotentialPrideScenario: boolean
  isPotentialEmbarrassmentScenario: boolean

  // Context details
  involvedHarmToOther: boolean
  involvedNormViolation: boolean
  involvedAchievement: boolean
  involvedCompetence: boolean
  involvedGoalAttainment: boolean
  involvedPublicExposure: boolean
  involvedSocialRuleViolation: boolean

  // Confidence metrics
  perspectiveConfidence: number
}

/**
 * Represents the high-level source or reason for generating a specific assistant response.
 * Used for logging, auditing, and potentially conditional UI rendering.
 * @enum {string}
 */
export type ResponseRationaleSource =
  | 'PCE-Informed-LLM' // Standard reflective response informed by PCE analysis.
  | 'Confidence-Fallback:ListeningAck' // Fallback due to low PCE analysis confidence.
  | 'User-Paused:ListeningAck' // Fallback because user paused analysis for the session.
  | 'Error-Fallback:Generic' // Fallback due to an error during analysis or response generation.
  | 'Special-Flow:BootstrapPrompt' // Initial system prompt or greeting.
  | 'Special-Flow:DistressCheck' // Response related to distress detection flow.
  | 'Special-Flow:SomaticPrompt' // Response related to somatic awareness prompt flow.
  | 'Special-Flow:CoherenceCheck' // Response related to coherence check flow.
  | 'User-Feedback:Response' // A response generated based on user feedback (e.g., confirming resonance).
  | 'Unknown' // Default or unknown source.
