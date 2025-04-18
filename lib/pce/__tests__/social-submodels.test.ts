import {
  calculateGuiltLikelihood,
  calculatePrideLikelihood,
  calculateEmbarrassmentLikelihood,
} from "../social-submodels"
import type { ContextualAnalysisOutput } from "../context-analyzer"
import { describe, it, expect } from "@jest/globals"

describe("Social Emotion Sub-models", () => {
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

  describe("calculateGuiltLikelihood", () => {
    it("should return high likelihood for clear guilt scenario", () => {
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

      // Act
      const likelihood = calculateGuiltLikelihood(context, pInstanceData, baseMhhVariables)

      // Assert
      expect(likelihood).toBeGreaterThan(0.7) // Should be high likelihood
    })

    it("should return low likelihood when source is external", () => {
      // Arrange
      const context: ContextualAnalysisOutput = {
        ...baseContext,
        socialContext: {
          ...baseContext.socialContext,
          isPotentialGuiltScenario: true,
          involvedHarmToOther: true,
        },
      }

      const pInstanceData = {
        ...basePInstanceData,
        mhhSource: "external", // External source
        pValuationShiftEstimate: -0.5,
      }

      // Act
      const likelihood = calculateGuiltLikelihood(context, pInstanceData, baseMhhVariables)

      // Assert
      expect(likelihood).toBeLessThan(0.2) // Should be low likelihood
    })

    it("should return low likelihood for positive valuation", () => {
      // Arrange
      const context: ContextualAnalysisOutput = {
        ...baseContext,
        socialContext: {
          ...baseContext.socialContext,
          isPotentialGuiltScenario: true,
        },
      }

      const pInstanceData = {
        ...basePInstanceData,
        pValuationShiftEstimate: 0.5, // Positive valuation
      }

      // Act
      const likelihood = calculateGuiltLikelihood(context, pInstanceData, baseMhhVariables)

      // Assert
      expect(likelihood).toBeLessThan(0.2) // Should be low likelihood
    })
  })

  describe("calculatePrideLikelihood", () => {
    it("should return high likelihood for clear pride scenario", () => {
      // Arrange
      const context: ContextualAnalysisOutput = {
        ...baseContext,
        socialContext: {
          ...baseContext.socialContext,
          isPotentialPrideScenario: true,
          involvedAchievement: true,
          involvedGoalAttainment: true,
        },
      }

      const pInstanceData = {
        ...basePInstanceData,
        pValuationShiftEstimate: 0.7, // Strong positive valuation
      }

      // Act
      const likelihood = calculatePrideLikelihood(context, pInstanceData, baseMhhVariables)

      // Assert
      expect(likelihood).toBeGreaterThan(0.7) // Should be high likelihood
    })

    it("should return low likelihood when source is external", () => {
      // Arrange
      const context: ContextualAnalysisOutput = {
        ...baseContext,
        socialContext: {
          ...baseContext.socialContext,
          isPotentialPrideScenario: true,
          involvedAchievement: true,
        },
      }

      const pInstanceData = {
        ...basePInstanceData,
        mhhSource: "external", // External source
        pValuationShiftEstimate: 0.5,
      }

      // Act
      const likelihood = calculatePrideLikelihood(context, pInstanceData, baseMhhVariables)

      // Assert
      expect(likelihood).toBeLessThan(0.2) // Should be low likelihood
    })

    it("should return low likelihood for negative valuation", () => {
      // Arrange
      const context: ContextualAnalysisOutput = {
        ...baseContext,
        socialContext: {
          ...baseContext.socialContext,
          isPotentialPrideScenario: true,
        },
      }

      const pInstanceData = {
        ...basePInstanceData,
        pValuationShiftEstimate: -0.5, // Negative valuation
      }

      // Act
      const likelihood = calculatePrideLikelihood(context, pInstanceData, baseMhhVariables)

      // Assert
      expect(likelihood).toBeLessThan(0.2) // Should be low likelihood
    })
  })

  describe("calculateEmbarrassmentLikelihood", () => {
    it("should return high likelihood for clear embarrassment scenario", () => {
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

      // Act
      const likelihood = calculateEmbarrassmentLikelihood(context, pInstanceData, mhhVariables)

      // Assert
      expect(likelihood).toBeGreaterThan(0.7) // Should be high likelihood
    })

    it("should return moderate likelihood for 'both' perspective", () => {
      // Arrange
      const context: ContextualAnalysisOutput = {
        ...baseContext,
        socialContext: {
          ...baseContext.socialContext,
          isPotentialEmbarrassmentScenario: true,
          involvedPublicExposure: true,
        },
      }

      const pInstanceData = {
        ...basePInstanceData,
        mhhPerspective: "both", // Both self and other perspective
        pValuationShiftEstimate: -0.4,
      }

      const mhhVariables = {
        ...baseMhhVariables,
        perspective: { value: "both", confidence: 0.7 },
      }

      // Act
      const likelihood = calculateEmbarrassmentLikelihood(context, pInstanceData, mhhVariables)

      // Assert
      expect(likelihood).toBeGreaterThan(0.4) // Should be moderate likelihood
      expect(likelihood).toBeLessThan(0.8) // But not too high
    })

    it("should return low likelihood for self perspective", () => {
      // Arrange
      const context: ContextualAnalysisOutput = {
        ...baseContext,
        socialContext: {
          ...baseContext.socialContext,
          isPotentialEmbarrassmentScenario: true,
        },
      }

      const pInstanceData = {
        ...basePInstanceData,
        mhhPerspective: "self", // Self-oriented perspective
        pValuationShiftEstimate: -0.5,
      }

      // Act
      const likelihood = calculateEmbarrassmentLikelihood(context, pInstanceData, baseMhhVariables)

      // Assert
      expect(likelihood).toBeLessThan(0.2) // Should be low likelihood
    })
  })
})
