import { logger } from "../utils/logger"
import { generateObject } from "ai"
import { z } from "zod"

// Advanced: Use Vercel AI SDK for LLM-powered sentiment analysis, with fallback to improved rule-based logic

/**
 * Sentiment analysis result
 */
export interface SentimentResult {
  /**
   * Sentiment score (-1.0 to 1.0)
   * Negative values indicate negative sentiment, positive values indicate positive sentiment
   */
  score: number

  /**
   * Sentiment magnitude (0.0 to 1.0)
   * Higher values indicate stronger sentiment
   */
  magnitude: number

  /**
   * Sentiment label (positive, negative, neutral)
   */
  label: "positive" | "negative" | "neutral"
}

/**
 * Zod schema for LLM output validation
 */
const SentimentResultSchema = z.object({
  score: z.number().min(-1).max(1),
  magnitude: z.number().min(0).max(1),
  label: z.enum(["positive", "negative", "neutral"]),
})

type LLMSentimentResult = z.infer<typeof SentimentResultSchema>;

/**
 * Analyze sentiment of text using LLM (Vercel AI SDK) with fallback to advanced rule-based logic.
 * @param text Text to analyze
 * @returns Sentiment analysis result
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Try LLM-based analysis first for best accuracy
  try {
    // Use generateObject for structured, robust output
    const prompt = `
Analyze the sentiment of the following text. 
Return a JSON object with:
- "score": a number from -1.0 (very negative) to 1.0 (very positive)
- "magnitude": a number from 0.0 (neutral/weak) to 1.0 (very strong sentiment)
- "label": "positive", "negative", or "neutral" (based on the overall sentiment)

Text: """${text}"""
`
    // Only pass a model if the API key is set, otherwise omit the model property
    const generateObjectArgs: any = {
      schema: SentimentResultSchema,
      prompt,
      maxTokens: 128,
      temperature: 0.0,
      experimental_telemetry: { isEnabled: true, functionId: "sentiment" },
      // Optionally, add repairText for robustness
      experimental_repairText: async ({ text, error }: { text: string; error: any }) => {
        logger?.warn?.(`[Sentiment] LLM output repair triggered: ${error}`)
        // Try to extract JSON from malformed output
        const match = text.match(/\{[\s\S]*\}/)
        return match ? match[0] : text
      },
    }
    if (process.env.OPENAI_API_KEY) {
      generateObjectArgs.model = { provider: "openai", model: "gpt-3.5-turbo" }
    }

    const { object, usage, warnings } = await generateObject(generateObjectArgs)
    const llmResult = object as LLMSentimentResult

    if (llmResult) {
      logger?.debug?.(
        `[Sentiment][LLM] text="${text}" score=${llmResult.score} mag=${llmResult.magnitude} label=${llmResult.label} usage=${JSON.stringify(
          usage
        )} warnings=${JSON.stringify(warnings)}`
      )
      return llmResult
    }
  } catch (error) {
    logger?.warn?.(`[Sentiment][LLM] Fallback to rule-based: ${error}`)
    // Continue to rule-based fallback
  }

  // --- Advanced Rule-Based Fallback (improved) ---
  try {
    // Expanded lexicons and negation handling
    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "fantastic", "terrific", "outstanding", "superb",
      "brilliant", "awesome", "happy", "joy", "love", "like", "enjoy", "pleased", "delighted", "grateful",
      "thankful", "excited", "hopeful", "optimistic", "positive", "confident", "satisfied", "impressed", "blessed",
      "cheerful", "glad", "enthusiastic", "marvelous", "spectacular", "fabulous", "charming", "admirable"
    ]
    const negativeWords = [
      "bad", "terrible", "horrible", "awful", "poor", "disappointing", "frustrating", "annoying", "irritating",
      "unpleasant", "sad", "unhappy", "angry", "upset", "worried", "anxious", "stressed", "depressed",
      "miserable", "hate", "dislike", "fear", "scared", "afraid", "concerned", "negative", "unsatisfied",
      "disgusted", "dismal", "pathetic", "regret", "resent", "unimpressed", "hopeless", "unfortunate"
    ]
    const intensifiers = [
      "very", "extremely", "incredibly", "really", "absolutely", "completely", "totally", "utterly", "deeply",
      "highly", "strongly", "especially", "particularly", "exceptionally", "remarkably", "so", "super", "mega"
    ]
    const negations = [
      "not", "never", "no", "none", "hardly", "barely", "scarcely", "neither", "nor", "without", "cannot", "isn't", "wasn't", "aren't", "don't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't", "can't"
    ]

    // Tokenize and keep track of negation context
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s!]/g, " ")
      .split(/\s+/)
      .filter(Boolean)

    let positiveCount = 0
    let negativeCount = 0
    let intensifierCount = 0
    let negationWindow = 0

    // Sliding window for negation (negates next 2 tokens)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (negations.includes(token)) {
        negationWindow = 2
        continue
      }
      let isNegated = negationWindow > 0
      if (positiveWords.includes(token)) {
        if (isNegated) {
          negativeCount++
        } else {
          positiveCount++
        }
      }
      if (negativeWords.includes(token)) {
        if (isNegated) {
          positiveCount++
        } else {
          negativeCount++
        }
      }
      if (intensifiers.includes(token)) intensifierCount++
      if (negationWindow > 0) negationWindow--
    }

    // Exclamation and ALL CAPS boost
    let exclamationBoost = 0
    const exclamations = (text.match(/!/g) || []).length
    if (exclamations > 0) {
      exclamationBoost = Math.min(exclamations * 0.05, 0.2)
    }
    let capsBoost = 0
    const capsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).length
    if (capsWords > 0) {
      capsBoost = Math.min(capsWords * 0.03, 0.15)
    }

    // Calculate sentiment score (-1.0 to 1.0)
    const totalSentimentWords = positiveCount + negativeCount
    let score = 0
    if (totalSentimentWords > 0) {
      score = (positiveCount - negativeCount) / totalSentimentWords
    }
    // Add exclamation/caps boost if sentiment is strong
    if (score > 0) score += exclamationBoost + capsBoost
    if (score < 0) score -= exclamationBoost + capsBoost

    // Clamp score
    score = Math.max(-1, Math.min(1, score))

    // Calculate magnitude (0.0 to 1.0)
    let magnitude = Math.min(totalSentimentWords / 8, 1)
    if (magnitude > 0) {
      magnitude = Math.min(magnitude * (1 + intensifierCount * 0.18), 1)
    } else if (exclamationBoost + capsBoost > 0) {
      magnitude = Math.min(exclamationBoost + capsBoost, 1)
    }

    // If no sentiment words, but exclamations/caps, treat as weak positive
    if (totalSentimentWords === 0 && (exclamationBoost + capsBoost) > 0) {
      score = exclamationBoost + capsBoost
      magnitude = exclamationBoost + capsBoost
    }

    // Determine sentiment label
    let label: "positive" | "negative" | "neutral"
    if (score > 0.15) {
      label = "positive"
    } else if (score < -0.15) {
      label = "negative"
    } else {
      label = "neutral"
    }

    logger?.debug?.(
      `[Sentiment][Fallback] text="${text}" tokens=${JSON.stringify(tokens)} pos=${positiveCount} neg=${negativeCount} intens=${intensifierCount} score=${score} mag=${magnitude} label=${label} exclam=${exclamationBoost} caps=${capsBoost}`
    )

    return {
      score,
      magnitude,
      label,
    }
  } catch (error) {
    logger?.error?.(`Error analyzing sentiment: ${error}`)
    // Return neutral sentiment on error
    return {
      score: 0,
      magnitude: 0,
      label: "neutral",
    }
  }
}
