import { shouldTriggerBootstrapping, generateBootstrappingPrompt, processBootstrapResponse } from "../bootstrap-service"
import { getRedisClient } from "../../db/redis/redis-client"
import { KgService } from "../../db/graph/kg-service"
import { getNeo4jDriver } from "../../db/graph/neo4j-driver"
import { getEngagementMode } from "../../session/mode-manager"
import { getTemplatedResponse } from "../../responses/template-filler"
import { getCoreNlpFeatures } from "../../nlp/nlp-features"
import { classifyConceptsZSC_LLM } from "../../ai-sdk/zsc-service"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("../../db/redis/redis-client")
jest.mock("../../db/graph/kg-service")
jest.mock("../../db/graph/neo4j-driver")
jest.mock("../../session/mode-manager")
jest.mock("../../responses/template-filler")
jest.mock("../../nlp/nlp-features")
jest.mock("../../ai-sdk/zsc-service")

describe("Bootstrap Service", () => {
  beforeEach(() => {
    jest.resetAllMocks()

    // Mock Redis client
    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }
    ;(getRedisClient as jest.Mock).mockReturnValue(mockRedis)

    // Mock KgService
    const mockKgService = {
      isBootstrappingComplete: jest.fn(),
      markBootstrappingComplete: jest.fn(),
      checkUserHasCoreAttachments: jest.fn(),
      findOrCreateAttachmentNode: jest.fn(),
      linkUserAttachment: jest.fn(),
    }
    ;(KgService as jest.Mock).mockImplementation(() => mockKgService)

    // Mock Neo4j driver
    ;(getNeo4jDriver as jest.Mock).mockReturnValue({})

    // Mock engagement mode
    ;(getEngagementMode as jest.Mock).mockResolvedValue("insight")

    // Mock template response
    ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
      "To help me understand what matters most to you, could you share one or two core values or important goals that guide you in life?",
    )

    // Mock NLP features
    ;(getCoreNlpFeatures as jest.Mock).mockResolvedValue({
      keywords: ["family", "honesty", "growth"],
      sentiment: { label: "POSITIVE", score: 0.8 },
      entities: [],
      abstractConcepts: [],
    })

    // Mock ZSC
    ;(classifyConceptsZSC_LLM as jest.Mock).mockResolvedValue({
      concepts: [
        { text: "Family", type: "VALUE", score: 0.9 },
        { text: "Personal Growth", type: "GOAL", score: 0.8 },
      ],
    })
  })

  describe("shouldTriggerBootstrapping", () => {
    test("should return true when all conditions are met", async () => {
      // Mock Redis to return null (not awaiting response)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      // Mock KgService to return false (bootstrapping not complete)
      const mockKgService = new KgService({}) as any
      mockKgService.isBootstrappingComplete.mockResolvedValue(false)
      mockKgService.checkUserHasCoreAttachments.mockResolvedValue(false)

      const result = await shouldTriggerBootstrapping("test-user", "test-session", 1)

      expect(result).toBe(true)
      expect(getEngagementMode).toHaveBeenCalledWith("test-user", "test-session")
      expect(mockKgService.isBootstrappingComplete).toHaveBeenCalledWith("test-user")
      expect(mockKgService.checkUserHasCoreAttachments).toHaveBeenCalledWith("test-user")
    })

    test("should return false if not in Insight Mode", async () => {
      // Mock engagement mode to return "listening"
      ;(getEngagementMode as jest.Mock).mockResolvedValue("listening")

      const result = await shouldTriggerBootstrapping("test-user", "test-session", 1)

      expect(result).toBe(false)
      expect(getEngagementMode).toHaveBeenCalledWith("test-user", "test-session")
    })

    test("should return false if bootstrapping is already complete", async () => {
      // Mock KgService to return true (bootstrapping complete)
      const mockKgService = new KgService({}) as any
      mockKgService.isBootstrappingComplete.mockResolvedValue(true)

      const result = await shouldTriggerBootstrapping("test-user", "test-session", 1)

      expect(result).toBe(false)
      expect(mockKgService.isBootstrappingComplete).toHaveBeenCalledWith("test-user")
    })

    test("should return false if user already has core attachments", async () => {
      // Mock KgService to return false (bootstrapping not complete) but true for attachments
      const mockKgService = new KgService({}) as any
      mockKgService.isBootstrappingComplete.mockResolvedValue(false)
      mockKgService.checkUserHasCoreAttachments.mockResolvedValue(true)

      const result = await shouldTriggerBootstrapping("test-user", "test-session", 1)

      expect(result).toBe(false)
      expect(mockKgService.isBootstrappingComplete).toHaveBeenCalledWith("test-user")
      expect(mockKgService.checkUserHasCoreAttachments).toHaveBeenCalledWith("test-user")
      expect(mockKgService.markBootstrappingComplete).toHaveBeenCalledWith("test-user")
    })

    test("should return false if already awaiting bootstrap response", async () => {
      // Mock Redis to return "true" (awaiting response)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("true")

      // Mock KgService to return false (bootstrapping not complete)
      const mockKgService = new KgService({}) as any
      mockKgService.isBootstrappingComplete.mockResolvedValue(false)

      const result = await shouldTriggerBootstrapping("test-user", "test-session", 1)

      expect(result).toBe(false)
      expect(mockRedis.get).toHaveBeenCalled()
    })

    test("should return false if turn count is too high", async () => {
      const result = await shouldTriggerBootstrapping("test-user", "test-session", 10)

      expect(result).toBe(false)
    })
  })

  describe("generateBootstrappingPrompt", () => {
    test("should generate a prompt and set awaiting flag", async () => {
      const mockRedis = getRedisClient() as any

      const result = await generateBootstrappingPrompt("test-user", "test-session")

      expect(result).toBe(
        "To help me understand what matters most to you, could you share one or two core values or important goals that guide you in life?",
      )
      expect(getTemplatedResponse).toHaveBeenCalledWith("bootstrap_self_map_prompt", expect.anything())
      expect(mockRedis.set).toHaveBeenCalled()
    })
  })

  describe("processBootstrapResponse", () => {
    test("should process skip request", async () => {
      const mockRedis = getRedisClient() as any
      const mockKgService = new KgService({}) as any

      const result = await processBootstrapResponse("test-user", "test-session", "skip")

      expect(result).toContain("No problem")
      expect(mockKgService.markBootstrappingComplete).toHaveBeenCalledWith("test-user")
      expect(mockRedis.del).toHaveBeenCalled()
      expect(getTemplatedResponse).toHaveBeenCalledWith(
        "bootstrap_acknowledgment",
        expect.objectContaining({
          templateId: "bootstrap_acknowledgment_skip",
        }),
      )
    })

    test("should extract concepts and create them in UIG", async () => {
      const mockRedis = getRedisClient() as any
      const mockKgService = new KgService({}) as any
      mockKgService.findOrCreateAttachmentNode.mockResolvedValue("attachment-id")
      mockKgService.linkUserAttachment.mockResolvedValue(true)

      const result = await processBootstrapResponse(
        "test-user",
        "test-session",
        "I value family and honesty, and my goal is personal growth.",
      )

      expect(result).toContain("Thank you for sharing")
      expect(getCoreNlpFeatures).toHaveBeenCalled()
      expect(classifyConceptsZSC_LLM).toHaveBeenCalled()
      expect(mockKgService.findOrCreateAttachmentNode).toHaveBeenCalledTimes(2)
      expect(mockKgService.linkUserAttachment).toHaveBeenCalledTimes(2)
      expect(mockKgService.markBootstrappingComplete).toHaveBeenCalledWith("test-user")
      expect(mockRedis.del).toHaveBeenCalled()
    })
  })
})
