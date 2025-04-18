import { generateLlmJson } from "./llm-interaction"
import { logger } from "../utils/logger"
import type { Entity, EntityType, EntityRecognitionResult, EntityRecognitionError } from "../types/nlp-types"

// Default empty entities array for fallbacks
const DEFAULT_ENTITIES: Entity[] = []

/**
 * Prompt template for named entity recognition
 */
const NER_PROMPT_TEMPLATE = `
Extract all named entities from the following text. Identify entities like PERSON, LOCATION, ORGANIZATION, DATE, TIME, MONEY, PERCENT, PRODUCT, EVENT, WORK_OF_ART, LAW, and LANGUAGE.

For each entity, provide:
1. The exact text of the entity
2. The entity type (one of: PERSON, LOCATION, ORGANIZATION, DATE, TIME, MONEY, PERCENT, PRODUCT, EVENT, WORK_OF_ART, LAW, LANGUAGE, OTHER)
3. The start and end character positions in the text (0-indexed)
4. A confidence score between 0 and 1

Text to analyze:
"""
{text}
"""

Respond with a JSON array of entities. Example format:
[
  {
    "text": "John Smith",
    "type": "PERSON",
    "start": 10,
    "end": 20,
    "score": 0.95
  }
]

If no entities are found, return an empty array: []
`

/**
 * Service for recognizing named entities using LLM
 */
export class NerService {
  /**
   * Recognizes named entities in the provided text using LLM
   *
   * @param text The text to analyze for entities
   * @returns A promise resolving to an EntityRecognitionResult or EntityRecognitionError
   */
  async recognizeEntities(text: string): Promise<EntityRecognitionResult | EntityRecognitionError> {
    try {
      // Handle empty or invalid input
      if (!text || typeof text !== "string" || text.trim() === "") {
        return { entities: DEFAULT_ENTITIES }
      }

      // Prepare the prompt
      const prompt = NER_PROMPT_TEMPLATE.replace("{text}", text)

      // Call the LLM
      const result = await generateLlmJson<Entity[]>(prompt, {
        system: "You are an expert in named entity recognition. Extract entities precisely and accurately.",
        temperature: 0.1,
      })

      // Defensive: If result is null or undefined, treat as error
      if (result == null) {
        logger.warn("LLM interaction returned null result")
        return {
          error: "LLM interaction failed",
          entities: DEFAULT_ENTITIES,
        }
      }

      // If the result is an array (success), validate and return entities
      if (Array.isArray(result)) {
        const validEntities = result.map(this.validateEntity).filter(Boolean) as Entity[]
        return { entities: validEntities }
      }

      // If the result is an object with error info (failure), handle accordingly
      if (typeof result === "object" && result !== null) {
        // Try to extract error message if present
        const errorMsg =
          (result as any).error ||
          (typeof (result as any).message === "string" ? (result as any).message : undefined) ||
          "Failed to extract entities from text"
        logger.warn(`LLM interaction failed or returned error: ${errorMsg}`)
        return {
          error: errorMsg,
          entities: DEFAULT_ENTITIES,
        }
      }

      // Fallback: unexpected result type
      logger.warn("LLM interaction returned unexpected result type")
      return {
        error: "Unexpected LLM result type",
        entities: DEFAULT_ENTITIES,
      }
    } catch (error) {
      logger.error(`Error in entity recognition: ${error}`)
      return {
        error: `Entity recognition failed: ${error}`,
        entities: DEFAULT_ENTITIES,
      }
    }
  }

  /**
   * Validates and normalizes entity types
   */
  private validateEntityType(type: string): EntityType {
    const validTypes: EntityType[] = [
      "PERSON",
      "LOCATION",
      "ORGANIZATION",
      "DATE",
      "TIME",
      "MONEY",
      "PERCENT",
      "PRODUCT",
      "EVENT",
      "WORK_OF_ART",
      "LAW",
      "LANGUAGE",
      "OTHER",
    ]

    const normalizedType = type.toUpperCase() as EntityType
    return validTypes.includes(normalizedType) ? normalizedType : "OTHER"
  }

  /**
   * Validates entity objects returned from the LLM
   */
  private validateEntity(entity: any): Entity | null {
    try {
      if (!entity || typeof entity !== "object") return null

      // Check required fields
      if (typeof entity.text !== "string" || entity.text.trim() === "") return null
      if (typeof entity.type !== "string") return null
      if (typeof entity.start !== "number" || entity.start < 0) return null
      if (typeof entity.end !== "number" || entity.end <= entity.start) return null

      // Normalize the entity type using the class method
      const type = this.validateEntityType(entity.type)

      // Normalize the score (default to 1 if not provided or invalid)
      const score = typeof entity.score === "number" && entity.score >= 0 && entity.score <= 1 ? entity.score : 1

      return {
        text: entity.text,
        type,
        start: entity.start,
        end: entity.end,
        score,
      }
    } catch (error) {
      logger.error(`Error validating entity: ${error}`)
      return null
    }
  }
}
