export const BASE_RESPONSE_DELAY_MS = 800

/**
 * Minimum response delay in milliseconds
 */
export const MIN_RESPONSE_DELAY_MS = 500

/**
 * Maximum response delay in milliseconds
 */
export const MAX_RESPONSE_DELAY_MS = 2000

/**
 * Additional delay for complex responses in milliseconds
 */
export const COMPLEX_RESPONSE_ADDITIONAL_DELAY_MS = 500

/**
 * Threshold for high stress
 */
export const HIGH_STRESS_THRESHOLD = 0.7

/**
 * Additional delay for high stress in milliseconds
 */
export const HIGH_STRESS_ADDITIONAL_DELAY_MS = 700

/**
 * Threshold for high distress (valence)
 */
export const HIGH_DISTRESS_VALENCE_THRESHOLD = -0.7

/**
 * Threshold for high distress (arousal)
 */
export const HIGH_DISTRESS_AROUSAL_THRESHOLD = 0.7

/**
 * Minimum VAD confidence for state determination
 */
export const MIN_VAD_CONFIDENCE = 0.5

/**
 * Minimum turns between coherence check-ins
 */
export const MIN_TURNS_BETWEEN_CHECKINS = 5

/**
 * Probability of triggering a felt coherence check-in
 */
export const FELT_COHERENCE_CHECKIN_PROBABILITY = 0.15
