import { getLlmVariableInference, getLlmPerceptionAppraisal } from "../llm-assistance"
import { callGenerateObject } from "../../ai-sdk/gateway"
import { logger } from "../../utils/logger"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock dependencies
vi.mock("../../ai-sdk/gateway", () => ({
  callGenerateObject: vi.fn(),
}))

vi.mock("../../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe("LLM Assistance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("getLlmVariableInference", () => {
    it("should return valid rule variables when LLM call succeeds", async () => {
      // Mock successful LLM response
      const mockRuleVariables = {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.7 },
        acceptanceState: { value: "accepted", confidence: 0.6 },
      }

      vi.mocked(callGenerateObject).mockResolvedValueOnce({
        success: true,
        data: mockRuleVariables,
        modelUsed: "openai:gpt-4o",
      })

      const result = await getLlmVariableInference("I feel anxious about my upcoming presentation")

      expect(callGenerateObject).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Successfully obtained"))
      expect(result).toEqual(mockRuleVariables)
    })

    it("should return null when LLM call fails", async () => {
      // Mock failed LLM response
      vi.mocked(callGenerateObject).mockResolvedValueOnce({
        success: false,
        error: "Failed to generate object",
        errorCode: "NO_OBJECT_GENERATED",
        modelUsed: "openai:gpt-4o",
      })

      const result = await getLlmVariableInference("I feel anxious about my upcoming presentation")

      expect(callGenerateObject).toHaveBeenCalledTimes(1)
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("LLM failed to return"))
      expect(result).toBeNull()
    })

    it("should handle exceptions and return null", async () => {
      // Mock exception
      vi.mocked(callGenerateObject).mockRejectedValueOnce(new Error("Network error"))

      const result = await getLlmVariableInference("I feel anxious about my upcoming presentation")

      expect(callGenerateObject).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Error in LLM variable inference"))
      expect(result).toBeNull()
    })
  })

  describe("getLlmPerceptionAppraisal", () => {
    it("should return valid perception appraisal when LLM call succeeds", async () => {
      // Mock successful LLM response
      const mockPerceptionAppraisal = {
        pValuationShiftEstimate: -0.3,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      }

      vi.mocked(callGenerateObject).mockResolvedValueOnce({
        success: true,
        data: mockPerceptionAppraisal,
        modelUsed: "openai:gpt-4o",
      })

      const result = await getLlmPerceptionAppraisal(
        "I feel anxious about my upcoming presentation",
        { label: "NEGATIVE", score: 0.7 },
        {
          source: { value: "internal", confidence: 0.8 },
          perspective: { value: "self", confidence: 0.9 },
          timeframe: { value: "future", confidence: 0.7 },
          acceptanceState: { value: "resisted", confidence: 0.6 },
        },
        [],
      )

      expect(callGenerateObject).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Successfully obtained"))
      expect(result).toEqual(mockPerceptionAppraisal)
    })

    it("should return null when LLM call fails", async () => {
      // Mock failed LLM response
      vi.mocked(callGenerateObject).mockResolvedValueOnce({
        success: false,
        error: "Failed to generate object",
        errorCode: "NO_OBJECT_GENERATED",
        modelUsed: "openai:gpt-4o",
      })

      const result = await getLlmPerceptionAppraisal(
        "I feel anxious about my upcoming presentation",
        { label: "NEGATIVE", score: 0.7 },
        {
          source: { value: "internal", confidence: 0.8 },
          perspective: { value: "self", confidence: 0.9 },
          timeframe: { value: "future", confidence: 0.7 },
          acceptanceState: { value: "resisted", confidence: 0.6 },
        },
        [],
      )

      expect(callGenerateObject).toHaveBeenCalledTimes(1)
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("LLM failed to return"))
      expect(result).toBeNull()
    })

    it("should handle exceptions and return null", async () => {
      // Mock exception
      vi.mocked(callGenerateObject).mockRejectedValueOnce(new Error("Network error"))

      const result = await getLlmPerceptionAppraisal(
        "I feel anxious about my upcoming presentation",
        { label: "NEGATIVE", score: 0.7 },
        {
          source: { value: "internal", confidence: 0.8 },
          perspective: { value: "self", confidence: 0.9 },
          timeframe: { value: "future", confidence: 0.7 },
          acceptanceState: { value: "resisted", confidence: 0.6 },
        },
        [],
      )

      expect(callGenerateObject).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Error in LLM perception appraisal"))
      expect(result).toBeNull()
    })
  })
})
