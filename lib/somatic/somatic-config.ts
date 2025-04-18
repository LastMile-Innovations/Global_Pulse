export const SOMATIC_PROMPT_AROUSAL_THRESHOLD = 0.65

/**
 * VAD threshold for triggering somatic prompts based on negative valence
 * Range: -1.0 to 0.0
 */
export const SOMATIC_PROMPT_NEG_VALENCE_THRESHOLD = -0.5

/**
 * VAD threshold for triggering somatic prompts based on arousal when valence is negative
 * Range: 0.0 to 1.0
 */
export const SOMATIC_PROMPT_NEG_AROUSAL_THRESHOLD = 0.6

/**
 * Minimum number of turns between somatic prompts
 * This prevents prompting too frequently
 */
export const SOMATIC_PROMPT_MIN_TURNS_BETWEEN = 5

/**
 * Minimum confidence level required in VAD calculation to trigger somatic prompts
 * Range: 0.0 to 1.0
 */
export const SOMATIC_PROMPT_MIN_CONFIDENCE = 0.6

/**
 * Probability of triggering a somatic prompt when all conditions are met
 * This adds some randomness to prevent predictable prompting
 * Range: 0.0 to 1.0
 */
export const SOMATIC_PROMPT_PROBABILITY = 0.8
