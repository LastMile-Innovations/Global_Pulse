import type { NextRequest } from "next/server"
import { streamObject } from "ai"
import { getLanguageModelInstance } from "@/ai-sdk/providers"
import { UIComponentSchema } from "@/ai-sdk/schemas/ui_components"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { GenUIPayloadSchema } from "@/lib/schemas/api"

/**
 * POST /api/genui
 * Generates a UI component JSON object based on the provided schema name and context.
 * Requires authentication.
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(req)
    if (!userId) {
      logger.warn("Unauthorized attempt to generate UI component")
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse and validate the request body
    let body: any
    try {
      body = await req.json()
    } catch (err) {
      logger.warn("Invalid JSON in genui request")
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const validationResult = GenUIPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      logger.warn("Validation failed for genui request")
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validationResult.error.format() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { targetSchemaName, context } = validationResult.data

    // Get the appropriate model (default to OpenAI, can be extended)
    const provider = getLanguageModelInstance("openai")
    if (!provider) {
      logger.error("No language model provider available")
      return new Response(JSON.stringify({ error: "No language model provider available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
    const model = provider.chat("gpt-4o")

    // Create a prompt based on the target schema and context
    const prompt = createPromptForSchema(targetSchemaName, context)

    // Log the request
    logger.info(
      `Generating UI component: ${targetSchemaName} for user: ${userId} with context keys: ${Object.keys(context).join(", ")}`,
    )

    // Stream the object using AI SDK
    let result
    try {
      result = await streamObject({
        model,
        schema: UIComponentSchema,
        prompt,
        temperature: 0.2, // Lower temperature for more deterministic output
      })
    } catch (err) {
      logger.error("Error streaming object from AI SDK", err)
      return new Response(JSON.stringify({ error: "Failed to generate UI component" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Return the stream
    return result.toTextStreamResponse()
  } catch (error) {
    logger.error("Error in genui API:", error)
    return new Response(JSON.stringify({ error: "Failed to generate UI component" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

/**
 * Creates a prompt for generating a specific UI component.
 * @param schemaName The name of the UI component schema (e.g., "slider", "multipleChoice").
 * @param context Contextual information to guide the component generation.
 * @returns A string prompt for the language model.
 */
function createPromptForSchema(schemaName: string, context: Record<string, any>): string {
  // Base instructions for all schemas
  const baseInstructions = `You are an expert UI generator. Generate a JSON object for a UI component of type "${schemaName}" based on the following context.
The JSON must strictly conform to the provided schema. Use the context to determine appropriate labels, values, and options.
If the context is insufficient, make reasonable assumptions and provide sensible defaults.`

  // Schema-specific instructions
  const schemaInstructions: Record<string, string> = {
    slider: `- Create a slider component with appropriate min/max values, step size, and labels.
- Consider what would be intuitive ranges based on the context.
- If the context mentions current values, use them as defaultValue.
- Add minLabel and maxLabel if appropriate.
- If units are relevant, include them in the label or description.`,

    multipleChoice: `- Create a multiple choice component with clear, distinct options.
- The question should be concise but descriptive.
- Options should be comprehensive and cover the likely choices based on context.
- If a default or pre-selected option is appropriate, set it.
- If the context includes previous answers, consider them.`,

    confirmation: `- Create a confirmation component with a clear message.
- The message should explain what the user is confirming.
- Use appropriate button labels based on the action being confirmed (e.g., "Yes, delete", "Cancel").
- If the context includes consequences, mention them in the message.`,

    infoCard: `- Create an information card that presents the context data in a structured way.
- The title should be concise and descriptive.
- The content should summarize the key information from the context.
- If there are important highlights, emphasize them in the content.
- Use bullet points or sections if the context is complex.`,

    formInput: `- Create a form input component appropriate for collecting the data mentioned in context.
- Choose the right input type (text, email, number, date, etc.) based on the expected data.
- Add appropriate validation if needed (e.g., required, min/max length, pattern).
- If the context includes example values, use them as placeholders.
- If multiple fields are needed, include them as an array of inputs.`,
  }

  // Combine instructions and format context
  const contextString = Object.entries(context ?? {})
    .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
    .join("\n")

  return `${baseInstructions}

${schemaInstructions[schemaName] || ""}

Context:
${contextString || "(none)"}

Generate only the JSON object with no additional text or explanation.`
}
