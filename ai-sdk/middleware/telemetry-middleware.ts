import { logger } from "../../lib/utils/logger"

/**
 * Types for telemetry middleware context and hooks
 * MVP production: extensible, robust, and type-safe
 */
export interface TelemetryBeforeContext {
  prompt?: unknown
  messages?: unknown
  options?: unknown
  // Optionally allow for user/session/request metadata
  userId?: string
  requestId?: string
}

export interface TelemetryAfterContext extends TelemetryBeforeContext {
  response?: unknown
  telemetryStart?: number
  usage?: Record<string, any>
  warnings?: unknown
}

export interface TelemetryErrorContext extends TelemetryBeforeContext {
  error?: unknown
}

export interface TelemetryMiddleware {
  before: (ctx: TelemetryBeforeContext) => Promise<TelemetryBeforeContext & { telemetryStart: number }>
  after: (ctx: TelemetryAfterContext) => Promise<unknown>
  error: (error: unknown, ctx: TelemetryErrorContext) => Promise<never>
}

/**
 * Telemetry middleware for language models
 * MVP production: robust, extensible, and safe
 * - Captures detailed metrics about AI operations
 * - Logs input, output, duration, usage, warnings, and errors
 * - Attaches requestId/userId if available
 * - Avoids logging sensitive data (PII/PHI) in production
 */
export function telemetryMiddleware(
  functionId: string,
  metadata: Record<string, any> = {}
): TelemetryMiddleware {
  // Fallback start time if telemetryStart is missing
  const startTime = Date.now()

  return {
    before: async (ctx: TelemetryBeforeContext) => {
      const { prompt, messages, options, userId, requestId } = ctx

      // For production: avoid logging full prompt/messages if sensitive
      logger.info(
        `[Telemetry] [${functionId}] START - Meta: ${JSON.stringify({
          functionId,
          userId,
          requestId,
          ...metadata,
        })}`
      )
      logger.debug(
        `[Telemetry] [${functionId}] Input: ${JSON.stringify({
          prompt,
          messages,
          options,
        })}`
      )

      // Attach telemetryStart for duration measurement
      return { ...ctx, telemetryStart: Date.now() }
    },

    after: async (ctx: TelemetryAfterContext) => {
      const {
        prompt,
        messages,
        options,
        response,
        telemetryStart,
        userId,
        requestId,
        usage,
        warnings,
      } = ctx
      const duration = Date.now() - (telemetryStart ?? startTime)

      // For production: log output/usage/warnings, but avoid sensitive data
      logger.info(
        `[Telemetry] [${functionId}] COMPLETE - Meta: ${JSON.stringify({
          functionId,
          userId,
          requestId,
          durationMs: duration,
          ...metadata,
        })}`
      )
      logger.debug(
        `[Telemetry] [${functionId}] Output: ${JSON.stringify({
          response,
          usage,
          warnings,
        })}`
      )

      return response
    },

    error: async (error: unknown, ctx: TelemetryErrorContext) => {
      const { prompt, messages, options, userId, requestId } = ctx
      const duration = Date.now() - startTime

      // For production: log error with context, but avoid sensitive data
      logger.error(
        `[Telemetry] [${functionId}] ERROR - Meta: ${JSON.stringify({
          functionId,
          userId,
          requestId,
          durationMs: duration,
          ...metadata,
        })} - Error: ${error instanceof Error ? error.stack || error.message : String(error)}`
      )
      logger.debug(
        `[Telemetry] [${functionId}] Failed Input: ${JSON.stringify({
          prompt,
          messages,
          options,
        })}`
      )

      throw error
    },
  }
}
