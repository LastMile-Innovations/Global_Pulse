import { eq } from "drizzle-orm"
import { getDrizzle } from "../drizzle"
import { users, userSessions } from "../../schema/users"
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
      const db = getDrizzle()
      const result = await db.insert(users).values(userData).returning()
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
      const db = getDrizzle()
      const result = await db.select().from(users).where(eq(users.userId, userId))
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
      const db = getDrizzle()
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
      const db = getDrizzle()
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
