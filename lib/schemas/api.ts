import { z } from "zod"

// ==========================================
// Analytics Schemas
// ==========================================

export const AnalyticsProcessPayloadSchema = z.object({
  type: z.enum(["daily", "weekly", "monthly", "all"]),
})
export type AnalyticsProcessPayload = z.infer<typeof AnalyticsProcessPayloadSchema>

export const AnalyticsFlagsQuerySchema = z.object({
  periodType: z.enum(["daily", "weekly", "monthly"]).optional(),
  limit: z.coerce.number().int().positive().optional(),
})
export type AnalyticsFlagsQuery = z.infer<typeof AnalyticsFlagsQuerySchema>

// ==========================================
// Auth Schemas
// ==========================================

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginPayload = z.infer<typeof LoginPayloadSchema>

export const SignupPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})
export type SignupPayload = z.infer<typeof SignupPayloadSchema>

// ==========================================
// Bootstrap Schemas
// ==========================================

export const BootstrapResetPayloadSchema = z.object({
  userID: z.string().uuid(),
  sessionID: z.string().min(1),
})
export type BootstrapResetPayload = z.infer<typeof BootstrapResetPayloadSchema>

// ==========================================
// Chat Schemas
// ==========================================

export const ChatPayloadSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().min(1),
})
export type ChatPayload = z.infer<typeof ChatPayloadSchema>

// ==========================================
// Data Access Schemas
// ==========================================

export const DataAccessRequestPayloadSchema = z.object({
  contactName: z.string().min(2),
  organizationName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  intentDeclaration: z.string().min(100),
  policyAcknowledged: z.literal(true),
})
export type DataAccessRequestPayload = z.infer<typeof DataAccessRequestPayloadSchema>

// ==========================================
// Feedback Schemas
// ==========================================

// Find the CoherenceFeedbackPayloadSchema and ensure it includes the feedback field
export const CoherenceFeedbackPayloadSchema = z.object({
  sessionId: z.string().min(1),
  messageId: z.string().min(1),
  coherenceScore: z.enum(["Helpful", "Neutral", "FeltOff"]), // Update to use enum instead of number
  feedback: z.string().nullable().optional(),
})
export type CoherenceFeedbackPayload = z.infer<typeof CoherenceFeedbackPayloadSchema>

export const NarrativeHidePayloadSchema = z.object({
  interactionID: z.string().min(1),
})
export type NarrativeHidePayload = z.infer<typeof NarrativeHidePayloadSchema>

export const ResonanceFlagPayloadSchema = z.object({
  sessionId: z.string().min(1),
  flaggedInteractionId: z.string().min(1),
  precedingInteractionId: z.string().optional(),
  selectedTags: z.array(z.string()).optional().default([]),
  optionalComment: z.string().nullable().optional(),
  clientTimestamp: z.string().datetime().optional(),
})
export type ResonanceFlagPayload = z.infer<typeof ResonanceFlagPayloadSchema>

export const SessionPauseUpdatePayloadSchema = z.object({
  sessionId: z.string().min(1),
  pauseChoice: z.enum(["Pause Both", "Continue Both", "Pause Insights Only", "Pause Training Only"]),
})
export type SessionPauseUpdatePayload = z.infer<typeof SessionPauseUpdatePayloadSchema>

// ==========================================
// GenUI Schemas
// ==========================================

export const GenUIPayloadSchema = z.object({
  targetSchemaName: z.enum(["slider", "multipleChoice", "confirmation", "infoCard", "formInput"]),
  context: z.record(z.any()),
  sessionId: z.string().optional(),
})
export type GenUIPayload = z.infer<typeof GenUIPayloadSchema>

export const GenUISubmitPayloadSchema = z.object({
  componentType: z.enum(["slider", "multipleChoice", "confirmation", "infoCard", "formInput"]),
  data: z.record(z.any()),
  sessionId: z.string().optional(),
  context: z.record(z.any()).optional(),
})
export type GenUISubmitPayload = z.infer<typeof GenUISubmitPayloadSchema>

// ==========================================
// LLM Schemas
// ==========================================

export const LlmTestPayloadSchema = z.object({
  prompt: z.string().min(1),
  config: z.record(z.any()).optional(),
})
export type LlmTestPayload = z.infer<typeof LlmTestPayloadSchema>

// ==========================================
// NLP Schemas
// ==========================================

export const NlpAnalyzePayloadSchema = z.object({
  text: z.string(), // Allow empty string for NLP
})
export type NlpAnalyzePayload = z.infer<typeof NlpAnalyzePayloadSchema>

// ==========================================
// Consent Schemas
// ==========================================

// Based on KgConsentProfile and isValidConsentUpdate function
export const ConsentUpdatePayloadSchema = z
  .object({
    consentDataProcessing: z.boolean().optional(),
    allowSomaticPrompts: z.boolean().optional(),
    consentDetailedAnalysisLogging: z.boolean().optional(),
    consentAnonymizedPatternTraining: z.boolean().optional(),
    allowDistressConsentCheck: z.boolean().optional(),
    consentAggregation: z.boolean().optional(),
    consentSaleOptIn: z.boolean().optional(),
    consentNarrativeTraining: z.boolean().optional(),
    showMyReflectionsInDashboard: z.boolean().optional(),
    dataSourceConsents: z.union([z.record(z.boolean()), z.string()]).optional(),
    featureConsent: z.union([z.record(z.boolean()), z.string()]).optional(),
    consentVersion: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one consent setting must be provided",
  })
export type ConsentUpdatePayload = z.infer<typeof ConsentUpdatePayloadSchema>

// ==========================================
// Session Schemas
// ==========================================

export const SessionModePutPayloadSchema = z.object({
  sessionId: z.string().min(1),
  mode: z.enum(["insight", "listening"]),
})
export type SessionModePutPayload = z.infer<typeof SessionModePutPayloadSchema>

export const SessionPausePutPayloadSchema = z
  .object({
    sessionId: z.string().min(1),
    aggregationPaused: z.boolean().optional(),
    trainingPaused: z.boolean().optional(),
  })
  .refine((data) => data.aggregationPaused !== undefined || data.trainingPaused !== undefined, {
    message: "At least one of aggregationPaused or trainingPaused must be provided",
  })
export type SessionPausePutPayload = z.infer<typeof SessionPausePutPayloadSchema>

// ==========================================
// Somatic Schemas
// ==========================================

export const SomaticTestPayloadSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().min(1),
})
export type SomaticTestPayload = z.infer<typeof SomaticTestPayloadSchema>

// VAD schema for somatic trigger test
const VADSchema = z.object({
  v: z.number().min(-1).max(1),
  a: z.number().min(-1).max(1),
  d: z.number().min(-1).max(1),
})

export const SomaticTriggerTestPayloadSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().min(1),
  vad: VADSchema,
  userMessage: z.string(),
  currentTurn: z.number().int(),
})
export type SomaticTriggerTestPayload = z.infer<typeof SomaticTriggerTestPayloadSchema>

// ==========================================
// Data Hub Schemas
// ==========================================

export const DataHubStatusSchema = z.object({
  sources: z.array(
    z.object({
      name: z.string(),
      displayName: z.string(),
      consentGranted: z.boolean(),
      connection: z.object({
        status: z.enum(["disconnected", "connected", "syncing", "error"]),
        lastSyncedAt: z.string().nullable(),
        errorMessage: z.string().nullable(),
      }),
    }),
  ),
})

export type DataHubStatus = z.infer<typeof DataHubStatusSchema>
