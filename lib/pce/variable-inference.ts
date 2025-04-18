import { logger } from "../utils/logger"
import type { RuleVariables } from "../types/pce-types"
import type { Entity, SentimentResult } from "../types/nlp-types"

/**
 * Infers MHH variables from text using heuristic methods
 * @param text The text to analyze
 * @param nlpFeatures NLP features extracted from the text
 * @returns Inferred MHH variables with confidence scores
 */
export async function inferMhhVariablesHeuristic(
  text: string,
  entities: Entity[],
  sentiment: SentimentResult,
): Promise<RuleVariables> {
  try {
    // Normalize text for analysis
    const normalizedText = text.toLowerCase()

    // 1. Infer Source (internal, external, valueSelf)
    const sourceResult = inferSource(normalizedText)

    // 2. Infer Perspective (self, other, both)
    const perspectiveResult = inferPerspective(normalizedText)

    // 3. Infer Timeframe (past, present, future)
    const timeframeResult = inferTimeframe(normalizedText)

    // 4. Infer Acceptance State (accepted, resisted, uncertain)
    const acceptanceResult = inferAcceptanceState(normalizedText, sentiment)

    return {
      source: sourceResult,
      perspective: perspectiveResult,
      timeframe: timeframeResult,
      acceptanceState: acceptanceResult,
    }
  } catch (error) {
    logger.error(`Error inferring MHH variables: ${error}`)

    // Return default values on error
    return {
      source: { value: "external", confidence: 0.5 },
      perspective: { value: "self", confidence: 0.5 },
      timeframe: { value: "present", confidence: 0.5 },
      acceptanceState: { value: "uncertain", confidence: 0.5 },
    }
  }
}

// Helper functions for inferring each MHH variable (implementation details omitted for brevity)
function inferSource(text: string): { value: "internal" | "external" | "valueSelf"; confidence: number } {
  // Default to external with medium confidence
  let source: "internal" | "external" | "valueSelf" = "external"
  let confidence = 0.6

  // Check for internal source indicators
  const internalIndicators = [
    "i feel",
    "i think",
    "i believe",
    "i want",
    "i need",
    "i wish",
    "my feeling",
    "my thought",
    "my belief",
    "my desire",
    "my need",
    "inside me",
    "within me",
    "in my mind",
    "in my heart",
  ]

  // Check for value-self source indicators
  const valueSelfIndicators = [
    "i value",
    "i care about",
    "important to me",
    "matters to me",
    "my value",
    "my principle",
    "my standard",
    "my ideal",
    "i stand for",
    "i believe in",
    "i uphold",
  ]

  // Check for external source indicators
  const externalIndicators = [
    "they",
    "them",
    "their",
    "he",
    "she",
    "it",
    "you",
    "we",
    "us",
    "people",
    "everyone",
    "anybody",
    "somebody",
    "world",
    "society",
    "happened",
    "occurred",
    "took place",
    "event",
    "situation",
  ]

  // Count matches for each category
  let internalCount = 0
  let valueSelfCount = 0
  let externalCount = 0

  // Check internal indicators
  for (const indicator of internalIndicators) {
    if (text.includes(indicator)) {
      internalCount++
    }
  }

  // Check value-self indicators
  for (const indicator of valueSelfIndicators) {
    if (text.includes(indicator)) {
      valueSelfCount++
    }
  }

  // Check external indicators
  for (const indicator of externalIndicators) {
    if (text.includes(indicator)) {
      externalCount++
    }
  }

  // Determine source based on counts
  if (valueSelfCount > 0 && valueSelfCount >= internalCount && valueSelfCount >= externalCount) {
    source = "valueSelf"
    confidence = 0.5 + valueSelfCount * 0.1 // Increase confidence with more matches
  } else if (internalCount > externalCount) {
    source = "internal"
    confidence = 0.5 + internalCount * 0.1 // Increase confidence with more matches
  } else {
    source = "external"
    confidence = 0.5 + externalCount * 0.1 // Increase confidence with more matches
  }

  // Cap confidence at 0.9
  confidence = Math.min(confidence, 0.9)

  return { value: source, confidence }
}

