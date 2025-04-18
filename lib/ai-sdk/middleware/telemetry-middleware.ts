import { logger } from "../../utils/logger"

/**
 * Types for telemetry middleware context and hooks
 */
export interface TelemetryBeforeContext {
  prompt?: unknown
  messages?: unknown
  options?: unknown
}

export interface TelemetryAfterContext extends TelemetryBeforeContext {
  response?: unknown
  telemetryStart?: number
}

export interface TelemetryErrorContext extends TelemetryBeforeContext {}

export interface TelemetryMiddleware {
  before: (ctx: TelemetryBeforeContext) => Promise<TelemetryBeforeContext & { telemetryStart: number }>
  after: (ctx: TelemetryAfterContext) => Promise<unknown>
  error: (error: unknown, ctx: TelemetryErrorContext) => Promise<never>
}

/**
 * Telemetry middleware for language models
 * Captures detailed metrics about AI operations
 */
export function telemetryMiddleware(functionId: string, metadata: Record<string, any> = {}): TelemetryMiddleware {
  // Note: startTime is only a fallback if telemetryStart is not set
  const startTime = Date.now()

  return {
    before: async ({ prompt, messages, options }: TelemetryBeforeContext) => {
      logger.debug(
        `[Telemetry] Starting AI operation: ${functionId} - Input: ${JSON.stringify({
          prompt,
          messages,
          options,
          ...metadata,
        })}`,
      )
      // Attach telemetryStart for duration measurement
      return { prompt, messages, options, telemetryStart: Date.now() }
    },

    after: async ({ prompt, messages, options, response, telemetryStart }: TelemetryAfterContext) => {
      const duration = Date.now() - (telemetryStart ?? startTime)

      logger.debug(
        `[Telemetry] Completed AI operation: ${functionId} - Input: ${JSON.stringify({
          prompt,
          messages,
          options,
          ...metadata,
        })} - Output: ${JSON.stringify(response)} - Duration: ${duration}ms`,
      )

      return response
    },

    error: async (error: unknown, { prompt, messages, options }: TelemetryErrorContext) => {
      const duration = Date.now() - startTime

      logger.error(
        `[Telemetry] Failed AI operation: ${functionId} - Input: ${JSON.stringify({
          prompt,
          messages,
          options,
          ...metadata,
        })} - Error: ${error instanceof Error ? error.stack || error.message : String(error)} - Duration: ${duration}ms`,
      )

      throw error
    },
  }
}
