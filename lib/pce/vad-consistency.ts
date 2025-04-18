import type { VADProfile } from "./vad-profiles"
import { logger } from "../utils/logger"

/**
 * Interface for VAD output from the Core VAD Engine
 */
export interface VADOutput {
  valence: number
  arousal: number
  dominance: number
  confidence: number
}

// Constants for distance calculation and mapping
export const MAX_VAD_DISTANCE = 1.732 // Maximum possible distance in 3D VAD space (sqrt(3))
export const CONSISTENCY_THRESHOLD_HIGH = 0.2 // Distance below which consistency is high
export const CONSISTENCY_THRESHOLD_MEDIUM = 0.5 // Distance below which consistency is medium
export const CONSISTENCY_THRESHOLD_LOW = 0.8 // Distance below which consistency is low

/**
 * Calculate the Euclidean distance between two VAD profiles
 *
 * @param vad1 The first VAD profile
 * @param vad2 The second VAD profile
 * @returns The Euclidean distance between the two profiles
 */
export function calculateVADDistance(vad1: VADOutput | VADProfile, vad2: VADProfile): number {
  const valDiff = vad1.valence - vad2.valence
  const aroDiff = vad1.arousal - vad2.arousal
  const domDiff = vad1.dominance - vad2.dominance

  // Calculate Euclidean distance in 3D space
  const distance = Math.sqrt(valDiff * valDiff + aroDiff * aroDiff + domDiff * domDiff)

  logger.debug("VAD distance calculation", {
    vad1,
    vad2,
    distance,
  })

  return distance
}

/**
 * Map a VAD distance to a consistency score between 0 and 1
 *
 * @param distance The Euclidean distance between two VAD profiles
 * @returns A consistency score between 0 (inconsistent) and 1 (highly consistent)
 */
export function mapDistanceToConsistency(distance: number): number {
  // Inverse exponential mapping: consistency = e^(-k * distance)
  // where k is a scaling factor to ensure appropriate decay rate
  const k = 2.5 // Tuned to ensure good distribution across the consistency range
  let consistency = Math.exp(-k * distance)

  // Ensure consistency is between 0 and 1
  consistency = Math.max(0, Math.min(1, consistency))

  logger.debug("Distance to consistency mapping", {
    distance,
    consistency,
  })

  return consistency
}

/**
 * Alternative linear mapping function for distance to consistency
 *
 * @param distance The Euclidean distance between two VAD profiles
 * @returns A consistency score between 0 (inconsistent) and 1 (highly consistent)
 */
export function mapDistanceToConsistencyLinear(distance: number): number {
  // Linear mapping with thresholds
  let consistency: number

  if (distance <= CONSISTENCY_THRESHOLD_HIGH) {
    // High consistency range (0.8-1.0)
    consistency = 1.0 - (distance / CONSISTENCY_THRESHOLD_HIGH) * 0.2
  } else if (distance <= CONSISTENCY_THRESHOLD_MEDIUM) {
    // Medium consistency range (0.5-0.8)
    const ratio = (distance - CONSISTENCY_THRESHOLD_HIGH) / (CONSISTENCY_THRESHOLD_MEDIUM - CONSISTENCY_THRESHOLD_HIGH)
    consistency = 0.8 - ratio * 0.3
  } else if (distance <= CONSISTENCY_THRESHOLD_LOW) {
    // Low consistency range (0.2-0.5)
    const ratio = (distance - CONSISTENCY_THRESHOLD_MEDIUM) / (CONSISTENCY_THRESHOLD_LOW - CONSISTENCY_THRESHOLD_MEDIUM)
    consistency = 0.5 - ratio * 0.3
  } else {
    // Very low consistency range (0.0-0.2)
    const ratio = Math.min(1, (distance - CONSISTENCY_THRESHOLD_LOW) / (MAX_VAD_DISTANCE - CONSISTENCY_THRESHOLD_LOW))
    consistency = 0.2 - ratio * 0.2
  }

  // Ensure consistency is between 0 and 1
  consistency = Math.max(0, Math.min(1, consistency))

  logger.debug("Distance to consistency linear mapping", {
    distance,
    consistency,
  })

  return consistency
}

/**
 * Check the consistency between a predicted VAD and a typical VAD profile for an emotion label
 *
 * @param predictedVAD The VAD output from the Core VAD Engine
 * @param typicalVAD The typical VAD profile for an emotion label
 * @returns A consistency score between 0 (inconsistent) and 1 (highly consistent)
 */
export function checkVADConsistency(predictedVAD: VADOutput, typicalVAD: VADProfile): number {
  const distance = calculateVADDistance(predictedVAD, typicalVAD)
  const consistency = mapDistanceToConsistency(distance)

  logger.debug("VAD consistency check", {
    predictedVAD,
    typicalVAD,
    distance,
    consistency,
  })

  return consistency
}
