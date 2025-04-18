/**
 * Threshold for arousal (VAD) to consider triggering a somatic prompt.
 * Range: 0.0 to 1.0
 * If arousal >= this value, prompt may be triggered (if other conditions met).
 */
export const SOMATIC_PROMPT_AROUSAL_THRESHOLD = 0.65

/**
 * VAD threshold for triggering somatic prompts based on negative valence.
 * Range: -1.0 to 0.0
 * If valence <= this value, prompt may be triggered (if other conditions met).
 */
export const SOMATIC_PROMPT_NEG_VALENCE_THRESHOLD = -0.5

/**
 * VAD threshold for arousal when valence is negative.
 * Range: 0.0 to 1.0
 * If arousal >= this value AND valence <= SOMATIC_PROMPT_NEG_VALENCE_THRESHOLD, prompt may be triggered.
 */
export const SOMATIC_PROMPT_NEG_AROUSAL_THRESHOLD = 0.6

/**
 * Minimum number of user turns between somatic prompts.
 * Prevents prompting too frequently.
 */
export const SOMATIC_PROMPT_MIN_TURNS_BETWEEN = 5

/**
 * Minimum confidence required in VAD calculation to consider triggering a somatic prompt.
 * Range: 0.0 to 1.0
 */
export const SOMATIC_PROMPT_MIN_CONFIDENCE = 0.6

/**
 * Probability of triggering a somatic prompt when all conditions are met.
 * Adds randomness to prevent predictable prompting.
 * Range: 0.0 to 1.0
 */
export const SOMATIC_PROMPT_PROBABILITY = 0.8

/**
 * Returns true if the VAD/confidence/turns/probability criteria are met for a somatic prompt.
 * @param vad Object with valence, arousal, dominance, confidence
 * @param turnsSinceLastPrompt Number of user turns since last prompt
 * @returns boolean
 */
export function shouldTriggerSomaticPrompt(
  vad: { valence: number; arousal: number; dominance?: number; confidence: number },
  turnsSinceLastPrompt: number
): boolean {
  if (turnsSinceLastPrompt < SOMATIC_PROMPT_MIN_TURNS_BETWEEN) return false;
  if (vad.confidence < SOMATIC_PROMPT_MIN_CONFIDENCE) return false;

  // Negative valence + high arousal
  if (
    vad.valence <= SOMATIC_PROMPT_NEG_VALENCE_THRESHOLD &&
    vad.arousal >= SOMATIC_PROMPT_NEG_AROUSAL_THRESHOLD
  ) {
    return Math.random() < SOMATIC_PROMPT_PROBABILITY;
  }

  // High arousal (regardless of valence)
  if (vad.arousal >= SOMATIC_PROMPT_AROUSAL_THRESHOLD) {
    return Math.random() < SOMATIC_PROMPT_PROBABILITY;
  }

  return false;
}
