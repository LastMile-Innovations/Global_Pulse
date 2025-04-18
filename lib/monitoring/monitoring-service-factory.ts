import { KgService } from "../db/graph/kg-service"
import { NerService } from "../../ai-sdk/ner-service"
import { RelevanceFilter } from "./relevance-filter"
import { NewsApiClient } from "./news-api-client"
import { MonitoringService } from "./monitoring-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"
import { logger } from "../utils/logger"

/**
 * Factory for creating a MonitoringService instance
 */
export class MonitoringServiceFactory {
  /**
   * Create a new MonitoringService instance
   */
  static async create(newsApiKey: string, relevantKeywords?: string[]): Promise<MonitoringService> {
    try {
      // Create dependencies
      const driver = getNeo4jDriver()
      const kgService = new KgService(driver)
      const nerService = new NerService()
      const relevanceFilter = new RelevanceFilter(relevantKeywords)
      const newsApiClient = new NewsApiClient(newsApiKey)

      // Create and return the monitoring service
      return new MonitoringService(kgService, nerService, relevanceFilter, newsApiClient)
    } catch (error) {
      logger.error(`Error creating MonitoringService: ${error}`)
      throw error
    }
  }
}
