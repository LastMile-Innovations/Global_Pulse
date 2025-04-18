import { describe, it, expect, vi, beforeEach } from "vitest"
import { callGenerateText, callGenerateJson } from "../gateway"
import * as providers from "../providers"

// Mock the AI SDK functions
vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({ text: "Generated text" }),
  streamText: vi.fn().mockResolvedValue({ stream: {} }),
}))

// Mock the providers module
vi.mock("../providers", () => ({
  getLanguageModelInstance: vi.fn().mockReturnValue({ provider: "openai" }),
}))

// Mock the logger
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

import { generateText } from "ai"

describe("AI SDK Gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("callGenerateText", () => {
    it("should call generateText with the correct parameters", async () => {
      const result = await callGenerateText("openai:gpt-4o", "Test prompt", {
        system: "You are a helpful assistant",
        temperature: 0.5,
      })

      expect(providers.getLanguageModelInstance).toHaveBeenCalledWith("openai:gpt-4o")
      expect(generateText).toHaveBeenCalledWith({
        model: { provider: "openai" },
        prompt: "Test prompt",
        system: "You are a helpful assistant",
        temperature: 0.5,
        maxTokens: 1000, // Default value
      })

      expect(result).toEqual({
        success: true,
        data: "Generated text",
        modelUsed: "openai:gpt-4o",
      })
    })

    it("should handle errors gracefully", async () => {
      // Mock generateText to throw an error
      vi.mocked(generateText).mockRejectedValueOnce(new Error("API error"))

      const result = await callGenerateText("openai:gpt-4o", "Test prompt")

      expect(result).toEqual({
        success: false,
        error: "An unknown error occurred",
        errorCode: "UNKNOWN",
        modelUsed: "openai:gpt-4o",
      })
    })
  })

  describe("callGenerateJson", () => {
    it("should parse JSON responses correctly", async () => {
      // Mock generateText to return a JSON string
      vi.mocked(generateText).mockResolvedValueOnce({ text: '{"key": "value"}' })

      const result = await callGenerateJson("openai:gpt-4o", "Test prompt")

      expect(result).toEqual({
        success: true,
        data: { key: "value" },
        modelUsed: "openai:gpt-4o",
      })
    })

    it("should handle JSON parsing errors", async () => {
      // Mock generateText to return an invalid JSON string
      vi.mocked(generateText).mockResolvedValueOnce({ text: "Not a JSON" })

      const result = await callGenerateJson("openai:gpt-4o", "Test prompt")

      expect(result).toEqual({
        success: false,
        error: "Failed to parse JSON response",
        errorCode: "PARSING",
        modelUsed: "openai:gpt-4o",
        data: null,
      })
    })
  })
})
