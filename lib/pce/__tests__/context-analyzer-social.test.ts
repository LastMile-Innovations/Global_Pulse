import { analyzeSocialEmotionCues } from "../context-analyzer"
import type { Entity, AbstractConcept } from "../../types/nlp-types"
import { describe, it, expect } from "vitest"

// We need to export the function to test it
// Add this to the context-analyzer.ts file right before the function definition
// export for testing
export { analyzeSocialEmotionCues }

describe("Social Emotion Context Detection", () => {
  it("should detect guilt scenario from keywords", () => {
    // Arrange
    const keywords = ["I feel guilty", "my fault", "I hurt them"]
    const entities: Entity[] = []
    const abstractConcepts: AbstractConcept[] = []

    // Act
    const socialContext = analyzeSocialEmotionCues(keywords, entities, abstractConcepts)

    // Assert
    expect(socialContext.isPotentialGuiltScenario).toBe(true)
    expect(socialContext.involvedHarmToOther).toBe(true)
  })

  it("should detect pride scenario from keywords", () => {
    // Arrange
    const keywords = ["proud of myself", "accomplished my goal"]
    const entities: Entity[] = []
    const abstractConcepts: AbstractConcept[] = []

    // Act
    const socialContext = analyzeSocialEmotionCues(keywords, entities, abstractConcepts)

    // Assert
    expect(socialContext.isPotentialPrideScenario).toBe(true)
    expect(socialContext.involvedAchievement).toBe(true)
    expect(socialContext.involvedGoalAttainment).toBe(true)
  })

  it("should detect embarrassment scenario from keywords", () => {
    // Arrange
    const keywords = ["so embarrassed", "everyone saw me"]
    const entities: Entity[] = []
    const abstractConcepts: AbstractConcept[] = []

    // Act
    const socialContext = analyzeSocialEmotionCues(keywords, entities, abstractConcepts)

    // Assert
    expect(socialContext.isPotentialEmbarrassmentScenario).toBe(true)
    expect(socialContext.involvedPublicExposure).toBe(true)
  })

  it("should detect multiple social contexts from mixed input", () => {
    // Arrange
    const keywords = ["embarrassed"]
    const entities: Entity[] = [{ text: "I feel guilty", type: "SENTIMENT", start: 0, end: 13 }]
    const abstractConcepts: AbstractConcept[] = [{ text: "achievement", type: "CONCEPT", confidence: 0.8 }]

    // Act
    const socialContext = analyzeSocialEmotionCues(keywords, entities, abstractConcepts)

    // Assert
    expect(socialContext.isPotentialGuiltScenario).toBe(true)
    expect(socialContext.isPotentialEmbarrassmentScenario).toBe(true)
    expect(socialContext.involvedAchievement).toBe(true)
  })

  it("should not detect any social contexts from unrelated input", () => {
    // Arrange
    const keywords = ["weather", "sunny", "today"]
    const entities: Entity[] = [{ text: "temperature", type: "CONCEPT", start: 0, end: 11 }]
    const abstractConcepts: AbstractConcept[] = [{ text: "climate", type: "CONCEPT", confidence: 0.8 }]

    // Act
    const socialContext = analyzeSocialEmotionCues(keywords, entities, abstractConcepts)

    // Assert
    expect(socialContext.isPotentialGuiltScenario).toBe(false)
    expect(socialContext.isPotentialPrideScenario).toBe(false)
    expect(socialContext.isPotentialEmbarrassmentScenario).toBe(false)
    expect(socialContext.involvedHarmToOther).toBe(false)
    expect(socialContext.involvedAchievement).toBe(false)
    expect(socialContext.involvedPublicExposure).toBe(false)
  })
})
