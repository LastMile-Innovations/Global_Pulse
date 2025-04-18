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