function inferPerspective(text: string): { value: "self" | "other" | "both"; confidence: number } {
  // Default to self with medium confidence
  let perspective: "self" | "other" | "both" = "self"
  let confidence = 0.6

  // Check for self perspective indicators
  const selfIndicators = [
    "i ",
    "me",
    "my",
    "mine",
    "myself",
    "i'm",
    "i've",
    "i'll",
    "i'd",
    "for me",
    "to me",
    "with me",
  ]

  // Check for other perspective indicators
  const otherIndicators = [
    "they ",
    "them",
    "their",
    "theirs",
    "themselves",
    "he ",
    "him",
    "his",
    "himself",
    "she ",
    "her",
    "hers",
    "herself",
    "you ",
    "your",
    "yours",
    "yourself",
    "people",
    "others",
    "everyone",
    "anybody",
  ]

  // Count matches for each category
  let selfCount = 0
  let otherCount = 0

  // Check self indicators
  for (const indicator of selfIndicators) {
    if (text.includes(indicator)) {
      selfCount++
    }
  }

  // Check other indicators
  for (const indicator of otherIndicators) {
    if (text.includes(indicator)) {
      otherCount++
    }
  }

  // Determine perspective based on counts
  if (selfCount > 0 && otherCount > 0) {
    perspective = "both"
    confidence = 0.5 + Math.min(selfCount, otherCount) * 0.1 // Confidence based on the weaker signal
  } else if (selfCount > otherCount) {
    perspective = "self"
    confidence = 0.5 + selfCount * 0.1 // Increase confidence with more matches
  } else if (otherCount > 0) {
    perspective = "other"
    confidence = 0.5 + otherCount * 0.1 // Increase confidence with more matches
  }

  // Cap confidence at 0.9
  confidence = Math.min(confidence, 0.9)

  return { value: perspective, confidence }
}

function inferTimeframe(text: string): { value: "past" | "present" | "future"; confidence: number } {
  // Default to present with medium confidence
  let timeframe: "past" | "present" | "future" = "present"
  let confidence = 0.6

  // Check for past timeframe indicators
  const pastIndicators = [
    "was",
    "were",
    "had",
    "did",
    "used to",
    "before",
    "yesterday",
    "last week",
    "last month",
    "last year",
    "previously",
    "earlier",
    "in the past",
    "once",
    "ago",
    "happened",
    "occurred",
    "experienced",
    "felt",
    "thought",
  ]

  // Check for future timeframe indicators
  const futureIndicators = [
    "will",
    "going to",
    "shall",
    "would",
    "could",
    "might",
    "tomorrow",
    "next week",
    "next month",
    "next year",
    "soon",
    "later",
    "in the future",
    "eventually",
    "someday",
    "plan",
    "intend",
    "expect",
    "hope",
    "anticipate",
  ]

  // Check for present timeframe indicators
  const presentIndicators = [
    "is",
    "are",
    "am",
    "do",
    "does",
    "have",
    "has",
    "now",
    "today",
    "currently",
    "presently",
    "at this moment",
    "right now",
    "in this moment",
    "these days",
    "this week",
  ]

  // Count matches for each category
  let pastCount = 0
  let presentCount = 0
  let futureCount = 0

  // Check past indicators
  for (const indicator of pastIndicators) {
    if (text.includes(indicator)) {
      pastCount++
    }
  }

  // Check present indicators
  for (const indicator of presentIndicators) {
    if (text.includes(indicator)) {
      presentCount++
    }
  }

  // Check future indicators
  for (const indicator of futureIndicators) {
    if (text.includes(indicator)) {
      futureCount++
    }
  }

  // Determine timeframe based on counts
  if (pastCount > presentCount && pastCount > futureCount) {
    timeframe = "past"
    confidence = 0.5 + pastCount * 0.1 // Increase confidence with more matches
  } else if (futureCount > presentCount && futureCount > pastCount) {
    timeframe = "future"
    confidence = 0.5 + futureCount * 0.1 // Increase confidence with more matches
  } else {
    timeframe = "present"
    confidence = 0.5 + presentCount * 0.1 // Increase confidence with more matches
  }

  // Cap confidence at 0.9
  confidence = Math.min(confidence, 0.9)

  return { value: timeframe, confidence }
}

