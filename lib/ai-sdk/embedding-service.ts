import { embed, embedMany } from "ai"
import { openai } from "@ai-sdk/openai"
import { logger } from "../utils/logger"
import type { EmbeddingModel, EmbeddingVector } from "./types"

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
      const model = modelName || this.defaultModel
      const provider = this.getEmbeddingProvider(model)

      const { embeddings } = await embed({
        model: provider,
        input: text,
      })

      return embeddings
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
      const model = modelName || this.defaultModel
      const provider = this.getEmbeddingProvider(model)

      const { embeddings } = await embedMany({
        model: provider,
        inputs: texts,
      })

      return embeddings
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

  /**
   * Get the embedding provider instance for the specified model
   *
   * @param modelName The embedding model name
   * @returns The provider instance
   */
  private getEmbeddingProvider(modelName: EmbeddingModel) {
    // For now, we're using OpenAI models directly
    // In the future, this could use the provider registry from Epic 2.01
    switch (modelName) {
      case "text-embedding-3-small":
        return openai("text-embedding-3-small")
      case "text-embedding-3-large":
        return openai("text-embedding-3-large")
      default:
        return openai("text-embedding-3-small")
    }
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService()
