import { getRedisClient } from "../db/redis/redis-client"
import { KgService } from "../db/graph/kg-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"
import { getTemplatedResponse } from "../responses/template-filler"
import { getCoreNlpFeatures } from "../nlp/nlp-features"
import { classifyConceptsZSC_LLM } from "../../ai-sdk/zsc-service"
import { logger } from "../utils/logger"
import { getEngagementMode } from "../session/mode-manager"

// Redis key for tracking bootstrapping state
const REDIS_KEY_AWAITING_BOOTSTRAP = "session:awaiting_bootstrap:"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

// Maximum number of concepts to extract
const MAX_CONCEPTS = 3

// Default power level and valuation for bootstrapped attachments
const DEFAULT_POWER_LEVEL = 8
const DEFAULT_VALUATION = 8
const DEFAULT_CERTAINTY = 0.7

/**
 * Check if bootstrapping should be triggered
 * @param userId User ID
 * @param sessionId Session ID
 * @param turnCount Current turn count
 * @returns Whether bootstrapping should be triggered
 */
export async function shouldTriggerBootstrapping(
  userId: string,
  sessionId: string,
  turnCount: number,
): Promise<boolean> {
  try {
    // Only trigger in the first 5 turns
    if (turnCount > 5) {
      return false
    }

    // Check if we're in Insight Mode
    const mode = await getEngagementMode(userId, sessionId)
    if (mode !== "insight") {
      logger.info(`Skipping bootstrapping for user ${userId}: Not in Insight Mode`)
      return false
    }

    // Get KgService
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)

    // Check if bootstrapping is already complete
    const isComplete = await kgService.isBootstrappingComplete(userId)
    if (isComplete) {
      logger.info(`Skipping bootstrapping for user ${userId}: Already completed`)
      return false
    }

    // Check if user already has core attachments
    const hasAttachments = await kgService.checkUserHasCoreAttachments(userId)
    if (hasAttachments) {
      logger.info(`Skipping bootstrapping for user ${userId}: Already has core attachments`)
      // Mark bootstrapping as complete since user already has attachments
      await kgService.markBootstrappingComplete(userId)
      return false
    }

    // Check if we're already awaiting a bootstrap response
    const redis = getRedisClient()
    const isAwaiting = await redis.get(`${REDIS_KEY_AWAITING_BOOTSTRAP}${sessionId}`)
    if (isAwaiting === "true") {
      logger.info(`Skipping bootstrapping for user ${userId}: Already awaiting response`)
      return false
    }

    // All conditions met, trigger bootstrapping
    logger.info(`Triggering bootstrapping for user ${userId}`)
    return true
  } catch (error) {
    logger.error(`Error in shouldTriggerBootstrapping: ${error}`)
    return false
  }
}

/**
 * Generate a bootstrapping prompt
 * @param userId User ID
 * @param sessionId Session ID
 * @returns The bootstrapping prompt
 */
export async function generateBootstrappingPrompt(userId: string, sessionId: string): Promise<string> {
  try {
    // Generate the prompt using the template system
    const prompt = await getTemplatedResponse("bootstrap_self_map_prompt", {
      userId,
      sessionId,
      user_message: "", // Not needed for this template
    })

    // Mark that we're awaiting a bootstrap response
    const redis = getRedisClient()
    await redis.set(`${REDIS_KEY_AWAITING_BOOTSTRAP}${sessionId}`, "true", { ex: SESSION_TTL })

    logger.info(`Generated bootstrapping prompt for user ${userId}`)
    return prompt
  } catch (error) {
    logger.error(`Error in generateBootstrappingPrompt: ${error}`)
    return "To help me understand what matters most to you, could you share one or two core values or important goals that guide you in life? You can also skip this if you prefer."
  }
}

/**
 * Check if we're awaiting a bootstrap response
 * @param userId User ID
 * @param sessionId Session ID
 * @returns Whether we're awaiting a bootstrap response
 */
export async function isAwaitingBootstrapResponse(userId: string, sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const isAwaiting = await redis.get(`${REDIS_KEY_AWAITING_BOOTSTRAP}${sessionId}`)
    return isAwaiting === "true"
  } catch (error) {
    logger.error(`Error in isAwaitingBootstrapResponse: ${error}`)
    return false
  }
}

