import { generateLlmJson } from "./llm-interaction"
import { logger } from "../lib/utils/logger"
import type {
  AbstractConcept,
  ConceptType,
  ZeroShotClassificationResult,
  ZeroShotClassificationError,
} from "../lib/types/nlp-types"

// Default empty concepts array for fallbacks
const DEFAULT_CONCEPTS: AbstractConcept[] = []

// List of concept types to classify against
const CONCEPT_TYPES: ConceptType[] = ["VALUE", "GOAL", "NEED", "INTEREST", "BELIEF", "EMOTION"]

/**
 * Prompt template for zero-shot concept classification
 */
const ZSC_PROMPT_TEMPLATE = `
Analyze the following text and identify any abstract concepts that are expressed. Focus on these concept types:

- VALUE: Core principles or standards that guide a person's behavior or judgments (e.g., honesty, freedom, family)
- GOAL: Specific objectives or desired outcomes the person wants to achieve (e.g., getting promoted, losing weight)
- NEED: Essential requirements for well-being or satisfaction (e.g., security, belonging, respect)
- INTEREST: Activities or subjects the person enjoys or is curious about (e.g., music, technology, travel)
- BELIEF: Convictions or assumptions about how the world works (e.g., "hard work leads to success")
- EMOTION: Feelings or emotional states expressed (e.g., joy, frustration, hope)

For each concept you identify, provide:
1. The relevant text segment that expresses the concept
2. The concept type (one of: VALUE, GOAL, NEED, INTEREST, BELIEF, EMOTION)
3. A confidence score between 0 and 1

Text to analyze:
"""
{text}
"""

Respond with a JSON array of concepts. Example format:
[
  {
    "text": "I want to finish my degree next year",
    "type": "GOAL",
    "score": 0.92
  }
]

If no relevant concepts are found, return an empty array: []
`

/**
 * Validates and normalizes concept types
 */
function validateConceptType(type: string): ConceptType {
  const normalizedType = type.toUpperCase() as ConceptType
  return CONCEPT_TYPES.includes(normalizedType) ? normalizedType : "OTHER"
}

/**
 * Validates concept objects returned from the LLM
 */
function validateConcept(concept: any): AbstractConcept | null {
  try {
    if (!concept || typeof concept !== "object") return null

    // Check required fields
    if (typeof concept.text !== "string" || concept.text.trim() === "") return null
    if (typeof concept.type !== "string") return null

    // Normalize the concept type
    const type = validateConceptType(concept.type)

    // Normalize the score (default to 1 if not provided or invalid)
    const score = typeof concept.score === "number" && concept.score >= 0 && concept.score <= 1 ? concept.score : 1

    return {
      text: concept.text,
      type,
      score,
    }
  } catch (error) {
    logger.error(`Error validating concept: ${error}`)
    return null
  }
}

/**
 * Classifies abstract concepts in the provided text using LLM
 *
 * @param text The text to analyze for concepts
 * @returns A promise resolving to a ZeroShotClassificationResult or ZeroShotClassificationError
 */
export async function classifyConceptsZSC_LLM(
  text: string,
): Promise<ZeroShotClassificationResult | ZeroShotClassificationError> {
  try {
    // Handle empty or invalid input
    if (!text || typeof text !== "string" || text.trim() === "") {
      return { concepts: DEFAULT_CONCEPTS }
    }

    // Prepare the prompt
    const prompt = ZSC_PROMPT_TEMPLATE.replace("{text}", text)

    // Call the LLM
    const result = await generateLlmJson<any[]>(prompt, {
      system: "You are an expert in psychological concept analysis. Identify abstract concepts accurately.",
      temperature: 0.2,
    })

    // Handle LLM failure
    if (!result) {
      logger.warn("LLM failed to return a valid response for concept classification")
      return {
        error: "Failed to classify concepts in text",
        concepts: DEFAULT_CONCEPTS,
      }
    }

    // Validate and filter concepts
    const validConcepts = Array.isArray(result)
      ? (result.map(validateConcept).filter(Boolean) as AbstractConcept[])
      : []

    return { concepts: validConcepts }
  } catch (error) {
    logger.error(`Error in concept classification: ${error}`)
    return {
      error: `Concept classification failed: ${error}`,
      concepts: DEFAULT_CONCEPTS,
    }
  }
}
