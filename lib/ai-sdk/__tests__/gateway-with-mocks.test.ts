import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { MockLanguageModelV1 } from "ai/test"
import { callGenerateText, callGenerateObject } from "../gateway"
import * as providers from "../providers"

// Mock the getLanguageModelInstance function
vi.mock("../providers", () => ({
  getLanguageModelInstance: vi.fn(),
  getModelConfig: vi.fn(() => ({
    modelId: "openai:gpt-4o",
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
  })),
}))

describe("AI SDK Gateway with Mocks", () => {
  let mockModel: MockLanguageModelV1

  beforeEach(() => {
    // Create a new mock model for each test
    mockModel = new MockLanguageModelV1({
      // Configure the mock model behavior
      generateText: {
        responseText: "This is a mocked response from the AI model.",
        usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 },
        finishReason: "stop",
      },
      generateObject: {
        responseObject: { message: "This is a mocked object response." },
      },
    })

    // Set the mock model as the return value for getLanguageModelInstance
    vi.mocked(providers.getLanguageModelInstance).mockReturnValue(mockModel)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should successfully call generateText with the mock model", async () => {
    // Call the gateway function
    const result = await callGenerateText("default-chat", "Test prompt", {
      telemetry: {
        functionId: "test.generate_text",
        metadata: { testId: "123" },
      },
    })

    // Verify the result
    expect(result.success).toBe(true)
    expect(result.data).toBe("This is a mocked response from the AI model.")

    // Verify the mock was called with the correct parameters
    expect(mockModel.generateText).toHaveBeenCalledTimes(1)
    expect(mockModel.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Test prompt",
        temperature: 0.7,
        maxTokens: 2000,
        experimental_telemetry: expect.objectContaining({
          functionId: "test.generate_text",
          metadata: { testId: "123" },
        }),
      }),
    )
  })

  it("should handle errors from the mock model", async () => {
    // Configure the mock to throw an error
    mockModel.generateText.mockRejectedValueOnce(new Error("Mock API error"))

    // Call the gateway function
    const result = await callGenerateText("default-chat", "Test prompt")

    // Verify the error handling
    expect(result.success).toBe(false)
    expect(result.error).toBe("An unknown error occurred")
    expect(result.errorCode).toBe("UNKNOWN")
  })

  it("should successfully call generateObject with the mock model", async () => {
    // Define a simple Zod schema
    const schema = {
      parse: vi.fn().mockReturnValue({ message: "This is a mocked object response." }),
    }

    // Call the gateway function
    const result = await callGenerateObject("structured-output", "Test prompt", schema as any, {
      telemetry: {
        functionId: "test.generate_object",
        metadata: { testId: "456" },
      },
    })

    // Verify the result
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ message: "This is a mocked object response." })

    // Verify the mock was called with the correct parameters
    expect(mockModel.generateObject).toHaveBeenCalledTimes(1)
    expect(mockModel.generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Test prompt",
        schema,
        experimental_telemetry: expect.objectContaining({
          functionId: "test.generate_object",
          metadata: { testId: "456" },
        }),
      }),
    )
  })
})
