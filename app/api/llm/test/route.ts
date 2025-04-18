import { NextResponse } from "next/server"
import { generateLlmResponseViaSdk } from "@/lib/llm/llm-gateway"
import { logger } from "@/lib/utils/logger"
import { LlmTestPayloadSchema } from "@/lib/schemas/api"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = LlmTestPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { prompt, config } = validationResult.data

    // Generate the LLM response
    const response = await generateLlmResponseViaSdk(prompt, config)

    // Return the response
    return NextResponse.json(response)
  } catch (error) {
    logger.error("Error in LLM test endpoint:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
