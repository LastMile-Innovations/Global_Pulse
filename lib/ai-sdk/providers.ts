import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { logger } from "../utils/logger"

/**
 * Supported model providers for MVP production.
 */
export type ModelProvider = "openai" | "anthropic" | "google"

/**
 * Supported model types for extensibility.
 */
export type ModelType = "language" | "embedding" | "image"

/**
 * Model identifier format: provider:model-name (e.g., openai:gpt-4o)
 */
export type ModelId = `${ModelProvider}:${string}`

/**
 * Model configuration for aliasing, defaults, and middleware.
 */
export interface ModelConfig {
  modelId: ModelId
  defaultTemperature?: number
  defaultMaxTokens?: number
  defaultSystemPrompt?: string
  applyReasoningMiddleware?: boolean
  applyLoggingMiddleware?: boolean
  applyCachingMiddleware?: boolean
  // Extend with more middleware/config as needed
}

/**
 * Alias mapping for models, with production-ready defaults.
 */
interface ModelAliasMap {
  [alias: string]: ModelConfig
}

/**
 * Default model aliases and their configurations for MVP production.
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
 * Validate that required API keys are present for a provider.
 * Logs a warning if missing in production.
 */
function validateApiKeys(provider: ModelProvider): boolean {
  switch (provider) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) {
        logger.warn("OPENAI_API_KEY is not set. OpenAI models will not be available.")
        return false
      }
      return true
    case "anthropic":
      if (!process.env.ANTHROPIC_API_KEY) {
        logger.warn("ANTHROPIC_API_KEY is not set. Anthropic models will not be available.")
        return false
      }
      return true
    case "google":
      if (!process.env.GOOGLE_API_KEY) {
        logger.warn("GOOGLE_API_KEY is not set. Google models will not be available.")
        return false
      }
      return true
    default:
      logger.error(`Unknown provider: ${provider}`)
      return false
  }
}

/**
 * Parse a model ID or alias into provider and model name.
 * Throws for invalid format.
 */
function parseModelId(modelIdOrAlias: string): { provider: ModelProvider; modelName: string } {
  // If alias, resolve to actual modelId
  const config = MODEL_ALIASES[modelIdOrAlias]
  const resolvedId = config ? config.modelId : modelIdOrAlias

  const parts = resolvedId.split(":")
  if (parts.length !== 2) {
    throw new Error(`Invalid model ID format: ${modelIdOrAlias}. Expected format: "provider:model-name"`)
  }
  const [provider, modelName] = parts as [ModelProvider, string]
  if (!["openai", "anthropic", "google"].includes(provider)) {
    throw new Error(`Unknown provider in model ID: ${provider}`)
  }
  return { provider: provider as ModelProvider, modelName }
}

/**
 * Get a language model instance for a model ID or alias.
 * Throws if provider is unsupported or API key is missing.
 */
export function getLanguageModelInstance(modelIdOrAlias: string) {
  const { provider } = parseModelId(modelIdOrAlias)

  if (!validateApiKeys(provider)) {
    throw new Error(`Missing API key for provider: ${provider}`)
  }

  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    case "anthropic":
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    case "google":
      return createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY! })
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * Get an embedding model instance for a model ID or alias.
 * Throws if provider is unsupported or API key is missing.
 * MVP: Only OpenAI embedding models are supported.
 */
export function getEmbeddingModelInstance(modelIdOrAlias: string) {
  const { provider, modelName } = parseModelId(modelIdOrAlias)

  if (!validateApiKeys(provider)) {
    throw new Error(`Missing API key for provider: ${provider}`)
  }

  if (provider === "openai") {
    const openaiProvider = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    // Defensive: ensure embedding method exists
    if (typeof openaiProvider.embedding !== "function") {
      throw new Error("OpenAI provider does not support embedding method")
    }
    return openaiProvider.embedding(modelName as any)
  }

  throw new Error(`Embedding models are only supported for OpenAI in MVP. Unsupported provider: ${provider}`)
}

/**
 * Validate all configured providers for required API keys.
 * Logs warnings for missing keys.
 */
export function validateConfiguredProviders(): void {
  const providers: ModelProvider[] = ["openai", "anthropic", "google"]
  for (const provider of providers) {
    validateApiKeys(provider)
  }
}

/**
 * Resolve a model alias to its configuration, or undefined if not an alias.
 */
export function resolveModelAlias(aliasOrId: string): ModelConfig | undefined {
  return MODEL_ALIASES[aliasOrId]
}

/**
 * Get the model configuration for an alias or model ID.
 * If not an alias, returns a default config for the ID.
 */
export function getModelConfig(aliasOrId: string): ModelConfig {
  const config = MODEL_ALIASES[aliasOrId]
  if (config) return config
  // Defensive: fallback config for unknown IDs
  return {
    modelId: aliasOrId as ModelId,
    applyLoggingMiddleware: true,
  }
}

/**
 * Select a model alias for a given task and options.
 * MVP: Covers chat, structured, embedding, reasoning, creative.
 */
export function selectModelForTask(
  task: "chat" | "structured" | "embedding" | "reasoning" | "creative",
  options?: { quality?: "high" | "balanced" | "low"; latencySensitive?: boolean },
): string {
  const { quality = "balanced", latencySensitive = false } = options || {}

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
      logger.warn(`Unknown task "${task}", falling back to default-chat`)
      return "default-chat"
  }
}
