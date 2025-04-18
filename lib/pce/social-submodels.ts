import type { Entity, AbstractConcept } from "../types/nlp-types"

export interface SocialContext {
  isPotentialGuiltScenario: boolean
  isPotentialPrideScenario: boolean
  isPotentialEmbarrassmentScenario: boolean
  involvedHarmToOther: boolean
  involvedNormViolation: boolean
  involvedAchievement: boolean
  involvedCompetence: boolean
  involvedGoalAttainment: boolean
  involvedPublicExposure: boolean
  involvedSocialRuleViolation: boolean
  perspectiveConfidence: number
}

/**
 * Analyzes user input for social emotion cues
 * Detects keywords and patterns that might indicate guilt, pride, or embarrassment
 */
export function analyzeSocialEmotionCues(
  keywords: string[],
  entities: Entity[],
  abstractConcepts: AbstractConcept[],
): SocialContext {
  // Initialize social context with default values
  const socialContext: SocialContext = {
    isPotentialGuiltScenario: false,
    isPotentialPrideScenario: false,
    isPotentialEmbarrassmentScenario: false,
    involvedHarmToOther: false,
    involvedNormViolation: false,
    involvedAchievement: false,
    involvedCompetence: false,
    involvedGoalAttainment: false,
    involvedPublicExposure: false,
    involvedSocialRuleViolation: false,
    perspectiveConfidence: 0.5,
  }

  // Convert all input to lowercase for case-insensitive matching
  const lowercaseKeywords = keywords.map((k) => k.toLowerCase())
  const lowercaseEntityTexts = entities.map((e) => e.text.toLowerCase())
  const lowercaseConceptTexts = abstractConcepts.map((c) => c.text.toLowerCase())

  // Combine all text for easier analysis
  const allTexts = [...lowercaseKeywords, ...lowercaseEntityTexts, ...lowercaseConceptTexts]
  const combinedText = allTexts.join(" ")

  // Check for guilt-related keywords and patterns
  const guiltKeywords = [
    "guilt",
    "guilty",
    "fault",
    "blame",
    "responsible",
    "sorry",
    "apologize",
    "regret",
    "mistake",
    "should have",
    "shouldn't have",
    "my fault",
    "my bad",
  ]

  // Check for pride-related keywords and patterns
  const prideKeywords = [
    "pride",
    "proud",
    "accomplish",
    "achievement",
    "success",
    "achieved",
    "completed",
    "finished",
    "won",
    "victory",
    "triumph",
    "mastered",
  ]

  // Check for embarrassment-related keywords and patterns
  const embarrassmentKeywords = [
    "embarrass",
    "embarrassed",
    "awkward",
    "blush",
    "shame",
    "ashamed",
    "humiliated",
    "mortified",
    "self-conscious",
    "exposed",
  ]

  // Check for harm to others
  const harmKeywords = ["hurt", "harm", "damage", "injured", "upset", "offended", "bothered"]

  // Check for norm violation
  const normViolationKeywords = ["wrong", "shouldn't", "shouldn't have", "bad", "immoral", "unethical", "improper"]

  // Check for achievement/competence
  const achievementKeywords = ["achieve", "accomplish", "complete", "finish", "succeed", "master", "excel"]

  // Check for public exposure
  const publicExposureKeywords = ["everyone", "public", "people", "saw", "watched", "noticed", "audience", "crowd"]

  // Check for social rule violation
  const socialRuleViolationKeywords = [
    "etiquette",
    "manners",
    "social",
    "norm",
    "rule",
    "protocol",
    "custom",
    "tradition",
  ]

  // Check for guilt scenario
  if (guiltKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.isPotentialGuiltScenario = true
    socialContext.perspectiveConfidence = 0.7
  }

  // Check for pride scenario
  if (prideKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.isPotentialPrideScenario = true
    socialContext.perspectiveConfidence = 0.7
  }

  // Check for embarrassment scenario
  if (embarrassmentKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.isPotentialEmbarrassmentScenario = true
    socialContext.perspectiveConfidence = 0.7
  }

  // Check for harm to others
  if (harmKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.involvedHarmToOther = true
  }

  // Check for norm violation
  if (normViolationKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.involvedNormViolation = true
  }

  // Check for achievement/competence
  if (achievementKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.involvedAchievement = true
    socialContext.involvedCompetence = true
  }

  // Check for goal attainment (more specific achievement patterns)
  if (
    combinedText.includes("goal") ||
    combinedText.includes("objective") ||
    combinedText.includes("target") ||
    (combinedText.includes("finally") && achievementKeywords.some((keyword) => combinedText.includes(keyword)))
  ) {
    socialContext.involvedGoalAttainment = true
  }

  // Check for public exposure
  if (publicExposureKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.involvedPublicExposure = true
  }

  // Check for social rule violation
  if (socialRuleViolationKeywords.some((keyword) => combinedText.includes(keyword))) {
    socialContext.involvedSocialRuleViolation = true
  }

  return socialContext
}
