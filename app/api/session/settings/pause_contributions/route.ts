import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { SessionPausePutPayloadSchema } from "@/lib/schemas/api"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

export async function PUT(request: Request) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = SessionPausePutPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { sessionId, aggregationPaused, trainingPaused } = validationResult.data

    // Get Redis client
    const redis = getRedisClient()

    // Update session pause flags
    if (typeof aggregationPaused === "boolean") {
      await redis.set(`session:${sessionId}:pauseAggregation`, aggregationPaused.toString(), { ex: SESSION_TTL })
    }

    if (typeof trainingPaused === "boolean") {
      await redis.set(`session:${sessionId}:pauseTraining`, trainingPaused.toString(), { ex: SESSION_TTL })
    }

    logger.info(
      `Updated session pause flags for user ${userId}, session ${sessionId}: aggregation=${aggregationPaused}, training=${trainingPaused}`,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error updating session pause flags: ${error}`)
    return NextResponse.json({ error: "Failed to update session pause flags" }, { status: 500 })
  }
}
