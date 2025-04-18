import { logger } from "../utils/logger"
import type {
  NlpFeatures,
  SentimentResult,
  Entity,
  AbstractConcept,
  SentimentLabel,
} from "../types/nlp-types"
import { extractKeywords } from "./keyword-extraction"
import { analyzeSentiment } from "../transformers/sentiment-service"
import { NerService } from "../ai-sdk/ner-service"
import { classifyConceptsZSC_LLM } from "../ai-sdk/zsc-service"
import { embeddingService } from "../ai-sdk/embedding-service"
import type { EmbeddingVector } from "../ai-sdk/types"

/**
 * Map sentiment label from the sentiment-service to the canonical SentimentLabel type.
 * Handles lowercase/uppercase and fallback.
 */
function normalizeSentimentLabel(label: string): SentimentLabel {
  switch (label.toLowerCase()) {
    case "positive":
      return "POSITIVE"
    case "negative":
      return "NEGATIVE"
    case "neutral":
      return "NEUTRAL"
    default:
      logger.warn(`Unknown sentiment label "${label}", defaulting to NEUTRAL`)
      return "NEUTRAL"
  }
}

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
        label: "NEUTRAL",
        score: 0.5,
      },
      entities: [],
      abstractConcepts: [],
      ...(options.includeEmbedding ? { embedding: undefined } : {}),
    }
  }

  let keywords: string[] = []
  let sentiment: SentimentResult = {
    label: "NEUTRAL",
    score: 0.5,
  }
  let entities: Entity[] = []
  let abstractConcepts: AbstractConcept[] = []
  let embedding: EmbeddingVector | undefined = undefined

  try {
    // Extract keywords
    try {
      keywords = extractKeywords(text)
    } catch (error) {
      logger.error(`Error extracting keywords: ${error}`)
      keywords = []
    }

    // Analyze sentiment
    try {
      const rawSentiment = await analyzeSentiment(text)
      sentiment = {
        label: normalizeSentimentLabel(rawSentiment.label),
        score: typeof rawSentiment.score === "number" ? rawSentiment.score : 0.5,
      }
    } catch (error) {
      logger.error(`Error analyzing sentiment: ${error}`)
      sentiment = {
        label: "NEUTRAL",
        score: 0.5,
      }
    }

    // Recognize entities using NerService class
    try {
      const nerService = new NerService()
      const entityResult = await nerService.recognizeEntities(text)
      if ("error" in entityResult) {
        logger.error(`Error recognizing entities: ${entityResult.error}`)
        entities = []
      } else {
        entities = entityResult.entities
      }
    } catch (error) {
      logger.error(`Error recognizing entities: ${error}`)
      entities = []
    }

    // Classify abstract concepts
    try {
      const conceptResult = await classifyConceptsZSC_LLM(text)
      if ("error" in conceptResult) {
        logger.error(`Error classifying concepts: ${conceptResult.error}`)
        abstractConcepts = []
      } else {
        abstractConcepts = conceptResult.concepts
      }
    } catch (error) {
      logger.error(`Error classifying concepts: ${error}`)
      abstractConcepts = []
    }

    // Generate embedding if requested
    if (options.includeEmbedding) {
      try {
        embedding = await embeddingService.getEmbedding(text)
        if (!embedding) {
          logger.warn(
            `Failed to generate embedding for text snippet: "${text.substring(0, 50)}..."`
          )
        }
      } catch (error) {
        logger.error(`Error generating embedding: ${error}`)
        embedding = undefined
      }
    }

    return {
      keywords,
      sentiment,
      entities,
      abstractConcepts,
      ...(options.includeEmbedding ? { embedding } : {}),
    }
  } catch (error) {
    logger.error(`Error extracting NLP features: ${error}`)

    // Return default values on error
    return {
      keywords: [],
      sentiment: {
        label: "NEUTRAL",
        score: 0.5,
      },
      entities: [],
      abstractConcepts: [],
      ...(options.includeEmbedding ? { embedding: undefined } : {}),
    }
  }
}
