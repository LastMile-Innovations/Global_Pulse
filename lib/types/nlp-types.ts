export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL"

export interface SentimentResult {
  label: SentimentLabel
  score: number
}

export interface SentimentError {
  error: string
  label: SentimentLabel
  score: number
}

// Named Entity Recognition Types
export type EntityType =
  | "PERSON"
  | "LOCATION"
  | "ORGANIZATION"
  | "DATE"
  | "TIME"
  | "MONEY"
  | "PERCENT"
  | "PRODUCT"
  | "EVENT"
  | "WORK_OF_ART"
  | "LAW"
  | "LANGUAGE"
  | "OTHER"

export interface Entity {
  text: string
  type: EntityType
  score?: number
  start: number
  end: number
}

export interface EntityRecognitionResult {
  entities: Entity[]
}

export interface EntityRecognitionError {
  error: string
  entities: Entity[]
}

// Zero-Shot Classification Types
export type ConceptType = "VALUE" | "GOAL" | "NEED" | "INTEREST" | "BELIEF" | "EMOTION" | "OTHER"

export interface AbstractConcept {
  text: string
  type: ConceptType
  score?: number
  start?: number
  end?: number
}

export interface ZeroShotClassificationResult {
  concepts: AbstractConcept[]
}

export interface ZeroShotClassificationError {
  error: string
  concepts: AbstractConcept[]
}

// Keyword Extraction Types
export interface KeywordExtractionOptions {
  minWordLength?: number
  maxKeywords?: number
  customStopwords?: string[]
}

// Embedding Vector Type
export type EmbeddingVector = number[]

// Combined NLP Features
export interface NlpFeatures {
  keywords: string[]
  sentiment: SentimentResult
  entities: Entity[]
  abstractConcepts: AbstractConcept[]
  embedding?: EmbeddingVector // Add embedding field
}
