import { NextRequest } from "next/server"
import { POST } from "../route"
import { auth } from "@/lib/auth/auth-utils"
import { db } from "@/lib/db/drizzle"
import { getEngagementMode } from "@/lib/session/mode-manager"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("@/lib/auth/auth-utils")
jest.mock("@/lib/db/drizzle")
jest.mock("@/lib/session/mode-manager")
jest.mock("@/lib/db/graph/kg-service-factory")

describe("Resonance Flag API Route", () => {
  const mockKgService = {
    getInteractionResponseType: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks
    ;(auth as jest.Mock).mockResolvedValue("test-user-id")
    ;(getEngagementMode as jest.Mock).mockResolvedValue("insight")
    ;(getKgService as jest.Mock).mockReturnValue(mockKgService)
    mockKgService.getInteractionResponseType.mockResolvedValue("LLM")
    ;(db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockResolvedValue({ insertId: "test-insert-id" }),
    })
  })

  it("should return 401 if user is not authenticated", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/feedback/resonance-flag", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        flaggedInteractionId: "test-interaction",
        clientTimestamp: new Date().toISOString(),
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: "Unauthorized" })
  })

  it("should return 400 if required fields are missing", async () => {
    const request = new NextRequest("http://localhost/api/feedback/resonance-flag", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        // Missing flaggedInteractionId
        clientTimestamp: new Date().toISOString(),
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("should successfully process a valid resonance flag", async () => {
    const mockTimestamp = new Date().toISOString()
    const request = new NextRequest("http://localhost/api/feedback/resonance-flag", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        flaggedInteractionId: "test-interaction",
        precedingInteractionId: "prev-interaction",
        selectedTags: ["Misunderstood me", "Tone issue"],
        optionalComment: "This response didn't address my question",
        clientTimestamp: mockTimestamp,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })

    // Verify the correct data was passed to the database
    expect(db.insert).toHaveBeenCalled()
    expect(db.insert().values).toHaveBeenCalledWith({
      userId: "test-user-id",
      sessionId: "test-session",
      flaggedInteractionId: "test-interaction",
      precedingInteractionId: "prev-interaction",
      modeAtTimeOfFlag: "insight",
      responseTypeAtTimeOfFlag: "LLM",
      selectedTags: ["Misunderstood me", "Tone issue"],
      optionalComment: "This response didn't address my question",
      clientTimestamp: expect.any(Date),
      createdAt: expect.any(Date),
    })
  })

  it("should handle missing optional fields", async () => {
    const mockTimestamp = new Date().toISOString()
    const request = new NextRequest("http://localhost/api/feedback/resonance-flag", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        flaggedInteractionId: "test-interaction",
        clientTimestamp: mockTimestamp,
        // No precedingInteractionId, selectedTags, or optionalComment
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    // Verify the correct data was passed to the database
    expect(db.insert().values).toHaveBeenCalledWith(
      expect.objectContaining({
        precedingInteractionId: null,
        selectedTags: [],
        optionalComment: null,
      }),
    )
  })

  it("should use UNKNOWN response type when Neo4j lookup fails", async () => {
    mockKgService.getInteractionResponseType.mockResolvedValue(null)

    const mockTimestamp = new Date().toISOString()
    const request = new NextRequest("http://localhost/api/feedback/resonance-flag", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        flaggedInteractionId: "test-interaction",
        clientTimestamp: mockTimestamp,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    // Verify UNKNOWN was used for responseTypeAtTimeOfFlag
    expect(db.insert().values).toHaveBeenCalledWith(
      expect.objectContaining({
        responseTypeAtTimeOfFlag: "UNKNOWN",
      }),
    )
  })
})
