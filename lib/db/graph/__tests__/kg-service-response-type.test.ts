import { KgService } from "../kg-service"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

describe("KgService - Response Type Methods", () => {
  let kgService: KgService
  let mockKgLayer: any

  beforeEach(() => {
    mockKgLayer = {
      executeCypherScalar: jest.fn(),
      executeCypher: jest.fn(),
    }

    kgService = new KgService(null as any)
    kgService.kgLayer = mockKgLayer
  })

  describe("getInteractionResponseType", () => {
    it("should return the response type when found", async () => {
      // Mock the executeCypherScalar to return a response type
      mockKgLayer.executeCypherScalar.mockResolvedValue("LLM")

      const result = await kgService.getInteractionResponseType("interaction-123", "user-456")

      // Verify the correct Cypher query was executed
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining(
          "MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction {interactionID: $interactionId})",
        ),
        {
          userId: "user-456",
          interactionId: "interaction-123",
        },
      )

      expect(result).toBe("LLM")
    })

    it("should return null when response type is not found", async () => {
      // Mock the executeCypherScalar to return null (not found)
      mockKgLayer.executeCypherScalar.mockResolvedValue(null)

      const result = await kgService.getInteractionResponseType("interaction-123", "user-456")

      expect(result).toBeNull()
    })

    it("should return null when parameters are missing", async () => {
      const result1 = await kgService.getInteractionResponseType("", "user-456")
      const result2 = await kgService.getInteractionResponseType("interaction-123", "")

      expect(result1).toBeNull()
      expect(result2).toBeNull()
      expect(mockKgLayer.executeCypherScalar).not.toHaveBeenCalled()
    })

    it("should return null and log error when database query fails", async () => {
      // Mock the executeCypherScalar to throw an error
      const mockError = new Error("Database connection failed")
      mockKgLayer.executeCypherScalar.mockRejectedValue(mockError)

      const result = await kgService.getInteractionResponseType("interaction-123", "user-456")

      expect(result).toBeNull()
    })
  })

  describe("setInteractionProperty", () => {
    it("should set a property on an interaction node", async () => {
      // Mock the executeCypherScalar to return 1 (success)
      mockKgLayer.executeCypherScalar.mockResolvedValue(1)

      const result = await kgService.setInteractionProperty("interaction-123", "responseType", "LLM")

      // Verify the correct Cypher query was executed
      expect(mockKgLayer.executeCypherScalar).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (i:Interaction {interactionID: $interactionID})"),
        {
          interactionID: "interaction-123",
          propertyValue: "LLM",
        },
      )

      expect(result).toBe(true)
    })

    it("should return false when interaction is not found", async () => {
      // Mock the executeCypherScalar to return 0 (not found)
      mockKgLayer.executeCypherScalar.mockResolvedValue(0)

      const result = await kgService.setInteractionProperty("interaction-123", "responseType", "LLM")

      expect(result).toBe(false)
    })

    it("should return false when parameters are invalid", async () => {
      const result1 = await kgService.setInteractionProperty("", "responseType", "LLM")
      const result2 = await kgService.setInteractionProperty("interaction-123", "", "LLM")

      expect(result1).toBe(false)
      expect(result2).toBe(false)
      expect(mockKgLayer.executeCypherScalar).not.toHaveBeenCalled()
    })

    it("should sanitize property names", async () => {
      // Try with an invalid property name
      const result = await kgService.setInteractionProperty("interaction-123", "response-type;DROP TABLE", "LLM")

      expect(result).toBe(false)
      expect(mockKgLayer.executeCypherScalar).not.toHaveBeenCalled()
    })

    it("should return false and log error when database query fails", async () => {
      // Mock the executeCypherScalar to throw an error
      const mockError = new Error("Database connection failed")
      mockKgLayer.executeCypherScalar.mockRejectedValue(mockError)

      const result = await kgService.setInteractionProperty("interaction-123", "responseType", "LLM")

      expect(result).toBe(false)
    })
  })
})
