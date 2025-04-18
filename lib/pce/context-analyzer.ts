import { KgService } from "../db/graph/kg-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"
import { logger } from "../utils/logger"
import type { BootstrappedEP, MinimalContext } from "../types/pce-types"
import type { Entity, AbstractConcept } from "../types/nlp-types"
// Import the embedding service at the top of the file
import { embeddingService } from "../ai-sdk/embedding-service"
import type { VectorSearchResult } from "../ai-sdk/types"
import type { KgCulturalContextProfile, KgPersonalityProfile, KgDevelopmentalStageProfile } from "../types/kg-types"
// Add the following import at the top of the file, after the existing imports
import type { SocialContext } from "../types/pce-types"
import { analyzeSocialEmotionCues } from "./social-submodels" // Import the new function

/**
 * Contextual Analysis Output
 */
export interface ContextualAnalysisOutput extends MinimalContext {
  userState?: {
    moodEstimate: number
    stressEstimate: number
  }
  culturalContext?: KgCulturalContextProfile
  personality?: KgPersonalityProfile
  developmentalStage?: KgDevelopmentalStageProfile
  socialContext?: SocialContext // Add this line
}

// Update the getMinimalContext function to use embeddings
export async function getMinimalContext(
  userID: string,
  keywords: string[],
  entities: Entity[],
  abstractConcepts: AbstractConcept[],
): Promise<ContextualAnalysisOutput> {
  try {
    // Initialize default context
    const defaultContext: ContextualAnalysisOutput = {
      activeBootstrappedEPs: [],
    }

    // Get Neo4j driver and create KG service
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)

    // Fetch bootstrapped Values and Goals for the user
    const bootstrappedEPs = await fetchBootstrappedEPs(kgService, userID)

    if (!bootstrappedEPs.length) {
      logger.info(`No bootstrapped EPs found for user ${userID}`)
      return defaultContext
    }

    // Combine user input for semantic matching
    const userInput = [...keywords, ...entities.map((e) => e.text), ...abstractConcepts.map((c) => c.text)].join(" ")

    // Get semantic matches using embeddings
    const semanticMatches = await getSemanticMatches(kgService, userID, userInput)

    // Determine which EPs are active based on keyword/entity matching and semantic matching
    const activeBootstrappedEPs = determineActiveEPs(
      bootstrappedEPs,
      keywords,
      entities,
      abstractConcepts,
      semanticMatches,
    )

    logger.info(`Found ${activeBootstrappedEPs.length} active bootstrapped EPs for user ${userID}`)

    // Fetch S, C, and T profiles
    const userState = await getMostRecentUserState(kgService, userID)
    const culturalContext = await getCulturalContextProfile(kgService, userID)
    const personality = await getPersonalityProfile(kgService, userID)
    const developmentalStage = await getDevelopmentalStageProfile(kgService, userID)

    // Analyze social emotion cues
    const socialContext = analyzeSocialEmotionCues(keywords, entities, abstractConcepts)

    // Add socialContext to the return object
    return {
      activeBootstrappedEPs,
      userState,
      culturalContext,
      personality,
      developmentalStage,
      socialContext, // Add this line
    }
  } catch (error) {
    logger.error(`Error retrieving minimal context: ${error}`)
    return {
      activeBootstrappedEPs: [],
    }
  }
}

/**
 * Fetches bootstrapped Emotional Patterns (Values and Goals) from the Knowledge Graph
 */
async function fetchBootstrappedEPs(kgService: KgService, userID: string): Promise<BootstrappedEP[]> {
  try {
    // This is a simplified query that would be implemented in the KgService
    // In a real implementation, this would use the actual KG schema and query patterns

    // For MVP, we're only interested in Values and Goals
    const cypher = `
      MATCH (u:User {userID: $userID})-[:HOLDS_ATTACHMENT]->(a)
      WHERE a:Value OR a:Goal
      RETURN a.attachmentID as id, a.name as name, labels(a)[0] as type, 
             a.powerLevel as powerLevel, a.valuation as valuation
    `

    const records = await kgService.kgLayer.executeCypher(cypher, { userID })

    return records.map((record) => {
      // Convert Neo4j record to BootstrappedEP
      const type = record.get("type").toUpperCase() as "VALUE" | "GOAL"

      return {
        id: record.get("id"),
        name: record.get("name"),
        type,
        powerLevel: record.get("powerLevel") || 0.5, // Default to 0.5 if not set
        valuation: record.get("valuation") || 0.0, // Default to 0.0 if not set
        activationWeight: 0.0, // Will be set in determineActiveEPs
      }
    })
  } catch (error) {
    logger.error(`Error fetching bootstrapped EPs: ${error}`)
    return []
  }
}

/**
 * Get semantic matches using embeddings
 */
