/**
 * VADProfile represents the Valence-Arousal-Dominance model for emotions.
 */
export interface VADProfile {
  valence: number;   // -1 (very negative) to 1 (very positive)
  arousal: number;   // 0 (calm) to 1 (excited)
  dominance: number; // 0 (submissive) to 1 (dominant)
}

/**
 * TYPICAL_VAD_PROFILES maps emotion labels to their VAD profiles.
 * This list is designed for MVP coverage and can be extended as needed.
 */
export const TYPICAL_VAD_PROFILES: Record<string, VADProfile> = {
  // Core Emotions
  Neutral:    { valence: 0.0,  arousal: 0.3, dominance: 0.5 },
  Happy:      { valence: 0.8,  arousal: 0.6, dominance: 0.7 },
  Sad:        { valence: -0.8, arousal: 0.3, dominance: 0.2 },
  Angry:      { valence: -0.8, arousal: 0.8, dominance: 0.7 },
  Afraid:     { valence: -0.7, arousal: 0.7, dominance: 0.2 },
  Disgusted:  { valence: -0.8, arousal: 0.6, dominance: 0.4 },
  Surprised:  { valence: 0.1,  arousal: 0.8, dominance: 0.5 },
  Calm:       { valence: 0.3,  arousal: 0.2, dominance: 0.6 },
  Excited:    { valence: 0.8,  arousal: 0.8, dominance: 0.7 },
  Bored:      { valence: -0.4, arousal: 0.1, dominance: 0.3 },
  Confused:   { valence: -0.3, arousal: 0.5, dominance: 0.3 },
  Anxious:    { valence: -0.7, arousal: 0.8, dominance: 0.2 },
  Proud:      { valence: 0.8,  arousal: 0.6, dominance: 0.9 },
  Ashamed:    { valence: -0.7, arousal: 0.5, dominance: 0.1 },
  Relieved:   { valence: 0.7,  arousal: 0.4, dominance: 0.6 },
  Grateful:   { valence: 0.8,  arousal: 0.5, dominance: 0.7 },
  Jealous:    { valence: -0.7, arousal: 0.6, dominance: 0.3 },
  Love:       { valence: 0.9,  arousal: 0.7, dominance: 0.7 },
  Hopeful:    { valence: 0.6,  arousal: 0.5, dominance: 0.6 },
  Disappointed:{ valence: -0.5, arousal: 0.3, dominance: 0.3 },
  Trust:      { valence: 0.7,  arousal: 0.3, dominance: 0.7 },
  Distrust:   { valence: -0.6, arousal: 0.4, dominance: 0.3 },
  Content:    { valence: 0.6,  arousal: 0.3, dominance: 0.6 },
  Stressed:   { valence: -0.6, arousal: 0.7, dominance: 0.3 },
  Overwhelmed:{ valence: -0.8, arousal: 0.9, dominance: 0.1 },
  Elated:     { valence: 0.9,  arousal: 0.8, dominance: 0.8 },
  Ecstatic:   { valence: 1.0,  arousal: 1.0, dominance: 0.9 },
  Despair:    { valence: -1.0, arousal: 0.4, dominance: 0.0 },
  Grief:      { valence: -0.9, arousal: 0.5, dominance: 0.1 },
  Embarrassed:{ valence: -0.5, arousal: 0.5, dominance: 0.2 },
  Mortified:  { valence: -0.9, arousal: 0.7, dominance: 0.0 },
  Awe:        { valence: 0.5,  arousal: 0.9, dominance: 0.5 },
  Shocked:    { valence: -0.2, arousal: 0.9, dominance: 0.3 },
  // Synonyms and common variants for MVP
  Joyful:     { valence: 0.9,  arousal: 0.7, dominance: 0.8 },
  Satisfied:  { valence: 0.6,  arousal: 0.35, dominance: 0.65 },
  Pleased:    { valence: 0.7,  arousal: 0.45, dominance: 0.65 },
  Hurt:       { valence: -0.7, arousal: 0.4, dominance: 0.2 },
  Frustrated: { valence: -0.6, arousal: 0.6, dominance: 0.4 },
  Annoyed:    { valence: -0.4, arousal: 0.4, dominance: 0.6 },
  Resentful:  { valence: -0.7, arousal: 0.6, dominance: 0.4 },
  Melancholy: { valence: -0.7, arousal: 0.2, dominance: 0.2 },
  Lonely:     { valence: -0.6, arousal: 0.3, dominance: 0.2 },
  Curious:    { valence: 0.5,  arousal: 0.6, dominance: 0.6 },
  Interested: { valence: 0.4,  arousal: 0.5, dominance: 0.6 },
  // Add more as needed for MVP completeness
};

/**
 * Get the typical VAD profile for an emotion label.
 * This function is case-insensitive and trims whitespace.
 *
 * @param label The emotion label to look up
 * @returns The VAD profile for the label, or the Neutral profile if not found
 */
export function getTypicalVADProfile(label: string): VADProfile {
  if (!label || typeof label !== "string") {
    return TYPICAL_VAD_PROFILES["Neutral"];
  }
  // Try direct match
  if (TYPICAL_VAD_PROFILES[label]) {
    return TYPICAL_VAD_PROFILES[label];
  }
  // Try case-insensitive, trimmed match
  const normalized = label.trim().toLowerCase();
  for (const key in TYPICAL_VAD_PROFILES) {
    if (key.toLowerCase() === normalized) {
      return TYPICAL_VAD_PROFILES[key];
    }
  }
  // Not found, return Neutral
  return TYPICAL_VAD_PROFILES["Neutral"];
}
