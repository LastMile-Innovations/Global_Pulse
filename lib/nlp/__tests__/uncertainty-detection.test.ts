import { detectUncertainty } from "../uncertainty-detection"
import { describe, test, expect } from "@jest/globals"

// Mock NLP features
const mockNlpFeatures = {
  keywords: ["test", "keyword"],
  sentiment: { label: "NEUTRAL", score: 0.5 },
  entities: [{ text: "Test Entity", type: "PERSON", start: 0, end: 10 }],
  abstractConcepts: [{ text: "Test Concept", type: "VALUE" }],
}

describe("Uncertainty Detection", () => {
  test("should detect uncertainty in text with common phrases", () => {
    const result = detectUncertainty("I'm not sure what to do next", mockNlpFeatures)

    expect(result.isExpressingUncertainty).toBe(true)
    expect(result.confidenceScore).toBeGreaterThan(0.5)
  })

  test("should detect uncertainty with multiple indicators", () => {
    const result = detectUncertainty(
      "I'm confused and uncertain about what to do. Maybe we should try something else?",
      mockNlpFeatures,
    )

    expect(result.isExpressingUncertainty).toBe(true)
    expect(result.confidenceScore).toBeGreaterThan(0.7) // Higher confidence due to multiple indicators
  })

  test("should not detect uncertainty in confident statements", () => {
    const result = detectUncertainty("I definitely want to proceed with this plan", mockNlpFeatures)

    expect(result.isExpressingUncertainty).toBe(false)
    expect(result.confidenceScore).toBe(0.0)
  })

  test("should extract uncertainty topic when available", () => {
    const result = detectUncertainty("I'm not sure about the project timeline", mockNlpFeatures)

    expect(result.isExpressingUncertainty).toBe(true)
    expect(result.uncertaintyTopic).toBe("the project timeline")
  })

  test("should handle question patterns that indicate uncertainty", () => {
    const result = detectUncertainty("What if we try a different approach?", mockNlpFeatures)

    expect(result.isExpressingUncertainty).toBe(true)
  })

  test("should handle empty or invalid input", () => {
    const result = detectUncertainty("", mockNlpFeatures)

    expect(result.isExpressingUncertainty).toBe(false)
    expect(result.confidenceScore).toBe(0.0)
  })

  test("should use NLP entities for topic extraction when pattern matching fails", () => {
    // Mock NLP features with entities
    const nlpFeaturesWithEntities = {
      ...mockNlpFeatures,
      entities: [{ text: "Career Path", type: "TOPIC", start: 20, end: 31 }],
    }

    const result = detectUncertainty("I'm uncertain about my career path", nlpFeaturesWithEntities)

    expect(result.isExpressingUncertainty).toBe(true)
    expect(result.uncertaintyTopic).toBe("Career Path")
  })

  test("should handle errors gracefully", () => {
    // Force an error by passing invalid NLP features
    const result = detectUncertainty("Test text", null as any)

    expect(result.isExpressingUncertainty).toBe(false)
    expect(result.confidenceScore).toBe(0.0)
  })
})
