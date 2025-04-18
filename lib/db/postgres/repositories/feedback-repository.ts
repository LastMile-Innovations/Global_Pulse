import { eq } from "drizzle-orm"
import { getDrizzle } from "../drizzle"
import { coherenceFeedback, distressRecords } from "../../schema/feedback"
import { logger } from "../../../utils/logger"

/**
 * Repository for feedback-related database operations
 */
export class FeedbackRepository {
  /**
   * Create a new coherence feedback record
   */
  async createCoherenceFeedback(feedbackData: {
    userId: string
    sessionId: string
    interactionId: string
    feedbackType: string
    feedbackScore?: number
    feedbackText?: string
    metadata?: any
  }) {
    try {
      const db = getDrizzle()
      const result = await db.insert(coherenceFeedback).values(feedbackData).returning()
      return result[0]
    } catch (error) {
      logger.error(`Error creating coherence feedback: ${error}`)
      throw error
    }
  }

  /**
   * Get coherence feedback by interaction ID
   */
  async getFeedbackByInteractionId(interactionId: string) {
    try {
      const db = getDrizzle()
      const result = await db.select().from(coherenceFeedback).where(eq(coherenceFeedback.interactionId, interactionId))
      return result
    } catch (error) {
      logger.error(`Error getting feedback by interaction ID: ${error}`)
      throw error
    }
  }

  /**
   * Create a new distress record
   */
  async createDistressRecord(distressData: {
    userId: string
    sessionId: string
    interactionId?: string
    distressLevel: number
    triggerContext?: string
    responseProvided?: string
  }) {
    try {
      const db = getDrizzle()
      const result = await db.insert(distressRecords).values(distressData).returning()
      return result[0]
    } catch (error) {
      logger.error(`Error creating distress record: ${error}`)
      throw error
    }
  }

  /**
   * Get distress records by user ID
   */
  async getDistressRecordsByUserId(userId: string) {
    try {
      const db = getDrizzle()
      const result = await db.select().from(distressRecords).where(eq(distressRecords.userId, userId))
      return result
    } catch (error) {
      logger.error(`Error getting distress records by user ID: ${error}`)
      throw error
    }
  }
}

// Export singleton instance
export const feedbackRepository = new FeedbackRepository()
