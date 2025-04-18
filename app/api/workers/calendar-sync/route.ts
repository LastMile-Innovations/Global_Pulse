import { type NextRequest, NextResponse } from "next/server"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { logger } from "@/lib/utils/logger"
import { verifySignature } from "@upstash/qstash/nextjs"

async function handler(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { userId, sourceName } = body

    if (!userId || sourceName !== "google_calendar") {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    logger.info(`Starting calendar sync for user ${userId}`)

    const externalSourceService = new ExternalSourceService()

    // Update status to syncing
    await externalSourceService.updateConnectionStatus(userId, "google_calendar", "syncing")

    // Get tokens
    const tokens = await externalSourceService.getTokens(userId, "google_calendar")
    if (!tokens) {
      logger.error(`No tokens found for user ${userId}`)
      await externalSourceService.updateConnectionStatus(userId, "google_calendar", "error", "No valid tokens found")
      return NextResponse.json({ error: "No tokens found" }, { status: 400 })
    }

    // Get fresh access token
    // const googleClient = new GoogleCalendarClient()
    // const { accessToken } = await googleClient.refreshAccessToken(tokens.refreshToken)

    // Fetch calendar events
    // const events = await googleClient.fetchCalendarEvents(
    //   accessToken,
    //   new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    //   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    // )
    const events = []

    logger.info(`Fetched ${events.length} calendar events for user ${userId}`)

    // Process calendar data and update UIG
    await externalSourceService.processCalendarData(userId, events)

    return NextResponse.json({ success: true, eventsProcessed: events.length })
  } catch (error) {
    logger.error("Error in calendar sync worker:", error)

    // Try to update connection status if we have userId
    try {
      const body = await request.json()
      const { userId } = body

      if (userId) {
        const externalSourceService = new ExternalSourceService()
        await externalSourceService.updateConnectionStatus(
          userId,
          "google_calendar",
          "error",
          error instanceof Error ? error.message : "Unknown error",
        )
      }
    } catch (e) {
      logger.error("Failed to update connection status after error:", e)
    }

    return NextResponse.json({ error: "Calendar sync failed" }, { status: 500 })
  }
}

// Wrap the handler with QStash verification middleware
export const POST = verifySignature(handler)

// Configure the runtime to use Edge for better performance
export const runtime = "edge"