async function getSemanticMatches(
  kgService: KgService,
  userID: string,
  userInput: string,
): Promise<VectorSearchResult[]> {
  try {
    // Generate embedding for user input
    const embedding = await embeddingService.getEmbedding(userInput)

    // Perform vector similarity search
    const semanticMatches = await kgService.vectorSimilaritySearch(
      embedding,
      ["Value", "Goal"], // Node types to search
      userID,
      10, // Limit
    )

    return semanticMatches
  } catch (error) {
    logger.error(`Error getting semantic matches: ${error}`)
    return []
  }
}

// Update the determineActiveEPs function to incorporate semantic matches
function determineActiveEPs(
  bootstrappedEPs: BootstrappedEP[],
  keywords: string[],
  entities: Entity[],
  abstractConcepts: AbstractConcept[],
  semanticMatches: VectorSearchResult[] = [],
): BootstrappedEP[] {
  // Convert everything to lowercase for case-insensitive matching
  const lowercaseKeywords = keywords.map((k) => k.toLowerCase())
  const lowercaseEntityTexts = entities.map((e) => e.text.toLowerCase())
  const lowercaseConceptTexts = abstractConcepts.map((c) => c.text.toLowerCase())

  // Create a map of semantic match IDs to their similarity scores
  const semanticMatchMap = new Map<string, number>()
  semanticMatches.forEach((match) => {
    semanticMatchMap.set(match.nodeId, match.similarityScore)
  })

  // Create a copy of the EPs to modify
  const processedEPs = [...bootstrappedEPs]

  for (const ep of processedEPs) {
    // Check if the EP name matches any keyword, entity, or concept
    const epNameLower = ep.name.toLowerCase()
    const epNameWords = epNameLower.split(/\s+/)

    // Check for direct matches
    const keywordMatch = lowercaseKeywords.some((k) => epNameLower.includes(k))
    const entityMatch = lowercaseEntityTexts.some((e) => epNameLower.includes(e))
    const conceptMatch = lowercaseConceptTexts.some((c) => epNameLower.includes(c))

    // Check for word-level matches
    const wordMatch = epNameWords.some(
      (word) =>
        lowercaseKeywords.includes(word) ||
        lowercaseEntityTexts.some((e) => e.includes(word)) ||
        lowercaseConceptTexts.some((c) => c.includes(word)),
    )

    // Check for semantic match
    const semanticScore = semanticMatchMap.get(ep.id) || 0

    // Calculate activation weight
    // Direct matches get full activation (1.0)
    // Semantic matches get activation proportional to their similarity score
    const directMatch = keywordMatch || entityMatch || conceptMatch || wordMatch

    // Combine direct and semantic matching
    // If there's a direct match, use 1.0
    // Otherwise, use the semantic score if it's above a threshold (e.g., 0.7)
    ep.activationWeight = directMatch ? 1.0 : semanticScore > 0.7 ? semanticScore : 0.0
  }

  // Return only the active EPs
  return processedEPs.filter((ep) => ep.activationWeight > 0)
}

/**
 * Fetches the most recent UserStateInstance from the Knowledge Graph
 */
async function getMostRecentUserState(
  kgService: KgService,
  userID: string,
): Promise<{ moodEstimate: number; stressEstimate: number } | undefined> {
  try {
    const cypher = `
      MATCH (u:User {userID: $userID})-[:PARTICIPATED_IN]->(i:Interaction)-[:HAS_STATE]->(s:UserStateInstance)
      RETURN s.moodEstimate AS moodEstimate, s.stressEstimate AS stressEstimate
      ORDER BY i.timestamp DESC
      LIMIT 1
    `
    const record = await kgService.kgLayer.executeCypherSingle(cypher, { userID })
    if (!record) return undefined

    return {
      moodEstimate: record.get("moodEstimate"),
      stressEstimate: record.get("stressEstimate"),
    }
  } catch (error) {
    logger.error(`Error getting most recent UserStateInstance: ${error}`)
    return undefined
  }
}

/**
 * Fetches the CulturalContextProfile from the Knowledge Graph
 */
async function getCulturalContextProfile(
  kgService: KgService,
  userID: string,
): Promise<KgCulturalContextProfile | undefined> {
  try {
    const profile = await kgService.getCulturalContextProfile(userID)
    return profile || undefined
  } catch (error) {
    logger.error(`Error getting CulturalContextProfile: ${error}`)
    return undefined
  }
}

/**
 * Fetches the PersonalityProfile from the Knowledge Graph
 */
async function getPersonalityProfile(kgService: KgService, userID: string): Promise<KgPersonalityProfile | undefined> {
  try {
    const profile = await kgService.getPersonalityProfile(userID)
    return profile || undefined
  } catch (error) {
    logger.error(`Error getting PersonalityProfile: ${error}`)
    return undefined
  }
}

/**
 * Fetches the DevelopmentalStageProfile from the Knowledge Graph
 */
async function getDevelopmentalStageProfile(
  kgService: KgService,
  userID: string,
): Promise<KgDevelopmentalStageProfile | undefined> {
  try {
    const profile = await kgService.getDevelopmentalStageProfile(userID)
    return profile || undefined
  } catch (error) {
    logger.error(`Error getting DevelopmentalStageProfile: ${error}`)
    return undefined
  }
}
