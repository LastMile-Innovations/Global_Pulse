import { getCoreNlpFeatures } from "../nlp-features"
import { extractKeywords } from "../keyword-extraction"
import { classifySentiment } from "../../transformers/sentiment-service"
import { recognizeEntitiesLLM } from "../../ai-sdk/ner-service"
import { classifyConceptsZSC_LLM } from "../../ai-sdk/zsc-service"
import { embeddingService } from "../../ai-sdk/embedding-service"

// Mock the dependencies
jest.mock("../keyword-extraction")
jest.mock("../../transformers/sentiment-service")
jest.mock("../../ai-sdk/ner-service")
jest.mock("../../ai-sdk/zsc-service")
jest.mock("../../ai-sdk/embedding-service")

describe("getCoreNlpFeatures", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks()

    // Setup default mock implementations
    ;(extractKeywords as jest.Mock).mockReturnValue(["keyword1", "keyword2"])
    ;(classifySentiment as jest.Mock).mockResolvedValue({
      label: "POSITIVE",
      score: 0.8,
    })
    ;(recognizeEntitiesLLM as jest.Mock).mockResolvedValue({
      entities: [
        {
          text: "John Doe",
          type: "PERSON",
          score: 0.95,
          start: 0,
          end: 8,
        },
      ],
    })
    ;(classifyConceptsZSC_LLM as jest.Mock).mockResolvedValue({
      concepts: [
        {
          text: "I want to succeed",
          type: "GOAL",
          score: 0.9,
        },
      ],
    })
    ;(embeddingService.getEmbedding as jest.Mock).mockResolvedValue([0.1, 0.2, 0.3, 0.4])
  })

  test("should return complete NLP features for valid input", async () => {
    const result = await getCoreNlpFeatures("This is a test")

    expect(result).toEqual({
      keywords: ["keyword1", "keyword2"],
      sentiment: {
        label: "POSITIVE",
        score: 0.8,
      },
      entities: [
        {
          text: "John Doe",
          type: "PERSON",
          score: 0.95,
          start: 0,
          end: 8,
        },
      ],
      abstractConcepts: [
        {
          text: "I want to succeed",
          type: "GOAL",
          score: 0.9,
        },
      ],
    })

    expect(extractKeywords).toHaveBeenCalledWith("This is a test")
    expect(classifySentiment).toHaveBeenCalledWith("This is a test")
    expect(recognizeEntitiesLLM).toHaveBeenCalledWith("This is a test")
    expect(classifyConceptsZSC_LLM).toHaveBeenCalledWith("This is a test")
    expect(embeddingService.getEmbedding).not.toHaveBeenCalled()
  })

  test("should include embeddings when includeEmbedding option is true", async () => {
    const result = await getCoreNlpFeatures("This is a test", { includeEmbedding: true })

    expect(result).toEqual({
      keywords: ["keyword1", "keyword2"],
      sentiment: {
        label: "POSITIVE",
        score: 0.8,
      },
      entities: [
        {
          text: "John Doe",
          type: "PERSON",
          score: 0.95,
          start: 0,
          end: 8,
        },
      ],
      abstractConcepts: [
        {
          text: "I want to succeed",
          type: "GOAL",
          score: 0.9,
        },
      ],
      embedding: [0.1, 0.2, 0.3, 0.4],
    })

    expect(embeddingService.getEmbedding).toHaveBeenCalledWith("This is a test")
  })

  test("should handle empty input", async () => {
    const result = await getCoreNlpFeatures("")

    expect(result).toEqual({
      keywords: [],
      sentiment: {
        label: "NEUTRAL",
        score: 0.5,
      },
      entities: [],
      abstractConcepts: [],
    })

    // The underlying functions should not be called for empty input
    expect(extractKeywords).not.toHaveBeenCalled()
    expect(classifySentiment).not.toHaveBeenCalled()
    expect(recognizeEntitiesLLM).not.toHaveBeenCalled()
    expect(classifyConceptsZSC_LLM).not.toHaveBeenCalled()
    expect(embeddingService.getEmbedding).not.toHaveBeenCalled()
  })

  test("should handle errors in individual components", async () => {
    // Mock errors in different components
    ;(extractKeywords as jest.Mock).mockImplementation(() => {
      throw new Error("Keyword extraction error")
    })
    ;(classifySentiment as jest.Mock).mockRejectedValue(new Error("Sentiment analysis error"))
    ;(recognizeEntitiesLLM as jest.Mock).mockResolvedValue({
      error: "Entity recognition failed",
      entities: [],
    })
    ;(classifyConceptsZSC_LLM as jest.Mock).mockRejectedValue(new Error("Concept classification error"))
    ;(embeddingService.getEmbedding as jest.Mock).mockRejectedValue(new Error("Embedding generation error"))

    const result = await getCoreNlpFeatures("This is a test", { includeEmbedding: true })

    // Should return default values for all components that failed
    expect(result).toEqual({
      keywords: [],
      sentiment: {
        label: "NEUTRAL",
        score: 0.5,
      },
      entities: [],
      abstractConcepts: [],
      embedding: undefined,
    })

    // All functions should still be called
    expect(extractKeywords).toHaveBeenCalledWith("This is a test")
    expect(classifySentiment).toHaveBeenCalledWith("This is a test")
    expect(recognizeEntitiesLLM).toHaveBeenCalledWith("This is a test")
    expect(classifyConceptsZSC_LLM).toHaveBeenCalledWith("This is a test")
    expect(embeddingService.getEmbedding).toHaveBeenCalledWith("This is a test")
  })

  test("should handle partial failures", async () => {
    // Mock a failure in just one component
    ;(recognizeEntitiesLLM as jest.Mock).mockRejectedValue(new Error("Entity recognition error"))
    ;(embeddingService.getEmbedding as jest.Mock).mockResolvedValue(null)

    const result = await getCoreNlpFeatures("This is a test", { includeEmbedding: true })

    // Should return valid results for components that succeeded and default for the failed one
    expect(result).toEqual({
      keywords: ["keyword1", "keyword2"],
      sentiment: {
        label: "POSITIVE",
        score: 0.8,
      },
      entities: [], // Default value due to failure
      abstractConcepts: [
        {
          text: "I want to succeed",
          type: "GOAL",
          score: 0.9,
        },
      ],
      embedding: undefined, // Null was returned from the service
    })
  })
})
