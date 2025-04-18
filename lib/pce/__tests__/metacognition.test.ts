import { generateExplanation } from "../metacognition"
import { describe, expect, it } from "vitest"

describe("Metacognitive Layer", () => {
  it("should generate an explanation based on EWEF analysis", async () => {
    const mockEwefAnalysis = {
      vad: {
        valence: 0.8,
        arousal: 0.6,
        dominance: 0.7,
        confidence: 0.9,
      },
      pInstance: {
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "present",
        mhhAcceptanceState: "accepted",
        pValuationShiftEstimate: 0.6,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      },
      ruleVariables: {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.7 },
        acceptanceState: { value: "accepted", confidence: 0.6 },
      },
      activeEPs: [
        {
          id: "value1",
          name: "Achievement",
          type: "VALUE",
          powerLevel: 0.8,
          valuation: 0.7,
          activationWeight: 1.0,
        },
      ],
    } as any

    const explanation = await generateExplanation(mockEwefAnalysis)

    expect(explanation).toContain("The predicted core affect is positive")
    expect(explanation).toContain("Source=internal")
    expect(explanation).toContain("Active attachments: Achievement (VALUE, PL: 0.8)")
  })

  it("should handle empty activeEPs gracefully", async () => {
    const mockEwefAnalysis = {
      vad: {
        valence: 0.8,
        arousal: 0.6,
        dominance: 0.7,
        confidence: 0.9,
      },
      pInstance: {
        mhhSource: "internal",
        mhhPerspective: "self",
        mhhTimeframe: "present",
        mhhAcceptanceState: "accepted",
        pValuationShiftEstimate: 0.6,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      },
      ruleVariables: {
        source: { value: "internal", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.7 },
        acceptanceState: { value: "accepted", confidence: 0.6 },
      },
      activeEPs: [],
    } as any

    const explanation = await generateExplanation(mockEwefAnalysis)

    expect(explanation).toContain("Active attachments: None")
  })

  it("should generate an explanation that includes emotion categorization", async () => {
    const mockEwefAnalysis = {
      vad: {
        valence: -0.7,
        arousal: 0.8,
        dominance: 0.3,
        confidence: 0.9,
      },
      pInstance: {
        mhhSource: "external",
        mhhPerspective: "self",
        mhhTimeframe: "present",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: -0.6,
        pPowerLevel: 0.7,
        pAppraisalConfidence: 0.8,
      },
      ruleVariables: {
        source: { value: "external", confidence: 0.9 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "present", confidence: 0.7 },
        acceptanceState: { value: "resisted", confidence: 0.8 },
      },
      activeEPs: [
        {
          id: "value1",
          name: "Achievement",
          type: "VALUE",
          powerLevel: 0.8,
          valuation: 0.7,
          activationWeight: 1.0,
        },
      ],
      emotionCategorization: {
        primaryLabel: "Anger",
        emotionGroup: "Negative",
        categoryDistribution: {
          Anger: 0.7,
          Frustration: 0.2,
          Sadness: 0.05,
          Fear: 0.05,
        },
      },
    } as any

    const explanation = await generateExplanation(mockEwefAnalysis)

    expect(explanation).toContain("The predicted core affect is negative")
    expect(explanation).toContain("categorized as Anger")
    expect(explanation).toContain("(Negative)")
    expect(explanation).toContain("70.0% confidence")
    expect(explanation).toContain("Source=external")
    expect(explanation).toContain("Acceptance=resisted")
    expect(explanation).toContain("Active attachments: Achievement (VALUE, PL: 0.8)")
  })

  it("should include emotion-specific MHH variables in the explanation", async () => {
    const mockEwefAnalysis = {
      vad: {
        valence: -0.6,
        arousal: 0.7,
        dominance: 0.4,
        confidence: 0.8,
      },
      pInstance: {
        mhhSource: "external",
        mhhPerspective: "self",
        mhhTimeframe: "future",
        mhhAcceptanceState: "resisted",
        pValuationShiftEstimate: -0.5,
        pPowerLevel: 0.6,
        pAppraisalConfidence: 0.7,
      },
      ruleVariables: {
        source: { value: "external", confidence: 0.8 },
        perspective: { value: "self", confidence: 0.9 },
        timeframe: { value: "future", confidence: 0.8 },
        acceptanceState: { value: "resisted", confidence: 0.7 },
      },
      activeEPs: [],
      emotionCategorization: {
        primaryLabel: "Anxiety",
        emotionGroup: "Negative",
        categoryDistribution: {
          Anxiety: 0.6,
          Fear: 0.3,
          Confusion: 0.1,
        },
      },
    } as any

    const explanation = await generateExplanation(mockEwefAnalysis)

    expect(explanation).toContain("categorized as Anxiety")
    expect(explanation).toContain("Future Uncertainty")
    expect(explanation).toContain("Timeframe=future")
  })
})
