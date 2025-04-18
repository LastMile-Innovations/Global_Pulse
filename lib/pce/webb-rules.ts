import { logger } from "../utils/logger"

// Constants for confidence thresholds
export const LOW_CONFIDENCE_THRESHOLD = 0.6
export const HIGH_CONFIDENCE_THRESHOLD = 0.85

// Constants for emotion groups (matching webb.md terminology)
export const FEAR_GROUP = "Fear Group"
export const ANGER_GROUP = "Anger Group"
export const SADNESS_GROUP = "Sadness Group"
export const WORRY_GROUP = "Worry Group"
export const REGRET_GROUP = "Regret Group"
export const HAPPINESS_GROUP = "Happiness Group"
export const POSITIVE_ANTICIPATION_GROUP = "Positive Anticipation Group"
export const NEGATIVE_ANTICIPATION_GROUP = "Negative Anticipation Group"
export const PRIDE_GROUP = "Pride Group"
export const SHAME_GROUP = "Shame Group"
export const EMBARRASSMENT_GROUP = "Embarrassment Group"
export const FLATTERY_GROUP = "Flattery Group"
export const DISGUST_GROUP = "Disgust Group"
export const SURPRISE_GROUP = "Surprise Group"
export const STRESS_GROUP = "Stress Group"
export const RELIEF_GROUP = "Relief Group"
export const ENVY_GROUP = "Envy Group"
export const LOVE_GROUP = "Love Group"
export const CONFUSION_GROUP = "Confusion Group"
export const BOREDOM_GROUP = "Boredom Group"
export const CURIOSITY_GROUP = "Curiosity Group"
export const NEUTRAL_GROUP = "Neutral Group"

/**
 * Input interface for the Webb Rule Engine, combining MHH variables and P-Instance data
 */
export interface WebbRuleEngineInput {
  // MHH variables with confidence
  mhhVariables: {
    source: { value: string; confidence: number }
    perspective: { value: string; confidence: number }
    timeframe: { value: string; confidence: number }
    acceptanceState: { value: string; confidence: number }
  }
  // Additional P-Instance data needed for rules
  pInstanceData: {
    pValuationShiftEstimate: number
    pPowerLevel: number
    pAppraisalConfidence: number
  }
}

/**
 * Output interface for the Webb Rule Engine
 */
export interface WebbRuleEngineOutput {
  // The determined emotion group
  emotionGroup: string
  // Confidence in the determination (0.0 to 1.0)
  confidence: number
  // Path taken through the rule engine (for debugging/explanation)
  rulePath: string[]
}

/**
 * Determines the Webb Emotion Group based on MHH variables and P-Instance data
 *
 * @param input The MHH variables and P-Instance data
 * @returns The determined emotion group, confidence, and rule path
 */