/**
 * Clear the awaiting bootstrap response flag
 * @param userId User ID
 * @param sessionId Session ID
 */
export async function clearAwaitingBootstrapResponse(userId: string, sessionId: string): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.del(`${REDIS_KEY_AWAITING_BOOTSTRAP}${sessionId}`)
  } catch (error) {
    logger.error(`Error in clearAwaitingBootstrapResponse: ${error}`)
  }
}

/**
 * Process a bootstrap response
 * @param userId User ID
 * @param sessionId Session ID
 * @param userMessage User's message
 * @returns The acknowledgment response
 */
export async function processBootstrapResponse(
  userId: string,
  sessionId: string,
  userMessage: string,
): Promise<string> {
  try {
    // Check if the user wants to skip
    const skipKeywords = ["skip", "no thanks", "not now", "later", "pass", "no"]
    const isSkipping = skipKeywords.some((keyword) => userMessage.toLowerCase().includes(keyword))

    if (isSkipping) {
      // Mark bootstrapping as complete
      const driver = getNeo4jDriver()
      const kgService = new KgService(driver)
      await kgService.markBootstrappingComplete(userId)

      // Clear the awaiting flag
      await clearAwaitingBootstrapResponse(userId, sessionId)

      // Return skip acknowledgment
      logger.info(`User ${userId} skipped bootstrapping`)
      return await getTemplatedResponse("bootstrap_acknowledgment", {
        userId,
        sessionId,
        user_message: userMessage,
        templateId: "bootstrap_acknowledgment_skip",
      })
    }

    // Process the user's response to extract concepts
    const concepts = await extractConcepts(userMessage)

    if (concepts.length > 0) {
      // Create the concepts in the UIG
      await createConceptsInUig(userId, concepts)

      // Mark bootstrapping as complete
      const driver = getNeo4jDriver()
      const kgService = new KgService(driver)
      await kgService.markBootstrappingComplete(userId)
    }

    // Clear the awaiting flag
    await clearAwaitingBootstrapResponse(userId, sessionId)

    // Return acknowledgment
    logger.info(`Processed bootstrap response for user ${userId}: ${concepts.length} concepts extracted`)
    return await getTemplatedResponse("bootstrap_acknowledgment", {
      userId,
      sessionId,
      user_message: userMessage,
    })
  } catch (error) {
    logger.error(`Error in processBootstrapResponse: ${error}`)

    // Clear the awaiting flag
    await clearAwaitingBootstrapResponse(userId, sessionId)

    // Return generic acknowledgment
    return "Thank you for sharing that with me."
  }
}

/**
 * Extract concepts from a user message
 * @param userMessage User's message
 * @returns Array of extracted concepts with type
 */
