import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { logger } from "../utils/logger"

/**
 * Model provider types
 */
export type ModelProvider = "openai" | "anthropic" | "google"

/**
 * Model type
 */
export type ModelType = "language" | "embedding" | "image"

/**
 * Model identifier format: provider:model-name
 * Examples: openai:gpt-4o, anthropic:claude-3-sonnet
 */
export type ModelId = `${ModelProvider}:${string}`

/**
 * Model configuration interface
 */
export interface ModelConfig {
  /** The actual model ID to use */
  modelId: ModelId
  /** Default temperature setting */
  defaultTemperature?: number
  /** Default max tokens setting */
  defaultMaxTokens?: number
  /** Default system prompt */
  defaultSystemPrompt?: string
  /** Whether to apply reasoning middleware */
  applyReasoningMiddleware?: boolean
  /** Whether to apply custom logging middleware */
  applyLoggingMiddleware?: boolean
  /** Whether to apply custom caching middleware */
  applyCachingMiddleware?: boolean
}

/**
 * Model alias mapping
 */
interface ModelAliasMap {
  [alias: string]: ModelConfig
}

/**
 * Default model aliases with configurations
 */
const MODEL_ALIASES: ModelAliasMap = {
  // Chat models
  "default-chat": {
    modelId: "openai:gpt-4o",
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    applyLoggingMiddleware: true,
  },
  "default-chat-mini": {
    modelId: "openai:gpt-4o-mini",
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    applyLoggingMiddleware: true,
  },
  "high-quality": {
    modelId: "anthropic:claude-3-opus",
    defaultTemperature: 0.5,
    defaultMaxTokens: 4000,
    defaultSystemPrompt: "You are a helpful, accurate, and thoughtful assistant.",
    applyReasoningMiddleware: true,
    applyLoggingMiddleware: true,
  },
  balanced: {
    modelId: "anthropic:claude-3-sonnet",
    defaultTemperature: 0.7,
    defaultMaxTokens: 3000,
    applyLoggingMiddleware: true,
  },
  fast: {
    modelId: "anthropic:claude-3-haiku",
    defaultTemperature: 0.8,
    defaultMaxTokens: 2000,
    applyLoggingMiddleware: true,
  },

  // Structured output models
  "structured-output": {
    modelId: "openai:gpt-4o",
    defaultTemperature: 0.2,
    defaultMaxTokens: 2000,
    defaultSystemPrompt:
      "You are a helpful assistant that provides structured outputs according to the specified schema.",
    applyLoggingMiddleware: true,
  },

  // Embedding models
  "default-embedding": {
    modelId: "openai:text-embedding-3-small",
    applyLoggingMiddleware: true,
  },
  "high-quality-embedding": {
    modelId: "openai:text-embedding-3-large",
    applyLoggingMiddleware: true,
  },

  // Specialized models
  "creative-writing": {
    modelId: "anthropic:claude-3-sonnet",
    defaultTemperature: 0.9,
    defaultMaxTokens: 4000,
    defaultSystemPrompt: "You are a creative writing assistant with a flair for engaging, imaginative content.",
    applyLoggingMiddleware: true,
  },
  reasoning: {
    modelId: "anthropic:claude-3-opus",
    defaultTemperature: 0.3,
    defaultMaxTokens: 4000,
    defaultSystemPrompt: "You are a logical reasoning assistant that thinks step by step to solve problems accurately.",
    applyReasoningMiddleware: true,
    applyLoggingMiddleware: true,
  },
}

/**
 * Validates that required API keys are present for the specified provider
 * @param provider The model provider
 * @returns True if the required API keys are present, false otherwise
 */
function validateApiKeys(provider: ModelProvider): boolean {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY
    case "google":
      return !!process.env.GOOGLE_API_KEY
    default:
      return false
  }
}

/**
 * Parses a model ID into provider and model name
 * @param modelId The model ID in format "provider:model-name" or an alias
 * @returns The parsed provider and model name
 * @throws Error if the model ID format is invalid
 */
