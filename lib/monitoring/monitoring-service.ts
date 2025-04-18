import { logger } from "../utils/logger"
import type { KgService } from "../db/graph/kg-service"
import type { NerService } from "../ai-sdk/ner-service"
import type { RelevanceFilter } from "./relevance-filter"
import type { NewsApiClient } from "./news-api-client"
import type { NewsItem, ProcessedEntity, MonitoringResult } from "../types/monitoring-types"

/**
 * Service responsible for monitoring external sources and populating UIG Layer 2
 */
export class MonitoringService {
  private kgService: KgService
  private nerService: NerService
  private relevanceFilter: RelevanceFilter
  private newsApiClient: NewsApiClient

  constructor(
    kgService: KgService,
    nerService: NerService,
    relevanceFilter: RelevanceFilter,
    newsApiClient: NewsApiClient,
  ) {
    this.kgService = kgService
    this.nerService = nerService
    this.relevanceFilter = relevanceFilter
    this.newsApiClient = newsApiClient
  }

  /**
   * Run a monitoring cycle to fetch, process, and store external data
   */
  async runMonitoringCycle(): Promise<MonitoringResult> {
    const result: MonitoringResult = {
      totalItemsFetched: 0,
      itemsPassedFilter: 0,
      entitiesExtracted: 0,
      eventsCreated: 0,
      entitiesCreated: 0,
      relationshipsCreated: 0,
      errors: [],
    }

    try {
      logger.info("Starting monitoring cycle")

      // Fetch news items
      const newsItems = await this.fetchNewsItems()
      result.totalItemsFetched = newsItems.length
      logger.info(`Fetched ${newsItems.length} news items`)

      // Process each news item
      for (const newsItem of newsItems) {
        try {
          // Check if the item is relevant
          if (!this.relevanceFilter.isRelevant(newsItem)) {
            continue
          }

          result.itemsPassedFilter++

          // Process the item and store in UIG
          const itemResult = await this.processAndStoreNewsItem(newsItem)

          // Update result counts
          result.entitiesExtracted += itemResult.entitiesExtracted
          result.eventsCreated += itemResult.eventsCreated
          result.entitiesCreated += itemResult.entitiesCreated
          result.relationshipsCreated += itemResult.relationshipsCreated
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logger.error(`Error processing news item: ${errorMessage}`)
          result.errors.push({
            stage: "processing",
            message: errorMessage,
            item: newsItem.title,
          })
        }
      }

      logger.info(
        `Monitoring cycle completed: ${result.eventsCreated} events created, ${result.entitiesCreated} entities created`,
      )
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(`Error in monitoring cycle: ${errorMessage}`)
      result.errors.push({
        stage: "cycle",
        message: errorMessage,
      })
      return result
    }
  }

  /**
   * Fetch news items from external sources
   */
  private async fetchNewsItems(): Promise<NewsItem[]> {
    try {
      return await this.newsApiClient.fetchTopHeadlines()
    } catch (error) {
      logger.error(`Error fetching news: ${error}`)
      throw error
    }
  }

  /**
   * Process a news item and store it in the UIG
   */
  private async processAndStoreNewsItem(newsItem: NewsItem): Promise<{
    entitiesExtracted: number
    eventsCreated: number
    entitiesCreated: number
    relationshipsCreated: number
  }> {
    const result = {
      entitiesExtracted: 0,
      eventsCreated: 0,
      entitiesCreated: 0,
      relationshipsCreated: 0,
    }

    // Extract content for NER
    const contentForNer = this.prepareContentForNer(newsItem)

    // Perform NER to extract entities
    const entities = await this.nerService.recognizeEntities(contentForNer)
    result.entitiesExtracted = entities.length

    // Create information event in UIG
    const eventId = await this.kgService.createInformationEvent({
      eventId: `news-${Buffer.from(newsItem.url || newsItem.title)
        .toString("base64")
        .substring(0, 24)}`,
      sourceType: "news",
      sourceUrl: newsItem.url,
      title: newsItem.title,
      summary: newsItem.description,
      publishedAt: new Date(newsItem.publishedAt).getTime(),
      rawContentSnippet: newsItem.content,
    })

    if (eventId) {
      result.eventsCreated = 1

      // Process each entity and link to the event
      for (const entity of entities) {
        try {
          // Find or create entity node
          const entityId = await this.kgService.findOrCreateTrackedEntity(entity.text, this.mapEntityType(entity.type))

          if (entityId) {
            result.entitiesCreated++

            // Link entity to event
            const relationshipType = this.determineRelationshipType(entity)
            await this.kgService.linkEventToEntity(eventId, entityId, relationshipType)
            result.relationshipsCreated++
          }
        } catch (entityError) {
          logger.warn(`Error processing entity ${entity.text}: ${entityError}`)
        }
      }
    }

    return result
  }

  /**
   * Prepare content from news item for NER processing
   */
  private prepareContentForNer(newsItem: NewsItem): string {
    return [
      newsItem.title,
      newsItem.description,
      newsItem.content?.substring(0, 500), // Limit content length
    ]
      .filter(Boolean)
      .join(" ")
      .substring(0, 1000) // Limit overall length for NER
  }

  /**
   * Map NER entity type to UIG entity type
   */
  private mapEntityType(nerType: string): string {
    switch (nerType.toUpperCase()) {
      case "PERSON":
        return "Person"
      case "ORG":
      case "ORGANIZATION":
        return "Organization"
      case "LOC":
      case "LOCATION":
      case "GPE":
        return "Location"
      case "EVENT":
        return "Event"
      case "PRODUCT":
        return "Product"
      default:
        return "Miscellaneous"
    }
  }

  /**
   * Determine relationship type between event and entity
   */
  private determineRelationshipType(entity: ProcessedEntity): "MENTIONS" | "ABOUT_ENTITY" {
    // Simple logic for V1: if entity appears in title, it's ABOUT_ENTITY, otherwise MENTIONS
    // This can be enhanced in future versions with more sophisticated analysis
    return entity.inTitle ? "ABOUT_ENTITY" : "MENTIONS"
  }
}
