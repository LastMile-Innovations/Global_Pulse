import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import { auth } from "@/lib/auth/auth-utils"
import { getRedisClient } from "@/lib/redis/client"
import { processPceMvpRequest } from "@/lib/pce/pce-service"
import { detectUncertainty } from "@/lib/nlp/uncertainty-detection"
import { applyGuardrails } from "@/lib/guardrails/guardrails-service"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { getEngagementMode } from "@/lib/session/mode-manager"
import { isAwaitingSomaticResponse } from "@/lib/somatic/somatic-service"
import { isAwaitingDistressCheckResponse } from "@/lib/distress/distress-detection"
import { rateLimit } from "@/lib/redis/rate-limit"
import type { NextRequest } from "next/server"
import { StreamingTextResponse } from "ai"

// Mock all the dependencies
vi.mock("@/lib/auth/auth-utils", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/redis/client", () => ({
  getRedisClient: vi.fn(),
}))

vi.mock("@/lib/pce/pce-service", () => ({
  processPceMvpRequest: vi.fn(),
}))

vi.mock("@/lib/nlp/uncertainty-detection", () => ({
  detectUncertainty: vi.fn(),
}))

vi.mock("@/lib/guardrails/guardrails-service", () => ({
  applyGuardrails: vi.fn(),
}))

vi.mock("@/lib/db/graph/kg-service-factory", () => ({
  getKgService: vi.fn(),
}))

vi.mock("@/lib/session/mode-manager", () => ({
  getEngagementMode: vi.fn(),
}))

vi.mock("@/lib/somatic/somatic-service", () => ({
  isAwaitingSomaticResponse: vi.fn(),
  generateSomaticAcknowledgment: vi.fn(),
}))

vi.mock("@/lib/distress/distress-detection", () => ({
  isAwaitingDistressCheckResponse: vi.fn(),
  handleDistressCheckinResponse: vi.fn(),
}))

vi.mock("@/lib/redis/rate-limit", () => ({
  rateLimit: vi.fn(),
}))

vi.mock("ai", () => ({
  StreamingTextResponse: vi.fn(),
  createStreamableValue: vi.fn().mockImplementation((text) => ({
    value: text,
    experimental_streamData: {
      append: vi.fn(),
    },
  })),
}))

vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-interaction-id"),
}))

