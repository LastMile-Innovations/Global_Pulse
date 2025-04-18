import { generateLlmJson } from "./llm-interaction"
import { logger } from "../lib/utils/logger"
import type { Entity, EntityType, EntityRecognitionResult, EntityRecognitionError } from "../lib/types/nlp-types"

// Default empty entities array for fallbacks
const DEFAULT_ENTITIES: Entity[] = []

/**
 * Prompt template for named entity recognition (MVP production: clear, robust, and explicit)
 */
const NER_PROMPT_TEMPLATE = `
You are a professional named entity recognition (NER) system. Extract all named entities from the following text. 
Recognize entities of these types: PERSON, LOCATION, ORGANIZATION, DATE, TIME, MONEY, PERCENT, PRODUCT, EVENT, WORK_OF_ART, LAW, LANGUAGE, OTHER.

For each entity, provide:
- "text": the exact substring of the entity as it appears in the text
- "type": one of the allowed types above (use "OTHER" if none fit)
- "start": the 0-based character index where the entity starts in the text
- "end": the 0-based character index where the entity ends (exclusive)
- "score": a confidence score between 0 and 1

Text to analyze:
"""
{text}
"""

Respond ONLY with a JSON array of entities, no extra text. Example:
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
 * Service for recognizing named entities using LLM (MVP production: robust, logs, defensive)
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
      // Defensive: Handle empty or invalid input
      if (!text || typeof text !== "string" || text.trim() === "") {
        logger.warn("NER called with empty or invalid text input")
        return { entities: DEFAULT_ENTITIES }
      }

      // Prepare the prompt
      const prompt = NER_PROMPT_TEMPLATE.replace("{text}", text)

      // Call the LLM (MVP: low temperature, explicit system prompt)
      const result = await generateLlmJson<Entity[]>(prompt, {
        system: "You are an expert in named entity recognition. Extract entities precisely and accurately. Only output valid JSON.",
        temperature: 0.1,
        // Optionally: add maxTokens, stopSequences, etc. for production
      })

      // Defensive: If result is null or undefined, treat as error
      if (result == null) {
        logger.warn("LLM NER returned null or undefined result")
        return {
          error: "LLM interaction failed",
          entities: DEFAULT_ENTITIES,
        }
      }

      // If the result is an array (success), validate and return entities
      if (Array.isArray(result)) {
        // Defensive: log if array is empty
        if (result.length === 0) {
          logger.info("NER: No entities found in text")
        }
        const validEntities = result
          .map((entity, idx) => this.validateEntity(entity, text, idx))
          .filter(Boolean) as Entity[]
        return { entities: validEntities }
      }

      // If the result is an object with error info (failure), handle accordingly
      if (typeof result === "object" && result !== null) {
        // Try to extract error message if present
        const errorMsg =
          (result as any).error ||
          (typeof (result as any).message === "string" ? (result as any).message : undefined) ||
          "Failed to extract entities from text"
        logger.warn(`LLM NER failed or returned error: ${errorMsg}`)
        return {
          error: errorMsg,
          entities: DEFAULT_ENTITIES,
        }
      }

      // Fallback: unexpected result type
      logger.warn("LLM NER returned unexpected result type")
      return {
        error: "Unexpected LLM result type",
        entities: DEFAULT_ENTITIES,
      }
    } catch (error: any) {
      logger.error(`Error in entity recognition: ${error?.message || error}`)
      return {
        error: `Entity recognition failed: ${error instanceof Error ? error.message : String(error)}`,
        entities: DEFAULT_ENTITIES,
      }
    }
  }

  /**
   * Validates and normalizes entity types (MVP: robust, extensible)
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
    if (!type || typeof type !== "string") return "OTHER"
    const normalizedType = type.trim().toUpperCase() as EntityType
    return validTypes.includes(normalizedType) ? normalizedType : "OTHER"
  }

  /**
   * Validates entity objects returned from the LLM (MVP: robust, logs, defensive)
   * Optionally checks that start/end indices are within text bounds.
   */
  private validateEntity(entity: any, text: string, idx: number): Entity | null {
    try {
      if (!entity || typeof entity !== "object") {
        logger.warn(`NER: Entity at index ${idx} is not an object`)
        return null
      }

      // Check required fields
      if (typeof entity.text !== "string" || entity.text.trim() === "") {
        logger.warn(`NER: Entity at index ${idx} missing or empty 'text'`)
        return null
      }
      if (typeof entity.type !== "string") {
        logger.warn(`NER: Entity at index ${idx} missing 'type'`)
        return null
      }
      if (typeof entity.start !== "number" || entity.start < 0) {
        logger.warn(`NER: Entity at index ${idx} has invalid 'start'`)
        return null
      }
      if (typeof entity.end !== "number" || entity.end <= entity.start) {
        logger.warn(`NER: Entity at index ${idx} has invalid 'end'`)
        return null
      }

      // Optionally: check that start/end are within text bounds
      if (entity.start >= text.length || entity.end > text.length) {
        logger.warn(`NER: Entity at index ${idx} has out-of-bounds indices`)
        return null
      }

      // Optionally: check that the substring matches the entity text (MVP: log if mismatch)
      const extracted = text.slice(entity.start, entity.end)
      if (extracted !== entity.text) {
        logger.info(
          `NER: Entity at index ${idx} text mismatch. Expected "${extracted}", got "${entity.text}"`
        )
      }

      // Normalize the entity type using the class method
      const type = this.validateEntityType(entity.type)

      // Normalize the score (default to 1 if not provided or invalid)
      let score = 1
      if (typeof entity.score === "number" && entity.score >= 0 && entity.score <= 1) {
        score = entity.score
      } else if (entity.score !== undefined) {
        logger.info(`NER: Entity at index ${idx} has invalid score, defaulting to 1`)
      }

      return {
        text: entity.text,
        type,
        start: entity.start,
        end: entity.end,
        score,
      }
    } catch (error: any) {
      logger.error(`Error validating entity at index ${idx}: ${error?.message || error}`)
      return null
    }
  }
}
