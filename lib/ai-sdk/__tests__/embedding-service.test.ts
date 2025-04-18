import { describe, it, expect, vi, beforeEach } from "vitest"
import { EmbeddingService } from "../embedding-service"
import { embed, embedMany } from "ai"

// Mock the AI SDK functions
vi.mock("ai", () => ({
  embed: vi.fn(),
  embedMany: vi.fn(),
}))

// Mock the logger
vi.mock("../../utils/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe("EmbeddingService", () => {
  let embeddingService: EmbeddingService

  beforeEach(() => {
    embeddingService = new EmbeddingService()
    vi.clearAllMocks()
  })

  describe("getEmbedding", () => {
    it("should generate an embedding for a single text", async () => {
      // Mock the embed function to return a sample embedding
      const mockEmbedding = [0.1, 0.2, 0.3]
      vi.mocked(embed).mockResolvedValue({ embeddings: mockEmbedding })

      // Call the service
      const result = await embeddingService.getEmbedding("test text")

      // Verify the result
      expect(result).toEqual(mockEmbedding)
      expect(embed).toHaveBeenCalledTimes(1)
    })

    it("should handle errors when generating embeddings", async () => {
      // Mock the embed function to throw an error
      vi.mocked(embed).mockRejectedValue(new Error("API error"))

      // Call the service and expect it to throw
      await expect(embeddingService.getEmbedding("test text")).rejects.toThrow("Failed to generate embedding")
    })
  })

  describe("getEmbeddings", () => {
    it("should generate embeddings for multiple texts", async () => {
      // Mock the embedMany function to return sample embeddings
      const mockEmbeddings = [
        [0.1, 0.2],
        [0.3, 0.4],
      ]
      vi.mocked(embedMany).mockResolvedValue({ embeddings: mockEmbeddings })

      // Call the service
      const result = await embeddingService.getEmbeddings(["text1", "text2"])

      // Verify the result
      expect(result).toEqual(mockEmbeddings)
      expect(embedMany).toHaveBeenCalledTimes(1)
    })

    it("should handle errors when generating multiple embeddings", async () => {
      // Mock the embedMany function to throw an error
      vi.mocked(embedMany).mockRejectedValue(new Error("API error"))

      // Call the service and expect it to throw
      await expect(embeddingService.getEmbeddings(["text1", "text2"])).rejects.toThrow("Failed to generate embeddings")
    })
  })

  describe("calculateSimilarity", () => {
    it("should calculate cosine similarity between two vectors", () => {
      const vec1 = [1, 0, 0]
      const vec2 = [0, 1, 0]
      const vec3 = [1, 0, 0]

      // Orthogonal vectors should have similarity 0
      expect(embeddingService.calculateSimilarity(vec1, vec2)).toEqual(0)

      // Identical vectors should have similarity 1
      expect(embeddingService.calculateSimilarity(vec1, vec3)).toEqual(1)

      // Test with non-trivial vectors
      const vec4 = [1, 2, 3]
      const vec5 = [4, 5, 6]
      const similarity = embeddingService.calculateSimilarity(vec4, vec5)
      expect(similarity).toBeGreaterThan(0.9) // Should be close to 1
    })

    it("should throw an error if vectors have different dimensions", () => {
      const vec1 = [1, 2, 3]
      const vec2 = [1, 2]

      expect(() => embeddingService.calculateSimilarity(vec1, vec2)).toThrow(
        "Embedding vectors must have the same dimensions",
      )
    })
  })
})
