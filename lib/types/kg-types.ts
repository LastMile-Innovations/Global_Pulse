export enum KgNodeLabel {
  USER = "User",
  CONSENT_PROFILE = "ConsentProfile",
  CULTURAL_CONTEXT_PROFILE = "CulturalContextProfile", // Added for Cultural Context Profile
  PERSONALITY_PROFILE = "PersonalityProfile", // Added for Personality Profile
  DEVELOPMENTAL_STAGE_PROFILE = "DevelopmentalStageProfile", // Added for Developmental Stage Profile
  INTERACTION = "Interaction",
  CHAT_SESSION = "ChatSession",
  USER_STATE_INSTANCE = "UserStateInstance",
  P_INSTANCE = "PInstance",
  ER_INSTANCE = "ERInstance",
  GUARDRAIL_ALERT = "GuardrailAlert",
  VALUE = "Value",
  GOAL = "Goal",
}

// Relationship Types (adding HAS_CONSENT)
export enum KgRelationshipType {
  HAS_PROFILE = "HAS_PROFILE",
  HAS_CONSENT = "HAS_CONSENT", // Added for consent relationship
  PARTICIPATED_IN = "PARTICIPATED_IN",
  CONTAINS = "CONTAINS",
  GENERATED_DURING = "GENERATED_DURING",
  HAS_STATE = "HAS_STATE",
  TRIGGERED_BY = "TRIGGERED_BY",
  LEADS_TO = "LEADS_TO",
  INFLUENCED_BY = "INFLUENCED_BY",
  HOLDS_ATTACHMENT = "HOLDS_ATTACHMENT",
}

// Consent Profile Node
export interface KgConsentProfile {
  profileID: string // Primary key
  userID: string // Foreign key to User, indexed

  // Core consent flags with specified defaults
  consentDataProcessing: boolean // Default true after signup
  allowSomaticPrompts: boolean // Default false
  consentDetailedAnalysisLogging: boolean // Default false
  consentAnonymizedPatternTraining: boolean // Default false
  allowDistressConsentCheck: boolean // Default false
  consentAggregation: boolean // Default false
  consentSaleOptIn: boolean // Default false
  consentNarrativeTraining?: boolean // New flag for narrative training
  showMyReflectionsInDashboard?: boolean // New flag for dashboard reflections

  // Optional properties for future use
  dataSourceConsents?: string // JSON string for data source consents
  featureConsent?: string // JSON string for feature consents
  consentVersion?: string // Version of the Privacy Policy/ToS

  lastConsentUpdate: number // timestamp when consent was last updated
  createdAt: number // timestamp when profile was created
  updatedAt: number // timestamp when profile was last updated
}

// Cultural Context Profile Node
export interface KgCulturalContextProfile {
  profileID: string // Primary key
  userID: string // Foreign key to User, indexed

  // Cultural dimensions (Hofstede)
  individualismScore: number // 0-1 scale, default 0.5
  powerDistanceScore: number // 0-1 scale, default 0.5
  uncertaintyAvoidanceScore: number // 0-1 scale, default 0.5
  masculinityScore: number // 0-1 scale, default 0.5
  longTermOrientationScore: number // 0-1 scale, default 0.5
  indulgenceScore: number // 0-1 scale, default 0.5

  // Cultural context
  activeNorms: string[] // List of active cultural norms
  primaryLanguage: string // Primary language, default "en"
  regionOfResidence: string // Geographic region

  // Timestamps
  createdAt: number // timestamp when profile was created
  updatedAt: number // timestamp when profile was last updated
}

// Personality Profile Node
export interface KgPersonalityProfile {
  profileID: string // Primary key
  userID: string // Foreign key to User, indexed

  // OCEAN model (Big Five)
  OCEAN_O: number // Openness, 0-1 scale, default 0.5
  OCEAN_C: number // Conscientiousness, 0-1 scale, default 0.5
  OCEAN_E: number // Extraversion, 0-1 scale, default 0.5
  OCEAN_A: number // Agreeableness, 0-1 scale, default 0.5
  OCEAN_N: number // Neuroticism, 0-1 scale, default 0.5

  // Additional personality traits
  optimismPessimismScore: number // -1 to 1 scale, default 0
  attachmentStyleIndicator: string // Enum: "Secure", "Anxious", "Avoidant", "Disorganized", default "Unknown"
  spsScore: number // Sensory Processing Sensitivity, 0-1 scale, default 0.5

  // Timestamps
  createdAt: number // timestamp when profile was created
  updatedAt: number // timestamp when profile was last updated
}

// Developmental Stage Profile Node
export interface KgDevelopmentalStageProfile {
  profileID: string // Primary key
  userID: string // Foreign key to User, indexed

  // Developmental information
  eriksonStage: string // Enum of Erikson's stages, default "Unknown"
  developmentalTaskTags: string[] // List of current developmental tasks
  ageRange: string // Enum: "Child", "Adolescent", "YoungAdult", "MiddleAdult", "OlderAdult", default "Unknown"

  // Timestamps
  createdAt: number // timestamp when profile was created
  updatedAt: number // timestamp when profile was last updated
}

// ER Instance Node
export interface KgERInstance {
  instanceID: string // Primary key
  interactionID: string // Foreign key to Interaction, indexed
  userID: string // Foreign key to User, indexed

  // Core emotional reaction data
  vadV: number // Valence score (-1 to 1)
  vadA: number // Arousal score (-1 to 1)
  vadD: number // Dominance score (-1 to 1)
  confidence: number // Confidence in the assessment (0 to 1)

  // Narrative sovereignty control
  isHiddenByUser?: boolean // Whether the user has chosen to hide this inference

  createdAt: number // timestamp when instance was created
  updatedAt?: number // timestamp when instance was last updated
}

// Type for permission strings used in checkConsent
export type ConsentPermissionString =
  | keyof KgConsentProfile // Direct properties
  | `CAN_ACCESS_SOURCE_${string}` // Convention for data sources
  | `CAN_USE_FEATURE_${string}` // Convention for features
