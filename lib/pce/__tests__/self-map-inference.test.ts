import { describe, it, expect, vi, beforeEach } from "vitest"
import { inferSelfMapAttachments, updateSelfMapWithInferences } from "../self-map-inference"
import { getCoreNlpFeatures } from "../../nlp/nlp-features"
import { classifyConceptsZSC_LLM } from "../../ai-sdk/zsc-service"
import { recognizeEntitiesLLM } from "../../ai-sdk/ner-service"
import { callGenerateObject } from "../../ai-sdk/gateway"
import type { NlpFeatures } from "../../types/nlp-types"
import type { InferredAttachment } from "../../types/pce-types"

// Mock dependencies
vi.mock("../../nlp/nlp-features")
vi.mock("../../ai-sdk/zsc-service")
vi.mock("../../ai-sdk/ner-service")
vi.mock("../../ai-sdk/embedding-service")
vi.mock("../../ai-sdk/gateway")
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe("Self-Map Inference", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Sample NLP features for testing
  const sampleNlpFeatures: NlpFeatures = {
    keywords: ["family", "career", "balance", "important"],
    sentiment: {
      label: "POSITIVE",
      score: 0.75,
    },
    entities: [
      {
        text: "Google",
        type: "ORGANIZATION",
        start: 10,
        end: 16,
        score: 0.9,
      },
    ],
    abstractConcepts: [
      {
        text: "work-life balance",
        type: "VALUE",
        score: 0.85,
      },
    ],
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
  }

  // Sample LLM response
  const sampleLlmResponse: InferredAttachment[] = [
    {
      name: "Work-Life Balance",
      type: "VALUE",
      estimatedPL: 8,
      estimatedV: 9,
      certainty: 0.9,
      sourceText: "I really value having a good balance between my work and personal life",
      inferenceMethod: "LLM",
    },
    {
      name: "Career Success",
      type: "GOAL",
      estimatedPL: 7,
      estimatedV: 8,
      certainty: 0.85,
      sourceText: "I want to advance in my career at Google",
      inferenceMethod: "LLM",
    },
  ]

  describe("inferSelfMapAttachments", () => {
    it("should infer attachments from text using provided NLP features", async () => {
      // Mock ZSC service
      vi.mocked(classifyConceptsZSC_LLM).mockResolvedValue({
        concepts: [
          {
            text: "work-life balance",
            type: "VALUE",
            score: 0.85,
          },
        ],
      })

      // Mock NER service
      vi.mocked(recognizeEntitiesLLM).mockResolvedValue({
        entities: [
          {
            text: "Google",
            type: "ORGANIZATION",
            start: 10,
            end: 16,
            score: 0.9,
          },
        ],
      })

      // Mock LLM call
      vi.mocked(callGenerateObject).mockResolvedValue({
        success: true,
        data: sampleLlmResponse,
        modelUsed: "structured-output",
      })

      const text =
        "I really value having a good balance between my work and personal life. I want to advance in my career at Google."

      const result = await inferSelfMapAttachments(text, sampleNlpFeatures)

      // Verify the result
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe("Work-Life Balance")
      expect(result[0].type).toBe("VALUE")
      expect(result[1].name).toBe("Career Success")
      expect(result[1].type).toBe("GOAL")

      // Verify that callGenerateObject was called
      expect(callGenerateObject).toHaveBeenCalledTimes(1)
    })

    it("should get NLP features if not provided", async () => {
      // Mock getCoreNlpFeatures
      vi.mocked(getCoreNlpFeatures).mockResolvedValue(sampleNlpFeatures)

      // Mock ZSC service
      vi.mocked(classifyConceptsZSC_LLM).mockResolvedValue({
        concepts: [
          {
            text: "work-life balance",
            type: "VALUE",
            score: 0.85,
          },
        ],
      })

      // Mock LLM call
      vi.mocked(callGenerateObject).mockResolvedValue({
        success: true,
        data: sampleLlmResponse,
        modelUsed: "structured-output",
      })

      const text = "I really value having a good balance between my work and personal life."

      const result = await inferSelfMapAttachments(text)

      // Verify that getCoreNlpFeatures was called
      expect(getCoreNlpFeatures).toHaveBeenCalledTimes(1)
      expect(getCoreNlpFeatures).toHaveBeenCalledWith(text, { includeEmbedding: true })

      // Verify the result
      expect(result).toHaveLength(2)
    })

    it("should handle LLM failure gracefully", async () => {
      // Mock ZSC service
      vi.mocked(classifyConceptsZSC_LLM).mockResolvedValue({
        concepts: [
          {
            text: "work-life balance",
            type: "VALUE",
            score: 0.85,
          },
        ],
      })

      // Mock NER service
      vi.mocked(recognizeEntitiesLLM).mockResolvedValue({
        entities: [
          {
            text: "Google",
            type: "ORGANIZATION",
            start: 10,
            end: 16,
            score: 0.9,
          },
        ],
      })

      // Mock LLM call - simulate failure
      vi.mocked(callGenerateObject).mockResolvedValue({
        success: false,
        error: "LLM processing failed",
        errorCode: "SERVER_ERROR",
        modelUsed: "structured-output",
      })

      const text = "I want to advance in my career at Google."

      const result = await inferSelfMapAttachments(text, sampleNlpFeatures)

      // Verify that we fall back to raw candidates
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].inferenceMethod).not.toBe("LLM")
    })

    it("should filter results by certainty threshold", async () => {
      // Mock ZSC service
      vi.mocked(classifyConceptsZSC_LLM).mockResolvedValue({
        concepts: [
          {
            text: "work-life balance",
            type: "VALUE",
            score: 0.85,
          },
          {
            text: "low certainty concept",
            type: "CONCEPT",
            score: 0.2, // Below default threshold
          },
        ],
      })

      // Mock LLM call
      vi.mocked(callGenerateObject).mockResolvedValue({
        success: true,
        data: [
          ...sampleLlmResponse,
          {
            name: "Low Certainty Attachment",
            type: "CONCEPT",
            estimatedPL: 3,
            estimatedV: 0,
            certainty: 0.2, // Below default threshold
            inferenceMethod: "LLM",
          },
        ],
        modelUsed: "structured-output",
      })

      const text = "Some text with mixed certainty concepts."

      const result = await inferSelfMapAttachments(text, sampleNlpFeatures)

      // Verify that low certainty results are filtered out
      expect(result).toHaveLength(2) // Only the high certainty ones
      expect(result.every((a) => a.certainty >= 0.3)).toBe(true)
    })
  })

  describe("updateSelfMapWithInferences", () => {
    it("should update the self-map with inferred attachments", async () => {
      const userId = "user123"
      const attachments = sampleLlmResponse

      const result = await updateSelfMapWithInferences(userId, attachments)

      // For now, this is just a placeholder that returns true
      expect(result).toBe(true)
    })
  })
})
