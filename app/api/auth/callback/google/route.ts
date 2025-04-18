import { type NextRequest, NextResponse } from "next/server"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { logger } from "@/lib/utils/logger"
import { getRedisClient } from "@/lib/db/redis/redis-client"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle errors from Google
    if (error) {
      logger.error(`Google OAuth error: ${error}`)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/data-hub?error=google_auth_failed`)
    }

    // Validate required parameters
    if (!code || !state) {
      logger.error("Missing code or state parameter in Google callback")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/data-hub?error=invalid_callback`)
    }

    // Verify state parameter to prevent CSRF
    const redis = getRedisClient()
    const userId = await redis.get(`oauth_state:${state}`)

    if (!userId) {
      logger.error("Invalid or expired state parameter in Google callback")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/data-hub?error=invalid_state`)
    }

    // Clean up the state from Redis
    await redis.del(`oauth_state:${state}`)

    // Exchange code for tokens
    // const googleClient = new GoogleCalendarClient()
    // const { refreshToken, accessToken, expiryDate } = await googleClient.getTokensFromCode(code)

    // Store tokens
    const externalSourceService = new ExternalSourceService()
    await externalSourceService.storeTokens(
      userId as string,
      "google_calendar",
      {
        refreshToken: "",
        accessToken: "",
        tokenExpiry: new Date(),
      },
      "connected",
    )

    // Queue a sync job
    // const qstash = new QStashClient({
    //   token: process.env.QSTASH_TOKEN!,
    // })
    const qstash = null
    // await qstash.publishJSON({
    //   url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/calendar-sync`,
    //   body: {
    //     userId,
    //     sourceName: "google_calendar",
    //   },
    //   delay: 1, // Start sync after 1 second
    // })

    // Redirect back to data hub page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/data-hub?success=google_connected`)
  } catch (error) {
    logger.error("Error in Google OAuth callback:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/data-hub?error=connection_failed`)
  }
}
