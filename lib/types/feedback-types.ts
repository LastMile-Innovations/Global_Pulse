import { z } from 'zod'

export enum CoherenceFeedbackChoice {
  Helpful = "Helpful",
  Neutral = "Neutral",
  FeltOff = "FeltOff",
}

/**
 * Interface for coherence feedback payload
 */
export interface CoherenceFeedbackPayload {
  /**
   * ID of the interaction being rated
   */
  interactionId: string

  /**
   * The feedback choice
   */
  choice: CoherenceFeedbackChoice

  /**
   * Session ID
   */
  sessionId: string

  /**
   * Optional text feedback
   */
  feedback?: string
}

/**
 * Payload for submitting user feedback on whether an AI reflection fits their experience.
 * Related to INTEGRITY-V1-001.
 */
export interface AnalysisFitFeedbackPayload {
  assistantInteractionId: string // The ID of the assistant message being evaluated.
  fitsExperience: boolean // True if the user felt the reflection fit, false otherwise.
}

// Optional: Zod schema for backend validation
export const AnalysisFitFeedbackPayloadSchema = z.object({
  assistantInteractionId: z.string().uuid('Invalid Assistant Interaction ID format.'),
  fitsExperience: z.boolean(),
})