function inferAcceptanceState(
  text: string,
  sentiment: SentimentResult,
): {
  value: "accepted" | "resisted" | "uncertain"
  confidence: number
} {
  // Default to uncertain with medium confidence
  let acceptanceState: "accepted" | "resisted" | "uncertain" = "uncertain"
  let confidence = 0.6

  // Check for acceptance indicators
  const acceptanceIndicators = [
    "accept",
    "embrace",
    "welcome",
    "agree",
    "approve",
    "fine with",
    "okay with",
    "comfortable with",
    "at peace with",
    "happy with",
    "content with",
    "satisfied with",
    "pleased with",
    "understand",
    "appreciate",
    "value",
    "respect",
    "acknowledge",
  ]

  // Check for resistance indicators
  const resistanceIndicators = [
    "resist",
    "reject",
    "oppose",
    "disagree",
    "disapprove",
    "not okay with",
    "uncomfortable with",
    "not at peace with",
    "unhappy with",
    "discontent with",
    "dissatisfied with",
    "displeased with",
    "don't understand",
    "don't appreciate",
    "don't value",
    "don't respect",
    "refuse",
    "deny",
    "fight",
    "struggle",
    "against",
    "not accept",
  ]

  // Check for uncertainty indicators
  const uncertaintyIndicators = [
    "maybe",
    "perhaps",
    "possibly",
    "not sure",
    "uncertain",
    "don't know",
    "confused",
    "unclear",
    "ambivalent",
    "mixed feelings",
    "on the fence",
    "undecided",
    "unsure",
    "wondering",
    "questioning",
    "conflicted",
    "torn",
    "ambiguous",
    "vague",
    "hesitant",
  ]

  // Count matches for each category
  let acceptanceCount = 0
  let resistanceCount = 0
  let uncertaintyCount = 0

  // Check acceptance indicators
  for (const indicator of acceptanceIndicators) {
    if (text.includes(indicator)) {
      acceptanceCount++
    }
  }

  // Check resistance indicators
  for (const indicator of resistanceIndicators) {
    if (text.includes(indicator)) {
      resistanceCount++
    }
  }

  // Check uncertainty indicators
  for (const indicator of uncertaintyIndicators) {
    if (text.includes(indicator)) {
      uncertaintyCount++
    }
  }

  // Determine acceptance state based on counts
  if (acceptanceCount > resistanceCount && acceptanceCount > uncertaintyCount) {
    acceptanceState = "accepted"
    confidence = 0.5 + acceptanceCount * 0.1 // Increase confidence with more matches
  } else if (resistanceCount > acceptanceCount && resistanceCount > uncertaintyCount) {
    acceptanceState = "resisted"
    confidence = 0.5 + resistanceCount * 0.1 // Increase confidence with more matches
  } else {
    acceptanceState = "uncertain"
    confidence = 0.5 + uncertaintyCount * 0.1 // Increase confidence with more matches
  }

  // Use sentiment to adjust confidence
  if (sentiment) {
    const sentimentScore = sentiment.score

    // Strong positive sentiment supports acceptance
    if (sentimentScore > 0.5 && acceptanceState === "accepted") {
      confidence += 0.1
    }

    // Strong negative sentiment supports resistance
    if (sentimentScore < -0.5 && acceptanceState === "resisted") {
      confidence += 0.1
    }

    // Neutral sentiment supports uncertainty
    if (Math.abs(sentimentScore) < 0.2 && acceptanceState === "uncertain") {
      confidence += 0.1
    }
  }

  // Cap confidence at 0.9
  confidence = Math.min(confidence, 0.9)

  return { value: acceptanceState, confidence }
}
