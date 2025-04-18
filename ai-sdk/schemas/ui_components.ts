import { z } from "zod"

/**
 * Common base for all UI components (MVP production: extensible, robust, type-safe)
 */
const BaseComponentSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(128)
    .optional()
    .describe("Unique identifier for the component (optional, for tracking)"),
  required: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether this component is required for form submission"),
  disabled: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether this component is disabled"),
  visible: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether this component is visible"),
  // For extensibility: allow extra metadata
  meta: z
    .record(z.any())
    .optional()
    .describe("Arbitrary metadata for the component"),
})

/**
 * Schema for a slider UI component (MVP production: robust, extensible)
 */
export const SliderSchema = BaseComponentSchema.extend({
  type: z.literal("slider"),
  label: z.string().min(1).max(200).describe("The main label/question for the slider"),
  description: z.string().max(500).optional().describe("Optional additional description or context"),
  min: z.number().finite().describe("Minimum value of the slider"),
  max: z.number().finite().describe("Maximum value of the slider"),
  step: z.number().positive().optional().default(1).describe("Step increment of the slider"),
  defaultValue: z.number().optional().describe("Initial value of the slider"),
  minLabel: z.string().max(100).optional().describe("Label for the minimum value"),
  maxLabel: z.string().max(100).optional().describe("Label for the maximum value"),
  showValue: z.boolean().optional().default(true).describe("Whether to show the current value"),
  marks: z
    .array(
      z.object({
        value: z.number().describe("Value at which to show the mark"),
        label: z.string().max(100).optional().describe("Label for the mark"),
      })
    )
    .optional()
    .describe("Optional marks to show on the slider"),
}).describe("A slider component for collecting numeric input within a range")

/**
 * Schema for a multiple choice UI component (MVP production: robust, extensible)
 */
export const MultipleChoiceSchema = BaseComponentSchema.extend({
  type: z.literal("multipleChoice"),
  question: z.string().min(1).max(300).describe("The question or prompt for the multiple choice options"),
  description: z.string().max(500).optional().describe("Optional additional description or context"),
  options: z
    .array(
      z.object({
        label: z.string().min(1).max(200).describe("Display label for the option"),
        value: z.string().min(1).max(200).describe("Value for the option"),
        description: z.string().max(300).optional().describe("Optional description for the option"),
        disabled: z.boolean().optional().default(false).describe("Whether this option is disabled"),
      })
    )
    .min(2)
    .max(50)
    .describe("Array of options to choose from"),
  allowMultiple: z.boolean().optional().default(false).describe("Whether multiple options can be selected"),
  defaultSelected: z
    .array(z.string())
    .optional()
    .describe("Values of default selected options"),
  randomize: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to randomize the order of options"),
  minSelections: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Minimum number of selections required (if allowMultiple)"),
  maxSelections: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Maximum number of selections allowed (if allowMultiple)"),
}).describe("A multiple choice component for selecting from predefined options")

/**
 * Schema for a confirmation UI component (MVP production: robust, extensible)
 */
export const ConfirmationSchema = BaseComponentSchema.extend({
  type: z.literal("confirmation"),
  message: z.string().min(1).max(500).describe("The message or question requiring confirmation"),
  description: z.string().max(500).optional().describe("Optional additional context or explanation"),
  confirmLabel: z.string().min(1).max(50).optional().default("Confirm").describe("Label for the confirm button"),
  denyLabel: z.string().min(1).max(50).optional().default("Cancel").describe("Label for the deny/cancel button"),
  confirmStyle: z
    .enum(["primary", "success", "danger", "warning", "info"])
    .optional()
    .default("primary")
    .describe("Style variant for the confirm button"),
  showDeny: z.boolean().optional().default(true).describe("Whether to show the deny/cancel button"),
  autoClose: z.boolean().optional().default(false).describe("Whether to auto-close after confirmation"),
}).describe("A confirmation component with approve/deny buttons")

/**
 * Schema for an information card UI component (MVP production: robust, extensible)
 */
export const InfoCardSchema = BaseComponentSchema.extend({
  type: z.literal("infoCard"),
  title: z.string().max(200).optional().describe("Title of the card"),
  content: z.string().min(1).max(2000).describe("Main content/body of the card"),
  imageUrl: z.string().url().max(500).optional().describe("Optional URL for an image to display"),
  footer: z.string().max(300).optional().describe("Optional footer text"),
  variant: z
    .enum(["default", "info", "success", "warning", "danger"])
    .optional()
    .default("default")
    .describe("Style variant for the card"),
  actions: z
    .array(
      z.object({
        label: z.string().min(1).max(100).describe("Label for the action button"),
        action: z.string().min(1).max(100).describe("Action identifier"),
        style: z
          .enum(["primary", "secondary", "success", "danger", "warning", "info"])
          .optional()
          .default("primary")
          .describe("Button style"),
        url: z.string().url().optional().describe("Optional URL for the action"),
        disabled: z.boolean().optional().default(false).describe("Whether the action is disabled"),
      })
    )
    .optional()
    .describe("Optional array of action buttons for the card"),
}).describe("An information card for displaying structured content")

/**
 * Schema for a form input UI component (MVP production: robust, extensible)
 */
export const FormInputSchema = BaseComponentSchema.extend({
  type: z.literal("formInput"),
  label: z.string().min(1).max(200).describe("Label for the input field"),
  inputType: z
    .enum([
      "text",
      "email",
      "password",
      "number",
      "tel",
      "url",
      "date",
      "textarea",
      "search",
      "color",
      "range",
    ])
    .describe("Type of input field"),
  placeholder: z.string().max(200).optional().describe("Placeholder text for the input"),
  defaultValue: z.string().max(2000).optional().describe("Default value for the input"),
  description: z.string().max(500).optional().describe("Optional helper text"),
  validation: z
    .object({
      pattern: z.string().optional().describe("Regex pattern for validation"),
      minLength: z.number().int().min(0).optional().describe("Minimum length"),
      maxLength: z.number().int().min(1).optional().describe("Maximum length"),
      min: z.number().optional().describe("Minimum numeric value (if inputType is number)"),
      max: z.number().optional().describe("Maximum numeric value (if inputType is number)"),
      step: z.number().optional().describe("Step for numeric input"),
      customMessage: z.string().max(500).optional().describe("Custom validation error message"),
    })
    .optional(),
  autoComplete: z
    .enum([
      "on",
      "off",
      "name",
      "email",
      "username",
      "new-password",
      "current-password",
      "organization",
      "street-address",
      "tel",
      "url",
      "country",
      "postal-code",
    ])
    .optional()
    .describe("Autocomplete attribute for the input"),
  prefix: z.string().max(20).optional().describe("Optional prefix to display before the input"),
  suffix: z.string().max(20).optional().describe("Optional suffix to display after the input"),
  rows: z.number().int().min(1).max(20).optional().describe("Number of rows (for textarea)"),
  maxLength: z.number().int().min(1).optional().describe("Maximum number of characters allowed"),
}).describe("A form input field for collecting text or numeric data")

/**
 * Union schema for all UI components (MVP production: robust, extensible)
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
