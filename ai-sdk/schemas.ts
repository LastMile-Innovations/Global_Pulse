import { z } from "zod"

/**
 * Enum schema for the source of perception in MHH (Mental Health Heuristics).
 * - "internal": Originates from within the self (thoughts, feelings).
 * - "external": Originates from outside the self (environment, others).
 * - "valueSelf": Originates from self-related values or beliefs.
 */
export const MhhSourceSchema = z
  .enum(["internal", "external", "valueSelf"])
  .describe("Source of perception: internal, external, or valueSelf")

/**
 * Enum schema for the perspective of perception.
 * - "self": The perception is from the individual's own perspective.
 * - "other": The perception is from another's perspective.
 * - "both": The perception includes both self and other perspectives.
 */
export const MhhPerspectiveSchema = z
  .enum(["self", "other", "both"])
  .describe("Perspective of perception: self, other, or both")

/**
 * Enum schema for the temporal focus of perception.
 * - "past": Focused on past events.
 * - "present": Focused on current events.
 * - "future": Focused on anticipated or future events.
 */
export const MhhTimeframeSchema = z
  .enum(["past", "present", "future"])
  .describe("Temporal focus of perception: past, present, or future")

/**
 * Enum schema for the acceptance state of a perception.
 * - "accepted": The perception is accepted.
 * - "resisted": The perception is resisted or rejected.
 * - "uncertain": The acceptance state is unclear or ambiguous.
 */
export const MhhAcceptanceStateSchema = z
  .enum(["accepted", "resisted", "uncertain"])
  .describe("Acceptance state: accepted, resisted, or uncertain")

/**
 * Confidence schema for a value, always between 0 and 1.
 */
const ConfidenceSchema = z.number().min(0).max(1).describe("Confidence score between 0 and 1")

/**
 * Generic schema for a value with confidence.
 */
function valueWithConfidence<T extends z.ZodTypeAny>(valueSchema: T, description: string) {
  return z.object({
    value: valueSchema,
    confidence: ConfidenceSchema,
  }).describe(description)
}

/**
 * Schema for all MHH variables, each with value and confidence.
 * - source: Source of perception.
 * - perspective: Perspective of perception.
 * - timeframe: Temporal focus of perception.
 * - acceptanceState: Acceptance state of perception.
 */
export const MhhVariablesSchema = z
  .object({
    source: valueWithConfidence(MhhSourceSchema, "Source of perception"),
    perspective: valueWithConfidence(MhhPerspectiveSchema, "Perspective of perception"),
    timeframe: valueWithConfidence(MhhTimeframeSchema, "Temporal focus of perception"),
    acceptanceState: valueWithConfidence(MhhAcceptanceStateSchema, "Acceptance state"),
  })
  .describe("Mental health heuristic variables inferred from text, each with value and confidence")

/**
 * Schema for the appraisal of a perception's impact and intensity.
 * - pValuationShiftEstimate: Estimated shift in valuation, from -1 (negative) to 1 (positive).
 * - pPowerLevel: Estimated power or intensity, from 0 (none) to 1 (maximum).
 * - pAppraisalConfidence: Confidence in the appraisal, from 0 to 1.
 */
export const PerceptionAppraisalSchema = z
  .object({
    pValuationShiftEstimate: z
      .number()
      .min(-1)
      .max(1)
      .describe("Valuation shift estimate: -1 (negative) to 1 (positive)"),
    pPowerLevel: z
      .number()
      .min(0)
      .max(1)
      .describe("Power level: 0 (none) to 1 (maximum)"),
    pAppraisalConfidence: ConfidenceSchema.describe("Confidence in the appraisal"),
  })
  .describe("Appraisal of a perception's impact (valuation shift), intensity (power), and confidence")

/**
 * Complete schema for a perception analysis result (MVP production).
 * Includes MHH variables, appraisal, and optional notes.
 */
export const PerceptionAnalysisSchema = z.object({
  variables: MhhVariablesSchema,
  appraisal: PerceptionAppraisalSchema,
  notes: z
    .string()
    .max(1000)
    .optional()
    .describe("Optional notes or explanation for the analysis"),
}).describe("Complete perception analysis result including variables, appraisal, and optional notes")

/**
 * TypeScript types for convenience (MVP production).
 */
export type MhhSource = z.infer<typeof MhhSourceSchema>
export type MhhPerspective = z.infer<typeof MhhPerspectiveSchema>
export type MhhTimeframe = z.infer<typeof MhhTimeframeSchema>
export type MhhAcceptanceState = z.infer<typeof MhhAcceptanceStateSchema>
export type MhhVariables = z.infer<typeof MhhVariablesSchema>
export type PerceptionAppraisal = z.infer<typeof PerceptionAppraisalSchema>
export type PerceptionAnalysis = z.infer<typeof PerceptionAnalysisSchema>

// End of MVP production schemas for perception analysis
