export const GUARDRAIL_VAD_VALENCE_MIN = -0.85
export const GUARDRAIL_VAD_AROUSAL_MAX = 0.9
export const GUARDRAIL_VAD_DOMINANCE_MIN = -0.9

// Manipulation keywords/patterns
export const GUARDRAIL_MANIPULATION_KEYWORDS = new Set([
  // Insults and derogatory terms
  "stupid",
  "idiot",
  "moron",
  "loser",
  "worthless",
  "pathetic",
  "useless",

  // Manipulative phrases
  "you need to",
  "you must",
  "you have no choice",
  "everyone knows that",
  "nobody would disagree",
  "trust me completely",
  "don't question this",
  "keep this between us",

  // Discriminatory terms
  // Note: This is a minimal set for MVP, would be expanded
  "retard",
  "retarded",

  // Extreme urgency/pressure
  "act now or else",
  "limited time only",
  "once in a lifetime",
  "you'll regret it",

  // Inappropriate intimacy
  "our little secret",
  "just between us",
  "don't tell anyone",

  // Gaslighting phrases
  "you're overreacting",
  "you're too sensitive",
  "that never happened",
  "you're imagining things",

  // Absolutist language
  "always right",
  "never wrong",
  "the only way",
  "absolutely must",
])

// Alert types
export enum GuardrailAlertType {
  WELLBEING_RISK_MVP = "WellbeingRisk_MVP",
  MANIPULATION_RISK_MVP = "ManipulationRisk_MVP",
}

// Action taken values
export enum GuardrailActionTaken {
  BLOCKED_REPLACED = "Blocked_Replaced",
}

// Status values
export enum GuardrailStatus {
  MVP_LOGGED = "MVP_Logged",
}
