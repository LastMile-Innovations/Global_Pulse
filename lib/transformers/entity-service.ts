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

  switch (label) {
    case "PER":
      return "PERSON"
    case "LOC":
      return "LOCATION"
    case "ORG":
      return "ORGANIZATION"
    case "MISC":
      return "MISC"
    default:
      return "OTHER"
  }
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
  } catch (error) {
    logger.error(`Failed to initialize NER pipeline: ${error}`)
    throw new Error(`Failed to initialize NER pipeline: ${error}`)
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
    const { word, entity, score, start, end } = item
    const entityType = mapEntityType(entity)

    // If this is a beginning of a new entity (B- prefix) or a different entity type
    if (entity.startsWith("B-") || !currentEntity || entityType !== currentEntity.type) {
      // If we have a current entity, push it to the results
      if (currentEntity) {
        mergedEntities.push(currentEntity)
      }

      // Start a new entity
      currentEntity = {
        text: word,
        type: entityType,
        score,
        start,
        end,
      }
    }
    // If this is a continuation of the current entity (I- prefix)
    else if (entity.startsWith("I-") && currentEntity) {
      // Append to the current entity
      currentEntity.text += " " + word
      currentEntity.end = end
      // Update score to average
      currentEntity.score = (currentEntity.score + score) / 2
    }
  }

  // Add the last entity if it exists
  if (currentEntity) {
    mergedEntities.push(currentEntity)
  }

  return mergedEntities
}

/**
 * Recognizes named entities in the provided text
 *
 * @param text The text to analyze for entities
 * @returns A promise resolving to an EntityRecognitionResult or EntityRecognitionError
 */
export async function recognizeEntities(text: string): Promise<EntityRecognitionResult | EntityRecognitionError> {
  try {
    // Handle empty or invalid input
    if (!text || typeof text !== "string" || text.trim() === "") {
      return { entities: DEFAULT_ENTITIES }
    }

    // Initialize the pipeline if not already done
    const ner = await initNerPipeline()

    // Recognize entities in the text
    const rawResults = await ner(text, { aggregation_strategy: "none" })

    // Process and merge entity spans
    const entities = processEntityResults(rawResults)

    return { entities }
  } catch (error) {
    logger.error(`Error in entity recognition: ${error}`)
    return {
      error: `Entity recognition failed: ${error}`,
      entities: DEFAULT_ENTITIES,
    }
  }
}
