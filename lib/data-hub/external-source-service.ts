import { db } from "@/lib/db/postgres/drizzle"
import { externalConnections } from "@/lib/db/schema/externalConnections"
import { encrypt, decrypt } from "@/lib/utils/encryption"
import { eq, and } from "drizzle-orm"
import { logger } from "@/lib/utils/logger"
import { checkConsent } from "@/lib/ethics/consent"
import { KgService } from "@/lib/db/graph/kg-service"
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver"

export type ConnectionStatus = "disconnected" | "connected" | "syncing" | "error"

export interface ExternalConnection {
  id: string
  userId: string
  sourceName: string
  status: ConnectionStatus
  lastSyncedAt: Date | null
  errorMessage: string | null
  metadata: Record<string, any> | null
}

export interface TokenData {
  refreshToken: string
  accessToken?: string
  tokenExpiry?: Date
}

export class ExternalSourceService {
  /**
   * Get all external connections for a user
   */
  async getUserConnections(userId: string): Promise<ExternalConnection[]> {
    try {
      const connections = await db
        .select({
          id: externalConnections.id,
          userId: externalConnections.userId,
          sourceName: externalConnections.sourceName,
          status: externalConnections.status,
          lastSyncedAt: externalConnections.lastSyncedAt,
          errorMessage: externalConnections.errorMessage,
          metadata: externalConnections.metadata,
        })
        .from(externalConnections)
        .where(eq(externalConnections.userId, userId))

      return connections
    } catch (error) {
      logger.error(`Error fetching external connections for user ${userId}:`, error)
      throw new Error("Failed to fetch external connections")
    }
  }

  /**
   * Get a specific external connection
   */
  async getConnection(userId: string, sourceName: string): Promise<ExternalConnection | null> {
    try {
      const connection = await db
        .select({
          id: externalConnections.id,
          userId: externalConnections.userId,
          sourceName: externalConnections.sourceName,
          status: externalConnections.status,
          lastSyncedAt: externalConnections.lastSyncedAt,
          errorMessage: externalConnections.errorMessage,
          metadata: externalConnections.metadata,
        })
        .from(externalConnections)
        .where(and(eq(externalConnections.userId, userId), eq(externalConnections.sourceName, sourceName)))
        .limit(1)

      return connection.length > 0 ? connection[0] : null
    } catch (error) {
      logger.error(`Error fetching ${sourceName} connection for user ${userId}:`, error)
      throw new Error(`Failed to fetch ${sourceName} connection`)
    }
  }

  /**
   * Store tokens for an external connection
   */
  async storeTokens(
    userId: string,
    sourceName: string,
    tokens: TokenData,
    status: ConnectionStatus = "connected",
  ): Promise<string> {
    try {
      // Check if user has consent for this source
      const hasConsent = await checkConsent(userId, `CAN_ACCESS_SOURCE_${sourceName}`)
      if (!hasConsent) {
        throw new Error(`User has not granted consent for ${sourceName}`)
      }

      // Encrypt tokens
      const encryptedRefreshToken = encrypt(tokens.refreshToken)
      const encryptedAccessToken = tokens.accessToken ? encrypt(tokens.accessToken) : null

      // Check if connection already exists
      const existingConnection = await this.getConnection(userId, sourceName)

      if (existingConnection) {
        // Update existing connection
        await db
          .update(externalConnections)
          .set({
            encryptedRefreshToken,
            encryptedAccessToken: encryptedAccessToken || null,
            tokenExpiry: tokens.tokenExpiry || null,
            status,
            updatedAt: new Date(),
            errorMessage: null, // Clear any previous errors
          })
          .where(eq(externalConnections.id, existingConnection.id))

        return existingConnection.id
      } else {
        // Create new connection
        const [newConnection] = await db
          .insert(externalConnections)
          .values({
            userId,
            sourceName,
            encryptedRefreshToken,
            encryptedAccessToken: encryptedAccessToken || null,
            tokenExpiry: tokens.tokenExpiry || null,
            status,
          })
          .returning({ id: externalConnections.id })

        return newConnection.id
      }
    } catch (error) {
      logger.error(`Error storing tokens for ${sourceName} connection (user ${userId}):`, error)
      throw new Error(`Failed to store ${sourceName} connection tokens`)
    }
  }

