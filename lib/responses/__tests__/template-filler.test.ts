import { getTemplatedResponse, type TemplateContextParams, type TemplateFillingOptions } from "../template-filler"
import { getRandomTemplate, getTemplateById, type ResponseTemplate } from "../templates"
import { generateLlmResponseViaSdk } from "../../llm/llm-gateway"

// Mock the LLM gateway
jest.mock("../../llm/llm-gateway", () => ({
  generateLlmResponseViaSdk: jest.fn(),
}))

// Mock the logger
jest.mock("../../utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe("Template Filler", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getTemplatedResponse", () => {
    it("should fill a template with direct context parameters", async () => {
      // Create a basic context
      const contextParams: TemplateContextParams = {
        userId: "user123",
        sessionId: "session456",
        user_message: "I'm feeling uncertain about my career path",
        topic_or_feeling: "your career direction",
      }

      // Mock successful template retrieval
      const mockTemplate: ResponseTemplate = {
        id: "test_template",
        template:
          "It's completely okay to feel unsure about {topic_or_feeling}. Uncertainty is a natural part of life.",
        parameters: [
          {
            name: "topic_or_feeling",
            required: true,
            defaultValue: "this",
          },
        ],
      }

      jest.spyOn(global.Math, "random").mockReturnValue(0.1) // Ensure consistent "random" selection
      jest.spyOn(global, "getRandomTemplate").mockReturnValue(mockTemplate)

      // Call the function
      const result = await getTemplatedResponse("validate_uncertainty", contextParams)

      // Verify the result
      expect(result).toBe(
        "It's completely okay to feel unsure about your career direction. Uncertainty is a natural part of life.",
      )
    })

    it("should use default values when parameters are missing", async () => {
      // Create a basic context without the required parameter
      const contextParams: TemplateContextParams = {
        userId: "user123",
        sessionId: "session456",
        user_message: "I'm feeling uncertain",
      }

      // Mock successful template retrieval
      const mockTemplate: ResponseTemplate = {
        id: "test_template",
        template:
          "It's completely okay to feel unsure about {topic_or_feeling}. Uncertainty is a natural part of life.",
        parameters: [
          {
            name: "topic_or_feeling",
            required: true,
            defaultValue: "things",
          },
        ],
      }

      jest.spyOn(global.Math, "random").mockReturnValue(0.1)
      jest.spyOn(global, "getRandomTemplate").mockReturnValue(mockTemplate)

      // Call the function
      const result = await getTemplatedResponse("validate_uncertainty", contextParams)

      // Verify the result
      expect(result).toBe("It's completely okay to feel unsure about things. Uncertainty is a natural part of life.")
    })

    it("should use LLM assistance when enabled", async () => {
      // Create a basic context
      const contextParams: TemplateContextParams = {
        userId: "user123",
        sessionId: "session456",
        user_message: "I'm feeling uncertain about my career path",
      }

      // Mock successful template retrieval
      const mockTemplate: ResponseTemplate = {
        id: "test_template",
        template:
          "It's completely okay to feel unsure about {topic_or_feeling}. Uncertainty is a natural part of life.",
        parameters: [
          {
            name: "topic_or_feeling",
            required: true,
            defaultValue: "things",
            useLlmAssistance: true,
            llmPrompt:
              "Based on the user's message '{user_message}', identify the specific topic or feeling they're uncertain about. Respond with just the topic or feeling, using no more than 3-4 words.",
          },
        ],
      }

      jest.spyOn(global.Math, "random").mockReturnValue(0.1)
      jest.spyOn(global, "getRandomTemplate").mockReturnValue(mockTemplate)

      // Mock successful LLM response
      const mockLlmResponse = {
        success: true,
        text: "career direction",
        error: null,
      }
      ;(generateLlmResponseViaSdk as jest.Mock).mockResolvedValue(mockLlmResponse)

      // Call the function with LLM assistance enabled
      const options: TemplateFillingOptions = {
        useLlmAssistance: true,
      }
      const result = await getTemplatedResponse("validate_uncertainty", contextParams, options)

      // Verify the result
      expect(result).toBe(
        "It's completely okay to feel unsure about career direction. Uncertainty is a natural part of life.",
      )
      expect(generateLlmResponseViaSdk).toHaveBeenCalled()
    })

    it("should fall back to default value when LLM assistance fails", async () => {
      // Create a basic context
      const contextParams: TemplateContextParams = {
        userId: "user123",
        sessionId: "session456",
        user_message: "I'm feeling uncertain",
      }

      // Mock successful template retrieval
      const mockTemplate: ResponseTemplate = {
        id: "test_template",
        template:
          "It's completely okay to feel unsure about {topic_or_feeling}. Uncertainty is a natural part of life.",
        parameters: [
          {
            name: "topic_or_feeling",
            required: true,
            defaultValue: "things",
            useLlmAssistance: true,
            llmPrompt:
              "Based on the user's message '{user_message}', identify the specific topic or feeling they're uncertain about. Respond with just the topic or feeling, using no more than 3-4 words.",
          },
        ],
      }

      jest.spyOn(global.Math, "random").mockReturnValue(0.1)
      jest.spyOn(global, "getRandomTemplate").mockReturnValue(mockTemplate)

      // Mock failed LLM response
      const mockLlmResponse = {
        success: false,
        text: null,
        error: "LLM service unavailable",
      }
      ;(generateLlmResponseViaSdk as jest.Mock).mockResolvedValue(mockLlmResponse)

      // Call the function with LLM assistance enabled
      const options: TemplateFillingOptions = {
        useLlmAssistance: true,
      }
      const result = await getTemplatedResponse("validate_uncertainty", contextParams, options)

      // Verify the result
      expect(result).toBe("It's completely okay to feel unsure about things. Uncertainty is a natural part of life.")
      expect(generateLlmResponseViaSdk).toHaveBeenCalled()
    })

    it("should use a specific template when templateId is provided", async () => {
      // Create a basic context
      const contextParams: TemplateContextParams = {
        userId: "user123",
        sessionId: "session456",
        user_message: "I'm feeling uncertain",
        topic_or_feeling: "the future",
      }

      // Mock successful template retrieval by ID
      const mockTemplate: ResponseTemplate = {
        id: "validate_uncertainty_2",
        template:
          "I notice you seem uncertain about {topic_or_feeling}. That's perfectly normal, and it's okay to sit with that uncertainty for a while.",
        parameters: [
          {
            name: "topic_or_feeling",
            required: true,
            defaultValue: "this",
          },
        ],
      }

      jest.spyOn(global, "getTemplateById").mockReturnValue(mockTemplate)

      // Call the function with specific templateId
      const options: TemplateFillingOptions = {
        templateId: "validate_uncertainty_2",
      }
      const result = await getTemplatedResponse("validate_uncertainty", contextParams, options)

      // Verify the result
      expect(result).toBe(
        "I notice you seem uncertain about the future. That's perfectly normal, and it's okay to sit with that uncertainty for a while.",
      )
      expect(getTemplateById).toHaveBeenCalledWith("validate_uncertainty_2")
    })

    it("should fall back to generic safe response when intent is invalid", async () => {
      // Create a basic context
      const contextParams: TemplateContextParams = {
        userId: "user123",
        sessionId: "session456",
        user_message: "Hello",
      }

      // Mock failed template retrieval for invalid intent
      jest.spyOn(global, "getRandomTemplate").mockImplementation((intentKey) => {
        if (intentKey === "invalid_intent") {
          return undefined
        }
        if (intentKey === "generic_safe_response") {
          return {
            id: "generic_safe_response_1",
            template: "I understand this is complex. Let's perhaps shift focus slightly.",
            parameters: [],
          }
        }
        return undefined
      })

      // Call the function with invalid intent
      const result = await getTemplatedResponse("invalid_intent", contextParams)

      // Verify the result
      expect(result).toBe("I understand this is complex. Let's perhaps shift focus slightly.")
      expect(getRandomTemplate).toHaveBeenCalledWith("invalid_intent")
      expect(getRandomTemplate).toHaveBeenCalledWith("generic_safe_response")
    })

    it("should handle critical errors and return hardcoded fallback", async () => {
      // Create a basic context
      const contextParams: TemplateContextParams = {
        userId: "user123",
        sessionId: "session456",
        user_message: "Hello",
      }

      // Mock catastrophic failure
      jest.spyOn(global, "getRandomTemplate").mockImplementation(() => {
        throw new Error("Catastrophic failure")
      })

      // Call the function
      const result = await getTemplatedResponse("any_intent", contextParams)

      // Verify the result
      expect(result).toBe("I understand. Let's continue our conversation.")
    })
  })
})
