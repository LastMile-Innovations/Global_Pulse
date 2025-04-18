import { type NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"

// MVP GET /api/session/settings?sessionId=...
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get sessionId from query params
    const sessionId = request.nextUrl.searchParams.get("sessionId")
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 })
    }

    // Get Redis client
    const redis = getRedisClient()

    // Get session pause flags and other settings
    const [
      sessionPauseAggregation,
      sessionPauseTraining,
      distressCheckPerformed,
      awaitingDistressCheckResponse,
    ] = await Promise.all([
      redis.get(`session:${sessionId}:pauseAggregation`),
      redis.get(`session:${sessionId}:pauseTraining`),
      redis.get(`session:${sessionId}:distressCheckPerformed`),
      redis.get(`session:${sessionId}:awaitingDistressCheckResponse`),
    ])

    return NextResponse.json({
      sessionPauseAggregation: sessionPauseAggregation === "true",
      sessionPauseTraining: sessionPauseTraining === "true",
      distressCheckPerformed: distressCheckPerformed === "true",
      awaitingDistressCheckResponse: awaitingDistressCheckResponse === "true",
    })
  } catch (error) {
    logger.error(`Error getting session settings: ${error}`)
    return NextResponse.json({ error: "Failed to get session settings" }, { status: 500 })
  }
}
