import { logger } from "../utils/logger"
import { getCoreNlpFeatures } from "../nlp/nlp-features"
import { classifyConceptsZSC_LLM } from "../ai-sdk/zsc-service"
import { callGenerateObject } from "../ai-sdk/gateway"
import type { NlpFeatures } from "../types/nlp-types"
import type { InferredAttachment, AttachmentType } from "../types/pce-types"
import { InferredAttachmentsSchema } from "../ai-sdk/schemas/self-map-schemas"
import type { EmbeddingVector } from "../ai-sdk/types"
import { KgService } from "../db/graph/kg-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"

// Constants
const DEFAULT_MODEL_ID = "structured-output"
const CERTAINTY_THRESHOLD = 0.3
const EMBEDDING_SIMILARITY_THRESHOLD = 0.7

// Type guard for error objects
function isError(obj: any): obj is { error: string } {
  return typeof obj === 'object' && obj !== null && 'error' in obj;
}

/**
 * Infer self-map attachments from text
 * @param text User text to analyze
 * @param nlpFeatures Pre-computed NLP features (optional)
 * @param userId User ID
 * @param options Additional options
 * @returns Array of inferred attachments
 */
export async function inferSelfMapAttachments(
  text: string,
  nlpFeatures?: NlpFeatures,
  userId?: string,
  options: {
    includeRawCandidates?: boolean
    certaintyThreshold?: number
    maxResults?: number
  } = {},
): Promise<InferredAttachment[]> {
  try {
    // Set default options
    const certaintyThreshold = options.certaintyThreshold ?? CERTAINTY_THRESHOLD
    const maxResults = options.maxResults ?? 10

    // Get NLP features if not provided
    const features = nlpFeatures || (await getCoreNlpFeatures(text, { includeEmbedding: true }))

    // Generate candidates using different methods
    let candidates: InferredAttachment[] = []

    // 1. Generate candidates using Zero-Shot Classification
    const zscCandidates = await generateZSCCandidates(text)
    candidates = candidates.concat(zscCandidates)

    // 2. Generate candidates using Named Entity Recognition
    const nerCandidates = await generateNERCandidates(features)
    candidates = candidates.concat(nerCandidates)

    // 3. Generate candidates using keywords
    const keywordCandidates = generateKeywordCandidates(features)
    candidates = candidates.concat(keywordCandidates)

    // 4. Generate candidates using embeddings (if available)
    if (features.embedding) {
      const embeddingCandidates = await generateEmbeddingCandidates(features.embedding, userId)
      candidates = candidates.concat(embeddingCandidates)
    }

    // Log candidate generation
    logger.info(`Generated ${candidates.length} attachment candidates from text analysis`)

    // Use LLM to synthesize and refine candidates
    const refinedAttachments = await synthesizeWithLLM(text, features, candidates)

    // Filter by certainty threshold and limit results
    const filteredAttachments = refinedAttachments
      .filter((attachment) => typeof attachment.certainty === "number" && attachment.certainty >= certaintyThreshold)
      .sort((a, b) => (b.certainty ?? 0) - (a.certainty ?? 0))
      .slice(0, maxResults)

    // Include raw candidates if requested
    if (options.includeRawCandidates) {
      logger.debug("Raw attachment candidates: " + JSON.stringify(candidates))
    }

    return filteredAttachments
  } catch (error) {
    logger.error(`Error inferring self-map attachments: ${error}`)
    return []
  }
}

/**
 * Generate attachment candidates using Zero-Shot Classification
 * @param text Text to analyze
 * @returns Array of candidate attachments
 */
async function generateZSCCandidates(text: string): Promise<InferredAttachment[]> {
  try {
    const result = await classifyConceptsZSC_LLM(text)

    if (isError(result)) {
      logger.warn(`ZSC LLM returned error: ${result.error}`)
      return []
    }
    if (!result.concepts?.length) {
      logger.debug("ZSC LLM returned no concepts.")
      return []
    }

    return result.concepts.map((concept) => {
      let attachmentType: AttachmentType = "CONCEPT"
      switch (concept.type) {
        case "VALUE": attachmentType = "VALUE"; break
        case "GOAL": attachmentType = "GOAL"; break
        case "NEED": attachmentType = "NEED"; break
        case "BELIEF": attachmentType = "BELIEF"; break
        case "INTEREST": attachmentType = "INTEREST"; break
        default: attachmentType = "CONCEPT"
      }

      const score = concept.score ?? 0.5
      const estimatedPL = Math.max(0, Math.min(10, Math.round(score * 10)))
      const estimatedV = Math.max(-10, Math.min(10, Math.round((score) * 10)))

      return {
        name: concept.text,
        type: attachmentType,
        estimatedPL,
        estimatedV,
        certainty: score,
        sourceText: concept.text,
        inferenceMethod: "ZSC" as const,
      }
    }).filter(Boolean)
  } catch (error) {
    logger.error("Error generating ZSC candidates:", error)
    return []
  }
}

