import { generateText, streamText, generateObject } from "ai"
import type { GenerateTextOptions, Message, StreamTextOptions, GenerateObjectOptions } from "ai"
import { getLanguageModelInstance, getModelConfig } from "./providers"
import { logger } from "../utils/logger"
import type { z } from "zod"

/**
 * Error codes for AI SDK calls
 */
export type AiSdkErrorCode =
  | "TIMEOUT"
  | "AUTH"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "PARSING"
  | "INVALID_REQUEST"
  | "UNKNOWN"
  | "NO_OBJECT_GENERATED"

/**
 * Result of an AI SDK call
 */
export interface AiSdkResult<T> {
  /**
   * Whether the API call was successful
   */
  success: boolean

  /**
   * The result data (present on success)
   */
  data?: T

  /**
   * The model used for generation (echoed back)
   */
  modelUsed?: string

  /**
   * Error message (present on failure)
   */
  error?: string

  /**
   * Categorized error code (present on failure)
   */
  errorCode?: AiSdkErrorCode
}

/**
 * Maps error to a standardized error code
 * @param error The error object
 * @returns The standardized error code and message
 */
function mapErrorToCode(error: any): { code: AiSdkErrorCode; message: string } {
  // Check for NoObjectGeneratedError
  if (error.name === "NoObjectGeneratedError" || error.message?.includes("No object generated")) {
    return { code: "NO_OBJECT_GENERATED", message: "Failed to generate a valid object" }
  }

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
 * Default options for generateText calls
 */
const DEFAULT_GENERATE_OPTIONS: Partial<GenerateTextOptions> = {
  temperature: 0.3,
  maxTokens: 1000,
}

/**
 * Default options for streamText calls
 */
const DEFAULT_STREAM_OPTIONS: Partial<StreamTextOptions> = {
  temperature: 0.3,
  maxTokens: 1000,
}

/**
 * Default options for generateObject calls
 */
const DEFAULT_GENERATE_OBJECT_OPTIONS: Partial<GenerateObjectOptions> = {
  temperature: 0.2,
  maxTokens: 1000,
}

/**
 * Calls the AI SDK generateText function with error handling and telemetry
 * @param modelId The model ID or alias to use
 * @param prompt The prompt to send to the model
 * @param options Optional configuration for the request
 * @returns A promise resolving to the AI SDK result
 */
export async function callGenerateText(
  modelId: string,
  prompt: string | Message[],
  options?: Partial<GenerateTextOptions> & {
    telemetry?: {
      functionId: string
      metadata?: Record<string, any>
    }
  },
): Promise<AiSdkResult<string>> {
  try {
    const functionId = options?.telemetry?.functionId || "ai.generate_text.default"
    logger.info(`Generating text using model: ${modelId}, function: ${functionId}`)

    // Get the model instance and config
    const model = getLanguageModelInstance(modelId)
    const modelConfig = getModelConfig(modelId)

    // Merge options with defaults and model config defaults
    const mergedOptions: Partial<GenerateTextOptions> = {
      ...DEFAULT_GENERATE_OPTIONS,
      temperature: modelConfig.defaultTemperature || DEFAULT_GENERATE_OPTIONS.temperature,
      maxTokens: modelConfig.defaultMaxTokens || DEFAULT_GENERATE_OPTIONS.maxTokens,
      ...options,
    }

    // Add telemetry if provided
    if (options?.telemetry) {
      mergedOptions.experimental_telemetry = {
        functionId: options.telemetry.functionId,
        metadata: options.telemetry.metadata || {},
        recordInputs: process.env.NODE_ENV !== "production", // Only record inputs in non-production
        recordOutputs: process.env.NODE_ENV !== "production", // Only record outputs in non-production
      }
    }

    // Call the AI SDK
    const result = await generateText({
      model,
      prompt,
      ...mergedOptions,
    })

    // Return the successful result
    return {
      success: true,
      data: result.text,
      modelUsed: modelId,
    }
  } catch (error) {
    // Handle errors
    const { code, message } = mapErrorToCode(error)

    logger.error(`AI SDK error (${code}): ${message}`, {
      modelId,
      functionId: options?.telemetry?.functionId,
      errorDetails: error,
    })

    return {
      success: false,
      error: message,
      errorCode: code,
      modelUsed: modelId,
    }
  }
}

/**
 * Calls the AI SDK streamText function with error handling and telemetry
 * @param modelId The model ID or alias to use
 * @param messages The messages to send to the model
 * @param options Optional configuration for the request
 * @returns The AI SDK stream response
 * @throws Error if the request fails
 */
export async function callStreamText(
  modelId: string,
  messages: Message[],
  options: {
    temperature?: number
    maxTokens?: number
    tools?: any[]
    userId?: string
    telemetry?: {
      functionId: string
      metadata?: Record<string, any>
    }
  } = {},
): Promise<ReadableStream> {
  const functionId = options?.telemetry?.functionId || "ai.stream_text.default"
  const { temperature, maxTokens, tools = [], userId } = options

  try {
    logger.info(`Streaming text using model: ${modelId}, function: ${functionId}`)

    const model = getLanguageModelInstance(modelId)
    const modelConfig = getModelConfig(modelId)

    if (!model) {
      throw new Error(`Model not found for key: ${modelId}`)
    }

    // Prepare telemetry options if provided
    const telemetryOptions = options.telemetry
      ? {
          experimental_telemetry: {
            functionId: options.telemetry.functionId,
            metadata: options.telemetry.metadata || {},
            recordInputs: process.env.NODE_ENV !== "production",
            recordOutputs: process.env.NODE_ENV !== "production",
          },
        }
      : {}

    const { stream } = await streamText({
      model,
      messages,
      temperature: temperature || modelConfig.defaultTemperature || DEFAULT_STREAM_OPTIONS.temperature,
      maxTokens: maxTokens || modelConfig.defaultMaxTokens || DEFAULT_STREAM_OPTIONS.maxTokens,
      tools,
      // Pass the userId in the context for tool execution
      toolContext: userId ? { userId } : undefined,
      ...telemetryOptions,
    })

    return stream
  } catch (error) {
    logger.error(`Error in callStreamText: ${error}`, {
      modelId,
      functionId,
    })
    throw error
  }
}

/**
 * Generates a JSON response from an LLM using the AI SDK
 * @param modelId The model ID or alias to use
 * @param prompt The prompt to send to the model
 * @param options Optional configuration for the request
 * @returns A promise resolving to the parsed JSON and AI SDK result
 */
export async function callGenerateJson<T>(
  modelId: string,
  prompt: string | Message[],
  options?: Partial<GenerateTextOptions> & {
    telemetry?: {
      functionId: string
      metadata?: Record<string, any>
    }
  },
): Promise<AiSdkResult<T | null>> {
  // Add JSON instruction to system prompt
  const systemPrompt = options?.system
    ? `${options.system}\nYou must respond with valid JSON only, no other text.`
    : "You must respond with valid JSON only, no other text."

  // Generate the response
  const response = await callGenerateText(modelId, prompt, {
    ...options,
    system: systemPrompt,
    temperature: options?.temperature ?? 0.1, // Lower temperature for structured output
    telemetry: options?.telemetry
      ? {
          functionId: options.telemetry.functionId || "ai.generate_json.default",
          metadata: options.telemetry.metadata,
        }
      : undefined,
  })

  // If the response was not successful, return early
  if (!response.success || !response.data) {
    return {
      ...response,
      data: null,
    }
  }

  try {
    // Try to parse the JSON
    // Find JSON in the response (in case the model added any extra text)
    const jsonMatch = response.data.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    const jsonString = jsonMatch ? jsonMatch[0] : response.data

    const data = JSON.parse(jsonString) as T

    return {
      ...response,
      data,
    }
  } catch (error) {
    logger.error(`Error parsing JSON response: ${error}`, {
      response: response.data,
      functionId: options?.telemetry?.functionId,
    })

    return {
      success: false,
      error: "Failed to parse JSON response",
      errorCode: "PARSING",
      modelUsed: response.modelUsed,
      data: null,
    }
  }
}

/**
 * Calls the AI SDK generateObject function with error handling and telemetry
 * @param modelId The model ID or alias to use
 * @param prompt The prompt to send to the model
 * @param schema The Zod schema to validate the response against
 * @param options Optional configuration for the request
 * @returns A promise resolving to the AI SDK result with the validated object
 */
export async function callGenerateObject<T extends z.ZodType>(
  modelId: string,
  prompt: string | Message[],
  schema: T,
  options?: Partial<GenerateObjectOptions> & {
    telemetry?: {
      functionId: string
      metadata?: Record<string, any>
    }
  },
): Promise<AiSdkResult<z.infer<T>>> {
  try {
    const functionId = options?.telemetry?.functionId || "ai.generate_object.default"
    logger.info(`Generating object using model: ${modelId}, function: ${functionId}`)

    // Get the model instance and config
    const model = getLanguageModelInstance(modelId)
    const modelConfig = getModelConfig(modelId)

    // Merge options with defaults and model config defaults
    const mergedOptions: Partial<GenerateObjectOptions> = {
      ...DEFAULT_GENERATE_OBJECT_OPTIONS,
      temperature: modelConfig.defaultTemperature || DEFAULT_GENERATE_OBJECT_OPTIONS.temperature,
      maxTokens: modelConfig.defaultMaxTokens || DEFAULT_GENERATE_OBJECT_OPTIONS.maxTokens,
      ...options,
    }

    // Add telemetry if provided
    if (options?.telemetry) {
      mergedOptions.experimental_telemetry = {
        functionId: options.telemetry.functionId,
        metadata: options.telemetry.metadata || {},
        recordInputs: process.env.NODE_ENV !== "production",
        recordOutputs: process.env.NODE_ENV !== "production",
      }
    }

    // Call the AI SDK
    const result = await generateObject({
      model,
      prompt,
      schema,
      ...mergedOptions,
    })

    // Return the successful result
    return {
      success: true,
      data: result.object,
      modelUsed: modelId,
    }
  } catch (error) {
    // Handle errors
    const { code, message } = mapErrorToCode(error)

    logger.error(`AI SDK generateObject error (${code}): ${message}`, {
      modelId,
      functionId: options?.telemetry?.functionId,
      errorDetails: error,
    })

    return {
      success: false,
      error: message,
      errorCode: code,
      modelUsed: modelId,
    }
  }
}
