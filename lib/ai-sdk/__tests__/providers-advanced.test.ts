import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getLanguageModelInstance, getEmbeddingModelInstance, selectModelForTask } from "../providers"
import { createOpenAI } from "ai/openai"
import { createAnthropic } from "ai/anthropic"
import { wrapLanguageModel } from "ai"

// Mock the AI SDK functions
vi.mock("ai/openai", () => ({
  createOpenAI: vi.fn().mockReturnValue({ type: "openai-mock" }),
}))

vi.mock("ai/anthropic", () => ({
  createAnthropic: vi.fn().mockReturnValue({ type: "anthropic-mock" }),
}))

vi.mock("ai", () => ({
  wrapLanguageModel: vi.fn((model, middleware) => ({
    type: `wrapped-${model.type}`,
    middleware,
  })),
}))

// Mock environment variables
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe("Advanced Provider Management", () => {
  beforeEach(() => {
    // Set up environment variables for testing
    process.env.OPENAI_API_KEY = "test-openai-key"
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key"
    process.env.GOOGLE_API_KEY = "test-google-key"
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Clean up environment variables
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.GOOGLE_API_KEY
  })

  it("should resolve model aliases correctly", () => {
    // Test with an alias
    const model = getLanguageModelInstance("default-chat")
    expect(createOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o",
        apiKey: "test-openai-key",
      }),
    )
    expect(model).toBeDefined()

    // Test with a direct model ID
    getLanguageModelInstance("anthropic:claude-3-sonnet")
    expect(createAnthropic).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-3-sonnet",
        apiKey: "test-anthropic-key",
      }),
    )
  })

  it("should apply middleware when configured", () => {
    // Test with a model that has reasoning middleware
    const model = getLanguageModelInstance("reasoning")
    expect(wrapLanguageModel).toHaveBeenCalledTimes(2) // Once for reasoning, once for logging
    expect(model).toHaveProperty("type", "wrapped-anthropic-mock")
  })

  it("should select the appropriate model for different tasks", () => {
    // Test model selection for different tasks
    expect(selectModelForTask("chat")).toBe("default-chat")
    expect(selectModelForTask("chat", { quality: "high" })).toBe("high-quality")
    expect(selectModelForTask("chat", { latencySensitive: true })).toBe("default-chat-mini")
    expect(selectModelForTask("structured")).toBe("structured-output")
    expect(selectModelForTask("embedding", { quality: "high" })).toBe("high-quality-embedding")
    expect(selectModelForTask("reasoning")).toBe("reasoning")
    expect(selectModelForTask("creative")).toBe("creative-writing")
  })

  it("should handle embedding models correctly", () => {
    const embeddingModel = getEmbeddingModelInstance("default-embedding")
    expect(createOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "text-embedding-3-small",
        apiKey: "test-openai-key",
      }),
    )
    expect(embeddingModel).toBeDefined()
  })
})
