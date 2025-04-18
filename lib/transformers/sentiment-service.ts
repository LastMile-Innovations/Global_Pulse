import { logger } from "../utils/logger"

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
 * Analyze sentiment of text
 * @param text Text to analyze
 * @returns Sentiment analysis result
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    // For MVP, use a simple rule-based approach
    // In a production system, this would call a proper sentiment analysis service

    // List of positive words
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "terrific",
      "outstanding",
      "superb",
      "brilliant",
      "awesome",
      "happy",
      "joy",
      "love",
      "like",
      "enjoy",
      "pleased",
      "delighted",
      "grateful",
      "thankful",
      "excited",
      "hopeful",
      "optimistic",
      "positive",
      "confident",
    ]

    // List of negative words
    const negativeWords = [
      "bad",
      "terrible",
      "horrible",
      "awful",
      "poor",
      "disappointing",
      "frustrating",
      "annoying",
      "irritating",
      "unpleasant",
      "sad",
      "unhappy",
      "angry",
      "upset",
      "worried",
      "anxious",
      "stressed",
      "depressed",
      "miserable",
      "hate",
      "dislike",
      "fear",
      "scared",
      "afraid",
      "concerned",
      "negative",
    ]

    // List of intensifiers
    const intensifiers = [
      "very",
      "extremely",
      "incredibly",
      "really",
      "absolutely",
      "completely",
      "totally",
      "utterly",
      "deeply",
      "highly",
      "strongly",
      "especially",
      "particularly",
      "exceptionally",
      "remarkably",
    ]

    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase()

    // Count positive and negative words
    let positiveCount = 0
    let negativeCount = 0
    let intensifierCount = 0

    // Check for positive words
    for (const word of positiveWords) {
      if (lowerText.includes(word)) {
        positiveCount++
      }
    }

    // Check for negative words
    for (const word of negativeWords) {
      if (lowerText.includes(word)) {
        negativeCount++
      }
    }

    // Check for intensifiers
    for (const word of intensifiers) {
      if (lowerText.includes(word)) {
        intensifierCount++
      }
    }

    // Calculate sentiment score (-1.0 to 1.0)
    const totalWords = positiveCount + negativeCount
    let score = 0

    if (totalWords > 0) {
      score = (positiveCount - negativeCount) / totalWords
    }

    // Calculate magnitude (0.0 to 1.0)
    // Higher magnitude means stronger sentiment
    let magnitude = Math.min((positiveCount + negativeCount) / 10, 1)

    // Adjust magnitude based on intensifiers
    magnitude = Math.min(magnitude * (1 + intensifierCount * 0.2), 1)

    // Determine sentiment label
    let label: "positive" | "negative" | "neutral"

    if (score > 0.1) {
      label = "positive"
    } else if (score < -0.1) {
      label = "negative"
    } else {
      label = "neutral"
    }

    return {
      score,
      magnitude,
      label,
    }
  } catch (error) {
    logger.error(`Error analyzing sentiment: ${error}`)

    // Return neutral sentiment on error
    return {
      score: 0,
      magnitude: 0,
      label: "neutral",
    }
  }
}
