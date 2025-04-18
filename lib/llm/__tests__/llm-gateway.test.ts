import { generateLlmResponseViaSdk, generateLlmJsonViaSdk } from "../llm-gateway"
import { generateText } from "ai"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock the AI SDK
jest.mock("ai", () => ({
  generateText: jest.fn(),
}))

// Mock environment variables
const originalEnv = process.env

describe("LLM Gateway", () => {
  beforeEach(() => {
    jest.resetAllMocks()

    // Reset environment variables
    process.env = { ...originalEnv }
    process.env.OPENAI_API_KEY = "test-openai-key"
    process.env.GOOGLE_API_KEY = "test-google-key"
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key"
  })

  afterAll(() => {
    // Restore environment variables
    process.env = originalEnv
  })

  describe("generateLlmResponseViaSdk", () => {
    test("should return text from LLM on success", async () => {
      // Mock the AI SDK response
      ;(generateText as jest.Mock).mockResolvedValue({ text: "This is a test response" })

      const result = await generateLlmResponseViaSdk("Test prompt")

      expect(result.success).toBe(true)
      expect(result.text).toBe("This is a test response")
      expect(result.modelUsed).toBe("openai/gpt-4o")
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: "Test prompt",
        }),
      )
    })

    test("should use custom configuration when provided", async () => {
      // Mock the AI SDK response
      ;(generateText as jest.Mock).mockResolvedValue({ text: "Custom config response" })

      const result = await generateLlmResponseViaSdk("Test prompt", {
        modelId: "google/gemini-1.5-flash",
        temperature: 0.7,
        maxTokens: 300,
        systemPrompt: "You are a helpful assistant",
      })

      expect(result.success).toBe(true)
      expect(result.modelUsed).toBe("google/gemini-1.5-flash")
      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: "Test prompt",
          system: "You are a helpful assistant",
          temperature: 0.7,
          maxTokens: 300,
        }),
      )
    })

    test("should handle empty prompt", async () => {
      const result = await generateLlmResponseViaSdk("")

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("INVALID_REQUEST")
      expect(generateText).not.toHaveBeenCalled()
    })

    test("should handle missing API key", async () => {
      // Remove API key
      delete process.env.OPENAI_API_KEY

      const result = await generateLlmResponseViaSdk("Test prompt")

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("AUTH")
      expect(generateText).not.toHaveBeenCalled()
    })

    test("should handle timeout errors", async () => {
      // Mock a timeout error
      ;(generateText as jest.Mock).mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error("Request timed out")
          error.name = "AbortError"
          reject(error)
        })
      })

      const result = await generateLlmResponseViaSdk("Test prompt", { timeoutMs: 100 })

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("TIMEOUT")
    })

    test("should handle authentication errors", async () => {
      // Mock an authentication error
      ;(generateText as jest.Mock).mockRejectedValue({
        status: 401,
        message: "Invalid API key",
      })

      const result = await generateLlmResponseViaSdk("Test prompt")

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("AUTH")
    })

    test("should handle rate limit errors", async () => {
      // Mock a rate limit error
      ;(generateText as jest.Mock).mockRejectedValue({
        status: 429,
        message: "Too many requests",
      })

      const result = await generateLlmResponseViaSdk("Test prompt")

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("RATE_LIMIT")
    })

    test("should handle server errors", async () => {
      // Mock a server error
      ;(generateText as jest.Mock).mockRejectedValue({
        status: 500,
        message: "Internal server error",
      })

      const result = await generateLlmResponseViaSdk("Test prompt")

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("SERVER_ERROR")
    })

    test("should handle unknown errors", async () => {
      // Mock an unknown error
      ;(generateText as jest.Mock).mockRejectedValue({
        message: "Something went wrong",
      })

      const result = await generateLlmResponseViaSdk("Test prompt")

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("UNKNOWN")
    })
  })

  describe("generateLlmJsonViaSdk", () => {
    test("should parse valid JSON response", async () => {
      // Mock the AI SDK response with valid JSON
      ;(generateText as jest.Mock).mockResolvedValue({ text: '{"key": "value"}' })

      const result = await generateLlmJsonViaSdk("Test prompt")

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ key: "value" })
    })

    test("should extract JSON from text with extra content", async () => {
      // Mock the AI SDK response with JSON embedded in text
      ;(generateText as jest.Mock).mockResolvedValue({
        text: 'Here is the JSON response: {"key": "value"} Hope this helps!',
      })

      const result = await generateLlmJsonViaSdk("Test prompt")

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ key: "value" })
    })

    test("should handle invalid JSON", async () => {
      // Mock the AI SDK response with invalid JSON
      ;(generateText as jest.Mock).mockResolvedValue({ text: "Not valid JSON" })

      const result = await generateLlmJsonViaSdk("Test prompt")

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe("PARSING")
      expect(result.data).toBeNull()
    })

    test("should add JSON instruction to system prompt", async () => {
      // Mock the AI SDK response
      ;(generateText as jest.Mock).mockResolvedValue({ text: '{"key": "value"}' })

      await generateLlmJsonViaSdk("Test prompt", {
        systemPrompt: "You are a helpful assistant",
      })

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: "You are a helpful assistant\nYou must respond with valid JSON only, no other text.",
        }),
      )
    })

    test("should use lower temperature for JSON generation", async () => {
      // Mock the AI SDK response
      ;(generateText as jest.Mock).mockResolvedValue({ text: '{"key": "value"}' })

      await generateLlmJsonViaSdk("Test prompt")

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.1,
        }),
      )
    })
  })
})
