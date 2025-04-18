export type LlmProvider = "openai" | "google" | "anthropic"

/**
 * Supported LLM models
 * Format: "provider/model-name"
 */
export type LlmModelId =
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini"
  | "openai/gpt-3.5-turbo"
  | "google/gemini-1.5-pro"
  | "google/gemini-1.5-flash"
  | "anthropic/claude-3-opus"
  | "anthropic/claude-3-sonnet"
  | "anthropic/claude-3-haiku"

/**
 * Configuration options for LLM requests
 */
export interface LlmRequestConfig {
  /**
   * The model ID to use for generation
   * Format: "provider/model-name"
   */
  modelId?: LlmModelId

  /**
   * Optional system prompt to set context for the model
   */
  systemPrompt?: string

  /**
   * Temperature controls randomness in generation
   * Range: 0.0 to 1.0
   * Lower values = more deterministic
   * Higher values = more creative/random
   */
  temperature?: number

  /**
   * Maximum number of tokens to generate
   */
  maxTokens?: number

  /**
   * Timeout in milliseconds for the API call
   */
  timeoutMs?: number

  /**
   * Optional stop sequences to end generation
   */
  stopSequences?: string[]
}

/**
 * Error codes for LLM API calls
 */
export type LlmErrorCode =
  | "TIMEOUT"
  | "AUTH"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "PARSING"
  | "INVALID_REQUEST"
  | "UNKNOWN"

/**
 * Result of an LLM API call
 */
export interface LlmResponseResult {
  /**
   * Whether the API call was successful
   */
  success: boolean

  /**
   * The generated text (present on success)
   */
  text?: string

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
  errorCode?: LlmErrorCode
}