function parseModelId(modelId: string): { provider: ModelProvider; modelName: string } {
  // Check if the modelId is an alias
  const config = MODEL_ALIASES[modelId]
  const resolvedId = config ? config.modelId : modelId

  // Parse the model ID
  const parts = resolvedId.split(":")
  if (parts.length !== 2) {
    throw new Error(`Invalid model ID format: ${modelId}. Expected format: "provider:model-name"`)
  }

  const [provider, modelName] = parts as [ModelProvider, string]
  return { provider, modelName }
}

/**
 * Gets a language model instance for the specified model ID or alias
 * @param modelIdOrAlias The model ID in format "provider:model-name" or an alias
 * @returns The language model instance with applied middleware
 * @throws Error if the provider is not supported or API keys are missing
 */
export function getLanguageModelInstance(modelIdOrAlias: string) {
  const config = MODEL_ALIASES[modelIdOrAlias]
  const { provider, modelName } = parseModelId(modelIdOrAlias)

  if (!validateApiKeys(provider)) {
    throw new Error(`Missing API key for provider: ${provider}`)
  }

  let modelInstance

  switch (provider) {
    case "openai":
      modelInstance = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      })
      break
    case "anthropic":
      modelInstance = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
      })
      break
    case "google":
      modelInstance = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY!,
      })
      break
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }

  // Return the provider instance, model will be specified at call time
  return modelInstance
}

/**
 * Gets an embedding model instance for the specified model ID or alias
 * @param modelIdOrAlias The model ID in format "provider:model-name" or an alias
 * @returns The embedding model instance
 * @throws Error if the provider is not supported or API keys are missing
 */
export function getEmbeddingModelInstance(modelIdOrAlias: string) {
  const { provider, modelName } = parseModelId(modelIdOrAlias)

  if (!validateApiKeys(provider)) {
    throw new Error(`Missing API key for provider: ${provider}`)
  }

  if (provider === "openai") {
    // Instantiate the provider
    const openaiProvider = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
    // Return the specific embedding model from the provider
    return openaiProvider.embedding(modelName as any)
  }

  throw new Error(`Unsupported embedding provider: ${provider}`)
}

/**
 * Validates that all required API keys are present for configured providers
 * Logs warnings for missing API keys
 */
export function validateConfiguredProviders(): void {
  const providers: ModelProvider[] = ["openai", "anthropic", "google"]

  for (const provider of providers) {
    if (!validateApiKeys(provider)) {
      logger.warn(`Missing API key for provider: ${provider}. Some functionality may be limited.`)
    } else {
      logger.info(`API key for provider ${provider} is configured.`)
    }
  }
}

/**
 * Resolves a model alias to its full model configuration
 * @param aliasOrId A model alias or full model ID
 * @returns The resolved model configuration or undefined if not an alias
 */
export function resolveModelAlias(aliasOrId: string): ModelConfig | undefined {
  return MODEL_ALIASES[aliasOrId]
}

/**
 * Gets the model configuration for a given alias or ID
 * @param aliasOrId A model alias or full model ID
 * @returns The model configuration or a default configuration if not an alias
 */
export function getModelConfig(aliasOrId: string): ModelConfig {
  const config = MODEL_ALIASES[aliasOrId]
  if (config) {
    return config
  }

  // If not an alias, create a default configuration
  return {
    modelId: aliasOrId as ModelId,
    applyLoggingMiddleware: true,
  }
}

/**
 * Dynamically selects a model based on the task requirements
 * @param task The task description
 * @param options Additional options to consider
 * @returns The selected model alias
 */
export function selectModelForTask(
  task: "chat" | "structured" | "embedding" | "reasoning" | "creative",
  options?: { quality?: "high" | "balanced" | "low"; latencySensitive?: boolean },
): string {
  const { quality = "balanced", latencySensitive = false } = options || {}

  // Select model based on task and quality requirements
  switch (task) {
    case "chat":
      if (latencySensitive) return "default-chat-mini"
      if (quality === "high") return "high-quality"
      if (quality === "low") return "fast"
      return "default-chat"

    case "structured":
      return "structured-output"

    case "embedding":
      return quality === "high" ? "high-quality-embedding" : "default-embedding"

    case "reasoning":
      return "reasoning"

    case "creative":
      return "creative-writing"

    default:
      return "default-chat"
  }
}
