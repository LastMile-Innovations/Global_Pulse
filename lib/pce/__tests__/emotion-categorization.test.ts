import { categorizeEmotion } from "../emotion-categorization"
import { determineWebbEmotionGroup } from "../webb-rules"
import { determineWebbSeverityLabel } from "../webb-severity"
import { checkVADConsistency } from "../vad-consistency"
import { getTypicalVADProfile } from "../vad-profiles"

// Mock dependencies
jest.mock("../webb-rules", () => ({
  determineWebbEmotionGroup: jest.fn(),
}))

jest.mock("../webb-severity", () => ({
  determineWebbSeverityLabel: jest.fn(),
}))

jest.mock("../vad-consistency", () => ({
  checkVADConsistency: jest.fn(),
}))

jest.mock("../vad-profiles", () => ({
  getTypicalVADProfile: jest.fn(),
  TYPICAL_VAD_PROFILES: {
    Happy: { valence: 0.8, arousal: 0.6, dominance: 0.7 },
    Sad: { valence: -0.8, arousal: 0.3, dominance: 0.2 },
    Angry: { valence: -0.8, arousal: 0.8, dominance: 0.7 },
    Confused: { valence: -0.3, arousal: 0.5, dominance: 0.3 },
  },
}))

describe("Emotion Categorization", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("should categorize emotion with high consistency", async () => {
    // Mock inputs
    const context = {
      activeEPs: [
        {
          id: "ep1",
          name: "Achievement",
          type: "GOAL",
          powerLevel: 8,
          valuation: 0.9,
          activationWeight: 0.8,
        },
      ],
    }

    const ruleVariables = {
      source: { value: "external", confidence: 0.9 },
      perspective: { value: "self", confidence: 0.9 },
      timeframe: { value: "present", confidence: 0.9 },
      acceptanceState: { value: "accepted", confidence: 0.9 },
    }

    const pInstanceData = {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "accepted",
      pValuationShiftEstimate: 0.7,
      pPowerLevel: 0.8,
      pAppraisalConfidence: 0.9,
    }

    const vadOutput = {
      valence: 0.8,
      arousal: 0.6,
      dominance: 0.7,
      confidence: 0.9,
    }

    // Mock return values
    ;(determineWebbEmotionGroup as jest.Mock).mockReturnValue({
      emotionGroup: "Happiness Group",
      confidence: 0.9,
      rulePath: ["Happiness Group: Present/past positive outcome, not self-value related"],
    })
    ;(determineWebbSeverityLabel as jest.Mock).mockReturnValue("Happy")
    ;(getTypicalVADProfile as jest.Mock).mockReturnValue({
      valence: 0.8,
      arousal: 0.6,
      dominance: 0.7,
    })
    ;(checkVADConsistency as jest.Mock).mockReturnValue(0.9)

    // Call the function
    const result = await categorizeEmotion(context, ruleVariables, pInstanceData, vadOutput)

    // Assertions
    expect(result.primaryLabel).toBe("Happy")
    expect(result.emotionGroup).toBe("Happiness Group")
    expect(result.webbConfidence).toBe(0.9)
    expect(result.consistencyScore).toBe(0.9)
    expect(result.categoryDistribution.length).toBeGreaterThanOrEqual(1)
    expect(result.categoryDistribution[0].label).toBe("Happy")
    expect(result.categoryDistribution[0].probability).toBeGreaterThan(0.8)

    // Check that probabilities sum to 1.0
    const totalProb = result.categoryDistribution.reduce((sum, cat) => sum + cat.probability, 0)
    expect(totalProb).toBeCloseTo(1.0, 5)
  })

  test("should include confusion with low MHH confidence", async () => {
    // Mock inputs with low confidence
    const context = {
      activeEPs: [
        {
          id: "ep1",
          name: "Safety",
          type: "NEED",
          powerLevel: 7,
          valuation: -0.8,
          activationWeight: 0.7,
        },
      ],
    }

    const ruleVariables = {
      source: { value: "internal", confidence: 0.4 },
      perspective: { value: "self", confidence: 0.5 },
      timeframe: { value: "present", confidence: 0.4 },
      acceptanceState: { value: "resisted", confidence: 0.3 },
    }

    const pInstanceData = {
      mhhSource: "internal",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "resisted",
      pValuationShiftEstimate: -0.6,
      pPowerLevel: 0.7,
      pAppraisalConfidence: 0.5,
    }

    const vadOutput = {
      valence: -0.6,
      arousal: 0.7,
      dominance: 0.3,
      confidence: 0.6,
    }

    // Mock return values
    ;(determineWebbEmotionGroup as jest.Mock).mockReturnValue({
      emotionGroup: "Fear Group",
      confidence: 0.6,
      rulePath: ["Fear Group: Internal/uncertain threat, resisted, present/past timeframe, negative valuation"],
    })
    ;(determineWebbSeverityLabel as jest.Mock).mockReturnValue("Afraid")
    ;(getTypicalVADProfile as jest.Mock).mockReturnValue({
      valence: -0.7,
      arousal: 0.7,
      dominance: 0.2,
    })
    ;(checkVADConsistency as jest.Mock).mockReturnValue(0.7)

    // Call the function
    const result = await categorizeEmotion(context, ruleVariables, pInstanceData, vadOutput)

    // Assertions
    expect(result.emotionGroup).toBe("Fear Group")
    expect(result.webbConfidence).toBe(0.6)

    // Check that Confused is in the distribution with significant probability
    const confusedCategory = result.categoryDistribution.find((cat) => cat.label === "Confused")
    expect(confusedCategory).toBeDefined()
    expect(confusedCategory?.probability).toBeGreaterThan(0.2)

    // Check that probabilities sum to 1.0
    const totalProb = result.categoryDistribution.reduce((sum, cat) => sum + cat.probability, 0)
    expect(totalProb).toBeCloseTo(1.0, 5)
  })

  test("should include alternatives with low VAD consistency", async () => {
    // Mock inputs
    const context = {
      activeEPs: [
        {
          id: "ep1",
          name: "Respect",
          type: "VALUE",
          powerLevel: 8,
          valuation: 0.9,
          activationWeight: 0.8,
        },
      ],
    }

    const ruleVariables = {
      source: { value: "external", confidence: 0.8 },
      perspective: { value: "self", confidence: 0.8 },
      timeframe: { value: "present", confidence: 0.8 },
      acceptanceState: { value: "resisted", confidence: 0.8 },
    }

    const pInstanceData = {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "resisted",
      pValuationShiftEstimate: -0.7,
      pPowerLevel: 0.8,
      pAppraisalConfidence: 0.8,
    }

    const vadOutput = {
      valence: -0.8,
      arousal: 0.8,
      dominance: 0.7,
      confidence: 0.8,
    }

    // Mock return values
    ;(determineWebbEmotionGroup as jest.Mock).mockReturnValue({
      emotionGroup: "Anger Group",
      confidence: 0.8,
      rulePath: ["Anger Group: External threat, resisted, present/past timeframe, negative valuation"],
    })
    ;(determineWebbSeverityLabel as jest.Mock).mockReturnValue("Angry")
    ;(getTypicalVADProfile as jest.Mock).mockReturnValue({
      valence: -0.8,
      arousal: 0.8,
      dominance: 0.7,
    })

    // Low consistency between VAD and emotion label
    ;(checkVADConsistency as jest.Mock).mockReturnValue(0.4)

    // Call the function
    const result = await categorizeEmotion(context, ruleVariables, pInstanceData, vadOutput)

    // Assertions
    expect(result.emotionGroup).toBe("Anger Group")
    expect(result.consistencyScore).toBe(0.4)

    // Check that distribution has multiple emotions with significant probability
    expect(result.categoryDistribution.length).toBeGreaterThan(2)

    // Check that probabilities sum to 1.0
    const totalProb = result.categoryDistribution.reduce((sum, cat) => sum + cat.probability, 0)
    expect(totalProb).toBeCloseTo(1.0, 5)
  })
})