describe("Chat API - Interaction ID Tracking", () => {
  const mockUserId = "user-123"
  const mockSessionId = "session-456"
  const mockMessage = "Hello, how are you?"
  const mockInteractionId = "mock-interaction-id"
  const mockPreviousInteractionId = "previous-interaction-id"

  // Mock Redis client
  const mockRedisClient = {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  }

  // Mock KG service
  const mockKgService = {
    logInteraction: vi.fn(),
    setInteractionResponseType: vi.fn(),
    setInteractionAgentResponse: vi.fn(),
  }

  // Mock request
  const createMockRequest = () => {
    return {
      json: vi.fn().mockResolvedValue({
        message: mockMessage,
        sessionId: mockSessionId,
      }),
    } as unknown as NextRequest
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    auth.mockResolvedValue(mockUserId)
    getRedisClient.mockReturnValue(mockRedisClient)
    getKgService.mockReturnValue(mockKgService)
    rateLimit.mockResolvedValue(true)
    getEngagementMode.mockResolvedValue("insight")
    isAwaitingSomaticResponse.mockResolvedValue(false)
    isAwaitingDistressCheckResponse.mockResolvedValue(false)
    processPceMvpRequest.mockResolvedValue({
      ewefAnalysis: { vad: { valence: 0, arousal: 0, dominance: 0 } },
    })
    detectUncertainty.mockResolvedValue({ isExpressingUncertainty: false })
    applyGuardrails.mockResolvedValue("This is a response")

    // Redis mocks
    mockRedisClient.get.mockImplementation((key) => {
      if (key === `session:turn_count:${mockSessionId}`) {
        return Promise.resolve("5")
      }
      if (key === `last_assistant_interaction_id:${mockSessionId}`) {
        return Promise.resolve(null)
      }
      return Promise.resolve(null)
    })
    mockRedisClient.incr.mockResolvedValue(6)
    mockRedisClient.expire.mockResolvedValue(true)
    mockRedisClient.set.mockResolvedValue("OK")

    // StreamingTextResponse mock
    StreamingTextResponse.mockImplementation((stream) => {
      return { stream }
    })
  })

  it("should store the interaction ID in Redis after a substantive response", async () => {
    const request = createMockRequest()

    await POST(request)

    // Verify the interaction ID was stored in Redis
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      `last_assistant_interaction_id:${mockSessionId}`,
      mockInteractionId,
      { ex: 86400 },
    )
  })

  it("should retrieve the previous interaction ID from Redis", async () => {
    const request = createMockRequest()

    // Mock Redis to return a previous interaction ID
    mockRedisClient.get.mockImplementation((key) => {
      if (key === `last_assistant_interaction_id:${mockSessionId}`) {
        return Promise.resolve(mockPreviousInteractionId)
      }
      if (key === `session:turn_count:${mockSessionId}`) {
        return Promise.resolve("5")
      }
      return Promise.resolve(null)
    })

    await POST(request)

    // Verify the previous interaction ID was retrieved from Redis
    expect(mockRedisClient.get).toHaveBeenCalledWith(`last_assistant_interaction_id:${mockSessionId}`)
  })

  it("should not trigger a coherence check-in if no previous interaction ID exists", async () => {
    const request = createMockRequest()

    // Mock shouldTriggerCoherenceCheckin to return true
    vi.mock("@/lib/session/mode-manager", () => ({
      getEngagementMode: vi.fn().mockResolvedValue("insight"),
      shouldTriggerCoherenceCheckin: vi.fn().mockResolvedValue(true),
    }))

    // Mock Redis to return null for previous interaction ID
    mockRedisClient.get.mockImplementation((key) => {
      if (key === `last_assistant_interaction_id:${mockSessionId}`) {
        return Promise.resolve(null)
      }
      if (key === `session:turn_count:${mockSessionId}`) {
        return Promise.resolve("5")
      }
      return Promise.resolve(null)
    })

    await POST(request)

    // Verify that a coherence check-in was not triggered
    // This is indicated by the fact that we stored the current interaction ID in Redis
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      `last_assistant_interaction_id:${mockSessionId}`,
      mockInteractionId,
      { ex: 86400 },
    )
  })

  it("should include the previous interaction ID in the stream metadata when triggering a coherence check-in", async () => {
    const request = createMockRequest()

    // Mock shouldTriggerCoherenceCheckin to return true
    vi.mock("@/lib/session/mode-manager", () => ({
      getEngagementMode: vi.fn().mockResolvedValue("insight"),
      shouldTriggerCoherenceCheckin: vi.fn().mockResolvedValue(true),
    }))

    // Mock Redis to return a previous interaction ID
    mockRedisClient.get.mockImplementation((key) => {
      if (key === `last_assistant_interaction_id:${mockSessionId}`) {
        return Promise.resolve(mockPreviousInteractionId)
      }
      if (key === `session:turn_count:${mockSessionId}`) {
        return Promise.resolve("5")
      }
      return Promise.resolve(null)
    })

    const createStreamableValueSpy = vi.spyOn(require("ai"), "createStreamableValue")

    await POST(request)

    // Verify that the stream metadata includes the previous interaction ID
    const streamableValue = createStreamableValueSpy.mock.results[0].value
    expect(streamableValue.experimental_streamData.append).toHaveBeenCalledWith({
      isCheckIn: true,
      reviewInteractionId: mockPreviousInteractionId,
    })
  })

  it("should handle Redis errors gracefully when retrieving the previous interaction ID", async () => {
    const request = createMockRequest()

    // Mock Redis to throw an error when getting the previous interaction ID
    mockRedisClient.get.mockImplementation((key) => {
      if (key === `last_assistant_interaction_id:${mockSessionId}`) {
        return Promise.reject(new Error("Redis connection error"))
      }
      if (key === `session:turn_count:${mockSessionId}`) {
        return Promise.resolve("5")
      }
      return Promise.resolve(null)
    })

    // This should not throw an error
    await expect(POST(request)).resolves.toBeDefined()
  })

  it("should handle Redis errors gracefully when storing the current interaction ID", async () => {
    const request = createMockRequest()

    // Mock Redis to throw an error when setting the current interaction ID
    mockRedisClient.set.mockImplementation((key) => {
      if (key === `last_assistant_interaction_id:${mockSessionId}`) {
        return Promise.reject(new Error("Redis connection error"))
      }
      return Promise.resolve("OK")
    })

    // This should not throw an error
    await expect(POST(request)).resolves.toBeDefined()
  })
})
