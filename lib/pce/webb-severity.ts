import { logger } from "../utils/logger"

// Constants for weighting the power levels
export const EP_POWER_WEIGHT = 0.6 // Give EP slightly more weight
export const P_POWER_WEIGHT = 0.4 // Perception power weight

// Maximum EP power level (for normalization)
export const MAX_EP_POWER_LEVEL = 10

/**
 * Severity mapping for each emotion group
 * These lists are derived directly from webb.md
 */
export const SEVERITY_MAP: Record<string, string[]> = {
  // Core emotion groups with well-defined severity levels
  "Fear Group": ["Concerned", "Cautious", "Afraid/Fearful", "Horror/Fright", "Panic"],
  "Anger Group": ["Annoyed", "Frustrated", "Angry", "Hate/Fury", "Rage"],
  "Sadness Group": ["Disappointed", "Hurt", "Sad", "Grief", "Despair"],
  "Happiness Group": ["Satisfied", "Pleased", "Happy", "Elated", "Ecstatic"],
  "Disgust Group": ["Dislike", "Distaste", "Disgusted", "Repulsed", "Revulsion/Sickened"],

  // Additional emotion groups
  "Worry Group": ["Concerned", "Nervous", "Worried", "Anxious", "Dread"],
  "Regret Group": ["Mild Regret", "Remorseful", "Regretful", "Deep Regret", "Profound Regret"],
  "Positive Anticipation Group": ["Hopeful", "Optimistic", "Excited", "Eager", "Thrilled"],
  "Negative Anticipation Group": ["Uneasy", "Apprehensive", "Dreading", "Fearful", "Terrified"],
  "Pride Group": ["Satisfied", "Pleased", "Proud", "Very Proud", "Triumphant"],
  "Shame Group": ["Embarrassed", "Guilty", "Ashamed", "Humiliated", "Mortified"],
  "Embarrassment Group": ["Slightly Embarrassed", "Embarrassed", "Very Embarrassed", "Humiliated", "Mortified"],
  "Flattery Group": ["Flattered", "Very Flattered", "Extremely Flattered", "Overwhelmed", "Excessively Flattered"],
  "Surprise Group": ["Startled", "Surprised", "Astonished", "Shocked", "Stunned"],
  "Stress Group": ["Pressured", "Stressed", "Very Stressed", "Overwhelmed", "Burnt Out"],
  "Relief Group": ["Mild Relief", "Relieved", "Very Relieved", "Deeply Relieved", "Profound Relief"],
  "Envy Group": ["Mild Envy", "Envious", "Jealous", "Very Jealous", "Consumed by Envy"],
  "Love Group": ["Affection", "Fondness", "Love", "Deep Love", "Profound Love"],
  "Confusion Group": ["Puzzled", "Confused", "Very Confused", "Bewildered", "Completely Lost"],
  "Boredom Group": ["Disinterested", "Bored", "Very Bored", "Extremely Bored", "Utterly Bored"],
  "Curiosity Group": ["Interested", "Curious", "Very Curious", "Fascinated", "Obsessed"],

  // Default fallback
  Default: ["Mild", "Moderate", "Strong", "Very Strong", "Extreme"],
  "Neutral Group": ["Slightly Neutral", "Neutral", "Calm", "Relaxed", "Serene"],
}

/**
 * Determines the specific emotion label within a Webb Emotion Group based on power levels
 *
 * @param emotionGroup The emotion group determined by the Webb Rule Engine
 * @param epPowerLevel The power level of the relevant EP (Expectation/Preference), typically 0-10
 * @param pPowerLevel The power level of the Perception, typically 0-1
 * @returns The specific emotion label within the group
 */
export function determineWebbSeverityLabel(emotionGroup: string, epPowerLevel: number, pPowerLevel: number): string {
  // Input validation and clamping
  const clampedEpPL = Math.max(0, Math.min(MAX_EP_POWER_LEVEL, epPowerLevel || 0))
  const clampedPPL = Math.max(0, Math.min(1, pPowerLevel || 0))

  logger.debug("Determining Webb severity label", {
    emotionGroup,
    epPowerLevel: clampedEpPL,
    pPowerLevel: clampedPPL,
  })

  // Combine power levels into a single intensity score
  // Scale EP power level to 0-1 range before combining
  const scaledEpPL = clampedEpPL / MAX_EP_POWER_LEVEL
  let intensity = scaledEpPL * EP_POWER_WEIGHT + clampedPPL * P_POWER_WEIGHT
  intensity = Math.max(0.0, Math.min(1.0, intensity)) // Ensure intensity is in 0-1 range

  logger.debug("Calculated intensity", { intensity, scaledEpPL, clampedPPL })

  // Get the severity labels for the emotion group, or use default if not found
  const labels = SEVERITY_MAP[emotionGroup] || SEVERITY_MAP["Default"] || [emotionGroup]
  const numLevels = labels.length

  // Map intensity to severity index
  // Ensure intensity 1.0 maps to the highest index (length - 1)
  let severityIndex = Math.floor(intensity * numLevels)
  if (intensity === 1.0) {
    severityIndex = numLevels - 1 // Handle edge case where intensity is exactly 1.0
  }

  // Clamp index to ensure it's within bounds
  severityIndex = Math.max(0, Math.min(numLevels - 1, severityIndex))

  logger.debug("Mapped to severity index", { severityIndex, numLevels })

  // Get the severity label
  const severityLabel = labels[severityIndex]

  if (!severityLabel) {
    logger.warn(`Could not find severity label for group '${emotionGroup}' at index ${severityIndex}. Defaulting.`)
    return emotionGroup // Return group name as fallback
  }

  logger.debug("Selected severity label", { severityLabel })

  return severityLabel
}

/**
 * Utility function to get a debug-friendly string representation of the severity calculation
 */
export function formatWebbSeverityCalculation(emotionGroup: string, epPowerLevel: number, pPowerLevel: number): string {
  const label = determineWebbSeverityLabel(emotionGroup, epPowerLevel, pPowerLevel)
  const clampedEpPL = Math.max(0, Math.min(MAX_EP_POWER_LEVEL, epPowerLevel || 0))
  const clampedPPL = Math.max(0, Math.min(1, pPowerLevel || 0))
  const scaledEpPL = clampedEpPL / MAX_EP_POWER_LEVEL
  const intensity = scaledEpPL * EP_POWER_WEIGHT + clampedPPL * P_POWER_WEIGHT

  return `Emotion: ${label} (from ${emotionGroup})\nEP Power: ${clampedEpPL.toFixed(1)}/10, P Power: ${(clampedPPL * 100).toFixed(1)}%\nCombined Intensity: ${(intensity * 100).toFixed(1)}%`
}
