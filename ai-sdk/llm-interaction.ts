import { callGenerateText, callGenerateJson } from "./gateway"
import { logger } from "../lib/utils/logger"
// NOTE: LlmGenerationOptions is not exported from ./types, so we define it here for MVP production robustness
export interface LlmGenerationOptions {
  modelId?: string
  system?: string
  temperature?: number
  maxTokens?: number
  stopSequences?: string[]
  // Extend with more options as needed for production
}

// Default model to use for LLM interactions (robust, extensible)
const DEFAULT_MODEL = "openai:gpt-4o"

/**
 * Generates text using the AI SDK with error handling, logging, and production-ready options.
 *
 * @param prompt The prompt to send to the LLM
 * @param options Optional configuration for the LLM call (model, system, temperature, etc.)
 * @returns The generated text or null if an error occurred
 */
export async function generateLlmText(
  prompt: string,
  options: LlmGenerationOptions = {}
): Promise<string | null> {
  const modelId = options.modelId || DEFAULT_MODEL

  try {
    const result = await callGenerateText(modelId, prompt, {
      system: options.system,
      temperature: options.temperature ?? 0.2,
      maxTokens: options.maxTokens,
      stopSequences: options.stopSequences,
      // Add more options as needed for production
    })

    if (!result.success) {
      logger.error(`LLM text generation failed [${modelId}]: ${result.error}`)
      return null
    }

    // Defensive: ensure result.data is a string
    if (typeof result.data !== "string") {
      logger.error(`LLM text generation returned non-string data [${modelId}]`)
      return null
    }

    return result.data
  } catch (error: any) {
    logger.error(`LLM text generation error [${modelId}]: ${error?.message || error}`)
    return null
  }
}

/**
 * Generates structured JSON data using the AI SDK with error handling, logging, and production-ready options.
 *
 * @param prompt The prompt to send to the LLM
 * @param options Optional configuration for the LLM call (model, system, temperature, etc.)
 * @returns The parsed JSON object or null if an error occurred
 */
export async function generateLlmJson<T>(
  prompt: string,
  options: LlmGenerationOptions = {}
): Promise<T | null> {
  const modelId = options.modelId || DEFAULT_MODEL

  try {
    const result = await callGenerateJson<T>(modelId, prompt, {
      system: options.system,
      temperature: options.temperature ?? 0.1, // Lower temperature for structured output
      maxTokens: options.maxTokens,
      stopSequences: options.stopSequences,
      // Add more options as needed for production
    })

    if (!result.success) {
      logger.error(`LLM JSON generation failed [${modelId}]: ${result.error}`)
      return null
    }

    // Defensive: ensure result.data is not undefined (MVP production: always return T or null)
    if (result.data === undefined) {
      logger.error(`LLM JSON generation returned undefined data [${modelId}]`)
      return null
    }

    return result.data as T
  } catch (error: any) {
    logger.error(`LLM JSON generation error [${modelId}]: ${error?.message || error}`)
    return null
  }
}
