import { calculateVADDistance, mapDistanceToConsistency, checkVADConsistency } from "../vad-consistency"
import { describe, expect, test } from "@jest/globals"

describe("VAD Consistency Checking", () => {
  test("should calculate correct distance between VAD profiles", () => {
    const vad1 = { valence: 0.8, arousal: 0.6, dominance: 0.7, confidence: 0.9 }
    const vad2 = { valence: 0.8, arousal: 0.6, dominance: 0.7 }

    // Same coordinates should have zero distance
    expect(calculateVADDistance(vad1, vad2)).toBe(0)

    const vad3 = { valence: -0.8, arousal: 0.3, dominance: 0.2 }

    // Calculate expected distance using Euclidean formula
    const expectedDistance = Math.sqrt(
      Math.pow(vad1.valence - vad3.valence, 2) +
        Math.pow(vad1.arousal - vad3.arousal, 2) +
        Math.pow(vad1.dominance - vad3.dominance, 2),
    )

    expect(calculateVADDistance(vad1, vad3)).toBeCloseTo(expectedDistance)
  })

  test("should map distance to consistency correctly", () => {
    // Zero distance should map to perfect consistency (1.0)
    expect(mapDistanceToConsistency(0)).toBe(1.0)

    // Very large distance should map to very low consistency
    expect(mapDistanceToConsistency(2.0)).toBeLessThan(0.1)

    // Check that consistency decreases as distance increases
    const consistency1 = mapDistanceToConsistency(0.2)
    const consistency2 = mapDistanceToConsistency(0.5)
    const consistency3 = mapDistanceToConsistency(1.0)

    expect(consistency1).toBeGreaterThan(consistency2)
    expect(consistency2).toBeGreaterThan(consistency3)
  })

  test("should check VAD consistency correctly", () => {
    const predictedVAD = { valence: 0.8, arousal: 0.6, dominance: 0.7, confidence: 0.9 }

    // Identical profile should have perfect consistency
    const identicalProfile = { valence: 0.8, arousal: 0.6, dominance: 0.7 }
    expect(checkVADConsistency(predictedVAD, identicalProfile)).toBe(1.0)

    // Similar profile should have high consistency
    const similarProfile = { valence: 0.7, arousal: 0.5, dominance: 0.6 }
    expect(checkVADConsistency(predictedVAD, similarProfile)).toBeGreaterThan(0.7)

    // Very different profile should have low consistency
    const differentProfile = { valence: -0.8, arousal: 0.2, dominance: 0.1 }
    expect(checkVADConsistency(predictedVAD, differentProfile)).toBeLessThan(0.3)
  })
})
