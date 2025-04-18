import { NextResponse } from "next/server"
import { getCoreNlpFeatures } from "@/lib/nlp/nlp-features"
import { logger } from "@/lib/utils/logger"
import { NlpAnalyzePayloadSchema } from "@/lib/schemas/api"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = NlpAnalyzePayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { text } = validationResult.data

    // Get NLP features
    const nlpFeatures = await getCoreNlpFeatures(text)

    // Return the features
    return NextResponse.json(nlpFeatures)
  } catch (error) {
    logger.error("Error analyzing text:", error)
    return NextResponse.json({ error: "Failed to analyze text. Please try again." }, { status: 500 })
  }
}