async function extractConcepts(userMessage: string): Promise<Array<{ name: string; type: "Value" | "Goal" }>> {
  try {
    // Get NLP features
    const nlpFeatures = await getCoreNlpFeatures(userMessage)

    // Try to use Zero-Shot Classification first
    const zscResult = await classifyConceptsZSC_LLM(userMessage)

    // Extract concepts from ZSC results
    const concepts: Array<{ name: string; type: "Value" | "Goal" }> = []

    if (zscResult && !("error" in zscResult) && zscResult.concepts.length > 0) {
      for (const concept of zscResult.concepts) {
        if (concept.type === "VALUE") {
          concepts.push({ name: concept.text, type: "Value" })
        } else if (concept.type === "GOAL") {
          concepts.push({ name: concept.text, type: "Goal" })
        }

        // Limit to MAX_CONCEPTS
        if (concepts.length >= MAX_CONCEPTS) {
          break
        }
      }
    }

    // If we couldn't extract enough concepts from ZSC, use keywords and entities
    if (concepts.length < MAX_CONCEPTS) {
      // Check for explicit mentions of values or goals
      const valueKeywords = ["value", "values", "important", "care about", "believe in", "principle"]
      const goalKeywords = ["goal", "goals", "aim", "objective", "aspiration", "want to", "hope to"]

      // Extract potential values
      for (const keyword of valueKeywords) {
        if (concepts.length >= MAX_CONCEPTS) break

        const index = userMessage.toLowerCase().indexOf(keyword)
        if (index !== -1) {
          // Extract text after the keyword
          const afterKeyword = userMessage.substring(index + keyword.length).trim()
          const endIndex = Math.min(
            ...[".", ",", ";", "!", "?"]
              .map((p) => {
                const idx = afterKeyword.indexOf(p)
                return idx === -1 ? Number.POSITIVE_INFINITY : idx
              })
              .filter((idx) => idx !== Number.POSITIVE_INFINITY),
          )

          if (endIndex !== Number.POSITIVE_INFINITY) {
            const potentialValue = afterKeyword.substring(0, endIndex).trim()
            if (potentialValue && !concepts.some((c) => c.name.toLowerCase() === potentialValue.toLowerCase())) {
              concepts.push({ name: potentialValue, type: "Value" })
            }
          }
        }
      }

      // Extract potential goals
      for (const keyword of goalKeywords) {
        if (concepts.length >= MAX_CONCEPTS) break

        const index = userMessage.toLowerCase().indexOf(keyword)
        if (index !== -1) {
          // Extract text after the keyword
          const afterKeyword = userMessage.substring(index + keyword.length).trim()
          const endIndex = Math.min(
            ...[".", ",", ";", "!", "?"]
              .map((p) => {
                const idx = afterKeyword.indexOf(p)
                return idx === -1 ? Number.POSITIVE_INFINITY : idx
              })
              .filter((idx) => idx !== Number.POSITIVE_INFINITY),
          )

          if (endIndex !== Number.POSITIVE_INFINITY) {
            const potentialGoal = afterKeyword.substring(0, endIndex).trim()
            if (potentialGoal && !concepts.some((c) => c.name.toLowerCase() === potentialGoal.toLowerCase())) {
              concepts.push({ name: potentialGoal, type: "Goal" })
            }
          }
        }
      }

      // If we still don't have enough concepts, use entities and keywords
      if (concepts.length < MAX_CONCEPTS) {
        // Use entities
        for (const entity of nlpFeatures.entities) {
          if (concepts.length >= MAX_CONCEPTS) break

          if (!concepts.some((c) => c.name.toLowerCase() === entity.text.toLowerCase())) {
            // Determine if it's more likely a value or goal
            const type = userMessage.toLowerCase().includes("goal") ? "Goal" : "Value"
            concepts.push({ name: entity.text, type })
          }
        }

        // Use keywords as a last resort
        for (const keyword of nlpFeatures.keywords) {
          if (concepts.length >= MAX_CONCEPTS) break

          if (!concepts.some((c) => c.name.toLowerCase() === keyword.toLowerCase())) {
            // Determine if it's more likely a value or goal
            const type = userMessage.toLowerCase().includes("goal") ? "Goal" : "Value"
            concepts.push({ name: keyword, type })
          }
        }
      }
    }

    return concepts
  } catch (error) {
    logger.error(`Error in extractConcepts: ${error}`)
    return []
  }
}

/**
 * Create concepts in the UIG
 * @param userId User ID
 * @param concepts Array of concepts with type
 */
async function createConceptsInUig(
  userId: string,
  concepts: Array<{ name: string; type: "Value" | "Goal" }>,
): Promise<void> {
  try {
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)

    for (const concept of concepts) {
      // Find or create the attachment node
      const attachmentId = await kgService.findOrCreateAttachmentNode(concept.name, concept.type)

      // Link the user to the attachment
      await kgService.linkUserAttachment(userId, attachmentId, {
        powerLevel: DEFAULT_POWER_LEVEL,
        valuation: DEFAULT_VALUATION,
        certainty: DEFAULT_CERTAINTY,
        classification: concept.type,
      })

      logger.info(`Created ${concept.type} "${concept.name}" for user ${userId}`)
    }
  } catch (error) {
    logger.error(`Error in createConceptsInUig: ${error}`)
  }
}
