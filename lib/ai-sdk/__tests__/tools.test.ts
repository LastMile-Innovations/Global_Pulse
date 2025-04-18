import { describe, it, expect, vi, beforeEach } from "vitest"
import { serverTools } from "../tools"
import { KgService } from "../../db/graph/kg-service"
import { neo4jDriver } from "../../db/graph/neo4j-driver"
import { generateText } from "ai"

// Mock dependencies
vi.mock("../../db/graph/neo4j-driver", () => ({
  neo4jDriver: {
    // Mock driver implementation
  },
}))

vi.mock("../../db/graph/kg-service", () => ({
  KgService: vi.fn().mockImplementation(() => ({
    kgLayer: {
      executeCypherSingle: vi.fn(),
      executeCypher: vi.fn(),
    },
  })),
}))

vi.mock("ai", () => ({
  generateText: vi.fn(),
  tool: vi.fn((config) => config),
}))

vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

describe("Server Tools", () => {
  let mockContext: { userId: string | null }
  let mockKgService: any

  beforeEach(() => {
    mockContext = { userId: "test-user-id" }
    mockKgService = new KgService(neo4jDriver)

    // Reset mocks
    vi.clearAllMocks()
  })

  describe("getCurrentUserState", () => {
    const getCurrentUserState = serverTools.find((t) => t.name === "getCurrentUserState")

    it("should throw an error if userId is not provided", async () => {
      mockContext.userId = null

      await expect(getCurrentUserState.execute({}, mockContext)).rejects.toThrow(
        "Authorization failed: User ID not provided",
      )
    })

    it("should return default values if no state is found", async () => {
      mockKgService.kgLayer.executeCypherSingle.mockResolvedValue(null)

      const result = await getCurrentUserState.execute({}, mockContext)

      expect(result).toEqual({
        moodEstimate: 5,
        stressEstimate: 3,
        timestamp: expect.any(Number),
        note: "No previous state data found, returning defaults",
      })
    })

    it("should return user state if found", async () => {
      const mockState = {
        get: () => ({
          properties: {
            moodEstimate: 7,
            stressEstimate: 2,
            timestamp: 1234567890,
          },
        }),
      }

      mockKgService.kgLayer.executeCypherSingle.mockResolvedValue(mockState)

      const result = await getCurrentUserState.execute({}, mockContext)

      expect(result).toEqual({
        moodEstimate: 7,
        stressEstimate: 2,
        timestamp: 1234567890,
      })
    })
  })

  describe("getCoreAttachments", () => {
    const getCoreAttachments = serverTools.find((t) => t.name === "getCoreAttachments")

    it("should throw an error if userId is not provided", async () => {
      mockContext.userId = null

      await expect(getCoreAttachments.execute({ attachmentType: "Value" }, mockContext)).rejects.toThrow(
        "Authorization failed: User ID not provided",
      )
    })

    it("should return empty array if no attachments are found", async () => {
      mockKgService.kgLayer.executeCypher.mockResolvedValue([])

      const result = await getCoreAttachments.execute({ attachmentType: "Value" }, mockContext)

      expect(result).toEqual({
        attachments: [],
        note: "No value attachments found for this user",
      })
    })

    it("should return attachments if found", async () => {
      const mockAttachments = [
        {
          get: (key) => {
            const data = { name: "Security", powerLevel: 8, valence: 1 }
            return data[key]
          },
        },
        {
          get: (key) => {
            const data = { name: "Freedom", powerLevel: 7, valence: 1 }
            return data[key]
          },
        },
      ]

      mockKgService.kgLayer.executeCypher.mockResolvedValue(mockAttachments)

      const result = await getCoreAttachments.execute(
        {
          attachmentType: "Value",
          limit: 2,
        },
        mockContext,
      )

      expect(result).toEqual({
        attachments: [
          { name: "Security", powerLevel: 8, valence: 1 },
          { name: "Freedom", powerLevel: 7, valence: 1 },
        ],
      })
    })
  })

  describe("getRecentInteractionSummary", () => {
    const getRecentInteractionSummary = serverTools.find((t) => t.name === "getRecentInteractionSummary")

    it("should throw an error if userId is not provided", async () => {
      mockContext.userId = null

      await expect(getRecentInteractionSummary.execute({ numTurns: 3 }, mockContext)).rejects.toThrow(
        "Authorization failed: User ID not provided",
      )
    })

    it("should return default message if no interactions are found", async () => {
      mockKgService.kgLayer.executeCypher.mockResolvedValue([])

      const result = await getRecentInteractionSummary.execute({ numTurns: 3 }, mockContext)

      expect(result).toEqual({
        summary: "No recent interactions found for this user.",
      })
    })

    it("should summarize interactions if found", async () => {
      const mockInteractions = [
        {
          get: (key) => {
            const data = {
              userInput: "Hello",
              agentResponse: "Hi there!",
              timestamp: 1000,
            }
            return data[key]
          },
        },
        {
          get: (key) => {
            const data = {
              userInput: "How are you?",
              agentResponse: "I'm doing well, thanks!",
              timestamp: 2000,
            }
            return data[key]
          },
        },
      ]

      mockKgService.kgLayer.executeCypher.mockResolvedValue(mockInteractions)

      // Mock the generateText response
      vi.mocked(generateText).mockResolvedValue({
        text: "The user greeted the assistant and asked how it was doing.",
      })

      const result = await getRecentInteractionSummary.execute(
        {
          numTurns: 2,
        },
        mockContext,
      )

      expect(result).toEqual({
        summary: "The user greeted the assistant and asked how it was doing.",
      })

      // Verify generateText was called with the correct transcript
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("User: Hello\nAssistant: Hi there!"),
        }),
      )
    })
  })
})
