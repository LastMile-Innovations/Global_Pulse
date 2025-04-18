import { calculateLinearVad } from "../ewef-core-engine/linear-model"
import type { PInstanceData, RuleVariables, BootstrappedEP } from "../../types/pce-types"
import { describe, test, expect } from "@jest/globals"

describe("Linear VAD Model", () => {
  // Mock data for testing
  const mockPInstance: PInstanceData = {
    mhhSource: "internal",
    mhhPerspective: "self",
    mhhTimeframe: "present",
    mhhAcceptanceState: "accepted",
    pValuationShiftEstimate: 0.5,
    pPowerLevel: 0.7,
    pAppraisalConfidence: 0.8,
  }

  const mockRuleVariables: RuleVariables = {
    source: { value: "internal", confidence: 0.8 },
    perspective: { value: "self", confidence: 0.8 },
    timeframe: { value: "present", confidence: 0.8 },
    acceptanceState: { value: "accepted", confidence: 0.8 },
  }

  const mockActiveEPs: BootstrappedEP[] = [
    {
      id: "value1",
      name: "Achievement",
      type: "VALUE",
      powerLevel: 0.8,
      valuation: 0.7,
      activationWeight: 1.0,
    },
    {
      id: "goal1",
      name: "Complete Project",
      type: "GOAL",
      powerLevel: 0.6,
      valuation: 0.8,
      activationWeight: 0.9,
    },
  ]

  test("should calculate positive valence for positive inputs", () => {
    const result = calculateLinearVad(
      mockPInstance,
      mockRuleVariables,
      mockActiveEPs,
      0.8, // Positive sentiment
    )

    expect(result.valence).toBeGreaterThan(0)
    expect(result.arousal).toBeGreaterThan(0)
    expect(result.dominance).toBeGreaterThan(0)
    expect(result.confidence).toBe(0.8)
  })

  test("should calculate negative valence for negative inputs", () => {
    const negativePInstance: PInstanceData = {
      ...mockPInstance,
      pValuationShiftEstimate: -0.7,
    }

    const result = calculateLinearVad(
      negativePInstance,
      mockRuleVariables,
      mockActiveEPs,
      0.2, // Negative sentiment
    )

    expect(result.valence).toBeLessThan(0)
    expect(result.arousal).toBeGreaterThan(0)
    expect(result.dominance).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBe(0.8)
  })

  test("should handle resistance with increased arousal", () => {
    const resistedPInstance: PInstanceData = {
      ...mockPInstance,
      mhhAcceptanceState: "resisted",
    }

    const resistedRuleVariables: RuleVariables = {
      ...mockRuleVariables,
      acceptanceState: { value: "resisted", confidence: 0.8 },
    }

    const baselineResult = calculateLinearVad(
      mockPInstance,
      mockRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
    )

    const resistedResult = calculateLinearVad(
      resistedPInstance,
      resistedRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
    )

    // Resistance should increase arousal
    expect(resistedResult.arousal).toBeGreaterThan(baselineResult.arousal)
    // Resistance should decrease dominance
    expect(resistedResult.dominance).toBeLessThan(baselineResult.dominance)
  })

  test("should handle external source with decreased dominance", () => {
    const externalPInstance: PInstanceData = {
      ...mockPInstance,
      mhhSource: "external",
    }

    const externalRuleVariables: RuleVariables = {
      ...mockRuleVariables,
      source: { value: "external", confidence: 0.8 },
    }

    const baselineResult = calculateLinearVad(
      mockPInstance,
      mockRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
    )

    const externalResult = calculateLinearVad(
      externalPInstance,
      externalRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
    )

    // External source should decrease dominance
    expect(externalResult.dominance).toBeLessThan(baselineResult.dominance)
  })

  test("should handle future timeframe with increased arousal", () => {
    const futurePInstance: PInstanceData = {
      ...mockPInstance,
      mhhTimeframe: "future",
    }

    const futureRuleVariables: RuleVariables = {
      ...mockRuleVariables,
      timeframe: { value: "future", confidence: 0.8 },
    }

    const baselineResult = calculateLinearVad(
      mockPInstance,
      mockRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
    )

    const futureResult = calculateLinearVad(
      futurePInstance,
      futureRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
    )

    // Future timeframe should increase arousal
    expect(futureResult.arousal).toBeGreaterThan(baselineResult.arousal)
  })

  test("should handle error cases gracefully", () => {
    // @ts-ignore - Intentionally passing invalid data to test error handling
    const result = calculateLinearVad(null, null, null, null)

    // Should return default values
    expect(result.valence).toBe(0.0)
    expect(result.arousal).toBe(0.1)
    expect(result.dominance).toBe(0.0)
    expect(result.confidence).toBe(0.5)
  })

  test("should respect value bounds", () => {
    // Create extreme inputs that would push values out of bounds
    const extremePInstance: PInstanceData = {
      mhhSource: "internal",
      mhhPerspective: "self",
      mhhTimeframe: "future",
      mhhAcceptanceState: "resisted",
      pValuationShiftEstimate: 2.0, // Extreme value
      pPowerLevel: 2.0, // Extreme value
      pAppraisalConfidence: 1.0,
    }

    const result = calculateLinearVad(
      extremePInstance,
      mockRuleVariables,
      mockActiveEPs,
      1.0, // Extreme sentiment
    )

    // Values should be clamped to their valid ranges
    expect(result.valence).toBeGreaterThanOrEqual(-1.0)
    expect(result.valence).toBeLessThanOrEqual(1.0)
    expect(result.arousal).toBeGreaterThanOrEqual(0.0)
    expect(result.arousal).toBeLessThanOrEqual(1.0)
    expect(result.dominance).toBeGreaterThanOrEqual(0.0)
    expect(result.dominance).toBeLessThanOrEqual(1.0)
  })

  test("should incorporate state context when provided", () => {
    const state = {
      moodEstimate: 0.7,
      stressEstimate: 0.8,
    }

    const resultWithState = calculateLinearVad(
      mockPInstance,
      mockRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
      state,
    )

    const resultWithoutState = calculateLinearVad(
      mockPInstance,
      mockRuleVariables,
      mockActiveEPs,
      0.5, // Neutral sentiment
    )

    // State should influence the results
    expect(resultWithState).not.toEqual(resultWithoutState)
  })
})
