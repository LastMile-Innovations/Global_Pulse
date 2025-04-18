import { recognizeEntitiesLLM } from "../ner-service"
import { generateLlmJson } from "../llm-interaction"

// Mock the LLM interaction
jest.mock("../llm-interaction", () => ({
  generateLlmJson: jest.fn(),
}))

describe("Named Entity Recognition Service", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("should recognize entities correctly", async () => {
    // Mock the LLM response
    ;(generateLlmJson as jest.Mock).mockResolvedValue([
      {
        text: "John Smith",
        type: "PERSON",
        start: 0,
        end: 10,
        score: 0.95,
      },
      {
        text: "New York",
        type: "LOCATION",
        start: 15,
        end: 23,
        score: 0.92,
      },
    ])

    const result = await recognizeEntitiesLLM("John Smith from New York")

    expect("entities" in result).toBe(true)
    if ("entities" in result) {
      expect(result.entities).toHaveLength(2)
      expect(result.entities[0].text).toBe("John Smith")
      expect(result.entities[0].type).toBe("PERSON")
      expect(result.entities[1].text).toBe("New York")
      expect(result.entities[1].type).toBe("LOCATION")
    }
  })

  test("should handle empty input", async () => {
    const result = await recognizeEntitiesLLM("")

    expect("entities" in result).toBe(true)
    if ("entities" in result) {
      expect(result.entities).toEqual([])
    }
  })

  test("should handle LLM errors", async () => {
    // Mock the LLM error
    ;(generateLlmJson as jest.Mock).mockResolvedValue(null)

    const result = await recognizeEntitiesLLM("Test text")

    expect("error" in result).toBe(true)
    if ("error" in result) {
      expect(result.entities).toEqual([])
    }
  })

  test("should validate and normalize entity types", async () => {
    // Mock the LLM response with invalid entity type
    ;(generateLlmJson as jest.Mock).mockResolvedValue([
      {
        text: "John Smith",
        type: "INVALID_TYPE",
        start: 0,
        end: 10,
        score: 0.95,
      },
    ])

    const result = await recognizeEntitiesLLM("John Smith")

    expect("entities" in result).toBe(true)
    if ("entities" in result) {
      expect(result.entities).toHaveLength(1)
      expect(result.entities[0].type).toBe("OTHER") // Should normalize to OTHER
    }
  })

  test("should filter out invalid entities", async () => {
    // Mock the LLM response with some invalid entities
    ;(generateLlmJson as jest.Mock).mockResolvedValue([
      {
        text: "John Smith",
        type: "PERSON",
        start: 0,
        end: 10,
        score: 0.95,
      },
      {
        // Missing required fields
        type: "LOCATION",
      },
      {
        // Invalid start/end
        text: "Example",
        type: "ORGANIZATION",
        start: 20,
        end: 10,
      },
    ])

    const result = await recognizeEntitiesLLM("Test text")

    expect("entities" in result).toBe(true)
    if ("entities" in result) {
      expect(result.entities).toHaveLength(1) // Only the valid entity should remain
      expect(result.entities[0].text).toBe("John Smith")
    }
  })
})
