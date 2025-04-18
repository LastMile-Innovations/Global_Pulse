import { v4 as uuidv4 } from "uuid"
import { KgService } from "../db/graph/kg-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"
import { logger } from "../utils/logger"

/**
 * Service for user management
 */
export class UserService {
  private kgService: KgService

  constructor() {
    const driver = getNeo4jDriver()
    this.kgService = new KgService(driver)
  }

  /**
   * Register a new user and create their consent profile
   */
  async registerUser(email: string, name: string): Promise<string> {
    try {
      // Generate a unique user ID
      const userId = uuidv4()

      // Create the user node
      await this.kgService.createUserNode({
        userID: userId,
        email,
        name,
      })

      // Create the consent profile with default values
      await this.kgService.createConsentProfileNode(userId)

      // Create core profile nodes (C, T, D)
      await this.kgService.createCulturalContextProfile(userId)
      await this.kgService.createPersonalityProfile(userId)
      await this.kgService.createDevelopmentalStageProfile(userId)

      logger.info(`User registered successfully: ${userId}`)
      return userId
    } catch (error) {
      logger.error(`Error registering user: ${error}`)
      throw error
    }
  }
}