/**
 * Generate attachment candidates using Named Entity Recognition
 * @param features NLP features
 * @returns Array of candidate attachments
 */
async function generateNERCandidates(features: NlpFeatures): Promise<InferredAttachment[]> {
  try {
    if (!features.entities?.length) {
      return []
    }

    return features.entities.map((entity) => {
      let attachmentType: AttachmentType = "CONCEPT"
      switch (entity.type) {
        case "PERSON": attachmentType = "CONCEPT"; break
        case "ORGANIZATION": attachmentType = "CONCEPT"; break
        case "PRODUCT": attachmentType = "INTEREST"; break
        case "WORK_OF_ART": attachmentType = "INTEREST"; break
        case "EVENT": attachmentType = "CONCEPT"; break
        default: attachmentType = "CONCEPT"
      }

      const score = entity.score ?? 0.5
      const estimatedPL = Math.max(0, Math.min(10, Math.round(score * 8)))
      const estimatedV = 5

      return {
        name: entity.text,
        type: attachmentType,
        estimatedPL,
        estimatedV,
        certainty: score,
        sourceText: entity.text,
        inferenceMethod: "NER" as const,
      }
    }).filter(Boolean)
  } catch (error) {
    logger.error("Error generating NER candidates:", error)
    return []
  }
}

/**
 * Generate attachment candidates using keywords
 * @param features NLP features
 * @returns Array of candidate attachments
 */
function generateKeywordCandidates(features: NlpFeatures): InferredAttachment[] {
  try {
    if (!features.keywords || features.keywords.length === 0) {
      return []
    }

    const topKeywords = features.keywords.slice(0, 5)
    return topKeywords.map((keyword) => ({
      name: keyword,
      type: "INTEREST",
      estimatedPL: 5,
      estimatedV: 5,
      certainty: 0.5,
      sourceText: keyword,
      inferenceMethod: "KEYWORD" as const,
    }))
  } catch (error) {
    logger.error(`Error generating keyword candidates:`, error)
    return []
  }
}

/**
 * Generate attachment candidates using embeddings
 * @param embedding Text embedding
 * @param userId User ID
 * @returns Array of candidate attachments
 */
async function generateEmbeddingCandidates(embedding: EmbeddingVector, userId?: string): Promise<InferredAttachment[]> {
  try {
    if (!userId) return []

    const kgService = new KgService(getNeo4jDriver())
    // MVP: Find similar attachments for the user using embedding similarity
    const similarAttachments: any[] = [] // TODO: implement embedding similarity

    if (!Array.isArray(similarAttachments) || similarAttachments.length === 0) {
      return []
    }

    return similarAttachments.map(attachment => ({
      name: attachment.name,
      type: (attachment.type as AttachmentType) ?? "CONCEPT",
      estimatedPL: typeof attachment.powerLevel === "number" ? attachment.powerLevel : 5,
      estimatedV: typeof attachment.valence === "number" ? attachment.valence : 0,
      certainty: typeof attachment.similarity === "number" ? attachment.similarity : 0.5,
      sourceText: attachment.name,
      inferenceMethod: "EMBEDDING" as const,
    }))
  } catch (error) {
    logger.error(`Error generating embedding candidates: ${error}`)
    return []
  }
}

/**
 * Synthesize and refine attachment candidates using LLM
 * @param text Original text
 * @param features NLP features
 * @param candidates Candidate attachments
 * @returns Refined attachments
 */
async function synthesizeWithLLM(
  text: string,
  features: NlpFeatures,
  candidates: InferredAttachment[],
): Promise<InferredAttachment[]> {
  try {
    const prompt = constructLLMPrompt(text, features, candidates)
    const result = await callGenerateObject(DEFAULT_MODEL_ID, prompt, InferredAttachmentsSchema)

    if (result.success && result.data) {
      const llmAttachments = result.data as Array<Omit<InferredAttachment, 'inferenceMethod'>>
      if (Array.isArray(llmAttachments)) {
        return llmAttachments.map((att) => ({
          ...att,
          inferenceMethod: "LLM" as const,
        }))
      } else {
        logger.warn("LLM synthesis result data was not an array. Response: " + JSON.stringify(result.data))
        return candidates
      }
    } else {
      logger.warn("LLM synthesis failed: reason=" + (result.success ? "Data was missing" : "API Error") + ", errorDetails=" + (result.success ? undefined : result.error))
      return candidates
    }
  } catch (error) {
    logger.error(`Error during LLM synthesis:`, error)
    return candidates
  }
}

