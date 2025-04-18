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
 * Validates and normalizes entity types
 */
function validateEntityType(type: string): EntityType {
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
function validateEntity(entity: any): Entity | null {
  try {
    if (!entity || typeof entity !== "object") return null

    // Check required fields
    if (typeof entity.text !== "string" || entity.text.trim() === "") return null
    if (typeof entity.type !== "string") return null
    if (typeof entity.start !== "number" || entity.start < 0) return null
    if (typeof entity.end !== "number" || entity.end <= entity.start) return null

    // Normalize the entity type
    const type = validateEntityType(entity.type)

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

/**
 * Recognizes named entities in the provided text using LLM
 *
 * @param text The text to analyze for entities
 * @returns A promise resolving to an EntityRecognitionResult or EntityRecognitionError
 */
export async function recognizeEntitiesLLM(text: string): Promise<EntityRecognitionResult | EntityRecognitionError> {
  try {
    // Handle empty or invalid input
    if (!text || typeof text !== "string" || text.trim() === "") {
      return { entities: DEFAULT_ENTITIES }
    }

    // Prepare the prompt
    const prompt = NER_PROMPT_TEMPLATE.replace("{text}", text)

    // Call the LLM
    const result = await generateLlmJson<any[]>(prompt, {
      system: "You are an expert in named entity recognition. Extract entities precisely and accurately.",
      temperature: 0.1,
    })

    // Handle LLM failure
    if (!result) {
      logger.warn("LLM failed to return a valid response for entity recognition")
      return {
        error: "Failed to extract entities from text",
        entities: DEFAULT_ENTITIES,
      }
    }

    // Validate and filter entities
    const validEntities = Array.isArray(result) ? (result.map(validateEntity).filter(Boolean) as Entity[]) : []

    return { entities: validEntities }
  } catch (error) {
    logger.error(`Error in entity recognition: ${error}`)
    return {
      error: `Entity recognition failed: ${error}`,
      entities: DEFAULT_ENTITIES,
    }
  }
}
