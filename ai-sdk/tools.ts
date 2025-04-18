import { tool, type Tool } from "ai"
import { z } from "zod"
import { KgService } from "../lib/db/graph/kg-service"
import { getNeo4jDriver } from "../lib/db/graph/neo4j-driver"
import { logger } from "../lib/utils/logger"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ToolExecutionOptions } from "ai"

// Import the embedding service
import { embeddingService } from "./embedding-service"

// Initialize services
const kgService = new KgService(getNeo4jDriver())

// Schemas for tools
const GetCurrentUserStateSchema = z.object({});
const GetCoreAttachmentsSchema = z.object({
  attachmentType: z
    .enum(["Value", "Goal", "Need"])
    .describe("The type of attachment to retrieve (Value, Goal, or Need)"),
  limit: z.number().int().positive().optional().default(3).describe("The maximum number of attachments to return"),
});
const GetRecentInteractionSummarySchema = z.object({
  numTurns: z.number().int().positive().optional().default(5).describe("The number of recent turns to summarize"),
});
const RequestStructuredInputSchema = z.object({
  schemaToGenerate: z
    .enum(["slider", "multipleChoice", "confirmation", "infoCard", "formInput"])
    .describe("The type of UI element needed"),
  contextParams: z.record(z.any()).describe("Contextual parameters for the UI"),
});
const GetClientLocationSchema = z.object({});
const AskForConfirmationSchema = z.object({
  message: z.string().describe("The question or action requiring confirmation."),
  context: z.string().optional().describe("Additional context for the confirmation request."),
});
const FindSimilarMemoriesOrConceptsSchema = z.object({
  queryText: z.string().describe("The concept or memory to find similar items for."),
  nodeTypes: z.array(z.string()).optional().default(["Value", "Goal"]).describe("Types of nodes to search for."),
  limit: z.number().int().positive().optional().default(5).describe("Maximum number of results to return."),
});

/**
 * Get the user's current emotional state
 */
