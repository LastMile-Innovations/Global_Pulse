import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 })
    }

    // Get Redis client
    const redis = getRedisClient()

    // Get session pause flags
    const sessionPauseAggregation = await redis.get(`session:${sessionId}:pauseAggregation`)
    const sessionPauseTraining = await redis.get(`session:${sessionId}:pauseTraining`)
    const distressCheckPerformed = await redis.get(`session:${sessionId}:distressCheckPerformed`)
    const awaitingDistressCheckResponse = await redis.get(`session:${sessionId}:awaitingDistressCheckResponse`)

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
