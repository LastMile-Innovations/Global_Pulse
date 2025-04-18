import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"
import { logger } from "../utils/logger"
import type { LlmModelId, LlmRequestConfig, LlmResponseResult, LlmProvider } from "./types"

/**
 * Default configuration for LLM requests
 */
const DEFAULT_CONFIG: Required<Omit<LlmRequestConfig, "systemPrompt" | "stopSequences">> = {
  modelId: "openai/gpt-4o",
  temperature: 0.3,
  maxTokens: 150,
  timeoutMs: 15000, // 15 seconds
}

/**
 * Extracts provider from model ID
 * @param modelId The model ID in format "provider/model-name"
 * @returns The provider name
 */
function getProviderFromModelId(modelId: LlmModelId): LlmProvider {
  const [provider] = modelId.split("/") as [LlmProvider]
  return provider
}

/**
 * Extracts model name from model ID
 * @param modelId The model ID in format "provider/model-name"
 * @returns The model name
 */
function getModelNameFromModelId(modelId: LlmModelId): string {
  const [, modelName] = modelId.split("/")
  return modelName
}

/**
 * Validates that required API keys are present for the specified provider
 * @param provider The LLM provider
 * @returns True if the required API keys are present, false otherwise
 */
function validateApiKeys(provider: LlmProvider): boolean {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY
    case "google":
      return !!process.env.GOOGLE_API_KEY
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY
    default:
      return false
  }
}

/**
 * Maps error to a standardized error code
 * @param error The error object
 * @returns The standardized error code
 */
function mapErrorToCode(error: any): { code: LlmResponseResult["errorCode"]; message: string } {
  // Check for timeout errors
  if (error.name === "AbortError" || error.message?.includes("timeout")) {
    return { code: "TIMEOUT", message: "Request timed out" }
  }

  // Check for authentication errors
  if (
    error.status === 401 ||
    error.message?.includes("auth") ||
    error.message?.includes("key") ||
    error.message?.includes("unauthorized")
  ) {
    return { code: "AUTH", message: "Authentication failed" }
  }

  // Check for rate limit errors
  if (error.status === 429 || error.message?.includes("rate limit") || error.message?.includes("too many requests")) {
    return { code: "RATE_LIMIT", message: "Rate limit exceeded" }
  }

  // Check for server errors
  if ((error.status && error.status >= 500) || error.message?.includes("server error")) {
    return { code: "SERVER_ERROR", message: "Provider server error" }
  }

  // Check for parsing errors
  if (error.message?.includes("parse") || error.message?.includes("json") || error.message?.includes("unexpected")) {
    return { code: "PARSING", message: "Error parsing response" }
  }

  // Check for invalid request errors
  if (error.status === 400 || error.message?.includes("invalid") || error.message?.includes("bad request")) {
    return { code: "INVALID_REQUEST", message: "Invalid request parameters" }
  }

  // Default to unknown error
  return {
    code: "UNKNOWN",
    message: error.message || "An unknown error occurred",
  }
}

/**
 * Gets the appropriate AI SDK model instance for the specified model ID
 * @param modelId The model ID in format "provider/model-name"
 * @returns The AI SDK model instance
 * @throws Error if the provider is not supported or API keys are missing
 */
function getModelInstance(modelId: LlmModelId) {
  const provider = getProviderFromModelId(modelId)
  const modelName = getModelNameFromModelId(modelId)

  // Validate API keys
  if (!validateApiKeys(provider)) {
    throw new Error(`Missing API key for provider: ${provider}`)
  }

  // Return the appropriate model instance
  switch (provider) {
    case "openai":
      return openai(modelName)
    case "google":
      return google(modelName)
    case "anthropic":
      return anthropic(modelName)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * Generate a response from an LLM using the AI SDK
 * @param prompt The prompt to send to the LLM
 * @param options Optional configuration
 * @returns The LLM response
 */
export async function generateLlmResponseViaSdk(
  prompt: string,
  options?: {
    modelId?: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  },
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // Default model ID
    const reqModelId = options?.modelId || "default-chat"

    // Call the AI SDK
    // const result = await callGenerateText(modelId, prompt, {
    //   system: options?.systemPrompt,
    //   temperature: options?.temperature || 0.7,
    //   maxTokens: options?.maxTokens || 1000,
    // })

    // if (result.success && result.data) {
    //   return {
    //     success: true,
    //     text: result.data,
    //   }
    // } else {
    //   return {
    //     success: false,
    //     error: result.error || "Unknown error",
    //   }
    // }

    // Merge config with defaults
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      modelId: options?.modelId || DEFAULT_CONFIG.modelId,
      temperature: options?.temperature ?? DEFAULT_CONFIG.temperature,
      maxTokens: options?.maxTokens ?? DEFAULT_CONFIG.maxTokens,
      systemPrompt: options?.systemPrompt,
    }

    const { modelId, temperature, maxTokens, systemPrompt } = mergedConfig

    logger.info(`Generating LLM response using model: ${modelId}`)

    // Get the model instance
    const model = getModelInstance(modelId as LlmModelId)

    // Create the LLM request promise
    const llmPromise = generateText({
      model,
      prompt,
      system: systemPrompt,
      temperature,
      maxTokens,
    })

    const result = await llmPromise

    // Return the successful result
    return {
      success: true,
      text: result.text,
    }
  } catch (error) {
    logger.error(`Error generating LLM response: ${error}`)

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Generates a JSON response from an LLM using the Vercel AI SDK
 * @param prompt The prompt to send to the LLM
 * @param config Optional configuration for the request
 * @returns A promise resolving to the parsed JSON and LLM response result
 */
export async function generateLlmJsonViaSdk<T>(
  prompt: string,
  config?: LlmRequestConfig,
): Promise<{ data: T | null } & LlmResponseResult> {
  // Add JSON instruction to system prompt
  const systemPrompt = config?.systemPrompt
    ? `${config.systemPrompt}\nYou must respond with valid JSON only, no other text.`
    : "You must respond with valid JSON only, no other text."

  // Generate the response
  const response = await generateLlmResponseViaSdk(prompt, {
    ...config,
    systemPrompt,
    temperature: config?.temperature ?? 0.1, // Lower temperature for structured output
  })

  // If the response was not successful, return early
  if (!response.success || !response.text) {
    return {
      ...response,
      data: null,
    }
  }

  try {
    // Try to parse the JSON
    // Find JSON in the response (in case the model added any extra text)
    const jsonMatch = response.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    const jsonString = jsonMatch ? jsonMatch[0] : response.text

    const data = JSON.parse(jsonString) as T

    return {
      ...response,
      data,
    }
  } catch (error) {
    logger.error(`Error parsing LLM JSON response: ${error} - Response: ${response.text}`)

    return {
      success: false,
      error: "Failed to parse JSON response",
      errorCode: "PARSING",
      data: null,
    }
  }
}
