import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { checkConsent } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import crypto from "crypto"
import { getGoogleAuthUrl } from "@/lib/services/hub/google/google-auth-service"
import { rateLimit } from "@/lib/redis/rate-limit"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI!
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  // Add more scopes as needed
].join(" ")
const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth"

// Define specific limits for this endpoint (User ID based)
const endpointLimit = 10
const endpointWindow = 60 // 1 minute

function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
    include_granted_scopes: "true",
  })
  return `${GOOGLE_AUTH_BASE}?${params.toString()}`
}

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
  const rateLimitResponse = await rateLimit(request, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "hub:connect:google",
    ipFallback: { enabled: false }, // Requires User ID
  })
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  try {
    // Authenticate user
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized attempt to connect Google Calendar")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has granted consent for Google Calendar
    const hasConsent = await checkConsent(userId, "CAN_ACCESS_SOURCE_google_calendar")
    if (!hasConsent) {
      logger.warn(`User ${userId} has not granted consent for Google Calendar`)
      return NextResponse.json(
        { error: "You must grant consent for Google Calendar integration in your privacy settings" },
        { status: 403 },
      )
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(20).toString("hex")

    // Store state in Redis with expiration (10 minutes)
    const redis = getRedisClient()
    await redis.set(`oauth_state:${state}`, userId, { ex: 600 })

    // Build Google OAuth2 authorization URL
    const authUrl = buildGoogleAuthUrl(state)

    logger.info(`Initiated Google Calendar OAuth for user ${userId}`)

    return NextResponse.json({ authUrl })
  } catch (error) {
    logger.error("Error initiating Google Calendar connection:", error)
    return NextResponse.json({ error: "Failed to initiate Google Calendar connection" }, { status: 500 })
  }
}
