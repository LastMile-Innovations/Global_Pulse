import { sql } from "@vercel/postgres"
import { logger } from "../../utils/logger"

/**
 * Initialize the database schema for coherence feedback
 */
export async function initCoherenceFeedbackSchema(): Promise<void> {
  try {
    // Create the coherence feedback table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS coherence_feedback (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        interaction_id TEXT NOT NULL,
        feedback_value TEXT NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    // Create indexes for efficient querying
    await sql`
      CREATE INDEX IF NOT EXISTS coherence_feedback_user_id_idx ON coherence_feedback (user_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS coherence_feedback_session_id_idx ON coherence_feedback (session_id)
    `

    logger.info("Coherence feedback schema initialized successfully")
  } catch (error) {
    logger.error(`Error initializing coherence feedback schema: ${error}`)
    throw error
  }
}

/**
 * Log coherence feedback to the database
 * @param userId User ID
 * @param sessionId Session ID
 * @param interactionId Interaction ID
 * @param feedbackValue Feedback value (e.g., "matched_well", "a_bit_off", "missed_mark")
 */
export async function logCoherenceFeedback(
  userId: string,
  sessionId: string,
  interactionId: string,
  feedbackValue: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO coherence_feedback (user_id, session_id, interaction_id, feedback_value)
      VALUES (${userId}, ${sessionId}, ${interactionId}, ${feedbackValue})
    `

    logger.info(`Logged coherence feedback for user ${userId}: ${feedbackValue}`)
  } catch (error) {
    logger.error(`Error logging coherence feedback: ${error}`)
    throw error
  }
}
