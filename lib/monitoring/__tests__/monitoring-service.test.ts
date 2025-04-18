import { MonitoringService } from "../monitoring-service"
import { KgService } from "../../db/graph/kg-service"
import { NerService } from "../../ai-sdk/ner-service"
import { RelevanceFilter } from "../relevance-filter"
import { NewsApiClient } from "../news-api-client"
import type { NewsItem, ProcessedEntity } from "../../types/monitoring-types"
import { expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("../../db/graph/kg-service")
jest.mock("../../ai-sdk/ner-service")
jest.mock("../relevance-filter")
jest.mock("../news-api-client")

describe("MonitoringService", () => {
  let monitoringService: MonitoringService
  let mockKgService: jest.Mocked<KgService>
  let mockNerService: jest.Mocked<NerService>
  let mockRelevanceFilter: jest.Mocked<RelevanceFilter>
  let mockNewsApiClient: jest.Mocked<NewsApiClient>

  beforeEach(() => {
    // Create mock instances
    mockKgService = new KgService(null as any) as jest.Mocked<KgService>
    mockNerService = new NerService() as jest.Mocked<NerService>
    mockRelevanceFilter = new RelevanceFilter() as jest.Mocked<RelevanceFilter>
    mockNewsApiClient = new NewsApiClient("fake-key") as jest.Mocked<NewsApiClient>

    // Create monitoring service with mocked dependencies
    monitoringService = new MonitoringService(mockKgService, mockNerService, mockRelevanceFilter, mockNewsApiClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("runMonitoringCycle", () => {
    it("should fetch news items and process relevant ones", async () => {
      // Mock news items
      const mockNewsItems: NewsItem[] = [
        {
          title: "Test News 1",
          description: "This is a test news item",
          content: "Content of test news 1",
          url: "https://example.com/news/1",
          publishedAt: "2023-01-01T12:00:00Z",
          source: "Test Source",
        },
        {
          title: "Test News 2",
          description: "This is another test news item",
          content: "Content of test news 2",
          url: "https://example.com/news/2",
          publishedAt: "2023-01-02T12:00:00Z",
          source: "Test Source",
        },
      ]

      // Mock entities
      const mockEntities: ProcessedEntity[] = [
        { text: "John Doe", type: "PERSON", inTitle: true },
        { text: "Acme Corp", type: "ORG", inTitle: false },
      ]

      // Setup mocks
      mockNewsApiClient.fetchTopHeadlines.mockResolvedValue(mockNewsItems)
      mockRelevanceFilter.isRelevant.mockReturnValue(true)
      mockNerService.recognizeEntities.mockResolvedValue(mockEntities)
      mockKgService.createInformationEvent.mockResolvedValue("event-123")
      mockKgService.findOrCreateTrackedEntity.mockResolvedValue("entity-123")
      mockKgService.linkEventToEntity.mockResolvedValue()

      // Run the monitoring cycle
      const result = await monitoringService.runMonitoringCycle()

      // Verify results
      expect(mockNewsApiClient.fetchTopHeadlines).toHaveBeenCalledTimes(1)
      expect(mockRelevanceFilter.isRelevant).toHaveBeenCalledTimes(2)
      expect(mockNerService.recognizeEntities).toHaveBeenCalledTimes(2)
      expect(mockKgService.createInformationEvent).toHaveBeenCalledTimes(2)
      expect(mockKgService.findOrCreateTrackedEntity).toHaveBeenCalledTimes(4) // 2 entities per news item
      expect(mockKgService.linkEventToEntity).toHaveBeenCalledTimes(4) // 2 entities per news item

      // Check result counts
      expect(result.totalItemsFetched).toBe(2)
      expect(result.itemsPassedFilter).toBe(2)
      expect(result.entitiesExtracted).toBe(4) // 2 entities per news item
      expect(result.eventsCreated).toBe(2)
      expect(result.entitiesCreated).toBe(4) // 2 entities per news item
      expect(result.relationshipsCreated).toBe(4) // 2 entities per news item
      expect(result.errors).toHaveLength(0)
    })

    it("should handle errors during processing", async () => {
      // Mock news items
      const mockNewsItems: NewsItem[] = [
        {
          title: "Test News 1",
          description: "This is a test news item",
          content: "Content of test news 1",
          url: "https://example.com/news/1",
          publishedAt: "2023-01-01T12:00:00Z",
          source: "Test Source",
        },
      ]

      // Setup mocks
      mockNewsApiClient.fetchTopHeadlines.mockResolvedValue(mockNewsItems)
      mockRelevanceFilter.isRelevant.mockReturnValue(true)
      mockNerService.recognizeEntities.mockRejectedValue(new Error("NER error"))

      // Run the monitoring cycle
      const result = await monitoringService.runMonitoringCycle()

      // Verify results
      expect(mockNewsApiClient.fetchTopHeadlines).toHaveBeenCalledTimes(1)
      expect(mockRelevanceFilter.isRelevant).toHaveBeenCalledTimes(1)
      expect(mockNerService.recognizeEntities).toHaveBeenCalledTimes(1)

      // Check result counts
      expect(result.totalItemsFetched).toBe(1)
      expect(result.itemsPassedFilter).toBe(1)
      expect(result.entitiesExtracted).toBe(0)
      expect(result.eventsCreated).toBe(0)
      expect(result.entitiesCreated).toBe(0)
      expect(result.relationshipsCreated).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].stage).toBe("processing")
      expect(result.errors[0].message).toBe("NER error")
    })
  })
})
