import { classifyConceptsZSC_LLM } from "../zsc-service"
import { generateLlmJson } from "../llm-interaction"

// Mock the LLM interaction
jest.mock("../llm-interaction", () => ({
  generateLlmJson: jest.fn(),
}))

describe("Zero-Shot Classification Service", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("should classify concepts correctly", async () => {
    // Mock the LLM response
    ;(generateLlmJson as jest.Mock).mockResolvedValue([
      {
        text: "I want to finish my degree",
        type: "GOAL",
        score: 0.92,
      },
      {
        text: "I believe in working hard",
        type: "BELIEF",
        score: 0.85,
      },
    ])

    const result = await classifyConceptsZSC_LLM("I want to finish my degree because I believe in working hard")

    expect("concepts" in result).toBe(true)
    if ("concepts" in result) {
      expect(result.concepts).toHaveLength(2)
      expect(result.concepts[0].text).toBe("I want to finish my degree")
      expect(result.concepts[0].type).toBe("GOAL")
      expect(result.concepts[1].text).toBe("I believe in working hard")
      expect(result.concepts[1].type).toBe("BELIEF")
    }
  })

  test("should handle empty input", async () => {
    const result = await classifyConceptsZSC_LLM("")

    expect("concepts" in result).toBe(true)
    if ("concepts" in result) {
      expect(result.concepts).toEqual([])
    }
  })

  test("should handle LLM errors", async () => {
    // Mock the LLM error
    ;(generateLlmJson as jest.Mock).mockResolvedValue(null)

    const result = await classifyConceptsZSC_LLM("Test text")

    expect("error" in result).toBe(true)
    if ("error" in result) {
      expect(result.concepts).toEqual([])
    }
  })

  test("should validate and normalize concept types", async () => {
    // Mock the LLM response with invalid concept type
    ;(generateLlmJson as jest.Mock).mockResolvedValue([
      {
        text: "I want to be happy",
        type: "INVALID_TYPE",
        score: 0.95,
      },
    ])

    const result = await classifyConceptsZSC_LLM("I want to be happy")

    expect("concepts" in result).toBe(true)
    if ("concepts" in result) {
      expect(result.concepts).toHaveLength(1)
      expect(result.concepts[0].type).toBe("OTHER") // Should normalize to OTHER
    }
  })

  test("should filter out invalid concepts", async () => {
    // Mock the LLM response with some invalid concepts
    ;(generateLlmJson as jest.Mock).mockResolvedValue([
      {
        text: "I want to be successful",
        type: "GOAL",
        score: 0.95,
      },
      {
        // Missing required fields
        type: "VALUE",
      },
      {
        // Empty text
        text: "",
        type: "NEED",
        score: 0.8,
      },
    ])

    const result = await classifyConceptsZSC_LLM("Test text")

    expect("concepts" in result).toBe(true)
    if ("concepts" in result) {
      expect(result.concepts).toHaveLength(1) // Only the valid concept should remain
      expect(result.concepts[0].text).toBe("I want to be successful")
    }
  })
})
