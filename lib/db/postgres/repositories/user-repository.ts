import { eq } from "drizzle-orm"
import { db } from "@/lib/db/postgres/drizzle"
import { profiles } from "@/lib/db/schema"
import { logger } from "../../../utils/logger"

/**
 * Repository for user-related database operations
 */
export class UserRepository {
  /**
   * Create a new user profile
   */
  async createUser(userData: {
    id: string
    firstName?: string | null
    lastName?: string | null
  }) {
    try {
      const insertData = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };
      const result = await db.insert(profiles).values(insertData).returning()
      return result[0]
    } catch (error) {
      logger.error(`Error creating user profile: ${error}`)
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
    logger.error("createSession called, but userSessions schema is missing or not imported.")
    throw new Error("User session functionality is not implemented.")
  }

  /**
   * Update a user session's last activity
   */
  async updateSessionActivity(sessionId: string) {
    logger.error("updateSessionActivity called, but userSessions schema is missing or not imported.")
    throw new Error("User session functionality is not implemented.")
  }
}

// Export singleton instance
export const userRepository = new UserRepository()
