import { KgService } from "../kg-service"
import { KgInteractionLayer } from "../kg-interaction-layer"
import { expect } from "@jest/globals"

// Mock dependencies
jest.mock("../kg-interaction-layer")

describe("KgService - Layer 2", () => {
  let kgService: KgService
  let mockKgLayer: jest.Mocked<KgInteractionLayer>

  beforeEach(() => {
    // Create mock KgInteractionLayer
    mockKgLayer = new KgInteractionLayer(null as any) as jest.Mocked<KgInteractionLayer>

    // Create KgService with mocked KgInteractionLayer
    kgService = new KgService(null as any)
    kgService.kgLayer = mockKgLayer
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("findOrCreateTrackedEntity", () => {
    it("should find or create a tracked entity", async () => {
      // Setup mock
      mockKgLayer.executeCypherScalar.mockResolvedValue("entity-123")

      // Call the method
      const result = await kgService.findOrCreateTrackedEntity("John Doe", "Person")

      // Verify results
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledTimes(1)
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (e:TrackedEntity"),
        expect.objectContaining({
          name: "John Doe",
          type: "Person",
        }),
      )
      expect(result).toBe("entity-123")
    })

    it("should throw an error if entity name or type is missing", async () => {
      await expect(kgService.findOrCreateTrackedEntity("", "Person")).rejects.toThrow()
      await expect(kgService.findOrCreateTrackedEntity("John Doe", "")).rejects.toThrow()
    })
  })

  describe("createInformationEvent", () => {
    it("should create an information event", async () => {
      // Setup mock
      mockKgLayer.executeCypherScalar.mockResolvedValue("event-123")

      // Call the method
      const result = await kgService.createInformationEvent({
        eventId: "news-123",
        sourceType: "news",
        sourceUrl: "https://example.com/news/123",
        title: "Test News",
        summary: "This is a test news item",
        publishedAt: 1672567200000, // 2023-01-01T12:00:00Z
        rawContentSnippet: "Content of test news",
      })

      // Verify results
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledTimes(1)
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (e:InformationEvent"),
        expect.objectContaining({
          eventId: "news-123",
          sourceType: "news",
          title: "Test News",
        }),
      )
      expect(result).toBe("event-123")
    })

    it("should throw an error if required fields are missing", async () => {
      await expect(
        kgService.createInformationEvent({
          eventId: "",
          sourceType: "news",
          title: "Test News",
          publishedAt: 1672567200000,
        }),
      ).rejects.toThrow()

      await expect(
        kgService.createInformationEvent({
          eventId: "news-123",
          sourceType: "",
          title: "Test News",
          publishedAt: 1672567200000,
        }),
      ).rejects.toThrow()

      await expect(
        kgService.createInformationEvent({
          eventId: "news-123",
          sourceType: "news",
          title: "",
          publishedAt: 1672567200000,
        }),
      ).rejects.toThrow()
    })
  })

  describe("linkEventToEntity", () => {
    it("should link an event to an entity with MENTIONS relationship", async () => {
      // Setup mock
      mockKgLayer.executeCypherScalar.mockResolvedValue(1)

      // Call the method
      await kgService.linkEventToEntity("event-123", "entity-123", "MENTIONS")

      // Verify results
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledTimes(1)
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (e)-[r:MENTIONS]->(t)"),
        expect.objectContaining({
          eventId: "event-123",
          entityId: "entity-123",
        }),
      )
    })

    it("should link an event to an entity with ABOUT_ENTITY relationship", async () => {
      // Setup mock
      mockKgLayer.executeCypherScalar.mockResolvedValue(1)

      // Call the method
      await kgService.linkEventToEntity("event-123", "entity-123", "ABOUT_ENTITY")

      // Verify results
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledTimes(1)
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (e)-[r:ABOUT_ENTITY]->(t)"),
        expect.objectContaining({
          eventId: "event-123",
          entityId: "entity-123",
        }),
      )
    })

    it("should throw an error if required fields are missing", async () => {
      await expect(kgService.linkEventToEntity("", "entity-123", "MENTIONS")).rejects.toThrow()
      await expect(kgService.linkEventToEntity("event-123", "", "MENTIONS")).rejects.toThrow()
      await expect(kgService.linkEventToEntity("event-123", "entity-123", "" as any)).rejects.toThrow()
    })

    it("should throw an error if relationship type is invalid", async () => {
      await expect(kgService.linkEventToEntity("event-123", "entity-123", "INVALID" as any)).rejects.toThrow()
    })
  })

  describe("getRecentInformationEvents", () => {
    it("should get recent information events", async () => {
      // Setup mock
      const mockRecords = [
        {
          get: (key: string) => {
            const data: Record<string, any> = {
              eventId: "event-1",
              title: "Test Event 1",
              summary: "Summary 1",
              sourceType: "news",
              sourceUrl: "https://example.com/1",
              publishedAt: 1672567200000,
              entities: [
                { entityId: "entity-1", name: "John Doe", type: "Person", relationshipType: "MENTIONS" },
                { entityId: "entity-2", name: "Acme Corp", type: "Organization", relationshipType: "ABOUT_ENTITY" },
              ],
            }
            return data[key]
          },
        },
        {
          get: (key: string) => {
            const data: Record<string, any> = {
              eventId: "event-2",
              title: "Test Event 2",
              summary: "Summary 2",
              sourceType: "news",
              sourceUrl: "https://example.com/2",
              publishedAt: 1672653600000,
              entities: [{ entityId: "entity-3", name: "Jane Smith", type: "Person", relationshipType: "MENTIONS" }],
            }
            return data[key]
          },
        },
      ]

      mockKgLayer.executeCypher.mockResolvedValue({
        records: mockRecords,
      } as any)

      // Call the method
      const result = await kgService.getRecentInformationEvents(2, 0)

      // Verify results
      expect(mockKgLayer.executeCypher).toHaveBeenCalledTimes(1)
      expect(mockKgLayer.executeCypher).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (e:InformationEvent)"),
        expect.objectContaining({
          limit: 2,
          offset: 0,
        }),
      )

      expect(result).toHaveLength(2)
      expect(result[0].eventId).toBe("event-1")
      expect(result[0].entities).toHaveLength(2)
      expect(result[1].eventId).toBe("event-2")
      expect(result[1].entities).toHaveLength(1)
    })

    it("should return an empty array if no events are found", async () => {
      // Setup mock
      mockKgLayer.executeCypher.mockResolvedValue({
        records: [],
      } as any)

      // Call the method
      const result = await kgService.getRecentInformationEvents()

      // Verify results
      expect(result).toHaveLength(0)
    })
  })
})
