import { logger } from "../utils/logger"
import type { NlpFeatures, SentimentResult, Entity, AbstractConcept, SentimentLabel } from "../types/nlp-types"
import { extractKeywords } from "./keyword-extraction"
import { classifySentiment } from "../transformers/sentiment-service"
import { recognizeEntitiesLLM } from "../ai-sdk/ner-service"
import { classifyConceptsZSC_LLM } from "../ai-sdk/zsc-service"
import { embeddingService } from "../ai-sdk/embedding-service"
import type { EmbeddingVector } from "../ai-sdk/types"

/**
 * Extract core NLP features from text
 * @param text The text to analyze
 * @param options Options for feature extraction
 * @returns NLP features
 */
export async function getCoreNlpFeatures(
  text: string,
  options: { includeEmbedding?: boolean } = {},
): Promise<NlpFeatures> {
  // Handle empty input
  if (!text.trim()) {
    return {
      keywords: [],
      sentiment: {
        label: "NEUTRAL" as SentimentLabel,
        score: 0.5,
      },
      entities: [],
      abstractConcepts: [],
    }
  }

  try {
    // Extract keywords
    let keywords: string[] = []
    try {
      keywords = extractKeywords(text)
    } catch (error) {
      logger.error(`Error extracting keywords: ${error}`)
    }

    // Analyze sentiment
    let sentiment: SentimentResult = {
      label: "NEUTRAL" as SentimentLabel,
      score: 0.5,
    }
    try {
      sentiment = await classifySentiment(text)
    } catch (error) {
      logger.error(`Error analyzing sentiment: ${error}`)
    }

    // Recognize entities
    let entities: Entity[] = []
    try {
      const entityResult = await recognizeEntitiesLLM(text)
      if (!entityResult.error) {
        entities = entityResult.entities
      }
    } catch (error) {
      logger.error(`Error recognizing entities: ${error}`)
    }

    // Classify abstract concepts
    let abstractConcepts: AbstractConcept[] = []
    try {
      const conceptResult = await classifyConceptsZSC_LLM(text)
      if (!conceptResult.error) {
        abstractConcepts = conceptResult.concepts
      }
    } catch (error) {
      logger.error(`Error classifying concepts: ${error}`)
    }

    // Generate embedding if requested
    let embedding: EmbeddingVector | undefined = undefined
    if (options.includeEmbedding) {
      try {
        embedding = await embeddingService.getEmbedding(text)
        if (!embedding) {
          logger.warn(`Failed to generate embedding for text snippet: "${text.substring(0, 50)}..."`)
        }
      } catch (error) {
        logger.error(`Error generating embedding: ${error}`)
      }
    }

    return {
      keywords,
      sentiment,
      entities,
      abstractConcepts,
      embedding,
    }
  } catch (error) {
    logger.error(`Error extracting NLP features: ${error}`)

    // Return default values on error
    return {
      keywords: [],
      sentiment: {
        label: "NEUTRAL" as SentimentLabel,
        score: 0.5,
      },
      entities: [],
      abstractConcepts: [],
    }
  }
}
