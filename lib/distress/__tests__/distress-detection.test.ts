import { detectHighDistress, shouldTriggerDistressCheckin, generateDistressCheckin } from "../distress-detection"
import { checkConsent } from "../../ethics/consent"
import { isDistressCheckPerformed, setDistressCheckPerformed } from "../../session/session-state"
import { getTemplatedResponse } from "../../responses/template-filler"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("../../ethics/consent")
jest.mock("../../session/session-state")
jest.mock("../../responses/template-filler")
jest.mock("../../db/graph/neo4j-driver")

describe("Distress Detection", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe("detectHighDistress", () => {
    test("should return false if not enough turns to analyze", async () => {
      const vad = {
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.9,
      }

      const result = await detectHighDistress("test-user", "test-session", vad, 1)

      expect(result).toBe(false)
    })

    test("should return true if all recent turns show high distress", async () => {
      const vad1 = {
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.9,
      }

      const vad2 = {
        valence: -0.6,
        arousal: 0.8,
        dominance: 0.3,
        confidence: 0.8,
      }

      // First call to add to cache
      await detectHighDistress("test-user", "test-session", vad1, 1)

      // Second call should return true
      const result = await detectHighDistress("test-user", "test-session", vad2, 2)

      expect(result).toBe(true)
    })

    test("should return false if not all recent turns show high distress", async () => {
      const vad1 = {
        valence: 0.2, // Not negative enough
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.9,
      }

      const vad2 = {
        valence: -0.6,
        arousal: 0.8,
        dominance: 0.3,
        confidence: 0.8,
      }

      // First call to add to cache
      await detectHighDistress("test-user", "test-session", vad1, 1)

      // Second call should return false
      const result = await detectHighDistress("test-user", "test-session", vad2, 2)

      expect(result).toBe(false)
    })
  })

  describe("shouldTriggerDistressCheckin", () => {
    test("should return false if detailed logging is not enabled", async () => {
      const vad = {
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.9,
      }

      const result = await shouldTriggerDistressCheckin("test-user", "test-session", vad, 1, false)

      expect(result).toBe(false)
    })

    test("should return false if distress check-in has already been performed", async () => {
      // Mock isDistressCheckPerformed to return true
      ;(isDistressCheckPerformed as jest.Mock).mockResolvedValue(true)

      const vad = {
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.9,
      }

      const result = await shouldTriggerDistressCheckin("test-user", "test-session", vad, 1, true)

      expect(result).toBe(false)
      expect(isDistressCheckPerformed).toHaveBeenCalledWith("test-session")
    })

    test("should return false if user has not opted in to distress check-ins", async () => {
      // Mock dependencies
      ;(isDistressCheckPerformed as jest.Mock).mockResolvedValue(false)
      ;(checkConsent as jest.Mock).mockResolvedValue(false)

      const vad = {
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.4,
        confidence: 0.9,
      }

      const result = await shouldTriggerDistressCheckin("test-user", "test-session", vad, 1, true)

      expect(result).toBe(false)
      expect(isDistressCheckPerformed).toHaveBeenCalledWith("test-session")
      expect(checkConsent).toHaveBeenCalledWith("test-user", "allowDistressConsentCheck", expect.anything())
    })
  })

  describe("generateDistressCheckin", () => {
    test("should generate a distress check-in prompt and update session state", async () => {
      // Mock getTemplatedResponse
      ;(getTemplatedResponse as jest.Mock).mockResolvedValue(
        "I notice this conversation has touched on some difficult feelings. Would you like to temporarily pause data contributions for this session?",
      )

      const result = await generateDistressCheckin("test-user", "test-session")

      expect(result).toBe(
        "I notice this conversation has touched on some difficult feelings. Would you like to temporarily pause data contributions for this session?",
      )
      expect(getTemplatedResponse).toHaveBeenCalledWith("distress_consent_checkin", expect.anything())
      expect(setDistressCheckPerformed).toHaveBeenCalledWith("test-session")
    })
  })
})
