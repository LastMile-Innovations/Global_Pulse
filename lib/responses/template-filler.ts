import { logger } from "../utils/logger"
import { generateLlmResponseViaSdk } from "../llm/llm-gateway"
import { getRandomTemplate, getTemplateById, type ResponseTemplate } from "./templates"

/**
 * Context parameters for template filling
 */
export interface TemplateContextParams {
  userId: string
  sessionId: string
  user_message: string
  valence?: number
  arousal?: number
  dominance?: number
  [key: string]: any
}

/**
 * Options for template filling
 */
export interface TemplateFillingOptions {
  useLlmAssistance?: boolean
  templateId?: string
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

    let template: ResponseTemplate | undefined

    if (options.templateId) {
      logger.debug(`Looking for specific template with ID: ${options.templateId}`)
      template = getTemplateById(options.templateId)
      if (!template) {
        logger.warn(
          `Template with ID ${options.templateId} not found, falling back to random template for intent ${intentKey}`,
        )
      }
    }

    if (!template) {
      logger.debug(`Getting random template for intent: ${intentKey}`)
      template = getRandomTemplate(intentKey)
    }

    if (!template) {
      logger.warn(`No template found for intent ${intentKey}, using generic safe response`)
      template = getRandomTemplate("generic_safe_response")
      if (!template) {
        logger.error("No generic safe response template found")
        return "I understand. Let's continue our conversation."
      }
    }

    logger.debug(`Selected template: ${template.id}`)

    const filledTemplate = await fillTemplate(template, contextParams, options)
    logger.debug(`Filled template: ${filledTemplate}`)

    return filledTemplate
  } catch (error: any) {
    logger.error(`Error getting templated response for intent ${intentKey}: ${error?.message || error}`)
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

    // Defensive: ensure parameters is an array
    const parameters = Array.isArray(template.parameters) ? template.parameters : []

    for (const param of parameters) {
      const paramName = param.name
      let paramValue: string | undefined

      // Direct substitution if present in context
      if (Object.prototype.hasOwnProperty.call(contextParams, paramName)) {
        paramValue = String(contextParams[paramName])
      } else if (param.useLlmAssistance && options.useLlmAssistance !== false) {
        paramValue = await fillParameterWithLlm(param, contextParams, options)
      }

      // Use default if still undefined
      if (paramValue === undefined) {
        paramValue = param.defaultValue ?? ""
        if (param.required && param.defaultValue) {
          logger.debug(`Using default value "${param.defaultValue}" for required parameter "${paramName}"`)
        }
      }

      // Replace all occurrences of {paramName}
      filledTemplate = filledTemplate.replace(new RegExp(`\\{${paramName}\\}`, "g"), paramValue)
    }

    // Remove any remaining {param} placeholders
    filledTemplate = filledTemplate.replace(/\{[^}]+\}/g, "")

    return filledTemplate
  } catch (error: any) {
    logger.error(`Error filling template: ${error?.message || error}`)
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
    if (!param.llmPrompt) {
      logger.debug(`No LLM prompt defined for parameter ${param.name}, skipping LLM assistance`)
      return undefined
    }

    if (options.useLlmAssistance === false) {
      logger.debug(`LLM assistance disabled via options for parameter ${param.name}`)
      return undefined
    }

    // Fill the LLM prompt with context parameters
    let filledPrompt = param.llmPrompt
    for (const [key, value] of Object.entries(contextParams)) {
      filledPrompt = filledPrompt.replace(new RegExp(`\\{${key}\\}`, "g"), String(value))
    }

    logger.debug(`LLM prompt for parameter ${param.name}: ${filledPrompt}`)

    const llmResponse = await generateLlmResponseViaSdk(filledPrompt, {
      modelId: options.llmModelId,
      temperature: 0.2,
      maxTokens: 30,
      systemPrompt:
        "You are a helpful assistant that provides very concise responses. Respond with only the specific information requested, using as few words as possible.",
    })

    if (llmResponse && llmResponse.success && llmResponse.text) {
      const cleanedResponse = llmResponse.text.trim().replace(/^["']|["']$|\.$/g, "")
      logger.debug(`LLM generated value for parameter ${param.name}: "${cleanedResponse}"`)
      return cleanedResponse
    }

    // Log error and return undefined (fix: only one argument for logger.warn)
    logger.warn(
      `LLM parameter filling failed for parameter ${param.name}: ${llmResponse?.error || "Unknown error"}`
    )
    return undefined
  } catch (error: any) {
    logger.error(`Error filling parameter ${param.name} with LLM: ${error?.message || error}`)
    return undefined
  }
}
