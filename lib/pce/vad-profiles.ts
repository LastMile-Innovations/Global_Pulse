export interface VADProfile {
  valence: number
  arousal: number
  dominance: number
}

export const TYPICAL_VAD_PROFILES: Record<string, VADProfile> = {
  // Fear Group
  Concerned: { valence: -0.3, arousal: 0.4, dominance: 0.3 },
  Cautious: { valence: -0.4, arousal: 0.5, dominance: 0.3 },
  Afraid: { valence: -0.7, arousal: 0.7, dominance: 0.2 },
  Fearful: { valence: -0.7, arousal: 0.7, dominance: 0.2 },
  Horror: { valence: -0.9, arousal: 0.9, dominance: 0.1 },
  Fright: { valence: -0.8, arousal: 0.9, dominance: 0.1 },
  Panic: { valence: -0.9, arousal: 1.0, dominance: 0.0 },

  // Anger Group
  Annoyed: { valence: -0.4, arousal: 0.4, dominance: 0.6 },
  Frustrated: { valence: -0.6, arousal: 0.6, dominance: 0.4 },
  Angry: { valence: -0.8, arousal: 0.8, dominance: 0.7 },
  Hate: { valence: -0.9, arousal: 0.7, dominance: 0.8 },
  Fury: { valence: -0.9, arousal: 0.9, dominance: 0.8 },
  Rage: { valence: -1.0, arousal: 1.0, dominance: 0.9 },

  // Sadness Group
  Disappointed: { valence: -0.5, arousal: 0.3, dominance: 0.3 },
  Hurt: { valence: -0.7, arousal: 0.4, dominance: 0.2 },
  Sad: { valence: -0.8, arousal: 0.3, dominance: 0.2 },
  Grief: { valence: -0.9, arousal: 0.5, dominance: 0.1 },
  Despair: { valence: -1.0, arousal: 0.4, dominance: 0.0 },

  // Happiness Group
  Satisfied: { valence: 0.6, arousal: 0.3, dominance: 0.6 },
  Pleased: { valence: 0.7, arousal: 0.4, dominance: 0.6 },
  Happy: { valence: 0.8, arousal: 0.6, dominance: 0.7 },
  Elated: { valence: 0.9, arousal: 0.8, dominance: 0.8 },
  Ecstatic: { valence: 1.0, arousal: 1.0, dominance: 0.9 },

  // Disgust Group
  Dislike: { valence: -0.5, arousal: 0.3, dominance: 0.5 },
  Distaste: { valence: -0.6, arousal: 0.4, dominance: 0.5 },
  Disgusted: { valence: -0.8, arousal: 0.6, dominance: 0.4 },
  Repulsed: { valence: -0.9, arousal: 0.7, dominance: 0.3 },
  Revulsion: { valence: -1.0, arousal: 0.8, dominance: 0.2 },
  Sickened: { valence: -0.9, arousal: 0.6, dominance: 0.2 },

  // Worry Group
  Nervous: { valence: -0.5, arousal: 0.6, dominance: 0.3 },
  Worried: { valence: -0.6, arousal: 0.7, dominance: 0.2 },
  Anxious: { valence: -0.7, arousal: 0.8, dominance: 0.2 },
  Dread: { valence: -0.8, arousal: 0.7, dominance: 0.1 },

  // Regret Group
  "Mild Regret": { valence: -0.4, arousal: 0.3, dominance: 0.3 },
  Remorseful: { valence: -0.6, arousal: 0.4, dominance: 0.2 },
  Regretful: { valence: -0.7, arousal: 0.4, dominance: 0.2 },
  "Deep Regret": { valence: -0.8, arousal: 0.5, dominance: 0.1 },
  "Profound Regret": { valence: -0.9, arousal: 0.5, dominance: 0.1 },

  // Positive Anticipation Group
  Hopeful: { valence: 0.6, arousal: 0.5, dominance: 0.6 },
  Optimistic: { valence: 0.7, arousal: 0.5, dominance: 0.7 },
  Excited: { valence: 0.8, arousal: 0.8, dominance: 0.7 },
  Eager: { valence: 0.8, arousal: 0.7, dominance: 0.8 },
  Thrilled: { valence: 0.9, arousal: 0.9, dominance: 0.8 },

  // Negative Anticipation Group
  Uneasy: { valence: -0.4, arousal: 0.5, dominance: 0.3 },
  Apprehensive: { valence: -0.5, arousal: 0.6, dominance: 0.3 },
  Dreading: { valence: -0.7, arousal: 0.7, dominance: 0.2 },
  Fearful: { valence: -0.8, arousal: 0.8, dominance: 0.1 },
  Terrified: { valence: -0.9, arousal: 0.9, dominance: 0.0 },

  // Pride Group
  Satisfied: { valence: 0.6, arousal: 0.4, dominance: 0.7 },
  Pleased: { valence: 0.7, arousal: 0.5, dominance: 0.7 },
  Proud: { valence: 0.8, arousal: 0.6, dominance: 0.9 },
  "Very Proud": { valence: 0.9, arousal: 0.7, dominance: 0.9 },
  Triumphant: { valence: 1.0, arousal: 0.8, dominance: 1.0 },

  // Shame Group
  Embarrassed: { valence: -0.5, arousal: 0.5, dominance: 0.2 },
  Guilty: { valence: -0.6, arousal: 0.4, dominance: 0.2 },
  Ashamed: { valence: -0.7, arousal: 0.5, dominance: 0.1 },
  Humiliated: { valence: -0.8, arousal: 0.6, dominance: 0.0 },
  Mortified: { valence: -0.9, arousal: 0.7, dominance: 0.0 },

  // Embarrassment Group
  "Slightly Embarrassed": { valence: -0.3, arousal: 0.4, dominance: 0.3 },
  Embarrassed: { valence: -0.5, arousal: 0.5, dominance: 0.2 },
  "Very Embarrassed": { valence: -0.7, arousal: 0.6, dominance: 0.1 },
  Humiliated: { valence: -0.8, arousal: 0.7, dominance: 0.0 },
  Mortified: { valence: -0.9, arousal: 0.8, dominance: 0.0 },

  // Flattery Group
  Flattered: { valence: 0.6, arousal: 0.5, dominance: 0.5 },
  "Very Flattered": { valence: 0.7, arousal: 0.6, dominance: 0.5 },
  "Extremely Flattered": { valence: 0.8, arousal: 0.7, dominance: 0.6 },
  Overwhelmed: { valence: 0.7, arousal: 0.8, dominance: 0.4 },
  "Excessively Flattered": { valence: 0.7, arousal: 0.8, dominance: 0.5 },

  // Surprise Group
  Startled: { valence: 0.0, arousal: 0.7, dominance: 0.4 },
  Surprised: { valence: 0.1, arousal: 0.8, dominance: 0.5 },
  Astonished: { valence: 0.2, arousal: 0.9, dominance: 0.4 },
  Shocked: { valence: -0.2, arousal: 0.9, dominance: 0.3 },
  Stunned: { valence: -0.1, arousal: 0.8, dominance: 0.3 },

  // Stress Group
  Pressured: { valence: -0.4, arousal: 0.6, dominance: 0.4 },
  Stressed: { valence: -0.6, arousal: 0.7, dominance: 0.3 },
  "Very Stressed": { valence: -0.7, arousal: 0.8, dominance: 0.2 },
  Overwhelmed: { valence: -0.8, arousal: 0.9, dominance: 0.1 },
  "Burnt Out": { valence: -0.9, arousal: 0.4, dominance: 0.1 },

  // Relief Group
  "Mild Relief": { valence: 0.5, arousal: 0.3, dominance: 0.5 },
  Relieved: { valence: 0.7, arousal: 0.4, dominance: 0.6 },
  "Very Relieved": { valence: 0.8, arousal: 0.5, dominance: 0.7 },
  "Deeply Relieved": { valence: 0.9, arousal: 0.5, dominance: 0.8 },
  "Profound Relief": { valence: 1.0, arousal: 0.6, dominance: 0.9 },

  // Envy Group
  "Mild Envy": { valence: -0.3, arousal: 0.4, dominance: 0.4 },
  Envious: { valence: -0.5, arousal: 0.5, dominance: 0.3 },
  Jealous: { valence: -0.7, arousal: 0.6, dominance: 0.3 },
  "Very Jealous": { valence: -0.8, arousal: 0.7, dominance: 0.2 },
  "Consumed by Envy": { valence: -0.9, arousal: 0.8, dominance: 0.1 },

  // Love Group
  Affection: { valence: 0.7, arousal: 0.5, dominance: 0.6 },
  Fondness: { valence: 0.8, arousal: 0.6, dominance: 0.6 },
  Love: { valence: 0.9, arousal: 0.7, dominance: 0.7 },
  "Deep Love": { valence: 1.0, arousal: 0.8, dominance: 0.7 },
  "Profound Love": { valence: 1.0, arousal: 0.9, dominance: 0.8 },

  // Confusion Group
  Puzzled: { valence: -0.1, arousal: 0.4, dominance: 0.4 },
  Confused: { valence: -0.3, arousal: 0.5, dominance: 0.3 },
  "Very Confused": { valence: -0.5, arousal: 0.6, dominance: 0.2 },
  Bewildered: { valence: -0.6, arousal: 0.7, dominance: 0.1 },
  "Completely Lost": { valence: -0.7, arousal: 0.8, dominance: 0.0 },

  // Boredom Group
  Disinterested: { valence: -0.2, arousal: 0.2, dominance: 0.4 },
  Bored: { valence: -0.4, arousal: 0.1, dominance: 0.3 },
  "Very Bored": { valence: -0.6, arousal: 0.1, dominance: 0.2 },
  "Extremely Bored": { valence: -0.7, arousal: 0.0, dominance: 0.2 },
  "Utterly Bored": { valence: -0.8, arousal: 0.0, dominance: 0.1 },

  // Curiosity Group
  Interested: { valence: 0.4, arousal: 0.5, dominance: 0.6 },
  Curious: { valence: 0.5, arousal: 0.6, dominance: 0.6 },
  "Very Curious": { valence: 0.6, arousal: 0.7, dominance: 0.7 },
  Fascinated: { valence: 0.7, arousal: 0.8, dominance: 0.7 },
  Obsessed: { valence: 0.5, arousal: 0.9, dominance: 0.8 },

  // Neutral
  Neutral: { valence: 0.0, arousal: 0.3, dominance: 0.5 },
  Calm: { valence: 0.3, arousal: 0.2, dominance: 0.6 },
  Relaxed: { valence: 0.5, arousal: 0.2, dominance: 0.7 },
  Content: { valence: 0.6, arousal: 0.3, dominance: 0.6 },
  Serene: { valence: 0.7, arousal: 0.1, dominance: 0.7 },
}

/**
 * Get the typical VAD profile for an emotion label
 *
 * @param label The emotion label to look up
 * @returns The VAD profile for the label, or the Neutral profile if not found
 */
export function getTypicalVADProfile(label: string): VADProfile {
  return TYPICAL_VAD_PROFILES[label] || TYPICAL_VAD_PROFILES["Neutral"]
}
