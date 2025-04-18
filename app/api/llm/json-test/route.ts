import { NextResponse } from "next/server"
import { generateLlmJsonViaSdk } from "@/lib/llm/llm-gateway"
import { logger } from "@/lib/utils/logger"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { prompt, config } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required and must be a string" }, { status: 400 })
    }

    // Generate the LLM JSON response
    const response = await generateLlmJsonViaSdk(prompt, config)

    // Return the response
    return NextResponse.json(response)
  } catch (error) {
    logger.error("Error in LLM JSON test endpoint:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
