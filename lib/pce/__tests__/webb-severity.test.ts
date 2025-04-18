import { determineWebbSeverityLabel, SEVERITY_MAP } from "../webb-severity"
import { describe, test, expect } from "@jest/globals"

describe("Webb Severity Calculator", () => {
  test("should determine correct severity label for Fear Group", () => {
    // Test different intensity levels
    expect(determineWebbSeverityLabel("Fear Group", 2, 0.2)).toBe("Concerned")
    expect(determineWebbSeverityLabel("Fear Group", 5, 0.5)).toBe("Afraid/Fearful")
    expect(determineWebbSeverityLabel("Fear Group", 10, 1.0)).toBe("Panic")
  })

  test("should determine correct severity label for Anger Group", () => {
    expect(determineWebbSeverityLabel("Anger Group", 2, 0.2)).toBe("Annoyed")
    expect(determineWebbSeverityLabel("Anger Group", 5, 0.5)).toBe("Angry")
    expect(determineWebbSeverityLabel("Anger Group", 10, 1.0)).toBe("Rage")
  })

  test("should determine correct severity label for Happiness Group", () => {
    expect(determineWebbSeverityLabel("Happiness Group", 2, 0.2)).toBe("Satisfied")
    expect(determineWebbSeverityLabel("Happiness Group", 5, 0.5)).toBe("Happy")
    expect(determineWebbSeverityLabel("Happiness Group", 10, 1.0)).toBe("Ecstatic")
  })

  test("should handle edge cases correctly", () => {
    // Test with zero power levels
    expect(determineWebbSeverityLabel("Fear Group", 0, 0)).toBe("Concerned")

    // Test with very high power levels (should clamp)
    expect(determineWebbSeverityLabel("Anger Group", 15, 1.5)).toBe("Rage")

    // Test with negative power levels (should clamp to 0)
    expect(determineWebbSeverityLabel("Happiness Group", -5, -0.2)).toBe("Satisfied")
  })

  test("should handle unknown emotion groups gracefully", () => {
    // Should use Default severity map for unknown groups
    const result = determineWebbSeverityLabel("Unknown Group", 5, 0.5)
    expect(result).toBe("Strong")

    // Should return group name if no mapping exists and no default
    const originalDefaultMap = SEVERITY_MAP["Default"]
    delete SEVERITY_MAP["Default"]
    expect(determineWebbSeverityLabel("Unknown Group", 5, 0.5)).toBe("Unknown Group")
    SEVERITY_MAP["Default"] = originalDefaultMap
  })

  test("should weight EP power level more than P power level", () => {
    // EP has 0.6 weight, P has 0.4 weight
    // High EP, low P should be higher intensity than low EP, high P
    const highEpLowP = determineWebbSeverityLabel("Anger Group", 8, 0.2)
    const lowEpHighP = determineWebbSeverityLabel("Anger Group", 3, 0.9)

    // Get indices in the severity map
    const highEpLowPIndex = SEVERITY_MAP["Anger Group"].indexOf(highEpLowP)
    const lowEpHighPIndex = SEVERITY_MAP["Anger Group"].indexOf(lowEpHighP)

    // Higher index means higher intensity
    expect(highEpLowPIndex).toBeGreaterThan(lowEpHighPIndex)
  })
})
