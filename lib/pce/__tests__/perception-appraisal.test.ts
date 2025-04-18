import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { appraisePerception, appraiseHeuristicPerception } from "../perception-appraisal"
import { getLlmPerceptionAppraisal } from "../llm-assistance"
import { logger } from "../../utils/logger"

// Mock dependencies
vi.mock("../llm-assistance", () => ({
  getLlmPerceptionAppraisal: vi.fn(),
}))

vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe("Perception Appraisal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("appraisePerception", () => {
    it("should use LLM-assisted appraisal when successful", async () => {
      // Mock successful LLM response
      const mockLlmAppraisal = {
        pValuationShiftEstimate: -0.3,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      }

      vi.mocked(getLlmPerceptionAppraisal).mockResolvedValueOnce(mockLlmAppraisal)

      const utteranceText = "I feel anxious about my upcoming presentation"
      const keywords = ["anxious", "presentation"]
      const sentiment = { label: "NEGATIVE", score: 0.7 }
      const ruleVariables = {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "future", confidence: 0.7 },
        acceptanceState: { value: "resisted", confidence: 0.6 },
      }
      const activeBootstrappedEPs = []

      const result = await appraisePerception(
        utteranceText,
        keywords,
        sentiment,
        ruleVariables,
        activeBootstrappedEPs,
        true, // useLlmAssistance = true
      )

      expect(getLlmPerceptionAppraisal).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Using LLM-assisted perception appraisal"))
      expect(result).toEqual({
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: -0.3,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      })
    })

    it("should fall back to heuristic appraisal when LLM fails", async () => {
      // Mock failed LLM response
      vi.mocked(getLlmPerceptionAppraisal).mockResolvedValueOnce(null)

      const utteranceText = "I feel anxious about my upcoming presentation"
      const keywords = ["anxious", "presentation"]
      const sentiment = { label: "NEGATIVE", score: 0.7 }
      const ruleVariables = {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "future", confidence: 0.7 },
        acceptanceState: { value: "resisted", confidence: 0.6 },
      }
      const activeBootstrappedEPs = []

      // Spy on appraiseHeuristicPerception
      const appraiseHeuristicSpy = vi.spyOn(await import("../perception-appraisal"), "appraiseHeuristicPerception")

      // Mock return value for appraiseHeuristicPerception
      appraiseHeuristicSpy.mockReturnValueOnce({
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: -0.2,
        pPowerLevel: 0.6,
        pAppraisalConfidence: 0.7,
      })

      const result = await appraisePerception(
        utteranceText,
        keywords,
        sentiment,
        ruleVariables,
        activeBootstrappedEPs,
        true, // useLlmAssistance = true
      )

      expect(getLlmPerceptionAppraisal).toHaveBeenCalledTimes(1)
      expect(appraiseHeuristicSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: -0.2,
        pPowerLevel: 0.6,
        pAppraisalConfidence: 0.7,
      })
    })

    it("should use heuristic appraisal when LLM assistance is disabled", async () => {
      const utteranceText = "I feel anxious about my upcoming presentation"
      const keywords = ["anxious", "presentation"]
      const sentiment = { label: "NEGATIVE", score: 0.7 }
      const ruleVariables = {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "future", confidence: 0.7 },
        acceptanceState: { value: "resisted", confidence: 0.6 },
      }
      const activeBootstrappedEPs = []

      // Spy on appraiseHeuristicPerception
      const appraiseHeuristicSpy = vi.spyOn(await import("../perception-appraisal"), "appraiseHeuristicPerception")

      // Mock return value for appraiseHeuristicPerception
      appraiseHeuristicSpy.mockReturnValueOnce({
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: -0.2,
        pPowerLevel: 0.6,
        pAppraisalConfidence: 0.7,
      })

      const result = await appraisePerception(
        utteranceText,
        keywords,
        sentiment,
        ruleVariables,
        activeBootstrappedEPs,
        false, // useLlmAssistance = false
      )

      expect(getLlmPerceptionAppraisal).not.toHaveBeenCalled()
      expect(appraiseHeuristicSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: -0.2,
        pPowerLevel: 0.6,
        pAppraisalConfidence: 0.7,
      })
    })

    it("should handle exceptions and return default values", async () => {
      // Mock exception
      vi.mocked(getLlmPerceptionAppraisal).mockRejectedValueOnce(new Error("Test error"))

      const utteranceText = "I feel anxious about my upcoming presentation"
      const keywords = ["anxious", "presentation"]
      const sentiment = { label: "NEGATIVE", score: 0.7 }
      const ruleVariables = {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "future", confidence: 0.7 },
        acceptanceState: { value: "resisted", confidence: 0.6 },
      }
      const activeBootstrappedEPs = []

      // Also make appraiseHeuristicPerception throw an error
      const appraiseHeuristicSpy = vi.spyOn(await import("../perception-appraisal"), "appraiseHeuristicPerception")
      appraiseHeuristicSpy.mockImplementationOnce(() => {
        throw new Error("Another test error")
      })

      const result = await appraisePerception(
        utteranceText,
        keywords,
        sentiment,
        ruleVariables,
        activeBootstrappedEPs,
        true, // useLlmAssistance = true
      )

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Error appraising perception"))
      expect(result).toEqual({
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: 0.0,
        pPowerLevel: 0.5,
        pAppraisalConfidence: 0.5,
      })
    })
  })

  describe("appraiseHeuristicPerception", () => {
    it("should calculate perception values based on inputs", () => {
      const utteranceText = "I feel very anxious about my upcoming presentation!"
      const keywords = ["anxious", "presentation"]
      const sentiment = { label: "NEGATIVE", score: 0.7 }
      const ruleVariables = {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "future", confidence: 0.7 },
        acceptanceState: { value: "resisted", confidence: 0.6 },
      }
      const activeBootstrappedEPs = []

      const result = appraiseHeuristicPerception(
        utteranceText,
        keywords,
        sentiment,
        ruleVariables,
        activeBootstrappedEPs,
      )

      expect(result).toHaveProperty("mhhSource", "internal")
      expect(result).toHaveProperty("mhhPerspective", "self")
      expect(result).toHaveProperty("mhhTimeframe", "future")
      expect(result).toHaveProperty("mhhAcceptanceState", "resisted")
      expect(result).toHaveProperty("pValuationShiftEstimate")
      expect(result).toHaveProperty("pPowerLevel")
      expect(result).toHaveProperty("pAppraisalConfidence")

      // Values should be within expected ranges
      expect(result.pValuationShiftEstimate).toBeGreaterThanOrEqual(-1)
      expect(result.pValuationShiftEstimate).toBeLessThanOrEqual(1)
      expect(result.pPowerLevel).toBeGreaterThanOrEqual(0)
      expect(result.pPowerLevel).toBeLessThanOrEqual(1)
      expect(result.pAppraisalConfidence).toBeGreaterThanOrEqual(0)
      expect(result.pAppraisalConfidence).toBeLessThanOrEqual(1)
    })

    it("should handle exceptions and return default values", () => {
      // Mock a function that will throw an error
      const calculateValuationShiftSpy = vi.spyOn(Object.getPrototypeOf({}), "calculateValuationShift")
      calculateValuationShiftSpy.mockImplementationOnce(() => {
        throw new Error("Test error")
      })

      const utteranceText = "I feel anxious about my upcoming presentation"
      const keywords = ["anxious", "presentation"]
      const sentiment = { label: "NEGATIVE", score: 0.7 }
      const ruleVariables = {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "future", confidence: 0.7 },
        acceptanceState: { value: "resisted", confidence: 0.6 },
      }
      const activeBootstrappedEPs = []

      const result = appraiseHeuristicPerception(
        utteranceText,
        keywords,
        sentiment,
        ruleVariables,
        activeBootstrappedEPs,
      )

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Error appraising perception"))
      expect(result).toEqual({
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: 0.0,
        pPowerLevel: 0.5,
        pAppraisalConfidence: 0.5,
      })
    })
  })
})
