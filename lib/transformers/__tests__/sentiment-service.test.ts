import { classifySentiment } from "../sentiment-service"

// Mock the pipeline function from transformers
jest.mock("@xenova/transformers", () => ({
  pipeline: jest.fn().mockImplementation(() => {
    return async (text: string) => {
      // Simple mock implementation that returns positive for positive words,
      // negative for negative words, and neutral otherwise
      if (text.includes("happy") || text.includes("good") || text.includes("excellent")) {
        return [{ label: "LABEL_1", score: 0.9 }]
      } else if (text.includes("sad") || text.includes("bad") || text.includes("terrible")) {
        return [{ label: "LABEL_0", score: 0.9 }]
      } else {
        return [{ label: "LABEL_1", score: 0.55 }]
      }
    }
  }),
}))

describe("classifySentiment", () => {
  test("should classify positive sentiment correctly", async () => {
    const result = await classifySentiment("I am feeling happy today")
    expect(result.label).toBe("POSITIVE")
    expect(result.score).toBeGreaterThan(0.7)
  })

  test("should classify negative sentiment correctly", async () => {
    const result = await classifySentiment("I am feeling sad today")
    expect(result.label).toBe("NEGATIVE")
    expect(result.score).toBeGreaterThan(0.7)
  })

  test("should handle neutral or ambiguous sentiment", async () => {
    const result = await classifySentiment("Today is Thursday")

    // Our mock returns a slightly positive score for neutral text
    expect(result.label).toBe("POSITIVE")
    expect(result.score).toBeLessThan(0.6)
  })

  test("should handle empty input", async () => {
    const result = await classifySentiment("")
    expect(result.label).toBe("NEUTRAL")
    expect(result.score).toBe(0.5)
  })

  test("should handle null or undefined input", async () => {
    const result1 = await classifySentiment(null as any)
    expect(result1.label).toBe("NEUTRAL")
    expect(result1.score).toBe(0.5)

    const result2 = await classifySentiment(undefined as any)
    expect(result2.label).toBe("NEUTRAL")
    expect(result2.score).toBe(0.5)
  })
})
