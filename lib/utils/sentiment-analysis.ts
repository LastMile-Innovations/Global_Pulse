import { logger } from "./logger"

/**
 * Simple sentiment analysis result
 */
export interface SentimentResult {
  score: number // -1 to 1, negative to positive
  magnitude: number // 0 to 1, strength of sentiment
  label: "positive" | "negative" | "neutral" // Text label
}

/**
 * Perform a simplified sentiment analysis on text
 *
 * @param text The text to analyze
 * @returns A sentiment analysis result
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    // For MVP, use a simple lexicon-based approach
    // In production, this would be replaced with a proper NLP service

    // List of positive and negative words
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "happy",
      "joy",
      "love",
      "like",
      "enjoy",
      "pleased",
      "excited",
      "thank",
      "thanks",
      "grateful",
      "appreciate",
      "helpful",
      "positive",
    ]

    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "poor",
      "disappointing",
      "sad",
      "angry",
      "hate",
      "dislike",
      "upset",
      "frustrated",
      "annoyed",
      "sorry",
      "regret",
      "unhappy",
      "negative",
      "worried",
      "concerned",
    ]

    // Normalize text
    const normalizedText = text.toLowerCase()
    const words = normalizedText.split(/\s+/)

    // Count positive and negative words
    let positiveCount = 0
    let negativeCount = 0

    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, "")
      if (positiveWords.includes(cleanWord)) positiveCount++
      if (negativeWords.includes(cleanWord)) negativeCount++
    }

    // Calculate score (-1 to 1)
    const totalWords = words.length
    const totalSentimentWords = positiveCount + negativeCount

    // If no sentiment words found, return neutral
    if (totalSentimentWords === 0) {
      return {
        score: 0,
        magnitude: 0,
        label: "neutral",
      }
    }

    // Calculate score and magnitude
    const score = (positiveCount - negativeCount) / totalSentimentWords
    const magnitude = totalSentimentWords / totalWords

    // Determine label
    let label: "positive" | "negative" | "neutral"
    if (score > 0.1) label = "positive"
    else if (score < -0.1) label = "negative"
    else label = "neutral"

    return {
      score,
      magnitude,
      label,
    }
  } catch (error) {
    logger.error(`Error in analyzeSentiment: ${error}`)

    // Return neutral sentiment on error
    return {
      score: 0,
      magnitude: 0,
      label: "neutral",
    }
  }
}
