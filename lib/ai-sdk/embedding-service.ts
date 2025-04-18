import { embed, embedMany } from "ai"
import { openai } from "@ai-sdk/openai"
import { logger } from "../utils/logger"
import type { EmbeddingVector } from "./types"
type EmbeddingModel = string;

/**
 * Service for generating and managing text embeddings
 */
export class EmbeddingService {
  private defaultModel: EmbeddingModel = "text-embedding-3-small"

  /**
   * Generate an embedding vector for a single text
   *
   * @param text The text to embed
   * @param modelName Optional model name override
   * @returns The embedding vector
   */
  async getEmbedding(text: string, modelName?: EmbeddingModel): Promise<EmbeddingVector> {
    try {
      const modelId = modelName || this.defaultModel
      const embeddingModel = openai.embedding(modelId);

      const embeddingResult = await embed({
        model: embeddingModel,
        value: text,
      })

      return embeddingResult.embedding
    } catch (error) {
      logger.error(`Error generating embedding: ${error}`)
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate embedding vectors for multiple texts
   *
   * @param texts Array of texts to embed
   * @param modelName Optional model name override
   * @returns Array of embedding vectors
   */
  async getEmbeddings(texts: string[], modelName?: EmbeddingModel): Promise<EmbeddingVector[]> {
    try {
      const modelId = modelName || this.defaultModel
      const embeddingModel = openai.embedding(modelId);

      const embeddingsResult = await embedMany({
        model: embeddingModel,
        values: texts,
      })

      return embeddingsResult.embeddings
    } catch (error) {
      logger.error(`Error generating multiple embeddings: ${error}`)
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   *
   * @param vec1 First embedding vector
   * @param vec2 Second embedding vector
   * @returns Similarity score between 0 and 1
   */
  calculateSimilarity(vec1: EmbeddingVector, vec2: EmbeddingVector): number {
    if (vec1.length !== vec2.length) {
      throw new Error("Embedding vectors must have the same dimensions")
    }

    // Calculate dot product
    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      mag1 += vec1[i] * vec1[i]
      mag2 += vec2[i] * vec2[i]
    }

    mag1 = Math.sqrt(mag1)
    mag2 = Math.sqrt(mag2)

    // Prevent division by zero
    if (mag1 === 0 || mag2 === 0) return 0

    // Cosine similarity
    return dotProduct / (mag1 * mag2)
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService()
