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
