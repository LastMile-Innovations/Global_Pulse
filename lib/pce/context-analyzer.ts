import { KgService } from "../db/graph/kg-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"
import { logger } from "../utils/logger"
import type { BootstrappedEP } from "../types/pce-types"
import type { Entity, AbstractConcept } from "../types/nlp-types"
import { embeddingService } from "../ai-sdk/embedding-service"
import type { VectorSearchResult } from "../ai-sdk/types"
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
  if (!userID || typeof userID !== "string") {
    logger.error("getMinimalContext: Invalid userID")
    throw new Error("Invalid userID")
  }
  try {
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)
    const bootstrappedEPs = await fetchBootstrappedEPs(kgService, userID)
    if (!bootstrappedEPs.length) {
      logger.info(`No bootstrapped EPs found for user ${userID}`)
      return {
        activeEPs: [],
      }
    }
    // Only direct/partial match activation
    const activeEPs = determineActiveEPs(
      bootstrappedEPs,
      keywords,
      entities,
      abstractConcepts,
    )
    logger.info(
      `[ContextAnalyzer] Found ${activeEPs.length} active bootstrapped EPs for user ${userID}`
    )
    // Only fetch userState; profiles are undefined for V1
    const userState = await getMostRecentUserState(kgService, userID)
    return {
      activeEPs,
      userState,
      culturalContext: undefined,
      personality: undefined,
      developmentalStage: undefined,
      socialContext: undefined,
    }
  } catch (error) {
    logger.error(`Error retrieving minimal context: ${error instanceof Error ? error.stack || error.message : error}`)
    return {
      activeEPs: [],
      culturalContext: undefined,
      personality: undefined,
      developmentalStage: undefined,
      socialContext: undefined,
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
 * Determines which bootstrapped EPs are active based on direct and semantic matches.
 * Returns only those with activationWeight > 0.
 */
function determineActiveEPs(
  bootstrappedEPs: BootstrappedEP[],
  keywords: string[],
  entities: Entity[],
  abstractConcepts: AbstractConcept[],
): BootstrappedEP[] {
  const lowercaseKeywords = keywords.map((k) => k.toLowerCase())
  const lowercaseEntityTexts = entities.map((e) => e.text.toLowerCase())
  const lowercaseConceptTexts = abstractConcepts.map((c) => c.text.toLowerCase())

  const processedEPs = bootstrappedEPs.map((ep) => {
    const epNameLower = (ep.name || "").toLowerCase()
    // Direct or partial match in any NLP feature
    const keywordMatch = lowercaseKeywords.some((k) => epNameLower.includes(k))
    const entityMatch = lowercaseEntityTexts.some((e) => epNameLower.includes(e))
    const conceptMatch = lowercaseConceptTexts.some((c) => epNameLower.includes(c))
    const match = keywordMatch || entityMatch || conceptMatch
    return {
      ...ep,
      activationWeight: match ? 1.0 : 0.0,
    }
  })
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