export const getCurrentUserState: Tool<typeof GetCurrentUserStateSchema> = {
  description: "Get the user's most recently inferred emotional state (mood and stress).",
  parameters: GetCurrentUserStateSchema,
  execute: async (params, context?: ToolExecutionOptions) => {
    try {
      const userId = (context as any)?.userId;
      if (!userId) {
        logger.warn("getCurrentUserState: No userId found in context. Authorization might be needed differently.");
        throw new Error("User ID not available in tool context");
      }

      const cypher = `
        MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)-[:HAS_STATE]->(s:UserStateInstance)
        RETURN s
        ORDER BY s.timestamp DESC
        LIMIT 1
      `;
      const result = await kgService.kgLayer.executeCypherSingle(cypher, { userId });

      if (!result) {
        return {
          moodEstimate: 5, stressEstimate: 3, note: "No previous state data found..."
        };
      }
      const state = result.get("s").properties;
      return {
        moodEstimate: state.moodEstimate,
        stressEstimate: state.stressEstimate,
        timestamp: state.timestamp.toNumber ? state.timestamp.toNumber() : state.timestamp,
      };
    } catch (error) {
      logger.error(`Error in getCurrentUserState tool: ${error}`);
      throw new Error(`Failed to retrieve user state: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

/**
 * Get the user's core attachments
 */
export const getCoreAttachments: Tool<typeof GetCoreAttachmentsSchema> = {
  description: "Retrieve the user's top attachments (Value, Goal, Need).",
  parameters: GetCoreAttachmentsSchema,
  execute: async ({ attachmentType, limit }, context?: ToolExecutionOptions) => {
    try {
      const userId = (context as any)?.userId;
      if (!userId) {
        logger.warn("getCoreAttachments: No userId found in context.");
        throw new Error("User ID not available in tool context");
      }
      const cypher = `
        MATCH (u:User {userID: $userId})-[r:HOLDS_ATTACHMENT]->(a:${attachmentType})
        RETURN a.name as name, r.powerLevel as powerLevel, r.valuation as valence
        ORDER BY r.powerLevel DESC
        LIMIT $limit
      `;
      const results = await kgService.kgLayer.executeCypher(cypher, { userId, limit });

       if (!results || results.length === 0) {
         return { attachments: [], note: `No ${attachmentType.toLowerCase()} attachments found` };
       }
       const attachments = results.map((record) => ({
         name: record.get("name"),
         powerLevel: record.get("powerLevel"),
         valence: record.get("valence"),
       }));
       return { attachments };
    } catch (error) {
      logger.error(`Error in getCoreAttachments tool: ${error}`);
      throw new Error(`Failed to retrieve core attachments: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

/**
 * Get a summary of recent interactions
 */
export const getRecentInteractionSummary: Tool<typeof GetRecentInteractionSummarySchema> = {
  description: "Get a brief summary of the last few user/assistant turns.",
  parameters: GetRecentInteractionSummarySchema,
  execute: async ({ numTurns }, context?: ToolExecutionOptions) => {
    try {
      const userId = (context as any)?.userId;
      if (!userId) {
        logger.warn("getRecentInteractionSummary: No userId found in context.");
        throw new Error("User ID not available in tool context");
      }
      const cypher = `
        MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)
        RETURN i.userInput as userInput, i.agentResponse as agentResponse, i.timestamp as timestamp
        ORDER BY i.timestamp DESC
        LIMIT $numTurns
      `;
      const results = await kgService.kgLayer.executeCypher(cypher, { userId, numTurns });

      if (!results || results.length === 0) {
        return { summary: "No recent interactions found for this user." };
      }
      const interactions = results
        .map((record) => ({
          userInput: record.get("userInput"),
          agentResponse: record.get("agentResponse"),
          timestamp: record.get("timestamp").toNumber ? record.get("timestamp").toNumber() : record.get("timestamp"),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      const transcript = interactions
        .map((int) => `User: ${int.userInput}\nAssistant: ${int.agentResponse}`)
        .join("\n\n");
      const { text: summary } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Summarize the following conversation...\n\n${transcript}`,
      });
      return { summary };
    } catch (error) {
      logger.error(`Error in getRecentInteractionSummary tool: ${error}`);
      throw new Error(`Failed to generate interaction summary: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

/**
 * Request structured input via UI (client-side)
 */
export const requestStructuredInputTool: Tool<typeof RequestStructuredInputSchema> = {
  description: "Request specific, structured input from the user via a UI element.",
  parameters: RequestStructuredInputSchema,
};

/**
 * Get user location (client-side)
 */
export const getClientLocation: Tool<typeof GetClientLocationSchema> = {
  description: "Get the user's approximate current city using browser location services.",
  parameters: GetClientLocationSchema,
};

/**
 * Ask for confirmation (client-side)
 */
export const askForConfirmation: Tool<typeof AskForConfirmationSchema> = {
  description: "Present a message to the user and ask for explicit confirmation (Yes/No).",
  parameters: AskForConfirmationSchema,
};

/**
 * Find semantically similar memories or concepts
 */
export const findSimilarMemoriesOrConcepts: Tool<typeof FindSimilarMemoriesOrConceptsSchema> = {
  description: "Find memories or concepts semantically similar to the query text.",
  parameters: FindSimilarMemoriesOrConceptsSchema,
  execute: async ({ queryText, nodeTypes, limit }, context?: ToolExecutionOptions) => {
    try {
      const userId = (context as any)?.userId;
      if (!userId) {
        logger.warn("findSimilarMemoriesOrConcepts: No userId found in context.");
      }
      const embedding = await embeddingService.getEmbedding(queryText);
      logger.warn("kgService.vectorSimilaritySearch is not implemented. Skipping similarity search.");
      const similarItems: any[] = [];
      // const similarItems = await kgService.vectorSimilaritySearch(embedding, nodeTypes, userId, limit); // Commented out
      return { similarItems };
    } catch (error) {
      logger.error(`Error in findSimilarMemoriesOrConcepts tool: ${error}`);
      throw new Error(`Failed to find similar items: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

// Export tools grouped by execution environment
export const serverTools = {
  getCurrentUserState,
  getCoreAttachments,
  getRecentInteractionSummary,
  findSimilarMemoriesOrConcepts,
  requestStructuredInputTool,
};
export const clientTools = {
  getClientLocation,
  askForConfirmation,
};

// Combine all tools for potential use in a single list if needed by the SDK
export const allTools = { ...serverTools, ...clientTools };
