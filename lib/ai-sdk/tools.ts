import { tool } from "ai"
import { z } from "zod"
import { KgService } from "../db/graph/kg-service"
import { neo4jDriver } from "../db/graph/neo4j-driver"
import { logger } from "../utils/logger"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Import the embedding service at the top of the file
import { embeddingService } from "./embedding-service"

// Initialize services
const kgService = new KgService(neo4jDriver)

/**
 * Get the user's current emotional state
 */
const getCurrentUserState = tool({
  name: "getCurrentUserState",
  description: "Get the user's most recently inferred emotional state (mood and stress).",
  schema: z.object({}),
  execute: async (params, context) => {
    try {
      // Get userId from context for authorization
      const { userId } = context

      if (!userId) {
        logger.error("getCurrentUserState: No userId provided in context")
        throw new Error("Authorization failed: User ID not provided")
      }

      // Query the most recent UserStateInstance for this user
      const cypher = `
        MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)-[:HAS_STATE]->(s:UserStateInstance)
        RETURN s
        ORDER BY s.timestamp DESC
        LIMIT 1
      `

      const result = await kgService.kgLayer.executeCypherSingle(cypher, { userId })

      if (!result) {
        return {
          moodEstimate: 5, // Neutral default
          stressEstimate: 3, // Low-moderate default
          timestamp: Date.now(),
          note: "No previous state data found, returning defaults",
        }
      }

      const state = result.get("s").properties

      return {
        moodEstimate: state.moodEstimate,
        stressEstimate: state.stressEstimate,
        timestamp: state.timestamp.toNumber ? state.timestamp.toNumber() : state.timestamp,
      }
    } catch (error) {
      logger.error(`Error in getCurrentUserState tool: ${error}`)
      throw new Error(`Failed to retrieve user state: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})

/**
 * Get the user's core attachments (values, goals, needs)
 */
const getCoreAttachments = tool({
  name: "getCoreAttachments",
  description:
    "Retrieve the user's top most important (highest Power Level) attachments of a specific type (Value, Goal, or Need).",
  schema: z.object({
    attachmentType: z
      .enum(["Value", "Goal", "Need"])
      .describe("The type of attachment to retrieve (Value, Goal, or Need)"),
    limit: z.number().int().positive().optional().default(3).describe("The maximum number of attachments to return"),
  }),
  execute: async (params, context) => {
    try {
      // Get userId from context for authorization
      const { userId } = context

      if (!userId) {
        logger.error("getCoreAttachments: No userId provided in context")
        throw new Error("Authorization failed: User ID not provided")
      }

      const { attachmentType, limit } = params

      // Query the user's attachments of the specified type
      const cypher = `
        MATCH (u:User {userID: $userId})-[r:HOLDS_ATTACHMENT]->(a:${attachmentType})
        RETURN a.name as name, r.powerLevel as powerLevel, r.valuation as valence
        ORDER BY r.powerLevel DESC
        LIMIT $limit
      `

      const results = await kgService.kgLayer.executeCypher(cypher, { userId, limit })

      if (!results || results.length === 0) {
        return {
          attachments: [],
          note: `No ${attachmentType.toLowerCase()} attachments found for this user`,
        }
      }

      const attachments = results.map((record) => ({
        name: record.get("name"),
        powerLevel: record.get("powerLevel"),
        valence: record.get("valence"),
      }))

      return { attachments }
    } catch (error) {
      logger.error(`Error in getCoreAttachments tool: ${error}`)
      throw new Error(`Failed to retrieve core attachments: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})

/**
 * Get a summary of recent interactions
 */
const getRecentInteractionSummary = tool({
  name: "getRecentInteractionSummary",
  description: "Get a brief summary of the last few user/assistant turns.",
  schema: z.object({
    numTurns: z.number().int().positive().optional().default(5).describe("The number of recent turns to summarize"),
  }),
  execute: async (params, context) => {
    try {
      // Get userId from context for authorization
      const { userId } = context

      if (!userId) {
        logger.error("getRecentInteractionSummary: No userId provided in context")
        throw new Error("Authorization failed: User ID not provided")
      }

      const { numTurns } = params

      // Query recent interactions for this user
      const cypher = `
        MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)
        RETURN i.userInput as userInput, i.agentResponse as agentResponse, i.timestamp as timestamp
        ORDER BY i.timestamp DESC
        LIMIT $numTurns
      `

      const results = await kgService.kgLayer.executeCypher(cypher, { userId, numTurns })

      if (!results || results.length === 0) {
        return {
          summary: "No recent interactions found for this user.",
        }
      }

      // Format the interactions for summarization
      const interactions = results
        .map((record) => ({
          userInput: record.get("userInput"),
          agentResponse: record.get("agentResponse"),
          timestamp: record.get("timestamp").toNumber ? record.get("timestamp").toNumber() : record.get("timestamp"),
        }))
        .sort((a, b) => a.timestamp - b.timestamp) // Sort chronologically

      // Create a conversation transcript for the LLM to summarize
      const transcript = interactions
        .map((int) => `User: ${int.userInput}\nAssistant: ${int.agentResponse}`)
        .join("\n\n")

      // Use the AI SDK to generate a summary
      const { text: summary } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Summarize the following conversation between a user and an AI assistant named Pulse. Focus on the key topics, emotional themes, and any important information shared by the user. Keep the summary concise (2-3 sentences):\n\n${transcript}`,
      })

      return { summary }
    } catch (error) {
      logger.error(`Error in getRecentInteractionSummary tool: ${error}`)
      throw new Error(
        `Failed to generate interaction summary: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  },
})

// Define the parameters the LLM needs to provide to request a specific UI
const requestStructuredInputParams = z
  .object({
    schemaToGenerate: z
      .enum([
        // LLM chooses which UI type it needs
        "slider",
        "multipleChoice",
        "confirmation",
        "infoCard", // Note: InfoCard doesn't take input, but might be requested via this tool
        "formInput",
        // ... other UI schema types
      ])
      .describe("The type of UI element needed to gather input or present information."),
    contextParams: z
      .record(z.any())
      .describe(
        "An object containing necessary context for the UI, e.g., { label: 'Importance Rating', min: 1, max: 10, targetAttachment: 'Value:Security' } or { question: 'Which option?', options: ['A', 'B'] }.",
      ),
  })
  .describe(
    "Requests the user provide specific input via a dynamically generated UI element based on the provided schema type and context.",
  )

export const requestStructuredInputTool = tool({
  name: "requestStructuredInput",
  description:
    "Use this tool when you need specific, structured input from the user (e.g., a rating, a choice from options, a confirmation) instead of asking an open-ended question. Provide the type of UI needed (schemaToGenerate) and any context needed to render it (contextParams).",
  parameters: requestStructuredInputParams,
  // NO 'execute' function here - this signals client-side handling
})

/**
 * Get the user's approximate location (client-side tool)
 * This tool has no execute function as it will be handled on the client
 */
const getClientLocation = tool({
  name: "getClientLocation",
  description:
    "Get the user's approximate current city using browser location services. Ask for permission first if not already granted.",
  schema: z.object({}),
  // No execute function - will be handled by onToolCall on the client
})

/**
 * Ask for user confirmation (client-side tool)
 * This tool has no execute function as it will be handled on the client
 */
const askForConfirmation = tool({
  name: "askForConfirmation",
  description: "Present a message to the user and ask for their explicit confirmation (Yes/No).",
  schema: z.object({
    message: z.string().describe("The question or action requiring confirmation."),
    context: z.string().optional().describe("Additional context or explanation for the confirmation request."),
  }),
  // No execute function - will be handled by rendering UI components
})

// Add this new tool to the existing tools

/**
 * Find semantically similar memories or concepts
 */
const findSimilarMemoriesOrConcepts = tool({
  name: "findSimilarMemoriesOrConcepts",
  description: "Find memories or concepts that are semantically similar to the provided query text.",
  schema: z.object({
    queryText: z.string().describe("The concept or memory to find similar items for."),
    nodeTypes: z.array(z.string()).optional().default(["Value", "Goal"]).describe("Types of nodes to search for."),
    limit: z.number().int().positive().optional().default(5).describe("Maximum number of results to return."),
  }),
  execute: async (params, context) => {
    try {
      // Get userId from context for authorization
      const { userId } = context

      if (!userId) {
        logger.error("findSimilarMemoriesOrConcepts: No userId provided in context")
        throw new Error("Authorization failed: User ID not provided")
      }

      const { queryText, nodeTypes, limit } = params

      // Generate embedding for query text
      const embedding = await embeddingService.getEmbedding(queryText)

      // Perform vector similarity search
      const driver = neo4jDriver
      const kgService = new KgService(driver)

      const similarItems = await kgService.vectorSimilaritySearch(embedding, nodeTypes, userId, limit)

      return { similarItems }
    } catch (error) {
      logger.error(`Error in findSimilarMemoriesOrConcepts tool: ${error}`)
      throw new Error(`Failed to find similar items: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})

// Add the new tool to the serverTools array
export const serverTools = [
  getCurrentUserState,
  getCoreAttachments,
  getRecentInteractionSummary,
  requestStructuredInputTool,
  findSimilarMemoriesOrConcepts,
]
export const clientTools = [getClientLocation, askForConfirmation]
export const tools = [...serverTools, ...clientTools]
