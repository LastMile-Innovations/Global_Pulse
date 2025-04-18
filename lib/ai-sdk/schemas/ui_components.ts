import { z } from "zod"

/**
 * Schema for a slider UI component
 */
export const SliderSchema = z
  .object({
    type: z.literal("slider"),
    label: z.string().describe("The main label/question for the slider"),
    description: z.string().optional().describe("Optional additional description or context"),
    min: z.number().describe("Minimum value of the slider"),
    max: z.number().describe("Maximum value of the slider"),
    step: z.number().optional().default(1).describe("Step increment of the slider"),
    defaultValue: z.number().optional().describe("Initial value of the slider"),
    minLabel: z.string().optional().describe("Label for the minimum value"),
    maxLabel: z.string().optional().describe("Label for the maximum value"),
    showValue: z.boolean().optional().default(true).describe("Whether to show the current value"),
  })
  .describe("A slider component for collecting numeric input within a range")

/**
 * Schema for a multiple choice UI component
 */
export const MultipleChoiceSchema = z
  .object({
    type: z.literal("multipleChoice"),
    question: z.string().describe("The question or prompt for the multiple choice options"),
    description: z.string().optional().describe("Optional additional description or context"),
    options: z.array(z.string()).min(2).describe("Array of options to choose from"),
    allowMultiple: z.boolean().optional().default(false).describe("Whether multiple options can be selected"),
    defaultSelected: z.array(z.number()).optional().describe("Indices of default selected options (zero-based)"),
  })
  .describe("A multiple choice component for selecting from predefined options")

/**
 * Schema for a confirmation UI component
 */
export const ConfirmationSchema = z
  .object({
    type: z.literal("confirmation"),
    message: z.string().describe("The message or question requiring confirmation"),
    description: z.string().optional().describe("Optional additional context or explanation"),
    confirmLabel: z.string().optional().default("Confirm").describe("Label for the confirm button"),
    denyLabel: z.string().optional().default("Cancel").describe("Label for the deny/cancel button"),
    confirmStyle: z
      .enum(["primary", "success", "danger", "warning", "info"])
      .optional()
      .default("primary")
      .describe("Style variant for the confirm button"),
  })
  .describe("A confirmation component with approve/deny buttons")

/**
 * Schema for an information card UI component
 */
export const InfoCardSchema = z
  .object({
    type: z.literal("infoCard"),
    title: z.string().optional().describe("Title of the card"),
    content: z.string().describe("Main content/body of the card"),
    imageUrl: z.string().url().optional().describe("Optional URL for an image to display"),
    footer: z.string().optional().describe("Optional footer text"),
    variant: z
      .enum(["default", "info", "success", "warning", "danger"])
      .optional()
      .default("default")
      .describe("Style variant for the card"),
  })
  .describe("An information card for displaying structured content")

/**
 * Schema for a form input UI component
 */
export const FormInputSchema = z
  .object({
    type: z.literal("formInput"),
    label: z.string().describe("Label for the input field"),
    inputType: z.enum(["text", "email", "password", "number", "tel", "url", "date"]).describe("Type of input field"),
    placeholder: z.string().optional().describe("Placeholder text for the input"),
    defaultValue: z.string().optional().describe("Default value for the input"),
    required: z.boolean().optional().default(false).describe("Whether the input is required"),
    description: z.string().optional().describe("Optional helper text"),
    validation: z
      .object({
        pattern: z.string().optional().describe("Regex pattern for validation"),
        minLength: z.number().int().optional().describe("Minimum length"),
        maxLength: z.number().int().optional().describe("Maximum length"),
      })
      .optional(),
  })
  .describe("A form input field for collecting text or numeric data")

/**
 * Union schema for all UI components
 */
export const UIComponentSchema = z.discriminatedUnion("type", [
  SliderSchema,
  MultipleChoiceSchema,
  ConfirmationSchema,
  InfoCardSchema,
  FormInputSchema,
])

/**
 * Type for all UI components
 */
export type UIComponent = z.infer<typeof UIComponentSchema>

/**
 * Type for specific UI components
 */
export type SliderComponent = z.infer<typeof SliderSchema>
export type MultipleChoiceComponent = z.infer<typeof MultipleChoiceSchema>
export type ConfirmationComponent = z.infer<typeof ConfirmationSchema>
export type InfoCardComponent = z.infer<typeof InfoCardSchema>
export type FormInputComponent = z.infer<typeof FormInputSchema>