export function determineWebbEmotionGroup(input: WebbRuleEngineInput): WebbRuleEngineOutput {
  const { mhhVariables, pInstanceData } = input
  const rulePath: string[] = []

  // Extract MHH variables for easier access
  const source = mhhVariables.source.value
  const sourceConfidence = mhhVariables.source.confidence
  const perspective = mhhVariables.perspective.value
  const perspectiveConfidence = mhhVariables.perspective.confidence
  const timeframe = mhhVariables.timeframe.value
  const timeframeConfidence = mhhVariables.timeframe.confidence
  const acceptanceState = mhhVariables.acceptanceState.value
  const acceptanceConfidence = mhhVariables.acceptanceState.confidence

  // Extract P-Instance data
  const valuationShift = pInstanceData.pValuationShiftEstimate
  const powerLevel = pInstanceData.pPowerLevel
  const appraisalConfidence = pInstanceData.pAppraisalConfidence

  // Default output (will be overridden if rules match)
  let emotionGroup = CONFUSION_GROUP
  let confidence = appraisalConfidence * 0.7 // Base confidence on appraisal confidence

  // Calculate overall MHH confidence
  const overallMhhConfidence =
    (sourceConfidence + perspectiveConfidence + timeframeConfidence + acceptanceConfidence) / 4

  // Check for low overall confidence in MHH variables
  if (overallMhhConfidence < LOW_CONFIDENCE_THRESHOLD) {
    rulePath.push("Low overall MHH confidence")
    return {
      emotionGroup: CONFUSION_GROUP,
      confidence: overallMhhConfidence,
      rulePath,
    }
  }

  // Check for unclear values in critical MHH variables
  if (source === "unclear" || acceptanceState === "unclear" || timeframe === "unclear") {
    rulePath.push("Critical MHH variable is unclear")
    return {
      emotionGroup: CONFUSION_GROUP,
      confidence: overallMhhConfidence * 0.8,
      rulePath,
    }
  }

  // Main rule logic based on webb.md "Conditions for..." sections
  // Organized by valuation shift (negative/positive) and then by acceptance state and timeframe

  // NEGATIVE VALUATION SHIFT EMOTIONS
  if (valuationShift < 0) {
    // NOT ACCEPTED (RESISTED) NEGATIVE OUTCOMES
    if (acceptanceState === "resisted") {
      // PRESENT OR PAST TIMEFRAME
      if (timeframe === "present" || timeframe === "past") {
        // FEAR GROUP vs ANGER GROUP - differentiated by source
        if (source === "external" && sourceConfidence >= LOW_CONFIDENCE_THRESHOLD) {
          // External source with sufficient confidence -> Anger
          rulePath.push("Anger Group: External threat, resisted, present/past timeframe, negative valuation")
          emotionGroup = ANGER_GROUP
          confidence = Math.min(sourceConfidence, acceptanceConfidence) * 0.9
        } else {
          // Internal source or low confidence external -> Fear
          rulePath.push("Fear Group: Internal/uncertain threat, resisted, present/past timeframe, negative valuation")
          emotionGroup = FEAR_GROUP
          confidence =
            Math.min(acceptanceConfidence, source === "external" ? 1.0 - sourceConfidence : sourceConfidence) * 0.9
        }
      }
      // FUTURE TIMEFRAME
      else if (timeframe === "future") {
        // Future negative, resisted -> Worry
        rulePath.push("Worry Group: Future negative outcome, resisted")
        emotionGroup = WORRY_GROUP
        confidence = Math.min(timeframeConfidence, acceptanceConfidence) * 0.9
      }
      // ONGOING TIMEFRAME
      else if (timeframe === "ongoing") {
        // Ongoing demands, resisted -> Stress
        rulePath.push("Stress Group: Ongoing demands, resisted")
        emotionGroup = STRESS_GROUP
        confidence = Math.min(timeframeConfidence, acceptanceConfidence) * 0.9
      }
    }
    // ACCEPTED NEGATIVE OUTCOMES
    else if (acceptanceState === "accepted") {
      // PRESENT TIMEFRAME
      if (timeframe === "present") {
        // DISGUST GROUP vs SADNESS GROUP - differentiated by source and visceral reaction
        if (source === "external" && valuationShift < -0.7) {
          // External negative stimulus, accepted, present, strong negative -> Disgust
          rulePath.push("Disgust Group: External negative stimulus, accepted, present timeframe, strong negative")
          emotionGroup = DISGUST_GROUP
          confidence = Math.min(sourceConfidence, acceptanceConfidence) * 0.9
        } else if (source !== "valueSelf") {
          // Accepted negative outcome, not self-value related -> Sadness
          rulePath.push("Sadness Group: Accepted negative outcome, present timeframe, not self-value related")
          emotionGroup = SADNESS_GROUP
          confidence = acceptanceConfidence * 0.9
        }
      }
      // PAST TIMEFRAME
      else if (timeframe === "past") {
        if (source !== "valueSelf") {
          // Past negative outcome, accepted -> Regret
          rulePath.push("Regret Group: Past negative outcome, accepted")
          emotionGroup = REGRET_GROUP
          confidence = Math.min(timeframeConfidence, acceptanceConfidence) * 0.9
        } else {
          // Sadness can also apply to past timeframe
          rulePath.push("Sadness Group: Accepted negative outcome, past timeframe, not self-value related")
          emotionGroup = SADNESS_GROUP
          confidence = acceptanceConfidence * 0.9
        }
      }
      // FUTURE TIMEFRAME
      else if (timeframe === "future") {
        // Future negative outcome, accepted -> Negative Anticipation
        rulePath.push("Negative Anticipation Group: Future negative outcome, accepted")
        emotionGroup = NEGATIVE_ANTICIPATION_GROUP
        confidence = Math.min(timeframeConfidence, acceptanceConfidence) * 0.9
      }
    }
    // UNCERTAIN ACCEPTANCE STATE
    else if (acceptanceState === "uncertain") {
      // Uncertain acceptance state -> Confusion
      rulePath.push("Confusion Group: Uncertain acceptance state with negative valuation")
      emotionGroup = CONFUSION_GROUP
      confidence = 0.7 // Relatively high confidence that the person is confused
    }

    // SELF-VALUE SOURCE NEGATIVE EMOTIONS (overrides previous assignments if applicable)
    if (source === "valueSelf" && sourceConfidence >= LOW_CONFIDENCE_THRESHOLD) {
      if (perspective === "self") {
        // Self-value related negative outcome, self perspective -> Shame
        rulePath.push("Shame Group: Self-value related negative outcome, self perspective")
        emotionGroup = SHAME_GROUP
        confidence = Math.min(sourceConfidence, perspectiveConfidence) * 0.9
      } else if (perspective === "other" || perspective === "both") {
        // Self-value related negative outcome, other/both perspective -> Embarrassment
        rulePath.push("Embarrassment Group: Self-value related negative outcome, other/both perspective")
        emotionGroup = EMBARRASSMENT_GROUP
        confidence = Math.min(sourceConfidence, perspectiveConfidence) * 0.9
      }
    }

    // ENVY GROUP - special case for external source, other perspective, negative valuation
    if (source === "external" && perspective === "other" && valuationShift < 0) {
      // External source, other perspective, negative valuation -> Envy
      rulePath.push("Envy Group: External source, other perspective, negative valuation")
      emotionGroup = ENVY_GROUP
      confidence = Math.min(sourceConfidence, perspectiveConfidence) * 0.8
    }
  }
  // POSITIVE VALUATION SHIFT EMOTIONS
  else if (valuationShift > 0) {
    // PRESENT OR PAST TIMEFRAME
    if (timeframe === "present" || timeframe === "past") {
      if (source === "valueSelf") {
        // Self-value related positive outcome -> Pride
        rulePath.push("Pride Group: Self-value related positive outcome")
        emotionGroup = PRIDE_GROUP
        confidence = Math.min(sourceConfidence, 0.9)
      } else {
        // Present/past positive outcome, not self-value related -> Happiness
        rulePath.push("Happiness Group: Present/past positive outcome, not self-value related")
        emotionGroup = HAPPINESS_GROUP
        confidence = timeframeConfidence * 0.9
      }

      // RELIEF GROUP - special case for past negative event ended, positive valuation
      if (timeframe === "past" && acceptanceState === "accepted") {
        // Past negative event ended, positive valuation -> Relief
        rulePath.push("Relief Group: Past negative event ended, positive valuation")
        emotionGroup = RELIEF_GROUP
        confidence = Math.min(timeframeConfidence, acceptanceConfidence) * 0.9
      }
    }
    // FUTURE TIMEFRAME
    else if (timeframe === "future") {
      // Future positive outcome -> Positive Anticipation
      rulePath.push("Positive Anticipation Group: Future positive outcome")
      emotionGroup = POSITIVE_ANTICIPATION_GROUP
      confidence = timeframeConfidence * 0.9
    }

    // FLATTERY GROUP - special case for external source, other perspective, positive valuation
    if (source === "external" && perspective === "other" && acceptanceState !== "accepted") {
      // Flattery: External source, other perspective, positive valuation, not necessarily accepted
      rulePath.push("Flattery Group: External source, other perspective, positive valuation, not fully accepted")
      emotionGroup = FLATTERY_GROUP
      confidence = Math.min(sourceConfidence, perspectiveConfidence) * 0.8
    }

    // LOVE GROUP - special case for external source, positive valuation, accepted
    if (source === "external" && acceptanceState === "accepted") {
      // External source, positive valuation, accepted -> Love
      rulePath.push("Love Group: External source, positive valuation, accepted")
      emotionGroup = LOVE_GROUP
      confidence = Math.min(sourceConfidence, acceptanceConfidence) * 0.8
    }
  }
  // NEUTRAL VALUATION SHIFT OR SPECIAL CASES
  else {
    // SURPRISE GROUP - based on high power level, present timeframe
    if (timeframe === "present" && powerLevel > 0.7) {
      // High power level event, present timeframe -> Surprise
      rulePath.push("Surprise Group: High power level event, present timeframe")
      emotionGroup = SURPRISE_GROUP
      confidence = Math.min(timeframeConfidence, 0.8)
    }

    // BOREDOM GROUP - based on low power level, ongoing timeframe
    if (timeframe === "ongoing" && powerLevel < 0.3) {
      // Low power level, ongoing timeframe -> Boredom
      rulePath.push("Boredom Group: Low power level, ongoing timeframe")
      emotionGroup = BOREDOM_GROUP
      confidence = Math.min(timeframeConfidence, 0.8)
    }

    // CURIOSITY GROUP - based on external source, neutral/positive valuation, uncertain acceptance
    if (source === "external" && acceptanceState === "uncertain") {
      // External source, neutral/positive valuation, uncertain acceptance -> Curiosity
      rulePath.push("Curiosity Group: External source, neutral/positive valuation, uncertain acceptance")
      emotionGroup = CURIOSITY_GROUP
      confidence = Math.min(sourceConfidence, acceptanceConfidence) * 0.8
    }
  }

  // If no specific rules matched, default to NEUTRAL_GROUP
  if (rulePath.length === 0) {
    rulePath.push("No specific Webb Emotion Group rules matched")
    emotionGroup = NEUTRAL_GROUP
    confidence = 0.5 // Medium confidence in the default case
    logger.warn("No specific Webb Emotion Group rules matched for MHH input:", {
      source,
      perspective,
      timeframe,
      acceptanceState,
      valuationShift,
    })
  }

  return {
    emotionGroup,
    confidence,
    rulePath,
  }
}

/**
 * Utility function to get a debug-friendly string representation of the rule engine output
 */
export function formatWebbRuleEngineOutput(output: WebbRuleEngineOutput): string {
  return `Emotion Group: ${output.emotionGroup} (Confidence: ${(output.confidence * 100).toFixed(1)}%)\nRule Path: ${output.rulePath.join(" → ")}`
}
