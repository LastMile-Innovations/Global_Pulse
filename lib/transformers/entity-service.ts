import { pipeline } from "@xenova/transformers"
import { logger } from "../utils/logger"
import type { Entity, EntityType, EntityRecognitionResult, EntityRecognitionError } from "../types/nlp-types"

// Default NER model
const DEFAULT_MODEL = "Xenova/bert-base-NER"

// Default empty entities array for fallbacks
const DEFAULT_ENTITIES: Entity[] = []

// Cache the pipeline to avoid reloading the model
let nerPipeline: any = null

/**
 * Maps model entity labels to our standardized entity types
 */
function mapEntityType(modelLabel: string): EntityType {
  // The BERT NER model uses labels like B-PER, I-PER, B-LOC, I-LOC, etc.
  // B- prefix means beginning of entity, I- prefix means inside/continuation of entity
  const label = modelLabel.replace(/^[BI]-/, "")

  // Normalize entity type
  const validTypes: EntityType[] = [
    "PERSON", "LOCATION", "ORGANIZATION", "DATE", "TIME", "MONEY", 
    "PERCENT", "PRODUCT", "EVENT", "WORK_OF_ART", "LAW", "LANGUAGE"
  ]
  const normalizedType = label.toUpperCase()

  if (validTypes.includes(normalizedType as EntityType)) {
    return normalizedType as EntityType
  }
  
  // Fallback to OTHER for unrecognized types
  return "OTHER"
}

/**
 * Initializes the named entity recognition pipeline
 */
async function initNerPipeline(modelName: string = DEFAULT_MODEL) {
  try {
    if (!nerPipeline) {
      logger.info(`Initializing named entity recognition pipeline with model: ${modelName}`)
      nerPipeline = await pipeline("token-classification", modelName)
      logger.info("Named entity recognition pipeline initialized successfully")
    }
    return nerPipeline
  } catch (error: any) {
    logger.error(`Failed to initialize NER pipeline: ${error?.message || error}`)
    throw new Error(`Failed to initialize NER pipeline: ${error?.message || error}`)
  }
}

/**
 * Processes raw NER results to merge entity spans and remove duplicates
 * For example, "B-PER I-PER" should be merged into a single PERSON entity
 */
function processEntityResults(rawEntities: any[]): Entity[] {
  if (!rawEntities || !Array.isArray(rawEntities) || rawEntities.length === 0) {
    return []
  }

  const mergedEntities: Entity[] = []
  let currentEntity: Entity | null = null

  for (const item of rawEntities) {
    // Defensive: support both 'entity' and 'entity_group' (some models use entity_group)
    const entityLabel = item.entity || item.entity_group
    const { word, score, start, end } = item
    const entityType = mapEntityType(entityLabel)

    // If this is a beginning of a new entity (B- prefix) or a different entity type
    if (
      entityLabel.startsWith("B-") ||
      !currentEntity ||
      entityType !== currentEntity.type
    ) {
      if (currentEntity) {
        mergedEntities.push(currentEntity)
      }
      currentEntity = {
        text: word,
        type: entityType,
        score,
        start,
        end,
      }
    }
    // If this is a continuation of the current entity (I- prefix)
    else if (entityLabel.startsWith("I-") && currentEntity) {
      // Handle subword tokens (e.g., ##ing) by joining without space if needed
      if (word.startsWith("##")) {
        currentEntity.text += word.replace(/^##/, "")
      } else {
        currentEntity.text += " " + word
      }
      currentEntity.end = end
      // Update score to running average
      currentEntity.score = (currentEntity.score + score) / 2
    }
  }

  // Add the last entity if it exists
  if (currentEntity) {
    mergedEntities.push(currentEntity)
  }

  // Remove duplicates (by text and type, keep highest score)
  const uniqueEntities: Entity[] = []
  const seen = new Set<string>()
  for (const ent of mergedEntities) {
    const key = `${ent.text.toLowerCase()}|${ent.type}`
    if (!seen.has(key)) {
      uniqueEntities.push(ent)
      seen.add(key)
    }
  }

  return uniqueEntities
}

/**
 * Recognizes named entities in the provided text
 *
 * @param text The text to analyze for entities
 * @returns A promise resolving to an EntityRecognitionResult or EntityRecognitionError
 */
export async function recognizeEntities(
  text: string
): Promise<EntityRecognitionResult | EntityRecognitionError> {
  try {
    // Handle empty or invalid input
    if (!text || typeof text !== "string" || text.trim() === "") {
      return { entities: DEFAULT_ENTITIES }
    }

    // Initialize the pipeline if not already done
    const ner = await initNerPipeline()

    // Recognize entities in the text
    // Defensive: some models return an object with .entities, some return an array
    let rawResults: any
    try {
      rawResults = await ner(text, { aggregation_strategy: "none" })
    } catch (err: any) {
      logger.error(`NER pipeline error: ${err?.message || err}`)
      return {
        error: `Entity recognition failed: ${err?.message || err}`,
        entities: DEFAULT_ENTITIES,
      }
    }

    // If the result is an object with .entities, use that
    if (rawResults && typeof rawResults === "object" && Array.isArray(rawResults.entities)) {
      rawResults = rawResults.entities
    }

    // Process and merge entity spans
    const entities = processEntityResults(rawResults)

    return { entities }
  } catch (error: any) {
    logger.error(`Error in entity recognition: ${error?.message || error}`)
    return {
      error: `Entity recognition failed: ${error?.message || error}`,
      entities: DEFAULT_ENTITIES,
    }
  }
}