  /**
   * Get tokens for an external connection
   */
  async getTokens(userId: string, sourceName: string): Promise<TokenData | null> {
    try {
      // Check if user has consent for this source
      const hasConsent = await checkConsent(userId, `CAN_ACCESS_SOURCE_${sourceName}`)
      if (!hasConsent) {
        throw new Error(`User has not granted consent for ${sourceName}`)
      }

      const connection = await db
        .select({
          encryptedRefreshToken: externalConnections.encryptedRefreshToken,
          encryptedAccessToken: externalConnections.encryptedAccessToken,
          tokenExpiry: externalConnections.tokenExpiry,
        })
        .from(externalConnections)
        .where(and(eq(externalConnections.userId, userId), eq(externalConnections.sourceName, sourceName)))
        .limit(1)

      if (connection.length === 0) {
        return null
      }

      const { encryptedRefreshToken, encryptedAccessToken, tokenExpiry } = connection[0]

      return {
        refreshToken: decrypt(encryptedRefreshToken),
        accessToken: encryptedAccessToken ? decrypt(encryptedAccessToken) : undefined,
        tokenExpiry: tokenExpiry || undefined,
      }
    } catch (error) {
      logger.error(`Error retrieving tokens for ${sourceName} connection (user ${userId}):`, error)
      throw new Error(`Failed to retrieve ${sourceName} connection tokens`)
    }
  }

  /**
   * Delete an external connection
   */
  async deleteConnection(userId: string, sourceName: string): Promise<boolean> {
    try {
      const result = await db
        .delete(externalConnections)
        .where(and(eq(externalConnections.userId, userId), eq(externalConnections.sourceName, sourceName)))
        .returning({ id: externalConnections.id })

      return result.length > 0
    } catch (error) {
      logger.error(`Error deleting ${sourceName} connection for user ${userId}:`, error)
      throw new Error(`Failed to delete ${sourceName} connection`)
    }
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(
    userId: string,
    sourceName: string,
    status: ConnectionStatus,
    errorMessage?: string,
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      }

      if (status === "syncing") {
        // Don't update lastSyncedAt yet, that happens when sync completes
      } else if (status === "connected") {
        updateData.lastSyncedAt = new Date()
        updateData.errorMessage = null // Clear any previous errors
      } else if (status === "error" && errorMessage) {
        updateData.errorMessage = errorMessage
      }

      const result = await db
        .update(externalConnections)
        .set(updateData)
        .where(and(eq(externalConnections.userId, userId), eq(externalConnections.sourceName, sourceName)))
        .returning({ id: externalConnections.id })

      return result.length > 0
    } catch (error) {
      logger.error(`Error updating status for ${sourceName} connection (user ${userId}):`, error)
      throw new Error(`Failed to update ${sourceName} connection status`)
    }
  }

  /**
   * Check if a user has a valid connection for a source
   */
  async hasValidConnection(userId: string, sourceName: string): Promise<boolean> {
    try {
      // Check if user has consent for this source
      const hasConsent = await checkConsent(userId, `CAN_ACCESS_SOURCE_${sourceName}`)
      if (!hasConsent) {
        return false
      }

      const connection = await this.getConnection(userId, sourceName)
      return connection !== null && (connection.status === "connected" || connection.status === "syncing")
    } catch (error) {
      logger.error(`Error checking connection validity for ${sourceName} (user ${userId}):`, error)
      return false
    }
  }

  /**
   * Process calendar data and update UIG
   * This would be called by the worker after fetching calendar data
   */
  async processCalendarData(userId: string, calendarData: any[], kgService?: KgService): Promise<boolean> {
    try {
      const service = kgService || new KgService(getNeo4jDriver())

      // Process calendar events and update UIG
      // This is a simplified implementation - the real one would be more complex

      // Example: Create activity nodes for each event
      for (const event of calendarData) {
        // Extract relevant data
        const { summary, description, start, end, attendees } = event

        // Example: Create an activity node
        // Note: This assumes KgService has a method to create activity nodes
        // You would need to implement this method
        await service.createActivityNode({
          userId,
          activityType: "CalendarEvent",
          title: summary,
          description: description || "",
          startTime: new Date(start.dateTime || start.date).getTime(),
          endTime: new Date(end.dateTime || end.date).getTime(),
          metadata: {
            attendeeCount: attendees?.length || 0,
            source: "google_calendar",
          },
        })
      }

      // Update connection status
      await this.updateConnectionStatus(userId, "google_calendar", "connected")

      return true
    } catch (error) {
      logger.error(`Error processing calendar data for user ${userId}:`, error)

      // Update connection status to error
      await this.updateConnectionStatus(
        userId,
        "google_calendar",
        "error",
        error instanceof Error ? error.message : "Unknown error",
      )

      return false
    }
  }
}
