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
    const certaintyThreshold = options.certaintyThreshold || CERTAINTY_THRESHOLD
    const maxResults = options.maxResults || 10

    // Get NLP features if not provided
    const features = nlpFeatures || (await getCoreNlpFeatures(text, { includeEmbedding: true }))

    // Generate candidates using different methods
    const candidates: InferredAttachment[] = []

    // 1. Generate candidates using Zero-Shot Classification
    const zscCandidates = await generateZSCCandidates(text)
    candidates.push(...zscCandidates)

    // 2. Generate candidates using Named Entity Recognition
    const nerCandidates = await generateNERCandidates(features)
    candidates.push(...nerCandidates)

    // 3. Generate candidates using keywords
    const keywordCandidates = generateKeywordCandidates(features)
    candidates.push(...keywordCandidates)

    // 4. Generate candidates using embeddings (if available)
    if (features.embedding) {
      const embeddingCandidates = await generateEmbeddingCandidates(features.embedding, userId)
      candidates.push(...embeddingCandidates)
    }

    // Log candidate generation
    logger.info(`Generated ${candidates.length} attachment candidates from text analysis`)

    // Use LLM to synthesize and refine candidates
    const refinedAttachments = await synthesizeWithLLM(text, features, candidates)

    // Filter by certainty threshold and limit results
    const filteredAttachments = refinedAttachments
      .filter((attachment) => attachment.certainty >= certaintyThreshold)
      .sort((a, b) => b.certainty - a.certainty)
      .slice(0, maxResults)

    // Include raw candidates if requested
    if (options.includeRawCandidates) {
      logger.debug("Raw attachment candidates:", candidates)
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

    if (result.error || !result.concepts.length) {
      return []
    }

    return result.concepts.map((concept) => {
      // Map concept type to attachment type
      let attachmentType: AttachmentType = "CONCEPT"
      switch (concept.type) {
        case "VALUE":
          attachmentType = "VALUE"
          break
        case "GOAL":
          attachmentType = "GOAL"
          break
        case "NEED":
          attachmentType = "NEED"
          break
        case "BELIEF":
          attachmentType = "BELIEF"
          break
        case "INTEREST":
          attachmentType = "INTEREST"
          break
        default:
          attachmentType = "CONCEPT"
      }

      // Map score to PL and V (initial estimates)
      const estimatedPL = Math.min(10, Math.round(concept.score * 10))
      const estimatedV = Math.min(10, Math.max(-10, Math.round(concept.score * 10)))

      return {
        name: concept.text,
        type: attachmentType,
        estimatedPL,
        estimatedV,
        certainty: concept.score,
        sourceText: concept.text,
        inferenceMethod: "ZSC",
      }
    })
  } catch (error) {
    logger.error(`Error generating ZSC candidates: ${error}`)
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
    if (!features.entities || features.entities.length === 0) {
      return []
    }

    return features.entities.map((entity) => {
      // Map entity type to attachment type
      let attachmentType: AttachmentType = "CONCEPT"
      switch (entity.type) {
        case "PERSON":
          attachmentType = "IDENTITY"
          break
        case "ORGANIZATION":
          attachmentType = "IDENTITY"
          break
        case "PRODUCT":
          attachmentType = "INTEREST"
          break
        case "WORK_OF_ART":
          attachmentType = "INTEREST"
          break
        case "EVENT":
          attachmentType = "CONCEPT"
          break
        default:
          attachmentType = "CONCEPT"
      }

      // Initial estimates based on entity score
      const estimatedPL = Math.min(10, Math.round(entity.score * 8))
      const estimatedV = 5 // Neutral-positive by default for entities

      return {
        name: entity.text,
        type: attachmentType,
        estimatedPL,
        estimatedV,
        certainty: entity.score,
        sourceText: entity.text,
        inferenceMethod: "NER",
      }
    })
  } catch (error) {
    logger.error(`Error generating NER candidates: ${error}`)
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

    // Only use top keywords (that aren't already covered by other methods)
    const topKeywords = features.keywords.slice(0, 5)

    return topKeywords.map((keyword) => {
      return {
        name: keyword,
        type: "INTEREST", // Default to INTEREST for keywords
        estimatedPL: 5, // Medium power level
        estimatedV: 5, // Neutral-positive valence
        certainty: 0.5, // Medium certainty
        sourceText: keyword,
        inferenceMethod: "KEYWORD",
      }
    })
  } catch (error) {
    logger.error(`Error generating keyword candidates: ${error}`)
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
    // This is a placeholder for future implementation
    // In a real implementation, this would query a vector database or KG service
    // to find semantically similar existing canonical Attachment nodes

    // For now, return an empty array
    return []

    // Future implementation would look something like:
    /*
    if (!userId) {
      return []
    }

    // Get similar attachments from KG service
    const similarAttachments = await kgService.findSimilarAttachments(userId, embedding, EMBEDDING_SIMILARITY_THRESHOLD)
    
    return similarAttachments.map(attachment => {
      return {
        name: attachment.name,
        type: attachment.type as AttachmentType,
        estimatedPL: attachment.powerLevel,
        estimatedV: attachment.valence,
        certainty: attachment.similarity, // Use similarity as certainty
        inferenceMethod: "EMBEDDING",
      }
    })
    */
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
    // Construct the prompt for the LLM
    const prompt = constructLLMPrompt(text, features, candidates)

    // Call the LLM to synthesize and refine candidates
    const result = await callGenerateObject(DEFAULT_MODEL_ID, prompt, InferredAttachmentsSchema, {
      temperature: 0.2,
      maxTokens: 2000,
      system:
        "You are an expert in psychological analysis and identity mapping. Your task is to identify the most salient user attachments expressed or implied in text.",
      telemetry: {
        functionId: "pce.self_map_inference",
        metadata: {
          candidateCount: candidates.length,
          textLength: text.length,
        },
      },
    })

    // Handle potential errors or null return
    if (!result.success || !result.data) {
      logger.warn("LLM synthesis failed, falling back to raw candidates")

      // Fall back to the top candidates sorted by certainty
      return candidates.sort((a, b) => b.certainty - a.certainty).slice(0, 5)
    }

    // Process the LLM output
    const llmAttachments = result.data.map((attachment) => ({
      ...attachment,
      inferenceMethod: "LLM" as const,
    }))

    // Merge LLM results with high-certainty candidates
    const highCertaintyCandidates = candidates.filter((c) => c.certainty > 0.8)

    // Combine and deduplicate
    const combined = [...llmAttachments]

    // Add high certainty candidates that aren't already in the LLM results
    for (const candidate of highCertaintyCandidates) {
      const isDuplicate = combined.some(
        (c) => c.name.toLowerCase() === candidate.name.toLowerCase() && c.type === candidate.type,
      )

      if (!isDuplicate) {
        combined.push({
          ...candidate,
          inferenceMethod: "COMBINED",
        })
      }
    }

    return combined
  } catch (error) {
    logger.error(`Error in LLM synthesis: ${error}`)

    // Fall back to the raw candidates
    return candidates.sort((a, b) => b.certainty - a.certainty).slice(0, 5)
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
              `- ${c.name} (Type: ${c.type}, PL: ${c.estimatedPL}, V: ${c.estimatedV}, Certainty: ${c.certainty.toFixed(2)}, Method: ${c.inferenceMethod})`,
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
  if (!inferredAttachments || inferredAttachments.length === 0) {
    logger.info(`No attachments to update for user ${userId}`)
    return 0
  }

  try {
    // Initialize Neo4j driver and KgService
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)

    let successCount = 0

    // Process each inferred attachment
    for (const attachment of inferredAttachments) {
      try {
        // Find or create the attachment node
        const attachmentNodeId = await kgService.findOrCreateAttachmentNode(attachment.name, attachment.type)

        if (!attachmentNodeId) {
          logger.warn(`Failed to find or create attachment node for ${attachment.name} (${attachment.type})`)
          continue
        }

        // Link the user to the attachment node with the inferred properties
        const success = await kgService.mergeUserAttachment(userId, attachmentNodeId, {
          pl: attachment.estimatedPL,
          v: attachment.estimatedV,
          certainty: attachment.certainty,
          inferenceMethod: attachment.inferenceMethod,
          sourceInteractionId: interactionId,
        })

        if (success) {
          successCount++
          logger.info(
            `Successfully linked user ${userId} to attachment ${attachment.name} (${attachment.type}) with PL=${attachment.estimatedPL}, V=${attachment.estimatedV}, certainty=${attachment.certainty}`,
          )
        } else {
          logger.warn(`Failed to link user ${userId} to attachment ${attachment.name} (${attachment.type})`)
        }
      } catch (error) {
        logger.error(`Error processing attachment ${attachment.name} (${attachment.type}) for user ${userId}: ${error}`)
        // Continue with the next attachment
      }
    }

    logger.info(`Updated ${successCount}/${inferredAttachments.length} attachments for user ${userId}`)
    return successCount
  } catch (error) {
    logger.error(`Error updating self-map with inferences for user ${userId}: ${error}`)
    return 0
  }
}
