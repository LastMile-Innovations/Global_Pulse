import { type NextRequest, NextResponse } from "next/server"
import { getCoreNlpFeatures } from "@/lib/nlp/nlp-features"
import { logger } from "@/lib/utils/logger"
import { NlpAnalyzePayloadSchema } from "@/lib/schemas/api"
import { rateLimit } from "@/lib/redis/rate-limit"

// --- Production MVP: robust error handling, validation, logging, metrics, and security ---

/**
 * POST /api/nlp/analyze
 * Analyzes text using core NLP features.
 * - Validates input using schema
 * - Logs all access and errors
 * - Returns JSON with NLP features or error
 * - Adds metrics and audit logging
 * - Handles edge cases and abuse
 * - Designed for production: type safety, security, and observability
 * - Rate limited for abuse prevention
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId()
  const startTime = Date.now()

  // --- Rate limiting (per user or IP) ---
  const rateLimitResponse = await rateLimit(request, {
    limit: 10, // 10 requests
    window: 60, // per 60 seconds
    keyPrefix: "nlp_analyze",
    includeHeaders: true,
    ipFallback: { enabled: true, limit: 5, window: 60 },
    useLocalCache: true,
    localCacheTtl: 1000,
  })
  if (rateLimitResponse) {
    // Attach requestId to error response if possible
    try {
      const json = await rateLimitResponse.json()
      return NextResponse.json(
        { ...json, requestId },
        { status: 429, headers: rateLimitResponse.headers }
      )
    } catch {
      return rateLimitResponse
    }
  }

  try {
    // --- Parse and validate the request body ---
    let body: unknown
    try {
      body = await request.json()
    } catch (err) {
      logger.warn(`[${requestId}] Invalid JSON in request body`)
      return NextResponse.json(
        { error: "Invalid JSON in request body", requestId },
        { status: 400 }
      )
    }

    // --- Validate payload schema ---
    const validationResult = NlpAnalyzePayloadSchema.safeParse(body)
    if (!validationResult.success) {
      logger.warn(`[${requestId}] Validation failed: ${JSON.stringify(validationResult.error.format())}`)
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format(), requestId },
        { status: 400 }
      )
    }

    const { text } = validationResult.data

    // --- Abuse/edge case checks ---
    if (typeof text !== "string" || text.trim().length === 0) {
      logger.warn(`[${requestId}] Empty or invalid text submitted`)
      return NextResponse.json(
        { error: "Text must be a non-empty string", requestId },
        { status: 400 }
      )
    }
    // Optional: Enforce max length for production
    const MAX_TEXT_LENGTH = 5000
    if (text.length > MAX_TEXT_LENGTH) {
      logger.warn(`[${requestId}] Text too long: length=${text.length}`)
      return NextResponse.json(
        { error: `Text exceeds maximum allowed length (${MAX_TEXT_LENGTH})`, requestId },
        { status: 413 }
      )
    }

    // --- Audit log the request (avoid logging sensitive text) ---
    logger.info(`[${requestId}] NLP analyze request received`)
    // Optionally: logger.info(`[${requestId}] NLP analyze request received`, { textLength: text.length, ... })

    // --- Get NLP features ---
    let nlpFeatures
    try {
      nlpFeatures = await getCoreNlpFeatures(text)
    } catch (err) {
      logger.error(`[${requestId}] Error in getCoreNlpFeatures: ${(err as Error)?.message ?? String(err)}`)
      return NextResponse.json(
        { error: "Failed to analyze text", requestId },
        { status: 500 }
      )
    }

    // --- Metrics ---
    const latencyMs = Date.now() - startTime

    // --- Response ---
    logger.info(`[${requestId}] NLP analysis complete`)
    // Optionally: logger.info(`[${requestId}] NLP analysis complete`, { latencyMs, ... })
    return NextResponse.json({
      success: true,
      features: nlpFeatures,
      requestId,
      latencyMs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error(`[${requestId}] Unexpected error in NLP analyze endpoint: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json(
      { error: "Failed to analyze text. Please try again.", requestId },
      { status: 500 }
    )
  }
}

// --- Utility: Generate a simple request ID for logging and tracing ---
function generateRequestId(): string {
  // Simple random hex string, not cryptographically secure
  return Math.random().toString(16).slice(2, 10) + Date.now().toString(36)
}
