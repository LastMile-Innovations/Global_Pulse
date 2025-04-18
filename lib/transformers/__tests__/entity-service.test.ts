import { recognizeEntities } from "../entity-service"

// Mock the pipeline function from transformers
jest.mock("@xenova/transformers", () => ({
  pipeline: jest.fn().mockImplementation(() => {
    return async (text: string) => {
      // Simple mock implementation that returns entities based on text content
      const entities = []

      if (text.includes("John")) {
        entities.push({
          word: "John",
          entity: "B-PER",
          score: 0.95,
          start: text.indexOf("John"),
          end: text.indexOf("John") + 4,
        })
      }

      if (text.includes("New York")) {
        entities.push({
          word: "New",
          entity: "B-LOC",
          score: 0.92,
          start: text.indexOf("New"),
          end: text.indexOf("New") + 3,
        })
        entities.push({
          word: "York",
          entity: "I-LOC",
          score: 0.94,
          start: text.indexOf("York"),
          end: text.indexOf("York") + 4,
        })
      }

      if (text.includes("Google")) {
        entities.push({
          word: "Google",
          entity: "B-ORG",
          score: 0.98,
          start: text.indexOf("Google"),
          end: text.indexOf("Google") + 6,
        })
      }

      return entities
    }
  }),
}))

describe("recognizeEntities", () => {
  test("should recognize person entities correctly", async () => {
    const result = await recognizeEntities("John is a software engineer.")

    expect(result.entities).toHaveLength(1)
    expect(result.entities[0].text).toBe("John")
    expect(result.entities[0].type).toBe("PERSON")
    expect(result.entities[0].score).toBeGreaterThan(0.9)
  })

  test("should recognize location entities correctly", async () => {
    const result = await recognizeEntities("I visited New York last summer.")

    expect(result.entities).toHaveLength(1)
    expect(result.entities[0].text).toBe("New York")
    expect(result.entities[0].type).toBe("LOCATION")
    expect(result.entities[0].score).toBeGreaterThan(0.9)
  })

  test("should recognize organization entities correctly", async () => {
    const result = await recognizeEntities("Google is a technology company.")

    expect(result.entities).toHaveLength(1)
    expect(result.entities[0].text).toBe("Google")
    expect(result.entities[0].type).toBe("ORGANIZATION")
    expect(result.entities[0].score).toBeGreaterThan(0.9)
  })

  test("should recognize multiple entity types in the same text", async () => {
    const result = await recognizeEntities("John works at Google in New York.")

    expect(result.entities).toHaveLength(3)

    // Check for person entity
    const personEntity = result.entities.find((e) => e.type === "PERSON")
    expect(personEntity).toBeDefined()
    expect(personEntity?.text).toBe("John")

    // Check for organization entity
    const orgEntity = result.entities.find((e) => e.type === "ORGANIZATION")
    expect(orgEntity).toBeDefined()
    expect(orgEntity?.text).toBe("Google")

    // Check for location entity
    const locEntity = result.entities.find((e) => e.type === "LOCATION")
    expect(locEntity).toBeDefined()
    expect(locEntity?.text).toBe("New York")
  })

  test("should handle empty input", async () => {
    const result = await recognizeEntities("")
    expect(result.entities).toEqual([])
  })

  test("should handle null or undefined input", async () => {
    const result1 = await recognizeEntities(null as any)
    expect(result1.entities).toEqual([])

    const result2 = await recognizeEntities(undefined as any)
    expect(result2.entities).toEqual([])
  })
})
