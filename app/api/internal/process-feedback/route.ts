import { type NextRequest, NextResponse } from "next/server"
import { LearningService } from "@/lib/learning/learning-service"
import { logger } from "@/lib/utils/logger"

const DEFAULT_BATCH_SIZE = 50
const MAX_BATCH_SIZE = 500

/**
 * POST /api/internal/process-feedback
 * Internal endpoint to process a batch of feedback for learning.
 * - Secured via internal API key (Bearer token)
 * - Accepts optional batchSize query param (default: 50, max: 500)
 * - Returns JSON with processing results
 * - Logs all access and errors
 * - Production MVP: robust error handling, type safety, metrics, and audit logging
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // --- Authorization ---
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`[${requestId}] Unauthorized: Missing or malformed authorization header`)
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const expectedToken = process.env.INTERNAL_API_KEY
    if (!expectedToken) {
      logger.error(`[${requestId}] INTERNAL_API_KEY not set in environment`)
      return NextResponse.json({ error: "Server misconfiguration", requestId }, { status: 500 })
    }
    if (!timingSafeEqual(token, expectedToken)) {
      logger.warn(`[${requestId}] Forbidden: Invalid internal API key`)
      return NextResponse.json({ error: "Forbidden", requestId }, { status: 403 })
    }

    // --- Parse and validate batchSize ---
    let batchSize = DEFAULT_BATCH_SIZE
    try {
      const url = new URL(request.url)
      const batchSizeParam = url.searchParams.get("batchSize")
      if (batchSizeParam) {
        const parsed = Number.parseInt(batchSizeParam, 10)
        if (Number.isNaN(parsed) || parsed <= 0) {
          logger.warn(`[${requestId}] Invalid batchSize param: ${batchSizeParam}`)
          return NextResponse.json({ error: "Invalid batchSize parameter", requestId }, { status: 400 })
        }
        batchSize = Math.min(parsed, MAX_BATCH_SIZE)
      }
    } catch (err) {
      logger.warn(`[${requestId}] Failed to parse URL or batchSize: ${String(err)}`)
      return NextResponse.json({ error: "Invalid request URL", requestId }, { status: 400 })
    }

    logger.info(`[${requestId}] Processing feedback batch (batchSize=${batchSize})`)

    // --- Process feedback batch ---
    const learningService = new LearningService()
    let result: ProcessFeedbackBatchResult
    try {
      result = await learningService.processFeedbackBatch(batchSize)
    } catch (err) {
      logger.error(`[${requestId}] Error in learningService.processFeedbackBatch:`, err)
      return NextResponse.json(
        {
          error: "Failed to process feedback batch",
          message: (err as Error)?.message ?? "Unknown error",
          requestId,
        },
        { status: 500 }
      )
    }

    // --- Audit log ---
    logger.info(
      `[${requestId}] Feedback batch processed: processed=${result.processed}, failed=${result.failed}, skipped=${result.skipped}`
    )

    // --- Metrics ---
    const latencyMs = Date.now() - startTime

    // --- Response ---
    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      skipped: result.skipped,
      timestamp: new Date().toISOString(),
      requestId,
      latencyMs,
      // Optionally include more details if available
      ...(result.errors ? { errors: result.errors } : {}),
      ...(result.details ? { details: result.details } : {}),
    })
  } catch (error) {
    logger.error(`[${requestId}] Error processing feedback batch:`, error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: (error as Error)?.message ?? "Unknown error",
        requestId,
      },
      { status: 500 }
    )
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Returns true if a === b, false otherwise.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Generate a short random request ID for log correlation.
 */
function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/**
 * Type for the result returned by LearningService.processFeedbackBatch.
 * Extend as needed for production.
 */
type ProcessFeedbackBatchResult = {
  processed: number
  failed: number
  skipped: number
  errors?: Array<{ message: string; feedbackId?: string }>
  details?: any
}
