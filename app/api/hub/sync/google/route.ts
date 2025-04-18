import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/auth-utils"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { checkConsent } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"

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

    const externalSourceService = new ExternalSourceService()

    // Check if connection exists
    const connection = await externalSourceService.getConnection(user.id, "google_calendar")
    if (!connection || connection.status === "disconnected") {
      return NextResponse.json({ error: "No active Google Calendar connection found" }, { status: 400 })
    }

    // Update status to syncing
    await externalSourceService.updateConnectionStatus(user.id, "google_calendar", "syncing")

    // Queue a sync job
    // const qstash = new QStashClient({
    //   token: process.env.QSTASH_TOKEN!,
    // })
    const qstash = null
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/calendar-sync`,
      body: {
        userId: user.id,
        sourceName: "google_calendar",
      },
    })

    return NextResponse.json({ success: true, message: "Sync job queued" })
  } catch (error) {
    logger.error("Error queuing Google Calendar sync:", error)
    return NextResponse.json({ error: "Failed to queue sync job" }, { status: 500 })
  }
}
