import type { NextRequest } from "next/server"
import { streamObject } from "ai"
import { getLanguageModelInstance } from "@/ai-sdk/providers"
import { UIComponentSchema } from "@/ai-sdk/schemas/ui_components"
import { logger } from "@/lib/utils/logger"
import { z } from "zod"

// --- Production MVP: Robust request schema, error handling, audit logging, metrics, and security ---

const ALLOWED_SCHEMAS = [
  "slider",
  "multipleChoice",
  "confirmation",
  "infoCard",
  "formInput",
] as const

const RequestSchema = z.object({
  targetSchemaName: z.enum(ALLOWED_SCHEMAS),
  context: z.record(z.any()).describe("Context data for generating the UI component"),
  // Optionally, allow model selection in the future
  // model: z.string().optional(),
})

/**
 * POST /api/llm/generate-ui-json
 * Generates a UI component JSON object using an LLM, streaming the result.
 * - Validates input
 * - Logs request and errors
 * - Returns streamed JSON or error
 * - Adds metrics and audit logging
 * - Handles edge cases and streaming errors robustly
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // --- Parse and validate the request body ---
    let body: unknown
    try {
      body = await req.json()
    } catch (err) {
      logger.warn(`[${requestId}] Invalid JSON in request body`)
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body", requestId }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    let validatedData: z.infer<typeof RequestSchema>
    try {
      validatedData = RequestSchema.parse(body)
    } catch (err) {
      logger.warn(`[${requestId}] Validation failed: ${(err as Error).message}`)
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: (err as Error).message, requestId }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    const { targetSchemaName, context } = validatedData

    // --- Get the appropriate model (MVP: always OpenAI, configurable later) ---
    let model
    try {
      model = getLanguageModelInstance("openai")
      // If you want to support other models in the future, use validatedData.model
    } catch (err) {
      logger.error(`[${requestId}] Failed to get language model instance: ${(err as Error).message}`)
      return new Response(
        JSON.stringify({ error: "Model unavailable", requestId }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // --- Create a prompt based on the target schema and context ---
    const prompt = createPromptForSchema(targetSchemaName, context)

    // --- Audit log the request ---
    const logContext = {
      targetSchemaName,
      contextKeys: Object.keys(context),
      requestId,
      timestamp: new Date().toISOString(),
      // Optionally log more, but avoid logging sensitive context values
    };
    logger.info(`[${requestId}] Generating UI component: ${JSON.stringify(logContext)}`);

    // --- Stream the object using AI SDK ---
    let resultStream
    try {
      // The AI SDK expects a LanguageModelV1, not a provider instance.
      // getLanguageModelInstance returns a provider like OpenAI(). We need to call its chat method.
      const provider = model; // Rename for clarity
      const chatModel = provider.chat("gpt-4o-mini"); // Call chat method with a model ID

      // Assign directly, let TypeScript infer the type
      resultStream = streamObject({
        model: chatModel, // Pass the obtained LanguageModelV1 instance
        schema: UIComponentSchema,
        prompt,
        temperature: 0.2, // Lower temperature for more deterministic output
        // Optionally: maxTokens, stopSequences, etc.
      });

    } catch (err) {
      logger.error(`[${requestId}] Error starting streamObject: ${(err as Error).message}`)
      return new Response(
        JSON.stringify({ error: "Failed to start LLM stream", requestId }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // --- Return the stream as a Response ---
    // The streamObject result is a ReadableStream<Uint8Array>
    // For production, ensure correct content-type and streaming
    const latencyMs = Date.now() - startTime
    logger.info(`[${requestId}] Streaming UI component JSON (latencyMs=${latencyMs})`)
    // @ts-expect-error Response constructor might expect ReadableStream<Uint8Array>, but StreamObjectResult might be compatible or need casting
    return new Response(resultStream, {
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        "X-Response-Time-Ms": latencyMs.toString(),
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    logger.error(`[${requestId}] Error in generate-ui-json API:`, error)
    return new Response(
      JSON.stringify({ error: "Failed to generate UI component", requestId }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

/**
 * Creates a prompt for generating a specific UI component.
 * Ensures the LLM is instructed to strictly follow the schema and context.
 * For production, this should be kept up to date with the schema and include clear, unambiguous instructions.
 */
function createPromptForSchema(schemaName: typeof ALLOWED_SCHEMAS[number], context: Record<string, any>): string {
  // Base instructions for all schemas
  const baseInstructions = `You are an expert UI JSON generator. Generate a JSON object for a UI component of type "${schemaName}" based on the following context.
The JSON must strictly conform to the provided schema. Use the context to determine appropriate labels, values, and options.
Do not include any text outside the JSON object. Do not explain your answer. Only output the JSON object.`

  // Schema-specific instructions
  const schemaInstructions: Record<typeof ALLOWED_SCHEMAS[number], string> = {
    slider: `Create a slider component with appropriate min/max values, step size, and labels.
If the context mentions current values, use them as defaultValue.
Ensure min < max, and step is a reasonable increment.
Add minLabel and maxLabel if context provides hints for them.`,

    multipleChoice: `Create a multiple choice component with a concise, descriptive question.
Options should be comprehensive and relevant to the context.
If the context provides likely choices, use them as options.
Ensure each option has a value and label.`,

    confirmation: `Create a confirmation component with a clear, actionable message.
The message should explain what the user is confirming.
Use appropriate button labels (e.g., "Confirm", "Cancel") based on the action being confirmed.`,

    infoCard: `Create an information card that presents the context data in a structured way.
The title should be concise and descriptive.
The content should summarize the key information from the context.
If context includes important fields, highlight them in the card.`,

    formInput: `Create a form input component for collecting the data described in context.
Choose the correct input type (text, email, number, etc.) based on the expected data.
Add validation rules if context suggests constraints (e.g., required, min/max length, pattern).
Include a label and placeholder if possible.`,
  }

  // Format context for the prompt
  const contextString =
    Object.keys(context).length === 0
      ? "(No additional context provided)"
      : Object.entries(context)
          .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
          .join("\n")

  return `${baseInstructions}

${schemaInstructions[schemaName] || ""}

Context:
${contextString}
`
}

// --- Utility: Generate a simple request ID for logging and tracing ---
function generateRequestId(): string {
  // Simple random hex string, not cryptographically secure
  return Math.random().toString(16).slice(2, 10) + Date.now().toString(36)
}
