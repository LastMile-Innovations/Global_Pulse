import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/auth-utils"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { logger } from "@/lib/utils/logger"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const externalSourceService = new ExternalSourceService()

    // Get current tokens
    const tokens = await externalSourceService.getTokens(user.id, "google_calendar")

    if (tokens?.accessToken) {
      // Revoke access with Google
      const googleClient = null //new GoogleCalendarClient()
      await googleClient.revokeAccess(tokens.accessToken)
    }

    // Delete the connection from our database
    await externalSourceService.deleteConnection(user.id, "google_calendar")

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error disconnecting Google Calendar:", error)
    return NextResponse.json({ error: "Failed to disconnect Google Calendar" }, { status: 500 })
  }
}
