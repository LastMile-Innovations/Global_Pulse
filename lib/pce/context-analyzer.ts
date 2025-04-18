import { KgService } from "../db/graph/kg-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"
import { logger } from "../utils/logger"
import type { BootstrappedEP } from "../types/pce-types"
import type { Entity, AbstractConcept } from "../types/nlp-types"
import { embeddingService } from "../../ai-sdk/embedding-service"
import type { VectorSearchResult } from "../../ai-sdk/types"
import type { KgCulturalContextProfile, KgPersonalityProfile, KgDevelopmentalStageProfile } from "../types/kg-types"
import type { SocialContext } from "../types/pce-types"
import { analyzeSocialEmotionCues } from "./social-submodels"

/**
 * Contextual Analysis Output
 * (MinimalContext is not imported due to type error; define fields explicitly)
 */
export interface ContextualAnalysisOutput {
  activeEPs: BootstrappedEP[]
  userState?: {
    moodEstimate: number
    stressEstimate: number
  }
  culturalContext?: KgCulturalContextProfile
  personality?: KgPersonalityProfile
  developmentalStage?: KgDevelopmentalStageProfile
  socialContext?: SocialContext
}

/**
 * Main function to retrieve minimal context for a user and input.
 * Returns a ContextualAnalysisOutput object with all relevant context.
 */
export async function getMinimalContext(
  userID: string,
  keywords: string[],
  entities: Entity[],
  abstractConcepts: AbstractConcept[],
): Promise<ContextualAnalysisOutput> {
  // Defensive: validate input
  if (!userID || typeof userID !== "string") {
    logger.error("getMinimalContext: Invalid userID")
    throw new Error("Invalid userID")
  }
  try {
    // Get Neo4j driver and create KG service
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)

    // Fetch bootstrapped Values and Goals for the user
    const bootstrappedEPs = await fetchBootstrappedEPs(kgService, userID)

    // If no EPs, return empty context
    if (!bootstrappedEPs.length) {
      logger.info(`No bootstrapped EPs found for user ${userID}`)
      return {
        activeEPs: [],
      }
    }

    // Combine user input for semantic matching
    const userInput = [
      ...keywords,
      ...entities.map((e) => e.text),
      ...abstractConcepts.map((c) => c.text),
    ]
      .filter(Boolean)
      .join(" ")
      .trim()

    // Get semantic matches using embeddings (if input is not empty)
    let semanticMatches: VectorSearchResult[] = []
    if (userInput.length > 0) {
      semanticMatches = await getSemanticMatches(kgService, userID, userInput)
    }

    // Determine which EPs are active based on keyword/entity matching and semantic matching
    const activeEPs = determineActiveEPs(
      bootstrappedEPs,
      keywords,
      entities,
      abstractConcepts,
      semanticMatches,
    )

    logger.info(
      `[ContextAnalyzer] Found ${activeEPs.length} active bootstrapped EPs for user ${userID}`
    )

    // Fetch user state, cultural context, personality, and developmental stage in parallel
    const [userState, culturalContext, personality, developmentalStage] = await Promise.all([
      getMostRecentUserState(kgService, userID),
      kgService.getCulturalContextProfile
        ? kgService.getCulturalContextProfile(userID)
        : Promise.resolve(undefined),
      kgService.getPersonalityProfile
        ? kgService.getPersonalityProfile(userID)
        : Promise.resolve(undefined),
      kgService.getDevelopmentalStageProfile
        ? kgService.getDevelopmentalStageProfile(userID)
        : Promise.resolve(undefined),
    ])

    // Analyze social emotion cues
    const socialContext = analyzeSocialEmotionCues(keywords, entities, abstractConcepts)

    return {
      activeEPs,
      userState,
      culturalContext,
      personality,
      developmentalStage,
      socialContext,
    }
  } catch (error) {
    logger.error(`Error retrieving minimal context: ${error instanceof Error ? error.stack || error.message : error}`)
    return {
      activeEPs: [],
    }
  }
}

