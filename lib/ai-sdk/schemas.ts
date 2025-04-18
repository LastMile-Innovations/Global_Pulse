import { z } from "zod"

/**
 * Schema for MHH Source values
 */
export const MhhSourceSchema = z.enum(["internal", "external", "valueSelf"]).describe("Source of perception")

/**
 * Schema for MHH Perspective values
 */
export const MhhPerspectiveSchema = z.enum(["self", "other", "both"]).describe("Perspective of perception")

/**
 * Schema for MHH Timeframe values
 */
export const MhhTimeframeSchema = z.enum(["past", "present", "future"]).describe("Temporal focus of perception")

/**
 * Schema for MHH Acceptance State values
 */
export const MhhAcceptanceStateSchema = z.enum(["accepted", "resisted", "uncertain"]).describe("Acceptance state")

/**
 * Schema for MHH Variables
 */
export const MhhVariablesSchema = z
  .object({
    source: z.object({ value: MhhSourceSchema, confidence: z.number().min(0).max(1) }).describe("Source of perception"),
    perspective: z
      .object({ value: MhhPerspectiveSchema, confidence: z.number().min(0).max(1) })
      .describe("Perspective of perception"),
    timeframe: z
      .object({ value: MhhTimeframeSchema, confidence: z.number().min(0).max(1) })
      .describe("Temporal focus of perception"),
    acceptanceState: z
      .object({ value: MhhAcceptanceStateSchema, confidence: z.number().min(0).max(1) })
      .describe("Acceptance state"),
  })
  .describe("Mental health heuristic variables inferred from text")

/**
 * Schema for Perception Appraisal
 */
export const PerceptionAppraisalSchema = z
  .object({
    pValuationShiftEstimate: z.number().min(-1).max(1).describe("Valuation shift estimate"),
    pPowerLevel: z.number().min(0).max(1).describe("Power level"),
    pAppraisalConfidence: z.number().min(0).max(1).describe("Appraisal confidence"),
  })
  .describe("Appraisal of a perception's impact and intensity")
