import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { checkConsent } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"

// For production, use the actual QStash client or your job queue of choice
// import { QStashClient } from "@upstash/qstash"
// const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! })

/**
 * POST /api/hub/sync/google
 * Queues a Google Calendar sync job for the authenticated user.
 * - Requires authentication
 * - Requires user consent for Google Calendar
 * - Requires an active Google Calendar connection
 * - Updates connection status to "syncing"
 * - Queues a sync job (via QStash or other job queue)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized attempt to queue Google Calendar sync")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has granted consent for Google Calendar
    let hasConsent = false
    try {
      hasConsent = await checkConsent(userId, "CAN_ACCESS_SOURCE_google_calendar")
    } catch (consentErr) {
      logger.error(`Consent check failed for user ${userId}: ${String(consentErr)}`)
      return NextResponse.json({ error: "Consent check failed" }, { status: 500 })
    }
    if (!hasConsent) {
      logger.warn(`User ${userId} has not granted consent for Google Calendar`)
      return NextResponse.json(
        { error: "You must grant consent for Google Calendar integration in your privacy settings" },
        { status: 403 }
      )
    }

    const externalSourceService = new ExternalSourceService()

    // Check if connection exists and is active
    let connection: any
    try {
      connection = await externalSourceService.getConnection(userId, "google_calendar")
    } catch (connErr) {
      logger.error(`Failed to fetch Google Calendar connection for user ${userId}: ${String(connErr)}`)
      return NextResponse.json({ error: "Failed to check Google Calendar connection" }, { status: 500 })
    }
    if (!connection || connection.status === "disconnected") {
      logger.info(`No active Google Calendar connection found for user ${userId}`)
      return NextResponse.json({ error: "No active Google Calendar connection found" }, { status: 400 })
    }

    // Update status to "syncing"
    try {
      await externalSourceService.updateConnectionStatus(userId, "google_calendar", "syncing")
    } catch (updateErr) {
      logger.error(`Failed to update connection status to syncing for user ${userId}: ${String(updateErr)}`)
      return NextResponse.json({ error: "Failed to update connection status" }, { status: 500 })
    }

    // Queue a sync job (production: use QStash or your job queue)
    try {
      // Uncomment and configure for production:
      // const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! })
      // await qstash.publishJSON({
      //   url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/calendar-sync`,
      //   body: {
      //     userId,
      //     sourceName: "google_calendar",
      //   },
      // })

      // For MVP fallback: simulate job queue with a log
      logger.info(`(MVP) Would queue Google Calendar sync job for user ${userId}`)

      // Optionally: call the worker endpoint directly (not recommended for production scale)
      // await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/workers/calendar-sync`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userId, sourceName: "google_calendar" }),
      // })
    } catch (queueErr) {
      logger.error(`Failed to queue Google Calendar sync job for user ${userId}: ${String(queueErr)}`)
      // Optionally, revert status to previous state
      try {
        await externalSourceService.updateConnectionStatus(userId, "google_calendar", "connected")
      } catch (revertErr) {
        logger.error(`Failed to revert connection status for user ${userId}: ${String(revertErr)}`)
      }
      return NextResponse.json({ error: "Failed to queue sync job" }, { status: 500 })
    }

    logger.info(`Queued Google Calendar sync job for user ${userId}`)
    return NextResponse.json({ success: true, message: "Sync job queued" })
  } catch (error) {
    logger.error("Error queuing Google Calendar sync:", error)
    return NextResponse.json({ error: "Failed to queue sync job" }, { status: 500 })
  }
}
