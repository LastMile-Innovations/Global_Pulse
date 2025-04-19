import { z } from "zod"

/**
 * Enum for attachment types in self-map inference.
 * Extendable for future types. Used for robust validation and UI.
 */
export const AttachmentTypeEnum = z.enum([
  "VALUE",
  "GOAL",
  "NEED",
  "BELIEF",
  "INTEREST",
  "IDENTITY",
  "CONCEPT",
  // Add more as needed for production
])

/**
 * Enum for inference methods.
 * Used to track how the attachment was inferred.
 */
export const InferenceMethodEnum = z.enum([
  "ZSC",        // Zero-shot classification
  "NER",        // Named entity recognition
  "EMBEDDING",  // Embedding similarity
  "KEYWORD",    // Keyword extraction
  "LLM",        // Large language model
  "COMBINED",   // Multiple methods
  // Extend as new methods are added
])

/**
 * Schema for a single inferred attachment.
 * MVP production: robust, extensible, and type-safe.
 */
export const InferredAttachmentSchema = z.object({
  name: z
    .string()
    .min(1, "Attachment name is required")
    .max(100, "Attachment name too long"),
  type: AttachmentTypeEnum,
  estimatedPL: z
    .number()
    .min(0, "Preference level must be >= 0")
    .max(10, "Preference level must be <= 10")
    .describe("Estimated preference level (0-10)"),
  estimatedV: z
    .number()
    .min(-10, "Value estimate must be >= -10")
    .max(10, "Value estimate must be <= 10")
    .describe("Estimated value (-10 to 10)"),
  certainty: z
    .number()
    .min(0, "Certainty must be >= 0")
    .max(1, "Certainty must be <= 1")
    .describe("Certainty/confidence (0-1)"),
  sourceText: z
    .string()
    .max(1000, "Source text too long")
    .optional()
    .describe("Text from which the attachment was inferred"),
  inferenceMethod: InferenceMethodEnum
    .optional()
    .default("LLM")
    .describe("Method used for inference"),
  createdAt: z
    .string()
    .datetime()
    .optional()
    .describe("ISO timestamp when the attachment was created"),
  updatedAt: z
    .string()
    .datetime()
    .optional()
    .describe("ISO timestamp when the attachment was last updated"),
  // Optionally, add userId/sessionId for auditability in production
  userId: z.string().optional().describe("User ID (if available)"),
  sessionId: z.string().optional().describe("Session ID (if available)"),
})

/**
 * Schema for an array of inferred attachments.
 * Enforces at least one attachment for production use.
 */
export const InferredAttachmentsSchema = z
  .array(InferredAttachmentSchema)
  .min(1, "At least one attachment is required")

/**
 * Type for a single inferred attachment.
 */
export type InferredAttachmentFromSchema = z.infer<typeof InferredAttachmentSchema>

/**
 * Type for an array of inferred attachments.
 */
export type InferredAttachmentsFromSchema = z.infer<typeof InferredAttachmentsSchema>
