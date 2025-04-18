import { NextRequest } from "next/server"
import { POST } from "../route"
import { auth } from "@/lib/auth/auth-utils"
import { processPceMvpRequest } from "@/lib/pce/pce-service"
import { getRedisClient } from "@/lib/redis/client"
import { detectUncertainty } from "@/lib/nlp/uncertainty-detection"
import { generateAttunedResponse } from "@/lib/attunement/attunement-service"
import { isInListeningMode } from "@/lib/attunement/attunement-service"
import { applyGuardrails } from "@/lib/guardrails/guardrails-service"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("@/lib/auth/auth-utils")
jest.mock("@/lib/pce/pce-service")
jest.mock("@/lib/redis/client")
jest.mock("@/lib/nlp/uncertainty-detection")
jest.mock("@/lib/attunement/attunement-service")
jest.mock("@/lib/guardrails/guardrails-service")
jest.mock("@/lib/db/graph/kg-service-factory")
jest.mock("@/lib/pce/conditional-logging")
jest.mock("@/lib/somatic/somatic-service")
jest.mock("@/lib/distress/distress-detection")
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mock-interaction-id"),
}))

describe("Chat API Route", () => {
  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
  }

  const mockKgService = {
    setInteractionProperty: jest.fn().mockResolvedValue(true),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks
    ;(auth as jest.Mock).mockResolvedValue("test-user-id")
    ;(getRedisClient as jest.Mock).mockReturnValue(mockRedisClient)
    mockRedisClient.get.mockResolvedValue("1") // Turn count
    ;(processPceMvpRequest as jest.Mock).mockResolvedValue({
      ewefAnalysis: { vad: { v: 0, a: 0, d: 0 } },
    })
    ;(detectUncertainty as jest.Mock).mockResolvedValue({ isUncertain: false })
    ;(isInListeningMode as jest.Mock).mockResolvedValue(false)
    ;(generateAttunedResponse as jest.Mock).mockResolvedValue({
      response: "This is a test response",
      source: "llm",
    })
    ;(applyGuardrails as jest.Mock).mockResolvedValue("This is a test response")
    ;(getKgService as jest.Mock).mockReturnValue(mockKgService)
  })

  it("should return 401 if user is not authenticated", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Hello",
        sessionId: "test-session",
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: "Unauthorized" })
  })

  it("should return 400 if required fields are missing", async () => {
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        // Missing message
        sessionId: "test-session",
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("should process a normal chat message and store response type in Neo4j", async () => {
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Hello",
        sessionId: "test-session",
      }),
    })

    await POST(request)

    // Verify the response type and agent response were stored in Neo4j
    expect(mockKgService.setInteractionProperty).toHaveBeenCalledWith("mock-interaction-id", "responseType", "LLM")
    expect(mockKgService.setInteractionProperty).toHaveBeenCalledWith(
      "mock-interaction-id",
      "agentResponse",
      "This is a test response",
    )
  })

  it("should handle template responses correctly", async () => {
    // Mock a template response
    ;(generateAttunedResponse as jest.Mock).mockResolvedValue({
      response: "This is a template response",
      source: "uncertainty_validation",
    })

    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Hello",
        sessionId: "test-session",
      }),
    })

    await POST(request)

    // Verify the correct response type was stored
    expect(mockKgService.setInteractionProperty).toHaveBeenCalledWith(
      "mock-interaction-id",
      "responseType",
      "Template:uncertainty_validation",
    )
  })
})