/**
 * Construct the prompt for the LLM
 * @param text Original text
 * @param features NLP features
 * @param candidates Candidate attachments
 * @returns Formatted prompt
 */
function constructLLMPrompt(text: string, features: NlpFeatures, candidates: InferredAttachment[]): string {
  // Format the sentiment information
  const sentimentInfo = features.sentiment
    ? `Sentiment: ${features.sentiment.label} (score: ${features.sentiment.score.toFixed(2)})`
    : "Sentiment: Unknown"

  // Format the entities
  const entitiesInfo =
    features.entities && features.entities.length > 0
      ? `Entities: ${features.entities.map((e) => `${e.text} (${e.type})`).join(", ")}`
      : "Entities: None detected"

  // Format the candidate attachments
  const candidatesInfo =
    candidates.length > 0
      ? candidates
          .map(
            (c) =>
              `- ${c.name} (Type: ${c.type}, PL: ${c.estimatedPL}, V: ${c.estimatedV}, Certainty: ${c.certainty?.toFixed(2) ?? "?"}, Method: ${c.inferenceMethod})`,
          )
          .join("\n")
      : "No candidates detected"

  // Construct the full prompt
  return `
Analyze the following user text and identify the most salient attachments (Values, Goals, Needs, Beliefs, Interests, Identity elements) expressed or implied.

USER TEXT:
"""
${text}
"""

TEXT ANALYSIS:
${sentimentInfo}
${entitiesInfo}

CANDIDATE ATTACHMENTS:
${candidatesInfo}

INSTRUCTIONS:
1. Identify the most salient user attachments expressed or implied in the text.
2. For each attachment:
   - Determine its type (VALUE, GOAL, NEED, BELIEF, INTEREST, IDENTITY, CONCEPT)
   - Estimate its importance/centrality (Power Level - PL, 0-10, where 10 is extremely important)
   - Estimate the user's positive/negative association (Valence - V, -10 to 10, where -10 is extremely negative, 0 is neutral, 10 is extremely positive)
   - Provide a certainty score (0-1) for your inference
   - Include the relevant source text that led to this inference

3. Focus on quality over quantity - only include attachments that are clearly expressed or strongly implied.
4. Consider both explicit statements and implicit meanings.
5. If the text is ambiguous or lacks clear attachments, provide fewer results with lower certainty scores.

Respond ONLY with a JSON array conforming to the specified schema.
`
}

/**
 * Updates the user's self-map in the UIG with inferred attachments
 * @param userId The ID of the user
 * @param inferredAttachments Array of inferred attachments
 * @param interactionId Optional ID of the current interaction
 * @returns Promise resolving to the number of successfully updated attachments
 */
export async function updateSelfMapWithInferences(
  userId: string,
  inferredAttachments: InferredAttachment[],
  interactionId?: string,
): Promise<number> {
  let updatedCount = 0
  const kgService = new KgService(getNeo4jDriver())

  for (const attachment of inferredAttachments) {
    try {
      // Map internal type to KG type if necessary
      let kgAttachmentType: "Value" | "Goal" | undefined
      if (attachment.type === "VALUE") {
        kgAttachmentType = "Value"
      } else if (attachment.type === "GOAL") {
        kgAttachmentType = "Goal"
      } else {
        // For MVP: skip non-core types, but log for future
        logger.debug(`Skipping non-core attachment type: ${attachment.type}`)
        continue
      }

      const attachmentNodeId = await kgService.findOrCreateAttachmentNode(attachment.name, kgAttachmentType)

      if (!attachmentNodeId) {
        logger.warn(`Failed to find or create attachment node: ${attachment.name} (${attachment.type})`)
        continue
      }

      // MVP: Actually merge the user-attachment relationship in the KG
      const success = await kgService.updateAttachmentProperties(userId, attachmentNodeId, {
        powerLevel: attachment.estimatedPL,
        valence: attachment.estimatedV,
        certainty: attachment.certainty,
      })

      if (success) {
        updatedCount++
      } else {
        logger.warn(`Failed to merge user attachment link for ${userId} -> ${attachment.name}`)
      }
    } catch (error) {
      logger.error(`Error updating self-map for attachment ${attachment.name}:`, { userId, error })
    }
  }

  logger.info(`Updated ${updatedCount} attachments in self-map for user ${userId}`)
  return updatedCount
}
