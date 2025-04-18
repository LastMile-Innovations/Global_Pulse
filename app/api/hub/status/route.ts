import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/auth-utils"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { checkConsent } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const externalSourceService = new ExternalSourceService()

    // Get all connections for the user
    const connections = await externalSourceService.getUserConnections(user.id)

    // Check consent for Google Calendar
    const hasGoogleCalendarConsent = await checkConsent(user.id, "CAN_ACCESS_SOURCE_google_calendar")

    // Prepare response
    const response = {
      sources: [
        {
          name: "google_calendar",
          displayName: "Google Calendar",
          consentGranted: hasGoogleCalendarConsent,
          connection: connections.find((c) => c.sourceName === "google_calendar") || {
            status: "disconnected",
            lastSyncedAt: null,
            errorMessage: null,
          },
        },
        // Add more sources here as they become available
      ],
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error("Error in hub status API:", error)
    return NextResponse.json({ error: "Failed to fetch data hub status" }, { status: 500 })
  }
}
