import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getLanguageModelInstance, getEmbeddingModelInstance, resolveModelAlias } from "../providers"

// Mock the AI SDK provider creation functions
vi.mock("ai/openai", () => ({
  createOpenAI: vi.fn().mockReturnValue({ provider: "openai" }),
}))

vi.mock("ai/anthropic", () => ({
  createAnthropic: vi.fn().mockReturnValue({ provider: "anthropic" }),
}))

vi.mock("ai/google", () => ({
  createGoogleGenerativeAI: vi.fn().mockReturnValue({ provider: "google" }),
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

describe("AI SDK Providers", () => {
  // Save original env
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Set up mock API keys
    process.env.OPENAI_API_KEY = "test-openai-key"
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key"
    process.env.GOOGLE_API_KEY = "test-google-key"
  })

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  describe("getLanguageModelInstance", () => {
    it("should return an OpenAI model instance for OpenAI model IDs", () => {
      const model = getLanguageModelInstance("openai:gpt-4o")
      expect(model).toEqual({ provider: "openai" })
    })

    it("should return an Anthropic model instance for Anthropic model IDs", () => {
      const model = getLanguageModelInstance("anthropic:claude-3-opus")
      expect(model).toEqual({ provider: "anthropic" })
    })

    it("should return a Google model instance for Google model IDs", () => {
      const model = getLanguageModelInstance("google:gemini-1.5-pro")
      expect(model).toEqual({ provider: "google" })
    })

    it("should throw an error for unsupported providers", () => {
      expect(() => getLanguageModelInstance("unsupported:model")).toThrow()
    })

    it("should throw an error for invalid model ID format", () => {
      expect(() => getLanguageModelInstance("invalid-format")).toThrow()
    })

    it("should throw an error when API key is missing", () => {
      delete process.env.OPENAI_API_KEY
      expect(() => getLanguageModelInstance("openai:gpt-4o")).toThrow()
    })
  })

  describe("getEmbeddingModelInstance", () => {
    it("should return an OpenAI model instance for OpenAI embedding model IDs", () => {
      const model = getEmbeddingModelInstance("openai:text-embedding-3-small")
      expect(model).toEqual({ provider: "openai" })
    })

    it("should throw an error for unsupported embedding providers", () => {
      expect(() => getEmbeddingModelInstance("anthropic:embedding-model")).toThrow()
    })
  })

  describe("resolveModelAlias", () => {
    it("should resolve known aliases to their model IDs", () => {
      expect(resolveModelAlias("default-chat")).toBe("openai:gpt-4o")
      expect(resolveModelAlias("high-quality")).toBe("anthropic:claude-3-opus")
    })

    it("should return the original ID if it's not an alias", () => {
      expect(resolveModelAlias("openai:custom-model")).toBe("openai:custom-model")
    })
  })
})
