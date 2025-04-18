import { generateLlmText, generateLlmJson } from "../llm-interaction"
import { generateText } from "ai"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock the AI SDK
jest.mock("ai", () => ({
  generateText: jest.fn(),
}))

describe("LLM Interaction", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe("generateLlmText", () => {
    test("should return text from LLM", async () => {
      // Mock the AI SDK response
      ;(generateText as jest.Mock).mockResolvedValue({ text: "This is a test response" })

      const result = await generateLlmText("Test prompt")
      expect(result).toBe("This is a test response")
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: "Test prompt",
        }),
      )
    })

    test("should handle LLM errors", async () => {
      // Mock the AI SDK error
      ;(generateText as jest.Mock).mockRejectedValue(new Error("API error"))

      const result = await generateLlmText("Test prompt")
      expect(result).toBeNull()
    })

    test("should handle timeout", async () => {
      // Mock a delayed response that will trigger timeout
      ;(generateText as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ text: "Delayed response" }), 100)
          }),
      )

      const result = await generateLlmText("Test prompt", { timeoutMs: 50 })
      expect(result).toBeNull()
    })
  })

  describe("generateLlmJson", () => {
    test("should parse valid JSON response", async () => {
      // Mock the AI SDK response with valid JSON
      ;(generateText as jest.Mock).mockResolvedValue({ text: '{"key": "value"}' })

      const result = await generateLlmJson("Test prompt")
      expect(result).toEqual({ key: "value" })
    })

    test("should extract JSON from text with extra content", async () => {
      // Mock the AI SDK response with JSON embedded in text
      ;(generateText as jest.Mock).mockResolvedValue({
        text: 'Here is the JSON response: {"key": "value"} Hope this helps!',
      })

      const result = await generateLlmJson("Test prompt")
      expect(result).toEqual({ key: "value" })
    })

    test("should handle invalid JSON", async () => {
      // Mock the AI SDK response with invalid JSON
      ;(generateText as jest.Mock).mockResolvedValue({ text: "Not valid JSON" })

      const result = await generateLlmJson("Test prompt")
      expect(result).toBeNull()
    })

    test("should handle LLM errors", async () => {
      // Mock the AI SDK error
      ;(generateText as jest.Mock).mockRejectedValue(new Error("API error"))

      const result = await generateLlmJson("Test prompt")
      expect(result).toBeNull()
    })
  })
})
