import { generateInteractionGuidance } from "../interaction-guidance"
import { describe, expect, it } from "vitest"

describe("Interaction Guidance Module", () => {
  it("should prioritize VALIDATE_EMOTION and OFFER_SUPPORT for high negative valence", () => {
    const vad = {
      valence: -0.8,
      arousal: 0.6,
      dominance: 0.5,
      confidence: 0.9,
    }

    const guidance = generateInteractionGuidance(vad)

    expect(guidance.primaryDialogueAct).toBe("VALIDATE_EMOTION")
    expect(guidance.suggestedFocus).toContain("Emotional State")
    expect(guidance.parameters.vadValence).toBe(vad.valence)
    expect(guidance.parameters.vadArousal).toBe(vad.arousal)
    expect(guidance.parameters.vadDominance).toBe(vad.dominance)
  })

  it("should prioritize OFFER_SUPPORT for high arousal", () => {
    const vad = {
      valence: 0.2,
      arousal: 0.8,
      dominance: 0.5,
      confidence: 0.9,
    }

    const guidance = generateInteractionGuidance(vad)

    expect(guidance.primaryDialogueAct).toBe("OFFER_SUPPORT")
    expect(guidance.suggestedFocus).toContain("Coping Strategies")
    expect(guidance.parameters.vadValence).toBe(vad.valence)
    expect(guidance.parameters.vadArousal).toBe(vad.arousal)
    expect(guidance.parameters.vadDominance).toBe(vad.dominance)
  })

  it("should default to EXPLORE_TOPIC for neutral or positive states", () => {
    const vad = {
      valence: 0.6,
      arousal: 0.4,
      dominance: 0.5,
      confidence: 0.9,
    }

    const guidance = generateInteractionGuidance(vad)

    expect(guidance.primaryDialogueAct).toBe("EXPLORE_TOPIC")
    expect(guidance.suggestedFocus).toContain("User Goals")
    expect(guidance.parameters.vadValence).toBe(vad.valence)
    expect(guidance.parameters.vadArousal).toBe(vad.arousal)
    expect(guidance.parameters.vadDominance).toBe(vad.dominance)
  })

  it("should prioritize VALIDATE_EMOTION and focus on Source of Frustration for Anger", () => {
    const vad = {
      valence: -0.7,
      arousal: 0.8,
      dominance: 0.3,
      confidence: 0.9,
    }

    const emotionCategorization = {
      primaryLabel: "Anger",
      emotionGroup: "Negative",
      categoryDistribution: {
        Anger: 0.7,
        Frustration: 0.2,
        Sadness: 0.05,
        Fear: 0.05,
      },
    }

    const pInstance = {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "resisted",
      pValuationShiftEstimate: -0.6,
      pPowerLevel: 0.7,
      pAppraisalConfidence: 0.8,
    }

    const ruleVariables = {
      source: { value: "external", confidence: 0.9 },
      perspective: { value: "self", confidence: 0.9 },
      timeframe: { value: "present", confidence: 0.7 },
      acceptanceState: { value: "resisted", confidence: 0.8 },
    }

    const guidance = generateInteractionGuidance(vad, emotionCategorization, pInstance, ruleVariables)

    expect(guidance.primaryDialogueAct).toBe("DE_ESCALATE")
    expect(guidance.suggestedFocus).toContain("Source of Frustration")
    expect(guidance.suggestedFocus).toContain("External Triggers")
    expect(guidance.suggestedFocus).toContain("Calming Strategies")
    expect(guidance.parameters.emotionLabel).toBe("Anger")
    expect(guidance.parameters.emotionGroup).toBe("Negative")
    expect(guidance.parameters.emotionConfidence).toBe(0.7)
    expect(guidance.parameters.vadValence).toBe(vad.valence)
    expect(guidance.parameters.vadArousal).toBe(vad.arousal)
    expect(guidance.parameters.vadDominance).toBe(vad.dominance)
  })

  it("should prioritize ASK_CLARIFY for Confusion", () => {
    const vad = {
      valence: -0.3,
      arousal: 0.6,
      dominance: 0.4,
      confidence: 0.8,
    }

    const emotionCategorization = {
      primaryLabel: "Confusion",
      emotionGroup: "Negative",
      categoryDistribution: {
        Confusion: 0.6,
        Anxiety: 0.2,
        Neutral: 0.2,
      },
    }

    const pInstance = {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "uncertain",
      pValuationShiftEstimate: -0.3,
      pPowerLevel: 0.5,
      pAppraisalConfidence: 0.6,
    }

    const ruleVariables = {
      source: { value: "external", confidence: 0.7 },
      perspective: { value: "self", confidence: 0.8 },
      timeframe: { value: "present", confidence: 0.7 },
      acceptanceState: { value: "uncertain", confidence: 0.9 },
    }

    const guidance = generateInteractionGuidance(vad, emotionCategorization, pInstance, ruleVariables)

    expect(guidance.primaryDialogueAct).toBe("ASK_CLARIFY")
    expect(guidance.suggestedFocus).toContain("Information Needs")
    expect(guidance.suggestedFocus).toContain("Conceptual Clarification")
    expect(guidance.parameters.emotionLabel).toBe("Confusion")
  })

  it("should prioritize AMPLIFY_POSITIVE for Joy with high arousal", () => {
    const vad = {
      valence: 0.8,
      arousal: 0.8,
      dominance: 0.7,
      confidence: 0.9,
    }

    const emotionCategorization = {
      primaryLabel: "Joy",
      emotionGroup: "Positive",
      categoryDistribution: {
        Joy: 0.8,
        Excitement: 0.15,
        Neutral: 0.05,
      },
    }

    const pInstance = {
      mhhSource: "internal",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "accepted",
      pValuationShiftEstimate: 0.7,
      pPowerLevel: 0.8,
      pAppraisalConfidence: 0.9,
    }

    const ruleVariables = {
      source: { value: "internal", confidence: 0.8 },
      perspective: { value: "self", confidence: 0.9 },
      timeframe: { value: "present", confidence: 0.8 },
      acceptanceState: { value: "accepted", confidence: 0.9 },
    }

    const guidance = generateInteractionGuidance(vad, emotionCategorization, pInstance, ruleVariables)

    expect(guidance.primaryDialogueAct).toBe("AMPLIFY_POSITIVE")
    expect(guidance.suggestedFocus).toContain("Positive Experiences")
    expect(guidance.suggestedFocus).toContain("Gratitude")
    expect(guidance.parameters.emotionLabel).toBe("Joy")
    expect(guidance.parameters.emotionGroup).toBe("Positive")
  })

  it("should add MHH-specific focus suggestions based on rule variables", () => {
    const vad = {
      valence: -0.4,
      arousal: 0.5,
      dominance: 0.4,
      confidence: 0.8,
    }

    const emotionCategorization = {
      primaryLabel: "Anxiety",
      emotionGroup: "Negative",
      categoryDistribution: {
        Anxiety: 0.5,
        Fear: 0.3,
        Confusion: 0.2,
      },
    }

    const pInstance = {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "future",
      mhhAcceptanceState: "resisted",
      pValuationShiftEstimate: -0.4,
      pPowerLevel: 0.2, // Low power level
      pAppraisalConfidence: 0.7,
    }

    const ruleVariables = {
      source: { value: "external", confidence: 0.7 },
      perspective: { value: "self", confidence: 0.8 },
      timeframe: { value: "future", confidence: 0.9 }, // High confidence future timeframe
      acceptanceState: { value: "resisted", confidence: 0.8 }, // High confidence resisted acceptance
    }

    const guidance = generateInteractionGuidance(vad, emotionCategorization, pInstance, ruleVariables)

    expect(guidance.suggestedFocus).toContain("Future Planning")
    expect(guidance.suggestedFocus).toContain("Uncertainty Management")
    expect(guidance.suggestedFocus).toContain("Acceptance Challenges")
    expect(guidance.suggestedFocus).toContain("Empowerment Strategies") // Due to low power level
  })

  it("should differentiate between Sadness and Anger with similar VAD values", () => {
    // Similar VAD values for both tests
    const vad = {
      valence: -0.7,
      arousal: 0.5,
      dominance: 0.4,
      confidence: 0.8,
    }

    // Test with Sadness
    const sadnessEmotion = {
      primaryLabel: "Sadness",
      emotionGroup: "Negative",
      categoryDistribution: {
        Sadness: 0.7,
        Grief: 0.2,
        Neutral: 0.1,
      },
    }

    const sadnessInstance = {
      mhhSource: "internal",
      mhhPerspective: "self",
      mhhTimeframe: "past",
      mhhAcceptanceState: "accepted",
      pValuationShiftEstimate: -0.6,
      pPowerLevel: 0.4,
      pAppraisalConfidence: 0.8,
    }

    const sadnessVariables = {
      source: { value: "internal", confidence: 0.8 },
      perspective: { value: "self", confidence: 0.9 },
      timeframe: { value: "past", confidence: 0.8 },
      acceptanceState: { value: "accepted", confidence: 0.7 },
    }

    const sadnessGuidance = generateInteractionGuidance(vad, sadnessEmotion, sadnessInstance, sadnessVariables)

    // Test with Anger
    const angerEmotion = {
      primaryLabel: "Anger",
      emotionGroup: "Negative",
      categoryDistribution: {
        Anger: 0.7,
        Frustration: 0.2,
        Irritation: 0.1,
      },
    }

    const angerInstance = {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "resisted",
      pValuationShiftEstimate: -0.6,
      pPowerLevel: 0.7,
      pAppraisalConfidence: 0.8,
    }

    const angerVariables = {
      source: { value: "external", confidence: 0.9 },
      perspective: { value: "self", confidence: 0.9 },
      timeframe: { value: "present", confidence: 0.7 },
      acceptanceState: { value: "resisted", confidence: 0.8 },
    }

    const angerGuidance = generateInteractionGuidance(vad, angerEmotion, angerInstance, angerVariables)

    // Verify different focus suggestions despite similar VAD
    expect(sadnessGuidance.suggestedFocus).toContain("Emotional Support")
    expect(sadnessGuidance.suggestedFocus).toContain("Past Loss Processing")
    expect(angerGuidance.suggestedFocus).toContain("Source of Frustration")
    expect(angerGuidance.suggestedFocus).toContain("Resistance Processing")

    // Verify different parameters
    expect(sadnessGuidance.parameters.emotionLabel).toBe("Sadness")
    expect(angerGuidance.parameters.emotionLabel).toBe("Anger")

    // The dialogue acts might be the same (VALIDATE_EMOTION) but the focus should differ
    expect(sadnessGuidance.suggestedFocus).not.toEqual(angerGuidance.suggestedFocus)
  })
})
