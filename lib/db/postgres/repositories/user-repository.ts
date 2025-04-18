import { eq } from "drizzle-orm"
import { db } from "@/lib/db/postgres/drizzle"
import { profiles, userSessions } from "@/lib/db/schema"
import { logger } from "../../../utils/logger"

/**
 * Repository for user-related database operations
 */
export class UserRepository {
  /**
   * Create a new user
   */
  async createUser(userData: {
    userId: string
    email: string
    name: string
    profileData?: string
  }) {
    try {
      const result = await db.insert(profiles).values(userData).returning()
      return result[0]
    } catch (error) {
      logger.error(`Error creating user: ${error}`)
      throw error
    }
  }

  /**
   * Get a user by ID
   */
  async getUserById(userId: string) {
    try {
      const result = await db.select().from(profiles).where(eq(profiles.id, userId))
      return result[0] || null
    } catch (error) {
      logger.error(`Error getting user by ID: ${error}`)
      throw error
    }
  }

  /**
   * Create a new user session
   */
  async createSession(sessionData: { sessionId: string; userId: string }) {
    try {
      const result = await db.insert(userSessions).values(sessionData).returning()
      return result[0]
    } catch (error) {
      logger.error(`Error creating session: ${error}`)
      throw error
    }
  }

  /**
   * Update a user session's last activity
   */
  async updateSessionActivity(sessionId: string) {
    try {
      const result = await db
        .update(userSessions)
        .set({ lastActivity: new Date() })
        .where(eq(userSessions.sessionId, sessionId))
        .returning()
      return result[0]
    } catch (error) {
      logger.error(`Error updating session activity: ${error}`)
      throw error
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository()
