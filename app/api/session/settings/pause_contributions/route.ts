import { type NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { SessionPausePutPayloadSchema } from "@/lib/schemas/api"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

export async function PUT(request: NextRequest) {
  // Debug: Entry point
  logger.debug("PUT /api/session/settings/pause_contributions called")

  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized request to pause_contributions")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    let body: unknown
    try {
      body = await request.json()
    } catch (err) {
      logger.warn("Invalid JSON in PUT /api/session/settings/pause_contributions")
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Validate input using centralized schema
    const validationResult = SessionPausePutPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      logger.warn("Validation failed for session pause PUT")
      return NextResponse.json({
        error: "Validation failed",
        details: validationResult.error.format()
      }, { status: 400 })
    }

    const { sessionId, aggregationPaused, trainingPaused } = validationResult.data

    if (!sessionId) {
      logger.warn("Missing sessionId in session pause PUT")
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    // Get Redis client
    let redis
    try {
      redis = getRedisClient()
    } catch (err) {
      logger.error("Failed to get Redis client")
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    // Update session pause flags
    let aggResult: unknown = null
    let trainResult: unknown = null
    let redisErrors: string[] = []

    if (typeof aggregationPaused === "boolean") {
      try {
        aggResult = await redis.set(
          `session:${sessionId}:pauseAggregation`,
          aggregationPaused.toString(),
          { ex: SESSION_TTL }
        )
        logger.debug(`Set pauseAggregation for session ${sessionId} to ${aggregationPaused}`)
      } catch (err) {
        logger.error(`Failed to set pauseAggregation for session ${sessionId}`)
        redisErrors.push("aggregationPaused")
      }
    }

    if (typeof trainingPaused === "boolean") {
      try {
        trainResult = await redis.set(
          `session:${sessionId}:pauseTraining`,
          trainingPaused.toString(),
          { ex: SESSION_TTL }
        )
        logger.debug(`Set pauseTraining for session ${sessionId} to ${trainingPaused}`)
      } catch (err) {
        logger.error(`Failed to set pauseTraining for session ${sessionId}`)
        redisErrors.push("trainingPaused")
      }
    }

    // Prepare log message
    const logMessage = `Updated session pause flags for user ${userId}, session ${sessionId}: aggregation=${aggregationPaused === undefined ? 'not set' : aggregationPaused}, training=${trainingPaused === undefined ? 'not set' : trainingPaused}`;
    logger.info(logMessage);

    if (redisErrors.length > 0) {
      return NextResponse.json({
        error: "Failed to update some pause flags",
        failedFlags: redisErrors,
        aggregationPaused,
        trainingPaused,
        sessionId,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      aggregationPaused,
      trainingPaused,
      sessionId,
    })
  } catch (error: any) {
    logger.error(`Error updating session pause flags: ${error?.message || error}`)
    return NextResponse.json({ error: "Failed to update session pause flags" }, { status: 500 })
  }
}
