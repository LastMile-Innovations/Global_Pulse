export type EmbeddingModel = "text-embedding-3-small" | "text-embedding-3-large"

/**
 * Embedding vector type
 */
export type EmbeddingVector = number[]

/**
 * Vector search result type
 */
export interface VectorSearchResult {
  nodeId: string
  nodeType: string
  name?: string
  content?: string
  similarityScore: number
}
