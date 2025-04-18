import {
  shouldTriggerSomaticPrompt,
  generateSomaticPrompt,
  isAwaitingSomaticResponse,
  generateSomaticAcknowledgment,
  resetSomaticState,
} from "../somatic-service"
import { checkConsent } from "../../ethics/consent"
import { getRedisClient } from "../../db/redis/redis-client"
import { getTemplatedResponse } from "../../responses/template-filler"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("../../ethics/consent")
jest.mock("../../db/redis/redis-client")
jest.mock("../../responses/template-filler")

describe("Somatic Service", () => {
  beforeEach(() => {
    jest.resetAllMocks()

    // Mock Redis client
    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }
    ;(getRedisClient as jest.Mock).mockReturnValue(mockRedis)
  })

  describe("shouldTriggerSomaticPrompt", () => {
    test("should return false if user has not consented", async () => {
      // Mock consent check to return false
      ;(checkConsent as jest.Mock).mockResolvedValue(false)

      const result = await shouldTriggerSomaticPrompt(
        "test-user",
        "test-session",
        { valence: -0.7, arousal: 0.8, dominance: 0.4, confidence: 0.9 },
        5,
      )

      expect(result).toBe(false)
      expect(checkConsent).toHaveBeenCalledWith("test-user", "allowSomaticPrompts")
    })

    test("should return false if VAD confidence is too low", async () => {
      // Mock consent check to return true
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      const result = await shouldTriggerSomaticPrompt(
        "test-user",
        "test-session",
        { valence: -0.7, arousal: 0.8, dominance: 0.4, confidence: 0.3 }, // Low confidence
        5,
      )

      expect(result).toBe(false)
    })

    test("should return false if VAD thresholds are not met", async () => {
      // Mock consent check to return true
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      const result = await shouldTriggerSomaticPrompt(
        "test-user",
        "test-session",
        { valence: 0.2, arousal: 0.3, dominance: 0.4, confidence: 0.9 }, // Low arousal, neutral valence
        5,
      )

      expect(result).toBe(false)
    })

    test("should return false if a prompt was triggered too recently", async () => {
      // Mock consent check to return true
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      // Mock Redis to return a recent turn number
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("3") // Last prompt was at turn 3

      const result = await shouldTriggerSomaticPrompt(
        "test-user",
        "test-session",
        { valence: -0.7, arousal: 0.8, dominance: 0.4, confidence: 0.9 },
        5, // Current turn is 5, which is too close to 3
      )

      expect(result).toBe(false)
      expect(mockRedis.get).toHaveBeenCalled()
    })

    test("should return true when all conditions are met", async () => {
      // Mock consent check to return true
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      // Mock Redis to return null (no recent prompt)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      // Mock Math.random to return a value below the threshold
      const originalRandom = Math.random
      Math.random = jest.fn().mockReturnValue(0.5)

      try {
        const result = await shouldTriggerSomaticPrompt(
          "test-user",
          "test-session",
          { valence: -0.7, arousal: 0.8, dominance: 0.4, confidence: 0.9 },
          10,
        )

        expect(result).toBe(true)
      } finally {
        // Restore original Math.random
        Math.random = originalRandom
      }
    })
  })

  describe("generateSomaticPrompt", () => {
    test("should return null if shouldTriggerSomaticPrompt returns false", async () => {
      // Mock consent check to return false
      ;(checkConsent as jest.Mock).mockResolvedValue(false)

      const result = await generateSomaticPrompt(
        "test-user",
        "test-session",
        "I'm feeling anxious",
        { valence: -0.7, arousal: 0.8, dominance: 0.4, confidence: 0.9 },
        5,
      )

      expect(result).toBeNull()
    })

    test("should generate a prompt and update session state when conditions are met", async () => {
      // Mock consent check to return true
      ;(checkConsent as jest.Mock).mockResolvedValue(true)

      // Mock Redis to return null (no recent prompt)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      // Mock Math.random to return a value below the threshold
      const originalRandom = Math.random
      Math.random = jest.fn().mockReturnValue(0.5)

      // Mock getTemplatedResponse
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
        "Taking a moment to pause... if you're comfortable, you might notice where you feel that distress in your body right now.",
      )

      try {
        const result = await generateSomaticPrompt(
          "test-user",
          "test-session",
          "I'm feeling anxious",
          { valence: -0.7, arousal: 0.8, dominance: 0.4, confidence: 0.9 },
          10,
        )

        expect(result).toBe(
          "Taking a moment to pause... if you're comfortable, you might notice where you feel that distress in your body right now.",
        )
        expect(getTemplatedResponse).toHaveBeenCalledWith(
          "somatic_body_cue_prompt",
          expect.objectContaining({
            userId: "test-user",
            sessionId: "test-session",
            user_message: "I'm feeling anxious",
            feeling_name: "distress",
          }),
          expect.anything(),
        )
        expect(mockRedis.set).toHaveBeenCalledTimes(2) // Should set last prompt turn and awaiting response flag
      } finally {
        // Restore original Math.random
        Math.random = originalRandom
      }
    })
  })

  describe("isAwaitingSomaticResponse", () => {
    test("should return true if awaiting response flag is set", async () => {
      // Mock Redis to return "true"
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("true")

      const result = await isAwaitingSomaticResponse("test-user", "test-session")

      expect(result).toBe(true)
      expect(mockRedis.get).toHaveBeenCalled()
    })

    test("should return false if awaiting response flag is not set", async () => {
      // Mock Redis to return null
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      const result = await isAwaitingSomaticResponse("test-user", "test-session")

      expect(result).toBe(false)
      expect(mockRedis.get).toHaveBeenCalled()
    })
  })

  describe("generateSomaticAcknowledgment", () => {
    test("should generate an acknowledgment and reset the awaiting response flag", async () => {
      // Mock getTemplatedResponse
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue("Thank you for sharing that observation.")

      const result = await generateSomaticAcknowledgment("test-user", "test-session")

      expect(result).toBe("Thank you for sharing that observation.")
      expect(getTemplatedResponse).toHaveBeenCalledWith(
        "somatic_response_ack",
        expect.objectContaining({
          userId: "test-user",
          sessionId: "test-session",
          user_message: "", // Should be empty
        }),
      )

      // Should reset the awaiting response flag
      const mockRedis = getRedisClient() as any
      expect(mockRedis.del).toHaveBeenCalled()
    })
  })

  describe("resetSomaticState", () => {
    test("should delete all somatic state keys from Redis", async () => {
      await resetSomaticState("test-user", "test-session")

      const mockRedis = getRedisClient() as any
      expect(mockRedis.del).toHaveBeenCalledTimes(2) // Should delete both state keys
    })
  })
})
