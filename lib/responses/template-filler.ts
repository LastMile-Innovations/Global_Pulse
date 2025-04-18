import { logger } from "../utils/logger"
import { generateLlmResponseViaSdk } from "../llm/llm-gateway"
import { getRandomTemplate, getTemplateById, type ResponseTemplate } from "./templates"

/**
 * Context parameters for template filling
 */
export interface TemplateContextParams {
  /**
   * User ID
   */
  userId: string

  /**
   * Session ID
   */
  sessionId: string

  /**
   * User's message
   */
  user_message: string

  /**
   * Emotional valence (-1.0 to 1.0)
   */
  valence?: number

  /**
   * Emotional arousal (0.0 to 1.0)
   */
  arousal?: number

  /**
   * Emotional dominance (0.0 to 1.0)
   */
  dominance?: number

  /**
   * Additional context parameters
   */
  [key: string]: any
}

/**
 * Options for template filling
 */
export interface TemplateFillingOptions {
  /**
   * Whether to use LLM assistance for parameter filling
   * If false, only direct substitution will be used
   */
  useLlmAssistance?: boolean

  /**
   * Specific template ID to use
   * If provided, this template will be used instead of a random one
   */
  templateId?: string

  /**
   * Model ID to use for LLM assistance
   */
  llmModelId?: string
}

/**
 * Get a templated response for the given intent
 * @param intentKey The intent key
 * @param contextParams Context parameters for template filling
 * @param options Options for template filling
 * @returns The filled template string
 */
export async function getTemplatedResponse(
  intentKey: string,
  contextParams: TemplateContextParams,
  options: TemplateFillingOptions = {},
): Promise<string> {
  try {
    logger.debug(`Getting templated response for intent: ${intentKey}`)

    // Get the template
    let template: ResponseTemplate | undefined

    if (options.templateId) {
      // Get specific template by ID
      logger.debug(`Looking for specific template with ID: ${options.templateId}`)
      template = getTemplateById(options.templateId)
      if (!template) {
        logger.warn(
          `Template with ID ${options.templateId} not found, falling back to random template for intent ${intentKey}`,
        )
      }
    }

    if (!template) {
      // Get random template for intent
      logger.debug(`Getting random template for intent: ${intentKey}`)
      template = getRandomTemplate(intentKey)
    }

    // If no template found, use generic safe response
    if (!template) {
      logger.warn(`No template found for intent ${intentKey}, using generic safe response`)
      template = getRandomTemplate("generic_safe_response")

      // If still no template found (should never happen), return hardcoded fallback
      if (!template) {
        logger.error("No generic safe response template found")
        return "I understand. Let's continue our conversation."
      }
    }

    logger.debug(`Selected template: ${template.id}`)

    // Fill the template
    const filledTemplate = await fillTemplate(template, contextParams, options)
    logger.debug(`Filled template: ${filledTemplate}`)

    return filledTemplate
  } catch (error) {
    logger.error(`Error getting templated response for intent ${intentKey}:`, error)

    // Return hardcoded fallback in case of error
    return "I understand. Let's continue our conversation."
  }
}

/**
 * Fill a template with context parameters
 * @param template The template to fill
 * @param contextParams Context parameters for template filling
 * @param options Options for template filling
 * @returns The filled template string
 */
async function fillTemplate(
  template: ResponseTemplate,
  contextParams: TemplateContextParams,
  options: TemplateFillingOptions = {},
): Promise<string> {
  try {
    let filledTemplate = template.template

    // Process each parameter
    for (const param of template.parameters) {
      const paramName = param.name
      let paramValue: string | undefined

      // Check if parameter exists in context
      if (paramName in contextParams) {
        // Direct substitution
        paramValue = String(contextParams[paramName])
      } else if (param.useLlmAssistance && options.useLlmAssistance !== false) {
        // LLM-assisted parameter filling
        paramValue = await fillParameterWithLlm(param, contextParams, options)
      }

      // Use default value if parameter is still undefined
      if (paramValue === undefined) {
        paramValue = param.defaultValue || ""

        // Log when falling back to default value for required parameters
        if (param.required && param.defaultValue) {
          logger.debug(`Using default value "${param.defaultValue}" for required parameter "${paramName}"`)
        }
      }

      // Replace parameter in template
      filledTemplate = filledTemplate.replace(new RegExp(`\\{${paramName}\\}`, "g"), paramValue)
    }

    // Replace any remaining parameters with empty string
    filledTemplate = filledTemplate.replace(/\{[^}]+\}/g, "")

    return filledTemplate
  } catch (error) {
    logger.error("Error filling template:", error)

    // Return the original template with parameters removed in case of error
    return template.template.replace(/\{[^}]+\}/g, "")
  }
}

/**
 * Fill a parameter using LLM assistance
 * @param param The parameter to fill
 * @param contextParams Context parameters for template filling
 * @param options Options for template filling
 * @returns The parameter value
 */
async function fillParameterWithLlm(
  param: ResponseTemplate["parameters"][0],
  contextParams: TemplateContextParams,
  options: TemplateFillingOptions = {},
): Promise<string | undefined> {
  try {
    // Skip if no LLM prompt
    if (!param.llmPrompt) {
      logger.debug(`No LLM prompt defined for parameter ${param.name}, skipping LLM assistance`)
      return undefined
    }

    // Skip if LLM assistance is explicitly disabled
    if (options.useLlmAssistance === false) {
      logger.debug(`LLM assistance disabled via options for parameter ${param.name}`)
      return undefined
    }

    // Fill the LLM prompt with context parameters
    let filledPrompt = param.llmPrompt
    for (const [key, value] of Object.entries(contextParams)) {
      filledPrompt = filledPrompt.replace(new RegExp(`\\{${key}\\}`, "g"), String(value))
    }

    // Log the filled prompt for debugging
    logger.debug(`LLM prompt for parameter ${param.name}: ${filledPrompt}`)

    // Call LLM
    const llmResponse = await generateLlmResponseViaSdk(filledPrompt, {
      modelId: options.llmModelId,
      temperature: 0.2, // Low temperature for more deterministic responses
      maxTokens: 30, // Short responses
      systemPrompt:
        "You are a helpful assistant that provides very concise responses. Respond with only the specific information requested, using as few words as possible.",
    })

    // Return LLM response if successful
    if (llmResponse.success && llmResponse.text) {
      const cleanedResponse = llmResponse.text.trim().replace(/^["']|["']$|\.$/g, "")
      logger.debug(`LLM generated value for parameter ${param.name}: "${cleanedResponse}"`)
      return cleanedResponse
    }

    // Log error and return undefined
    logger.warn(`LLM parameter filling failed for parameter ${param.name}:`, llmResponse.error)
    return undefined
  } catch (error) {
    logger.error(`Error filling parameter ${param.name} with LLM:`, error)
    return undefined
  }
}
