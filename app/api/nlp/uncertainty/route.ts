import { NextResponse } from "next/server"
import { detectUncertainty } from "@/lib/nlp/uncertainty-detection"
import { getCoreNlpFeatures } from "@/lib/nlp/nlp-features"
import { getTemplatedResponse } from "@/lib/responses/template-filler"
import { logger } from "@/lib/utils/logger"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid request. Text is required." }, { status: 400 })
    }

    // Get NLP features
    const nlpFeatures = await getCoreNlpFeatures(text)

    // Detect uncertainty
    const uncertaintyResult = detectUncertainty(text, nlpFeatures)

    // Find matched phrases
    const matchedPhrases = findMatchedPhrases(text)

    // Generate a suggested response if uncertainty is detected
    let suggestedResponse = "I understand. Would you like to tell me more about that?"

    if (uncertaintyResult.isExpressingUncertainty) {
      suggestedResponse = await getTemplatedResponse(
        "validate_uncertainty",
        {
          userId: "test-user",
          sessionId: "test-session",
          user_message: text,
          topic_or_feeling: uncertaintyResult.uncertaintyTopic || "this",
        },
        { useLlmAssistance: true },
      )
    }

    // Return the result
    return NextResponse.json({
      ...uncertaintyResult,
      matchedPhrases,
      suggestedResponse,
    })
  } catch (error) {
    logger.error("Error analyzing uncertainty:", error)
    return NextResponse.json({ error: "Failed to analyze text. Please try again." }, { status: 500 })
  }
}

/**
 * Find uncertainty phrases that match in the text
 * @param text Text to analyze
 * @returns Array of matched phrases
 */
function findMatchedPhrases(text: string): string[] {
  const lowerText = text.toLowerCase()
  const uncertaintyPhrases = [
    "don't know",
    "not sure",
    "unsure",
    "uncertain",
    "confused",
    "confusing",
    "unclear",
    "ambiguous",
    "maybe",
    "perhaps",
    "possibly",
    "it depends",
    "hard to say",
    "difficult to tell",
    "can't decide",
    "can't tell",
    "not certain",
    "don't understand",
    "no idea",
    "who knows",
    "wondering",
    "wonder if",
    "not clear",
    "puzzled",
    "puzzling",
    "perplexed",
    "perplexing",
    "bewildered",
    "bewildering",
    "baffled",
    "baffling",
    "lost",
    "undecided",
    "on the fence",
    "torn",
    "conflicted",
    "in two minds",
    "hesitant",
    "hesitating",
    "not convinced",
    "doubt",
    "doubtful",
    "skeptical",
    "questionable",
  ]

  return uncertaintyPhrases.filter((phrase) => lowerText.includes(phrase))
}
