import { logger } from "../utils/logger"
import type { NlpFeatures } from "../types/nlp-types"

/**
 * List of phrases indicating uncertainty or ambiguity
 */
const UNCERTAINTY_PHRASES = [
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
  "?",
]

/**
 * Result of uncertainty detection
 */
export interface UncertaintyDetectionResult {
  /**
   * Whether uncertainty was detected
   */
  isExpressingUncertainty: boolean

  /**
   * Confidence score (0.0 to 1.0)
   */
  confidenceScore: number

  /**
   * The specific term or topic the user is uncertain about (if identified)
   */
  uncertaintyTopic?: string
}

/**
 * Detect uncertainty in user message
 * @param text User message text
 * @param nlpFeatures NLP features from analysis
 * @returns Uncertainty detection result
 */
export function detectUncertainty(text: string, nlpFeatures: NlpFeatures): UncertaintyDetectionResult {
  try {
    const lowerText = text.toLowerCase()

    // Initialize result
    const result: UncertaintyDetectionResult = {
      isExpressingUncertainty: false,
      confidenceScore: 0.0,
    }

    // Check for uncertainty phrases
    let matchCount = 0
    let matchedPhrase = ""

    for (const phrase of UNCERTAINTY_PHRASES) {
      if (lowerText.includes(phrase)) {
        matchCount++
        if (!matchedPhrase || phrase.length > matchedPhrase.length) {
          matchedPhrase = phrase
        }
      }
    }

    // Check for question patterns that indicate uncertainty
    if (
      lowerText.startsWith("what if") ||
      lowerText.startsWith("i wonder") ||
      lowerText.startsWith("could it be") ||
      lowerText.startsWith("is it possible") ||
      lowerText.includes("should i") ||
      lowerText.includes("would it be")
    ) {
      matchCount++
    }

    // Calculate confidence score based on match count
    // More matches = higher confidence
    if (matchCount > 0) {
      result.isExpressingUncertainty = true
      result.confidenceScore = Math.min(0.5 + matchCount * 0.1, 0.9) // Cap at 0.9

      // Try to identify the uncertainty topic
      result.uncertaintyTopic = extractUncertaintyTopic(text, matchedPhrase, nlpFeatures)
    }

    return result
  } catch (error) {
    logger.error(`Error in detectUncertainty: ${error}`)
    return {
      isExpressingUncertainty: false,
      confidenceScore: 0.0,
    }
  }
}

/**
 * Extract the topic the user is uncertain about
 * @param text User message text
 * @param matchedPhrase The uncertainty phrase that was matched
 * @param nlpFeatures NLP features from analysis
 * @returns The uncertainty topic, or undefined if not identified
 */
function extractUncertaintyTopic(text: string, matchedPhrase: string, nlpFeatures: NlpFeatures): string | undefined {
  try {
    const lowerText = text.toLowerCase()

    // Check for common patterns like "I'm not sure about X"
    const aboutPatterns = ["about", "regarding", "concerning", "with", "on"]

    for (const pattern of aboutPatterns) {
      const phraseWithPattern = `${matchedPhrase} ${pattern}`
      const index = lowerText.indexOf(phraseWithPattern)

      if (index !== -1) {
        // Extract text after the pattern
        const startIndex = index + phraseWithPattern.length + 1
        let endIndex = text.length

        // Look for end punctuation
        const punctuation = [".", ",", "!", "?", ";"]
        for (const punct of punctuation) {
          const punctIndex = text.indexOf(punct, startIndex)
          if (punctIndex !== -1 && punctIndex < endIndex) {
            endIndex = punctIndex
          }
        }

        const topic = text.substring(startIndex, endIndex).trim()
        if (topic) {
          return topic
        }
      }
    }

    // If no pattern match, try using NLP entities or keywords
    if (nlpFeatures.entities.length > 0) {
      // Use the most prominent entity
      return nlpFeatures.entities[0].text
    }

    if (nlpFeatures.keywords.length > 0) {
      // Use the first keyword
      return nlpFeatures.keywords[0]
    }

    // If no topic identified, return undefined
    return undefined
  } catch (error) {
    logger.error(`Error in extractUncertaintyTopic: ${error}`)
    return undefined
  }
}
