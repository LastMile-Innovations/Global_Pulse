import { stopword } from "stopword"
import { logger } from "../utils/logger"
import type { KeywordExtractionOptions } from "../types/nlp-types"

/**
 * Extracts keywords from text using a frequency-based approach
 *
 * @param text The input text to extract keywords from
 * @param options Optional configuration for keyword extraction
 * @returns Array of keywords sorted by frequency (descending)
 */
export function extractKeywords(text: string, options?: KeywordExtractionOptions): string[] {
  try {
    // Handle empty or invalid input
    if (!text || typeof text !== "string") {
      return []
    }

    const { minWordLength = 3, maxKeywords = 10, customStopwords = [] } = options || {}

    // 1. Normalize text: lowercase and remove basic punctuation
    // Keep internal hyphens and apostrophes but remove sentence-ending punctuation
    const normalizedText = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()

    // 2. Tokenize: split text into individual words
    const tokens = normalizedText.split(" ")

    // 3. Filter stopwords using the stopword library
    const withoutStopwords = stopword.removeStopwords(tokens)

    // 4. Apply custom stopwords if provided
    const filteredTokens =
      customStopwords.length > 0 ? withoutStopwords.filter((word) => !customStopwords.includes(word)) : withoutStopwords

    // 5. Filter short words
    const significantTokens = filteredTokens.filter((word) => word.length >= minWordLength)

    // 6. Calculate frequency
    const frequencyMap: Record<string, number> = {}

    for (const token of significantTokens) {
      frequencyMap[token] = (frequencyMap[token] || 0) + 1
    }

    // 7. Rank and select top N keywords
    const sortedKeywords = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word)

    return sortedKeywords
  } catch (error) {
    logger.error(`Error extracting keywords: ${error}`)
    return []
  }
}
