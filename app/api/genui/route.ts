import type { NextRequest } from "next/server"
import { streamObject } from "ai"
import { getLanguageModelInstance } from "@/lib/ai-sdk/providers"
import { UIComponentSchema } from "@/lib/ai-sdk/schemas/ui_components"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { GenUIPayloadSchema } from "@/lib/schemas/api"

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse and validate the request body
    const body = await req.json()
    const validationResult = GenUIPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Validation failed", details: validationResult.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { targetSchemaName, context } = validationResult.data

    // Get the appropriate model
    const model = getLanguageModelInstance("openai")

    // Create a prompt based on the target schema and context
    const prompt = createPromptForSchema(targetSchemaName, context)

    // Log the request
    logger.info(`Generating UI component: ${targetSchemaName}`, {
      userId,
      targetSchemaName,
      contextKeys: Object.keys(context),
    })

    // Stream the object using AI SDK
    const result = await streamObject({
      model,
      schema: UIComponentSchema,
      prompt,
      temperature: 0.2, // Lower temperature for more deterministic output
    })

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
 * Creates a prompt for generating a specific UI component
 */
function createPromptForSchema(schemaName: string, context: Record<string, any>): string {
  // Base instructions for all schemas
  const baseInstructions = `Generate a JSON object for a UI component of type "${schemaName}" based on the following context. 
The JSON must strictly conform to the provided schema. Use the context to determine appropriate labels, values, and options.`

  // Schema-specific instructions
  const schemaInstructions: Record<string, string> = {
    slider: `Create a slider component with appropriate min/max values, step size, and labels.
Consider what would be intuitive ranges based on the context.
If the context mentions current values, use them as defaultValue.`,

    multipleChoice: `Create a multiple choice component with clear options.
The question should be concise but descriptive.
Options should be comprehensive and cover the likely choices based on context.`,

    confirmation: `Create a confirmation component with a clear message.
The message should explain what the user is confirming.
Use appropriate button labels based on the action being confirmed.`,

    infoCard: `Create an information card that presents the context data in a structured way.
The title should be concise and descriptive.
The content should summarize the key information from the context.`,

    formInput: `Create a form input component appropriate for collecting the data mentioned in context.
Choose the right input type (text, email, number, etc.) based on the expected data.
Add appropriate validation if needed.`,
  }

  // Combine instructions and format context
  const contextString = Object.entries(context)
    .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
    .join("\n")

  return `${baseInstructions}

${schemaInstructions[schemaName] || ""}

Context:
${contextString}

Generate only the JSON object with no additional text or explanation.`
}
