import { callGenerateText, callGenerateJson } from "./gateway"
import { logger } from "../utils/logger"
import type { LlmGenerationOptions } from "./types"

// Default model to use
const DEFAULT_MODEL = "openai:gpt-4o"

/**
 * Generates text using the AI SDK with error handling and timeout
 *
 * @param prompt The prompt to send to the LLM
 * @param options Optional configuration for the LLM call
 * @returns The generated text or null if an error occurred
 */
export async function generateLlmText(prompt: string, options: LlmGenerationOptions = {}): Promise<string | null> {
  const modelId = options.modelId || DEFAULT_MODEL

  try {
    const result = await callGenerateText(modelId, prompt, {
      system: options.system,
      temperature: options.temperature ?? 0.2,
      maxTokens: options.maxTokens,
      stopSequences: options.stopSequences,
    })

    if (!result.success) {
      logger.error(`Error generating LLM text: ${result.error}`)
      return null
    }

    return result.data || null
  } catch (error) {
    logger.error(`Error generating LLM text: ${error}`)
    return null
  }
}

/**
 * Generates structured JSON data using the AI SDK with error handling and timeout
 *
 * @param prompt The prompt to send to the LLM
 * @param options Optional configuration for the LLM call
 * @returns The parsed JSON object or null if an error occurred
 */
export async function generateLlmJson<T>(prompt: string, options: LlmGenerationOptions = {}): Promise<T | null> {
  const modelId = options.modelId || DEFAULT_MODEL

  try {
    const result = await callGenerateJson<T>(modelId, prompt, {
      system: options.system,
      temperature: options.temperature ?? 0.1, // Lower temperature for structured output
      maxTokens: options.maxTokens,
      stopSequences: options.stopSequences,
    })

    if (!result.success || result.data === null) {
      logger.error(`Error generating LLM JSON: ${result.error}`)
      return null
    }

    return result.data
  } catch (error) {
    logger.error(`Error generating LLM JSON: ${error}`)
    return null
  }
}
