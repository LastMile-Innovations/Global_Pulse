import { POST } from "../route"
import { auth } from "@/lib/auth/auth-utils"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { NextRequest } from "next/server"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("@/lib/auth/auth-utils")
jest.mock("@/lib/db/graph/kg-service-factory")
jest.mock("@/lib/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe("POST /api/feedback/narrative_hide", () => {
  // Setup mocks
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  const mockGetKgService = getKgService as jest.MockedFunction<typeof getKgService>
  const mockHideErInstance = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetKgService.mockReturnValue({
      hideErInstance: mockHideErInstance,
    } as any)
  })

  it("should return 401 if user is not authenticated", async () => {
    // Arrange
    mockAuth.mockResolvedValue(null)
    const request = new NextRequest("http://localhost/api/feedback/narrative_hide", {
      method: "POST",
      body: JSON.stringify({ interactionID: "test-interaction-id" }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
    expect(mockHideErInstance).not.toHaveBeenCalled()
  })

  it("should return 400 if request body is invalid", async () => {
    // Arrange
    mockAuth.mockResolvedValue("test-user-id")
    const request = new NextRequest("http://localhost/api/feedback/narrative_hide", {
      method: "POST",
      body: JSON.stringify({ interactionID: "" }), // Empty interactionID
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.error).toBe("Validation failed")
    expect(mockHideErInstance).not.toHaveBeenCalled()
  })

  it("should return 404 if hideErInstance returns false", async () => {
    // Arrange
    mockAuth.mockResolvedValue("test-user-id")
    mockHideErInstance.mockResolvedValue(false)
    const request = new NextRequest("http://localhost/api/feedback/narrative_hide", {
      method: "POST",
      body: JSON.stringify({ interactionID: "test-interaction-id" }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe("Interaction or related inference not found.")
    expect(mockHideErInstance).toHaveBeenCalledWith("test-user-id", "test-interaction-id")
  })

  it("should return 200 if hideErInstance returns true", async () => {
    // Arrange
    mockAuth.mockResolvedValue("test-user-id")
    mockHideErInstance.mockResolvedValue(true)
    const request = new NextRequest("http://localhost/api/feedback/narrative_hide", {
      method: "POST",
      body: JSON.stringify({ interactionID: "test-interaction-id" }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("Inference hidden successfully.")
    expect(mockHideErInstance).toHaveBeenCalledWith("test-user-id", "test-interaction-id")
  })

  it("should return 500 if an error occurs", async () => {
    // Arrange
    mockAuth.mockResolvedValue("test-user-id")
    mockHideErInstance.mockRejectedValue(new Error("Test error"))
    const request = new NextRequest("http://localhost/api/feedback/narrative_hide", {
      method: "POST",
      body: JSON.stringify({ interactionID: "test-interaction-id" }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe("Internal Server Error")
    expect(mockHideErInstance).toHaveBeenCalledWith("test-user-id", "test-interaction-id")
  })
})