/**
 * Fetches bootstrapped Emotional Patterns (Values and Goals) from the Knowledge Graph.
 * Returns an array of BootstrappedEP objects.
 */
async function fetchBootstrappedEPs(
  kgService: KgService,
  userID: string
): Promise<BootstrappedEP[]> {
  try {
    // For production: use parameterized Cypher and robust error handling
    const cypher = `
      MATCH (u:User {userID: $userID})-[:HOLDS_ATTACHMENT]->(a)
      WHERE a:Value OR a:Goal
      RETURN a.attachmentID as id, a.name as name, labels(a)[0] as type, 
             a.powerLevel as powerLevel, a.valuation as valuation
    `
    const records = await kgService.kgLayer.executeCypher(cypher, { userID })

    if (!records || !Array.isArray(records)) {
      logger.warn(`[ContextAnalyzer] No records returned for bootstrapped EPs for user ${userID}`)
      return []
    }

    return records
      .map((record) => {
        try {
          const type = (record.get("type") || "").toUpperCase()
          if (type !== "VALUE" && type !== "GOAL") return null
          return {
            id: record.get("id"),
            name: record.get("name"),
            type,
            powerLevel: typeof record.get("powerLevel") === "number" ? record.get("powerLevel") : 0.5,
            valuation: typeof record.get("valuation") === "number" ? record.get("valuation") : 0.0,
            activationWeight: 0.0,
          }
        } catch (err) {
          logger.warn(`[ContextAnalyzer] Error parsing bootstrapped EP record: ${err}`)
          return null
        }
      })
      .filter(Boolean) as BootstrappedEP[]
  } catch (error) {
    logger.error(`Error fetching bootstrapped EPs: ${error instanceof Error ? error.stack || error.message : error}`)
    return []
  }
}

/**
 * Get semantic matches using embeddings.
 * Returns an array of VectorSearchResult.
 */
async function getSemanticMatches(
  kgService: KgService,
  userID: string,
  userInput: string,
): Promise<VectorSearchResult[]> {
  try {
    if (!userInput || typeof userInput !== "string" || !userInput.trim()) {
      logger.warn("[ContextAnalyzer] getSemanticMatches called with empty userInput")
      return []
    }
    // Generate embedding for user input
    const embedding = await embeddingService.getEmbedding(userInput)
    if (!embedding || !Array.isArray(embedding)) {
      logger.warn("[ContextAnalyzer] No embedding returned for user input")
      return []
    }

    // Perform vector similarity search
    if (
      typeof (kgService as any).vectorSimilaritySearch !== "function"
    ) {
      logger.error("[ContextAnalyzer] vectorSimilaritySearch not implemented on KgService")
      return []
    }
    const semanticMatches = await (kgService as any).vectorSimilaritySearch(
      embedding,
      ["Value", "Goal"],
      userID,
      10
    )
    if (!semanticMatches || !Array.isArray(semanticMatches)) {
      logger.warn("[ContextAnalyzer] No semantic matches returned")
      return []
    }
    return semanticMatches
  } catch (error) {
    logger.error(`Error getting semantic matches: ${error instanceof Error ? error.stack || error.message : error}`)
    return []
  }
}

/**
 * Determines which bootstrapped EPs are active based on direct and semantic matches.
 * Returns only those with activationWeight > 0.
 */
