import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/auth-utils"
import { checkConsent } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"
import { getRedisClient } from "@/lib/redis/client"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has granted consent for Google Calendar
    const hasConsent = await checkConsent(user.id, "CAN_ACCESS_SOURCE_google_calendar")
    if (!hasConsent) {
      return NextResponse.json(
        { error: "You must grant consent for Google Calendar integration in your privacy settings" },
        { status: 403 },
      )
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(20).toString("hex")

    // Store state in Redis with expiration (10 minutes)
    const redis = getRedisClient()
    await redis.set(`oauth_state:${state}`, user.id, { ex: 600 })

    // Generate authorization URL
    // const googleClient = new GoogleCalendarClient()
    // const authUrl = googleClient.getAuthUrl(state)
    const authUrl = ""
    return NextResponse.json({ authUrl })
  } catch (error) {
    logger.error("Error initiating Google Calendar connection:", error)
    return NextResponse.json({ error: "Failed to initiate Google Calendar connection" }, { status: 500 })
  }
}
