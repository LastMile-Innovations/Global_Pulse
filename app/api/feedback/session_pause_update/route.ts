import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { SessionPauseUpdatePayloadSchema } from "@/lib/schemas/api"
import { NextRequest } from "next/server"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

export async function POST(request: Request) {
  try {
    // Authenticate the request
    const userId = await auth(request as unknown as NextRequest)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = SessionPauseUpdatePayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { sessionId, pauseChoice } = validationResult.data

    // Get Redis client
    const redis = getRedisClient()

    // Update session pause flags based on choice
    let aggregationPaused = false
    let trainingPaused = false

    switch (pauseChoice) {
      case "Pause Both":
        aggregationPaused = true
        trainingPaused = true
        break
      case "Pause Insights Only":
        aggregationPaused = true
        trainingPaused = false
        break
      case "Pause Training Only":
        aggregationPaused = false
        trainingPaused = true
        break
      case "Continue Both":
        aggregationPaused = false
        trainingPaused = false
        break
    }

    // Update Redis flags
    await redis.set(`session:${sessionId}:pauseAggregation`, aggregationPaused.toString(), { ex: SESSION_TTL })
    await redis.set(`session:${sessionId}:pauseTraining`, trainingPaused.toString(), { ex: SESSION_TTL })

    // Reset awaiting response flag
    await redis.set(`session:${sessionId}:awaitingDistressCheckResponse`, "false", { ex: SESSION_TTL })

    logger.info(
      `Updated session pause flags via distress check-in for user ${userId}, session ${sessionId}: aggregation=${aggregationPaused}, training=${trainingPaused}`,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error updating session pause flags via distress check-in: ${error}`)
    return NextResponse.json({ error: "Failed to update session pause flags" }, { status: 500 })
  }
}