function determineActiveEPs(
  bootstrappedEPs: BootstrappedEP[],
  keywords: string[],
  entities: Entity[],
  abstractConcepts: AbstractConcept[],
  semanticMatches: VectorSearchResult[] = [],
): BootstrappedEP[] {
  // Lowercase for case-insensitive matching
  const lowercaseKeywords = keywords.map((k) => k.toLowerCase())
  const lowercaseEntityTexts = entities.map((e) => e.text.toLowerCase())
  const lowercaseConceptTexts = abstractConcepts.map((c) => c.text.toLowerCase())

  // Map of semantic match IDs to similarity scores
  const semanticMatchMap = new Map<string, number>()
  for (const match of semanticMatches) {
    if (match && match.nodeId) {
      semanticMatchMap.set(match.nodeId, match.similarityScore)
    }
  }

  // Copy EPs to avoid mutation
  const processedEPs = bootstrappedEPs.map((ep) => ({ ...ep }))

  for (const ep of processedEPs) {
    const epNameLower = (ep.name || "").toLowerCase()
    const epNameWords = epNameLower.split(/\s+/)

    // Direct matches
    const keywordMatch = lowercaseKeywords.some((k) => epNameLower.includes(k))
    const entityMatch = lowercaseEntityTexts.some((e) => epNameLower.includes(e))
    const conceptMatch = lowercaseConceptTexts.some((c) => epNameLower.includes(c))

    // Word-level matches
    const wordMatch = epNameWords.some(
      (word) =>
        lowercaseKeywords.includes(word) ||
        lowercaseEntityTexts.some((e) => e.includes(word)) ||
        lowercaseConceptTexts.some((c) => c.includes(word))
    )

    // Semantic match
    const semanticScore = semanticMatchMap.get(ep.id) || 0

    // Activation logic
    const directMatch = keywordMatch || entityMatch || conceptMatch || wordMatch
    ep.activationWeight = directMatch ? 1.0 : semanticScore > 0.7 ? semanticScore : 0.0
  }

  // Only return active EPs
  return processedEPs.filter((ep) => ep.activationWeight > 0)
}

/**
 * Fetches the most recent UserStateInstance from the Knowledge Graph.
 * Returns an object with moodEstimate and stressEstimate, or undefined.
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

    const moodEstimate = record.get("moodEstimate")
    const stressEstimate = record.get("stressEstimate")
    if (typeof moodEstimate !== "number" || typeof stressEstimate !== "number") {
      logger.warn(`[ContextAnalyzer] Invalid user state values for user ${userID}`)
      return undefined
    }
    return { moodEstimate, stressEstimate }
  } catch (error) {
    logger.error(`Error getting most recent UserStateInstance: ${error instanceof Error ? error.stack || error.message : error}`)
    return undefined
  }
}

/**
 * Fetches the CulturalContextProfile from the Knowledge Graph.
 */
async function getCulturalContextProfile(
  kgService: KgService,
  userID: string,
): Promise<KgCulturalContextProfile | undefined> {
  try {
    if (typeof (kgService as any).getCulturalContextProfile !== "function") {
      logger.error("[ContextAnalyzer] getCulturalContextProfile not implemented on KgService")
      return undefined
    }
    const profile = await (kgService as any).getCulturalContextProfile(userID)
    return profile || undefined
  } catch (error) {
    logger.error(`Error getting CulturalContextProfile: ${error instanceof Error ? error.stack || error.message : error}`)
    return undefined
  }
}

/**
 * Fetches the PersonalityProfile from the Knowledge Graph.
 */
async function getPersonalityProfile(
  kgService: KgService,
  userID: string
): Promise<KgPersonalityProfile | undefined> {
  try {
    if (typeof (kgService as any).getPersonalityProfile !== "function") {
      logger.error("[ContextAnalyzer] getPersonalityProfile not implemented on KgService")
      return undefined
    }
    const profile = await (kgService as any).getPersonalityProfile(userID)
    return profile || undefined
  } catch (error) {
    logger.error(`Error getting PersonalityProfile: ${error instanceof Error ? error.stack || error.message : error}`)
    return undefined
  }
}

/**
 * Fetches the DevelopmentalStageProfile from the Knowledge Graph.
 */
async function getDevelopmentalStageProfile(
  kgService: KgService,
  userID: string,
): Promise<KgDevelopmentalStageProfile | undefined> {
  try {
    if (typeof (kgService as any).getDevelopmentalStageProfile !== "function") {
      logger.error("[ContextAnalyzer] getDevelopmentalStageProfile not implemented on KgService")
      return undefined
    }
    const profile = await (kgService as any).getDevelopmentalStageProfile(userID)
    return profile || undefined
  } catch (error) {
    logger.error(`Error getting DevelopmentalStageProfile: ${error instanceof Error ? error.stack || error.message : error}`)
    return undefined
  }
}
