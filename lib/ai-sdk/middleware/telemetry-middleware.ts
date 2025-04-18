import { logger } from "../../utils/logger"

/**
 * Telemetry middleware for language models
 * Captures detailed metrics about AI operations
 */
export function telemetryMiddleware(functionId: string, metadata: Record<string, any> = {}) {
  const startTime = Date.now()

  return {
    before: async ({ prompt, messages, options }) => {
      logger.debug(`[Telemetry] Starting AI operation: ${functionId}`, {
        metadata,
        messageCount: messages?.length,
        hasPrompt: !!prompt,
        options: {
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
        },
      })

      return { prompt, messages, options, telemetryStart: Date.now() }
    },

    after: async ({ prompt, messages, options, response, telemetryStart }) => {
      const duration = Date.now() - (telemetryStart || startTime)

      logger.debug(`[Telemetry] Completed AI operation: ${functionId}`, {
        metadata,
        duration,
        outputLength: response.text?.length,
        usage: response.usage,
        finishReason: response.finishReason,
      })

      return response
    },

    error: async (error, { prompt, messages, options }) => {
      const duration = Date.now() - startTime

      logger.error(`[Telemetry] Failed AI operation: ${functionId}`, {
        metadata,
        duration,
        error: {
          name: error.name,
          message: error.message,
        },
      })

      throw error
    },
  }
}
