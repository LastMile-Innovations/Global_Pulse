import {
  calculateResponseDelay,
  determineUserStateHint,
  determineResponseSource,
  getSystemPromptForState,
  shouldTriggerCoherenceCheckin,
  generateCoherenceCheckin,
  generateAttunedResponse,
  isInListeningMode,
  setListeningMode,
} from "../attunement-service"
import { getRedisClient } from "../../db/redis/redis-client"
import { getTemplatedResponse } from "../../responses/template-filler"
import { generateLlmResponseViaSdk } from "../../llm/llm-gateway"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("../../db/redis/redis-client")
jest.mock("../../responses/template-filler")
jest.mock("../../llm/llm-gateway")

describe("Attunement Service", () => {
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

  describe("calculateResponseDelay", () => {
    test("should calculate base delay for normal stress", () => {
      const delay = calculateResponseDelay(0.3, false)
      expect(delay).toBe(1000) // Base delay
    })

    test("should add delay for high stress", () => {
      const delay = calculateResponseDelay(0.8, false)
      expect(delay).toBeGreaterThan(1000) // Base delay + high stress addition
    })

    test("should add delay for complex responses", () => {
      const delay = calculateResponseDelay(0.3, true)
      expect(delay).toBeGreaterThan(1000) // Base delay + complex response addition
    })

    test("should add delay for both high stress and complex responses", () => {
      const delay = calculateResponseDelay(0.8, true)
      expect(delay).toBeGreaterThan(2000) // Base delay + high stress + complex response
    })

    test("should respect minimum and maximum delay bounds", () => {
      const minDelay = calculateResponseDelay(0.0, false)
      expect(minDelay).toBeGreaterThanOrEqual(500)

      const maxDelay = calculateResponseDelay(1.0, true)
      expect(maxDelay).toBeLessThanOrEqual(2500)
    })
  })

  describe("determineUserStateHint", () => {
    test("should return high_distress for high negative valence and high arousal", () => {
      const hint = determineUserStateHint({
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.9,
      })
      expect(hint).toBe("high_distress")
    })

    test("should return calm_neutral for low confidence", () => {
      const hint = determineUserStateHint({
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.3, // Low confidence
      })
      expect(hint).toBe("calm_neutral")
    })

    test("should return activated_positive for high arousal and positive valence", () => {
      const hint = determineUserStateHint({
        valence: 0.6,
        arousal: 0.7,
        dominance: 0.6,
        confidence: 0.9,
      })
      expect(hint).toBe("activated_positive")
    })

    test("should return calm_negative for low arousal and negative valence", () => {
      const hint = determineUserStateHint({
        valence: -0.6,
        arousal: 0.3,
        dominance: 0.4,
        confidence: 0.9,
      })
      expect(hint).toBe("calm_negative")
    })
  })

  describe("determineResponseSource", () => {
    test("should return template with validate_uncertainty for uncertainty", () => {
      const result = determineResponseSource("calm_neutral", true, false)
      expect(result.source).toBe("template")
      expect(result.templateIntent).toBe("validate_uncertainty")
    })

    test("should return template with validate_high_distress for high distress", () => {
      const result = determineResponseSource("high_distress", false, false)
      expect(result.source).toBe("template")
      expect(result.templateIntent).toBe("validate_high_distress")
    })

    test("should return template with listening_ack for listening mode", () => {
      const result = determineResponseSource("calm_neutral", false, true)
      expect(result.source).toBe("template")
      expect(result.templateIntent).toBe("listening_ack")
    })

    test("should return llm for normal conditions", () => {
      const result = determineResponseSource("calm_neutral", false, false)
      expect(result.source).toBe("llm")
      expect(result.templateIntent).toBeUndefined()
    })
  })

  describe("getSystemPromptForState", () => {
    test("should return high distress prompt for high_distress", () => {
      const prompt = getSystemPromptForState("high_distress")
      expect(prompt).toContain("supporting users through difficult moments")
      expect(prompt).toContain("Keep responses brief and supportive")
    })

    test("should return activated negative prompt for activated_negative", () => {
      const prompt = getSystemPromptForState("activated_negative")
      expect(prompt).toContain("supporting users through challenging moments")
    })

    test("should return default prompt for calm_neutral", () => {
      const prompt = getSystemPromptForState("calm_neutral")
      expect(prompt).toContain("supporting users through self-discovery")
    })
  })

  describe("shouldTriggerCoherenceCheckin", () => {
    test("should return false if in listening mode", async () => {
      // Mock Redis to return listening mode active
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes("listeningMode")) {
          return Promise.resolve("true")
        }
        return Promise.resolve(null)
      })

      const result = await shouldTriggerCoherenceCheckin("test-user", "test-session", 10)
      expect(result).toBe(false)
    })

    test("should return false if a check-in was triggered recently", async () => {
      // Mock Redis to return a recent check-in
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes("lastCoherenceCheckinTurn")) {
          return Promise.resolve("8") // Last check-in at turn 8
        }
        return Promise.resolve(null)
      })

      const result = await shouldTriggerCoherenceCheckin("test-user", "test-session", 10)
      expect(result).toBe(false)
    })

    test("should apply probability factor", async () => {
      // Mock Redis to return null (no recent check-in, not in listening mode)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      // Mock Math.random to return a value above the threshold
      const originalRandom = Math.random
      Math.random = jest.fn().mockReturnValue(0.95)

      try {
        const result = await shouldTriggerCoherenceCheckin("test-user", "test-session", 10)
        expect(result).toBe(false)
      } finally {
        // Restore original Math.random
        Math.random = originalRandom
      }
    })

    test("should return true when all conditions are met", async () => {
      // Mock Redis to return null (no recent check-in, not in listening mode)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      // Mock Math.random to return a value below the threshold
      const originalRandom = Math.random
      Math.random = jest.fn().mockReturnValue(0.05)

      try {
        const result = await shouldTriggerCoherenceCheckin("test-user", "test-session", 10)
        expect(result).toBe(true)
      } finally {
        // Restore original Math.random
        Math.random = originalRandom
      }
    })
  })

  describe("generateCoherenceCheckin", () => {
    test("should return null if shouldTriggerCoherenceCheckin returns false", async () => {
      // Mock Redis to return listening mode active
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes("listeningMode")) {
          return Promise.resolve("true")
        }
        return Promise.resolve(null)
      })

      const result = await generateCoherenceCheckin("test-user", "test-session", 10)
      expect(result).toBeNull()
    })

    test("should generate a check-in and update session state when conditions are met", async () => {
      // Mock Redis to return null (no recent check-in, not in listening mode)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      // Mock Math.random to return a value below the threshold
      const originalRandom = Math.random
      Math.random = jest.fn().mockReturnValue(0.05)

      // Mock getTemplatedResponse
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
        "I'd like to check in quickly - how well did my last response capture what you were conveying?",
      )

      try {
        const result = await generateCoherenceCheckin("test-user", "test-session", 10)

        expect(result).toBe("I'  \"test-session", 10)

        expect(result).toBe(
          "I'd like to check in quickly - how well did my last response capture what you were conveying?",
        )
        expect(getTemplatedResponse).toHaveBeenCalledWith(
          "felt_coherence_checkin",
          expect.objectContaining({
            userId: "test-user",
            sessionId: "test-session",
          }),
        )
        expect(mockRedis.set).toHaveBeenCalled() // Should set last check-in turn
      } finally {
        // Restore original Math.random
        Math.random = originalRandom
      }
    })
  })

  describe("generateAttunedResponse", () => {
    test("should return coherence check-in if triggered", async () => {
      // Mock Redis to return null (no recent check-in, not in listening mode)
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      // Mock Math.random to return a value below the threshold
      const originalRandom = Math.random
      Math.random = jest.fn().mockReturnValue(0.05)

      // Mock getTemplatedResponse
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
        "I'd like to check in quickly - how well did my last response capture what you were conveying?",
      )

      try {
        const result = await generateAttunedResponse(
          "test-user",
          "test-session",
          "How are you today?",
          { valence: 0.2, arousal: 0.3, dominance: 0.5, confidence: 0.8 },
          false,
          false,
          10,
        )

        expect(result.response).toBe(
          "I'd like to check in quickly - how well did my last response capture what you were conveying?",
        )
        expect(result.source).toBe("template")
      } finally {
        // Restore original Math.random
        Math.random = originalRandom
      }
    })

    test("should use template for uncertainty", async () => {
      // Mock Redis to return values that prevent coherence check-in
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes("lastCoherenceCheckinTurn")) {
          return Promise.resolve("8") // Recent check-in
        }
        return Promise.resolve(null)
      })

      // Mock getTemplatedResponse
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
        "It's completely okay to feel unsure about this. Uncertainty is a natural part of processing our experiences.",
      )

      const result = await generateAttunedResponse(
        "test-user",
        "test-session",
        "I'm not sure what to do",
        { valence: 0.0, arousal: 0.5, dominance: 0.4, confidence: 0.8 },
        true, // Has uncertainty
        false,
        10,
      )

      expect(result.response).toContain("It's completely okay to feel unsure")
      expect(result.source).toBe("template")
      expect(getTemplatedResponse).toHaveBeenCalledWith("validate_uncertainty", expect.anything(), expect.anything())
    })

    test("should use template for high distress", async () => {
      // Mock Redis to return values that prevent coherence check-in
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes("lastCoherenceCheckinTurn")) {
          return Promise.resolve("8") // Recent check-in
        }
        return Promise.resolve(null)
      })

      // Mock getTemplatedResponse
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
        "That sounds incredibly difficult right now. I want to acknowledge the intensity of what you're experiencing.",
      )

      const result = await generateAttunedResponse(
        "test-user",
        "test-session",
        "I'm feeling overwhelmed",
        { valence: -0.8, arousal: 0.8, dominance: 0.3, confidence: 0.9 }, // High distress
        false,
        false,
        10,
      )

      expect(result.response).toContain("That sounds incredibly difficult")
      expect(result.source).toBe("template")
      expect(getTemplatedResponse).toHaveBeenCalledWith("validate_high_distress", expect.anything(), expect.anything())
    })

    test("should use LLM for normal conditions", async () => {
      // Mock Redis to return values that prevent coherence check-in
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes("lastCoherenceCheckinTurn")) {
          return Promise.resolve("8") // Recent check-in
        }
        return Promise.resolve(null)
      })

      // Mock generateLlmResponseViaSdk
      ;(generateLlmResponseViaSdk as jest.Mock).mockResolvedValue({
        success: true,
        text: "I understand how you're feeling. Would you like to tell me more about that?",
      })

      const result = await generateAttunedResponse(
        "test-user",
        "test-session",
        "I'm feeling a bit down today",
        { valence: -0.3, arousal: 0.4, dominance: 0.5, confidence: 0.8 }, // Mild negative
        false,
        false,
        10,
      )

      expect(result.response).toContain("I understand how you're feeling")
      expect(result.source).toBe("llm")
      expect(generateLlmResponseViaSdk).toHaveBeenCalled()
    })

    test("should fall back to template if LLM fails", async () => {
      // Mock Redis to return values that prevent coherence check-in
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes("lastCoherenceCheckinTurn")) {
          return Promise.resolve("8") // Recent check-in
        }
        return Promise.resolve(null)
      })

      // Mock generateLlmResponseViaSdk to fail
      ;(generateLlmResponseViaSdk as jest.Mock).mockResolvedValue({
        success: false,
        error: "LLM error",
      })

      // Mock getTemplatedResponse for fallback
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
        "I appreciate you sharing that with me. Let's take a moment to consider what might be most helpful now.",
      )

      const result = await generateAttunedResponse(
        "test-user",
        "test-session",
        "I'm feeling a bit down today",
        { valence: -0.3, arousal: 0.4, dominance: 0.5, confidence: 0.8 }, // Mild negative
        false,
        false,
        10,
      )

      expect(result.response).toContain("I appreciate you sharing that")
      expect(result.source).toBe("template")
      expect(getTemplatedResponse).toHaveBeenCalledWith("generic_safe_response", expect.anything())
    })
  })

  describe("isInListeningMode and setListeningMode", () => {
    test("should return true if listening mode is active", async () => {
      // Mock Redis to return listening mode active
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue("true")

      const result = await isInListeningMode("test-user", "test-session")
      expect(result).toBe(true)
    })

    test("should return false if listening mode is not active", async () => {
      // Mock Redis to return null
      const mockRedis = getRedisClient() as any
      mockRedis.get.mockResolvedValue(null)

      const result = await isInListeningMode("test-user", "test-session")
      expect(result).toBe(false)
    })

    test("should set listening mode to active", async () => {
      // Mock Redis
      const mockRedis = getRedisClient() as any

      await setListeningMode("test-user", "test-session", true)
      expect(mockRedis.set).toHaveBeenCalledWith(expect.stringContaining("listeningMode"), "true", expect.anything())
    })

    test("should set listening mode to inactive", async () => {
      // Mock Redis
      const mockRedis = getRedisClient() as any

      await setListeningMode("test-user", "test-session", false)
      expect(mockRedis.del).toHaveBeenCalled()
    })
  })
})
