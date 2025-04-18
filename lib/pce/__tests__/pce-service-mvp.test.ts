import { processPceMvpRequest } from "../pce-service-mvp"
import { getCoreNlpFeatures } from "../../nlp/nlp-features"
import { getMinimalContext } from "../context-analyzer"
import { appraisePerception } from "../perception-appraisal"
import { calculateLinearVad } from "../ewef-core-engine/linear-model"
import { updateMinimalState } from "../state-monitor"
import { describe, beforeEach, test, expect, jest } from "vitest"

// Mock dependencies
jest.mock("../../nlp/nlp-features")
jest.mock("../context-analyzer")
jest.mock("../perception-appraisal")
jest.mock("../ewef-core-engine/linear-model")
jest.mock("../state-monitor")

describe("PCE Service MVP", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock implementations
    ;(getCoreNlpFeatures as jest.Mock).mockResolvedValue({
      keywords: ["test", "keyword"],
      sentiment: { label: "POSITIVE", score: 0.8 },
      entities: [{ text: "Test Entity", type: "PERSON", start: 0, end: 10 }],
      abstractConcepts: [{ text: "Test Concept", type: "VALUE" }],
    })
    ;(getMinimalContext as jest.Mock).mockResolvedValue({
      activeBootstrappedEPs: [
        {
          id: "ep1",
          name: "Test EP",
          type: "VALUE",
          powerLevel: 0.7,
          valuation: 0.8,
          activationWeight: 1.0,
        },
      ],
    })
    ;(appraisePerception as jest.Mock).mockResolvedValue({
      mhhSource: "internal",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "accepted",
      pValuationShiftEstimate: 0.6,
      pPowerLevel: 0.7,
      pAppraisalConfidence: 0.8,
    })
    ;(calculateLinearVad as jest.Mock).mockReturnValue({
      valence: 0.6,
      arousal: 0.5,
      dominance: 0.7,
      confidence: 0.8,
    })
    ;(updateMinimalState as jest.Mock).mockResolvedValue({
      timestamp: Date.now(),
      moodEstimate: 0.6,
      stressEstimate: 0.5,
    })
  })

  test("should process a request end-to-end and call all stages", async () => {
    const input = {
      userID: "user123",
      sessionID: "session456",
      utteranceText: "I'm feeling happy today",
    }

    const result = await processPceMvpRequest(input, { useLlmAssistance: true })

    // Verify all pipeline stages were called
    expect(getCoreNlpFeatures).toHaveBeenCalledWith(input.utteranceText)
    expect(getMinimalContext).toHaveBeenCalled()
    expect(appraisePerception).toHaveBeenCalledWith(
      input.utteranceText,
      expect.any(Array),
      expect.any(Object),
      expect.any(Object),
      expect.any(Array),
      true,
    )
    expect(calculateLinearVad).toHaveBeenCalled()
    expect(updateMinimalState).toHaveBeenCalled()

    // Verify the result structure
    expect(result).toHaveProperty("vad")
    expect(result).toHaveProperty("state")
    expect(result).toHaveProperty("activeEPs")
    expect(result).toHaveProperty("pInstance")
    expect(result).toHaveProperty("ruleVariables")
  })

  test("should handle errors in the pipeline gracefully", async () => {
    // Make one of the pipeline stages throw an error
    ;(getCoreNlpFeatures as jest.Mock).mockRejectedValue(new Error("Test error"))

    const input = {
      userID: "user123",
      sessionID: "session456",
      utteranceText: "I'm feeling happy today",
    }

    const result = await processPceMvpRequest(input)

    // Should still return a valid result with default values
    expect(result).toHaveProperty("vad")
    expect(result).toHaveProperty("state")
    expect(result).toHaveProperty("activeEPs")
    expect(result).toHaveProperty("pInstance")
    expect(result).toHaveProperty("ruleVariables")
  })
})
