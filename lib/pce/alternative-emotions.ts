import type { VADOutput } from "./vad-consistency"
import { TYPICAL_VAD_PROFILES, type VADProfile } from "./vad-profiles"
import { calculateVADDistance } from "./vad-consistency"
import { logger } from "../utils/logger"

/**
 * Interface for an alternative emotion with distance
 */
export interface AlternativeEmotion {
  label: string
  distance: number
  vadProfile: VADProfile
}

/**
 * Find alternative emotions that are closest to a given VAD profile
 *
 * @param vad The VAD profile to find alternatives for
 * @param currentLabel The current emotion label to exclude from alternatives
 * @param count The number of alternatives to return
 * @returns Array of alternative emotions sorted by distance (closest first)
 */
export function findAlternativeEmotions(vad: VADOutput, currentLabel: string, count = 3): AlternativeEmotion[] {
  // Calculate distance to all emotion profiles except the current one
  const alternatives: AlternativeEmotion[] = []

  for (const [label, profile] of Object.entries(TYPICAL_VAD_PROFILES)) {
    // Skip the current label
    if (label === currentLabel) continue

    const distance = calculateVADDistance(vad, profile)

    alternatives.push({
      label,
      distance,
      vadProfile: profile,
    })
  }

  // Sort by distance (closest first)
  alternatives.sort((a, b) => a.distance - b.distance)

  // Take the top 'count' alternatives
  const topAlternatives = alternatives.slice(0, count)

  logger.debug("Found alternative emotions", {
    vad,
    currentLabel,
    topAlternatives,
  })

  return topAlternatives
}

/**
 * Find alternative emotions within the same emotion group
 *
 * @param vad The VAD profile to find alternatives for
 * @param currentLabel The current emotion label to exclude from alternatives
 * @param emotionGroup The emotion group to search within
 * @param count The number of alternatives to return
 * @returns Array of alternative emotions sorted by distance (closest first)
 */
export function findAlternativesInGroup(
  vad: VADOutput,
  currentLabel: string,
  emotionGroup: string,
  count = 2,
): AlternativeEmotion[] {
  // Get all labels that might belong to this group
  // This is a simplistic approach - in a real implementation, you would have
  // a mapping from emotion groups to their member labels
  const groupPattern = new RegExp(`^${emotionGroup.replace(/\s+Group$/, "")}`, "i")

  // Calculate distance to all emotion profiles in the group except the current one
  const alternatives: AlternativeEmotion[] = []

  for (const [label, profile] of Object.entries(TYPICAL_VAD_PROFILES)) {
    // Skip the current label
    if (label === currentLabel) continue

    // Check if label belongs to the group (simplistic approach)
    if (groupPattern.test(label) || label.includes(emotionGroup.replace(/\s+Group$/, ""))) {
      const distance = calculateVADDistance(vad, profile)

      alternatives.push({
        label,
        distance,
        vadProfile: profile,
      })
    }
  }

  // Sort by distance (closest first)
  alternatives.sort((a, b) => a.distance - b.distance)

  // Take the top 'count' alternatives
  const topAlternatives = alternatives.slice(0, count)

  logger.debug("Found alternative emotions in group", {
    vad,
    currentLabel,
    emotionGroup,
    topAlternatives,
  })

  return topAlternatives
}
