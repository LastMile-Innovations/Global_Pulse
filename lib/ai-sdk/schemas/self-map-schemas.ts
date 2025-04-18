import { z } from "zod"

/**
 * Attachment type enum for Zod schema
 */
export const AttachmentTypeEnum = z.enum(["VALUE", "GOAL", "NEED", "BELIEF", "INTEREST", "IDENTITY", "CONCEPT"])

/**
 * Inference method enum for Zod schema
 */
export const InferenceMethodEnum = z.enum(["ZSC", "NER", "EMBEDDING", "KEYWORD", "LLM", "COMBINED"])

/**
 * Schema for a single inferred attachment
 */
export const InferredAttachmentSchema = z.object({
  name: z.string().min(1).max(100),
  type: AttachmentTypeEnum,
  estimatedPL: z.number().min(0).max(10),
  estimatedV: z.number().min(-10).max(10),
  certainty: z.number().min(0).max(1),
  sourceText: z.string().optional(),
  inferenceMethod: InferenceMethodEnum.optional().default("LLM"),
})

/**
 * Schema for an array of inferred attachments
 */
export const InferredAttachmentsSchema = z.array(InferredAttachmentSchema)

/**
 * Type for inferred attachments from the schema
 */
export type InferredAttachmentFromSchema = z.infer<typeof InferredAttachmentSchema>

/**
 * Type for array of inferred attachments from the schema
 */
export type InferredAttachmentsFromSchema = z.infer<typeof InferredAttachmentsSchema>
