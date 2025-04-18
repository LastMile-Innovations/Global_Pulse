import {
  determineWebbEmotionGroup,
  type WebbRuleEngineInput,
  FEAR_GROUP,
  ANGER_GROUP,
  SADNESS_GROUP,
  WORRY_GROUP,
  REGRET_GROUP,
  HAPPINESS_GROUP,
  POSITIVE_ANTICIPATION_GROUP,
  NEGATIVE_ANTICIPATION_GROUP,
  PRIDE_GROUP,
  SHAME_GROUP,
  EMBARRASSMENT_GROUP,
  DISGUST_GROUP,
  SURPRISE_GROUP,
  STRESS_GROUP,
  RELIEF_GROUP,
  ENVY_GROUP,
  LOVE_GROUP,
  CONFUSION_GROUP,
  BOREDOM_GROUP,
  CURIOSITY_GROUP,
  NEUTRAL_GROUP,
  FLATTERY_GROUP,
} from "../webb-rules"

// Mock the logger to prevent console output during tests
jest.mock("../../utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

describe("Webb EoE Rule Engine", () => {
  // Helper function to create a default input with high confidence
  const createDefaultInput = (overrides: Partial<WebbRuleEngineInput> = {}): WebbRuleEngineInput => {
    const defaultInput: WebbRuleEngineInput = {
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.5, // Negative by default
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      },
    }

    // Deep merge the overrides
    const result = {
      mhhVariables: {
        ...defaultInput.mhhVariables,
      },
      pInstanceData: {
        ...defaultInput.pInstanceData,
      },
    }

    // Handle nested overrides for mhhVariables
    if (overrides.mhhVariables) {
      Object.keys(overrides.mhhVariables).forEach((key) => {
        if (key in result.mhhVariables) {
          result.mhhVariables[key] = {
            ...result.mhhVariables[key],
            ...overrides.mhhVariables[key],
          }
        }
      })
    }

    // Handle overrides for pInstanceData
    if (overrides.pInstanceData) {
      result.pInstanceData = {
        ...result.pInstanceData,
        ...overrides.pInstanceData,
      }
    }

    return result
  }

  // Test for low overall confidence
  test("should return Confusion Group when overall MHH confidence is low", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.4 },
        perspective: { value: "self", confidence: 0.3 },
        timeframe: { value: "present", confidence: 0.5 },
        acceptanceState: { value: "resisted", confidence: 0.4 },
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(CONFUSION_GROUP)
    expect(result.confidence).toBeLessThan(0.6)
  })

  // Test for unclear critical variables
  test("should return Confusion Group when critical MHH variables are unclear", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "unclear", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(CONFUSION_GROUP)
  })

  // Test for Fear Group
  test("should return Fear Group for internal threat, resisted, present timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "internal", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.7, // Strong negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(FEAR_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Fear Group with external source but low confidence
  test("should return Fear Group for external threat with low source confidence", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.4 }, // Low confidence
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.7, // Strong negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(FEAR_GROUP)
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  // Test for Anger Group
  test("should return Anger Group for external threat, resisted, present timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.6, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(ANGER_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Anger Group with past timeframe
  test("should return Anger Group for external threat, resisted, past timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "past", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.6, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(ANGER_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Sadness Group
  test("should return Sadness Group for accepted negative outcome, present timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.5, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(SADNESS_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Sadness Group with past timeframe
  test("should return Sadness Group for accepted negative outcome, past timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "past", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.5, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(SADNESS_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Worry Group
  test("should return Worry Group for future negative outcome, resisted", () => {
    const input = createDefaultInput({
      mhhVariables: {
        timeframe: { value: "future", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.4, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(WORRY_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Regret Group
  test("should return Regret Group for past negative outcome, accepted", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "internal", confidence: 0.9 }, // Not valueSelf
        timeframe: { value: "past", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.5, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(REGRET_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Happiness Group
  test("should return Happiness Group for present positive outcome", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.6, // Positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(HAPPINESS_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Happiness Group with past timeframe
  test("should return Happiness Group for past positive outcome", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "past", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.6, // Positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(HAPPINESS_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Positive Anticipation Group
  test("should return Positive Anticipation Group for future positive outcome", () => {
    const input = createDefaultInput({
      mhhVariables: {
        timeframe: { value: "future", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.5, // Positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(POSITIVE_ANTICIPATION_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Negative Anticipation Group
  test("should return Negative Anticipation Group for future negative outcome, accepted", () => {
    const input = createDefaultInput({
      mhhVariables: {
        timeframe: { value: "future", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.4, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(NEGATIVE_ANTICIPATION_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Pride Group
  test("should return Pride Group for self-value related positive outcome", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "valueSelf", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.7, // Positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(PRIDE_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Shame Group
  test("should return Shame Group for self-value related negative outcome, self perspective", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "valueSelf", confidence: 0.9 },
        perspective: { value: "self", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.6, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(SHAME_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Embarrassment Group
  test("should return Embarrassment Group for self-value related negative outcome, other perspective", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "valueSelf", confidence: 0.9 },
        perspective: { value: "other", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.5, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(EMBARRASSMENT_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Embarrassment Group with both perspective
  test("should return Embarrassment Group for self-value related negative outcome, both perspective", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "valueSelf", confidence: 0.9 },
        perspective: { value: "both", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.5, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(EMBARRASSMENT_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Flattery Group
  test("should return Flattery Group for external source, other perspective, positive valuation, not accepted", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        perspective: { value: "other", confidence: 0.9 },
        acceptanceState: { value: "uncertain", confidence: 0.9 }, // Not accepted
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.5, // Positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(FLATTERY_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Disgust Group
  test("should return Disgust Group for external negative stimulus, accepted, present timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.8, // Strong negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(DISGUST_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Surprise Group
  test("should return Surprise Group for high power level event, present timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        timeframe: { value: "present", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0, // Neutral
        pPowerLevel: 0.9, // Very high power level
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(SURPRISE_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Stress Group
  test("should return Stress Group for ongoing demands, resisted", () => {
    const input = createDefaultInput({
      mhhVariables: {
        timeframe: { value: "ongoing", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.4, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(STRESS_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Relief Group
  test("should return Relief Group for past negative event ended, positive valuation", () => {
    const input = createDefaultInput({
      mhhVariables: {
        timeframe: { value: "past", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.5, // Positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(RELIEF_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Envy Group
  test("should return Envy Group for external source, other perspective, negative valuation", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        perspective: { value: "other", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.5, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(ENVY_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Love Group
  test("should return Love Group for external source, positive valuation, accepted", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.7, // Strong positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(LOVE_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Confusion Group
  test("should return Confusion Group for uncertain acceptance state", () => {
    const input = createDefaultInput({
      mhhVariables: {
        acceptanceState: { value: "uncertain", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.3, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(CONFUSION_GROUP)
    expect(result.confidence).toBeGreaterThan(0.6)
  })

  // Test for Boredom Group
  test("should return Boredom Group for low power level, ongoing timeframe", () => {
    const input = createDefaultInput({
      mhhVariables: {
        timeframe: { value: "ongoing", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0, // Neutral
        pPowerLevel: 0.2, // Low power level
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(BOREDOM_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for Curiosity Group
  test("should return Curiosity Group for external source, neutral valuation, uncertain acceptance", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        acceptanceState: { value: "uncertain", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.1, // Slightly positive
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(CURIOSITY_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  // Test for default case
  test("should return Neutral Group when no specific rules match", () => {
    // Create an input that doesn't match any specific rules
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "internal", confidence: 0.9 },
        perspective: { value: "other", confidence: 0.9 },
        timeframe: { value: "ongoing", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0, // Neutral
        pPowerLevel: 0.5,
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.emotionGroup).toBe(NEUTRAL_GROUP)
  })

  // Test for source confidence affecting emotion group selection
  test("should consider source confidence when differentiating between Anger and Fear", () => {
    // High confidence external source should lead to Anger
    const highConfidenceInput = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.6, // Negative
      },
    })

    const highConfidenceResult = determineWebbEmotionGroup(highConfidenceInput)
    expect(highConfidenceResult.emotionGroup).toBe(ANGER_GROUP)

    // Low confidence external source might lead to Fear
    const lowConfidenceInput = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.4 }, // Low confidence
        acceptanceState: { value: "resisted", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.6, // Negative
      },
    })

    const lowConfidenceResult = determineWebbEmotionGroup(lowConfidenceInput)
    expect(lowConfidenceResult.emotionGroup).toBe(FEAR_GROUP)
  })

  // Test for rule path tracking
  test("should track the rule path taken", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.6, // Negative
      },
    })

    const result = determineWebbEmotionGroup(input)
    expect(result.rulePath.length).toBeGreaterThan(0)
    expect(result.rulePath[0]).toContain("Anger Group")
  })

  // Test for ToM/Dual Classification logging
  test("should log a debug message for potential ToM/Dual Classification cases", () => {
    const input = createDefaultInput({
      mhhVariables: {
        source: { value: "external", confidence: 0.95 }, // Very high confidence
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.6, // Negative
      },
    })

    determineWebbEmotionGroup(input)
    expect(require("../../utils/logger").logger.debug).toHaveBeenCalledWith(
      expect.stringContaining("ToM/Dual Classification"),
    )
  })
})

describe("Webb Rules Engine", () => {
  test("should determine Fear Group for internal negative resisted", () => {
    const input = {
      mhhVariables: {
        source: { value: "internal", confidence: 0.9 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.7,
        pPowerLevel: 0.8,
        pAppraisalConfidence: 0.9,
      },
    }

    const result = determineWebbEmotionGroup(input)

    expect(result.emotionGroup).toBe(FEAR_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
    expect(result.rulePath.length).toBeGreaterThan(0)
  })

  test("should determine Anger Group for external negative resisted", () => {
    const input = {
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "resisted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.7,
        pPowerLevel: 0.8,
        pAppraisalConfidence: 0.9,
      },
    }

    const result = determineWebbEmotionGroup(input)

    expect(result.emotionGroup).toBe(ANGER_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
    expect(result.rulePath.length).toBeGreaterThan(0)
  })

  test("should determine Sadness Group for accepted negative present", () => {
    const input = {
      mhhVariables: {
        source: { value: "internal", confidence: 0.9 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.7,
        pPowerLevel: 0.6,
        pAppraisalConfidence: 0.9,
      },
    }

    const result = determineWebbEmotionGroup(input)

    expect(result.emotionGroup).toBe(SADNESS_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
    expect(result.rulePath.length).toBeGreaterThan(0)
  })

  test("should determine Happiness Group for positive present", () => {
    const input = {
      mhhVariables: {
        source: { value: "external", confidence: 0.9 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.9 },
        acceptanceState: { value: "accepted", confidence: 0.9 },
      },
      pInstanceData: {
        pValuationShiftEstimate: 0.7,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.9,
      },
    }

    const result = determineWebbEmotionGroup(input)

    expect(result.emotionGroup).toBe(HAPPINESS_GROUP)
    expect(result.confidence).toBeGreaterThan(0.7)
    expect(result.rulePath.length).toBeGreaterThan(0)
  })

  test("should return Confusion Group for low confidence inputs", () => {
    const input = {
      mhhVariables: {
        source: { value: "unclear", confidence: 0.3 },
        perspective: { value: "self", confidence: 0.4 },
        timeframe: { value: "present", confidence: 0.3 },
        acceptanceState: { value: "uncertain", confidence: 0.3 },
      },
      pInstanceData: {
        pValuationShiftEstimate: -0.2,
        pPowerLevel: 0.4,
        pAppraisalConfidence: 0.5,
      },
    }

    const result = determineWebbEmotionGroup(input)

    expect(result.emotionGroup).toBe("Confusion Group")
    expect(result.confidence).toBeLessThan(0.6)
    expect(result.rulePath.length).toBeGreaterThan(0)
  })
})
