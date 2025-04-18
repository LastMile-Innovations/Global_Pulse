import { categorizeEmotion } from "../emotion-categorization"
import type { ContextualAnalysisOutput } from "../context-analyzer"

describe("Emotion Categorization with Social Sub-models", () => {
  // Mock data
  const baseMhhVariables = {
    source: { value: "internal", confidence: 0.8 },
    perspective: { value: "self", confidence: 0.8 },
    timeframe: { value: "past", confidence: 0.8 },
    acceptanceState: { value: "accepted", confidence: 0.8 },
  }

  const basePInstanceData = {
    mhhSource: "internal",
    mhhPerspective: "self",
    mhhTimeframe: "past",
    mhhAcceptanceState: "accepted",
    pValuationShiftEstimate: 0,
    pPowerLevel: 0.7,
    pAppraisalConfidence: 0.8,
  }

  const baseVadOutput = {
    valence: 0,
    arousal: 0.5,
    dominance: 0.5,
  }

  const baseContext: ContextualAnalysisOutput = {
    activeBootstrappedEPs: [],
    socialContext: {
      isPotentialGuiltScenario: false,
      isPotentialPrideScenario: false,
      isPotentialEmbarrassmentScenario: false,
      involvedHarmToOther: false,
      involvedNormViolation: false,
      involvedAchievement: false,
      involvedCompetence: false,
      involvedGoalAttainment: false,
      involvedPublicExposure: false,
      involvedSocialRuleViolation: false,
      perspectiveConfidence: 0.5,
    },
  }

  it("should increase Guilt probability in guilt scenario", () => {
    // Arrange
    const context: ContextualAnalysisOutput = {
      ...baseContext,
      socialContext: {
        ...baseContext.socialContext,
        isPotentialGuiltScenario: true,
        involvedHarmToOther: true,
        involvedNormViolation: true,
      },
    }

    const pInstanceData = {
      ...basePInstanceData,
      pValuationShiftEstimate: -0.7, // Strong negative valuation
    }

    const vadOutput = {
      ...baseVadOutput,
      valence: -0.7, // Negative valence
      dominance: 0.3, // Lower dominance
    }

    // Act
    const result = categorizeEmotion(
      context,
      baseMhhVariables,
      pInstanceData,
      vadOutput,
      0.8, // epPowerLevel
    )

    // Assert
    const guiltProb = result.categoryDistribution.find((item) => item.label === "Guilt")?.probability || 0
    expect(guiltProb).toBeGreaterThan(0.3) // Should have significant probability

    // Check if Guilt is in top 2 emotions
    const sortedDistribution = [...result.categoryDistribution].sort((a, b) => b.probability - a.probability)
    const topLabels = sortedDistribution.slice(0, 2).map((item) => item.label)
    expect(topLabels).toContain("Guilt")
  })

  it("should increase Pride probability in pride scenario", () => {
    // Arrange
    const context: ContextualAnalysisOutput = {
      ...baseContext,
      socialContext: {
        ...baseContext.socialContext,
        isPotentialPrideScenario: true,
        involvedAchievement: true,
        involvedGoalAttainment: true,
        involvedCompetence: true,
      },
    }

    const pInstanceData = {
      ...basePInstanceData,
      pValuationShiftEstimate: 0.7, // Strong positive valuation
    }

    const vadOutput = {
      ...baseVadOutput,
      valence: 0.7, // Positive valence
      dominance: 0.7, // Higher dominance
    }

    // Act
    const result = categorizeEmotion(
      context,
      baseMhhVariables,
      pInstanceData,
      vadOutput,
      0.8, // epPowerLevel
    )

    // Assert
    const prideProb = result.categoryDistribution.find((item) => item.label === "Pride")?.probability || 0
    expect(prideProb).toBeGreaterThan(0.3) // Should have significant probability

    // Check if Pride is in top 2 emotions
    const sortedDistribution = [...result.categoryDistribution].sort((a, b) => b.probability - a.probability)
    const topLabels = sortedDistribution.slice(0, 2).map((item) => item.label)
    expect(topLabels).toContain("Pride")
  })

  it("should increase Embarrassment probability in embarrassment scenario", () => {
    // Arrange
    const context: ContextualAnalysisOutput = {
      ...baseContext,
      socialContext: {
        ...baseContext.socialContext,
        isPotentialEmbarrassmentScenario: true,
        involvedPublicExposure: true,
        involvedSocialRuleViolation: true,
      },
    }

    const pInstanceData = {
      ...basePInstanceData,
      mhhPerspective: "other", // Other-oriented perspective
      pValuationShiftEstimate: -0.6, // Negative valuation
    }

    const mhhVariables = {
      ...baseMhhVariables,
      perspective: { value: "other", confidence: 0.8 },
    }

    const vadOutput = {
      ...baseVadOutput,
      valence: -0.6, // Negative valence
      arousal: 0.7, // Higher arousal
      dominance: 0.3, // Lower dominance
    }

    // Act
    const result = categorizeEmotion(
      context,
      mhhVariables,
      pInstanceData,
      vadOutput,
      0.8, // epPowerLevel
    )

    // Assert
    const embarrassmentProb =
      result.categoryDistribution.find((item) => item.label === "Embarrassment")?.probability || 0
    expect(embarrassmentProb).toBeGreaterThan(0.3) // Should have significant probability

    // Check if Embarrassment is in top 2 emotions
    const sortedDistribution = [...result.categoryDistribution].sort((a, b) => b.probability - a.probability)
    const topLabels = sortedDistribution.slice(0, 2).map((item) => item.label)
    expect(topLabels).toContain("Embarrassment")
  })

  it("should not significantly affect probabilities when no social context flags are set", () => {
    // Arrange
    const pInstanceData = {
      ...basePInstanceData,
      pValuationShiftEstimate: -0.5, // Negative valuation
    }

    const vadOutput = {
      ...baseVadOutput,
      valence: -0.5, // Negative valence
    }

    // Act
    const result = categorizeEmotion(
      baseContext, // No social context flags set
      baseMhhVariables,
      pInstanceData,
      vadOutput,
      0.8, // epPowerLevel
    )

    // Assert
    const guiltProb = result.categoryDistribution.find((item) => item.label === "Guilt")?.probability || 0
    const prideProb = result.categoryDistribution.find((item) => item.label === "Pride")?.probability || 0
    const embarrassmentProb =
      result.categoryDistribution.find((item) => item.label === "Embarrassment")?.probability || 0

    // Social emotions should have low probabilities
    expect(guiltProb).toBeLessThan(0.2)
    expect(prideProb).toBeLessThan(0.2)
    expect(embarrassmentProb).toBeLessThan(0.2)
  })
})
