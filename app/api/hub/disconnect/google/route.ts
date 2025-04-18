import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { logger } from "@/lib/utils/logger"
// You would implement this client in your codebase, or import from a shared lib
// import { GoogleCalendarClient } from "@/lib/integrations/google-calendar-client"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized attempt to disconnect Google Calendar")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const externalSourceService = new ExternalSourceService()

    // Get current tokens for Google Calendar
    const tokens = await externalSourceService.getTokens(userId, "google_calendar")

    // Attempt to revoke access with Google if we have a token
    if (tokens?.accessToken) {
      try {
        // Replace with your actual GoogleCalendarClient implementation
        // const googleClient = new GoogleCalendarClient()
        // await googleClient.revokeAccess(tokens.accessToken)
        await revokeGoogleAccess(tokens.accessToken)
        logger.info(`Revoked Google Calendar access for user ${userId}`)
      } catch (revokeError) {
        logger.warn(
          `Failed to revoke Google Calendar access for user ${userId}: ${String(revokeError)}`
        )
        // Continue to delete connection even if revoke fails
      }
    } else {
      logger.info(`No Google Calendar access token found for user ${userId}, skipping revoke`)
    }

    // Delete the connection from our database
    await externalSourceService.deleteConnection(userId, "google_calendar")
    logger.info(`Deleted Google Calendar connection for user ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error disconnecting Google Calendar:", error)
    return NextResponse.json({ error: "Failed to disconnect Google Calendar" }, { status: 500 })
  }
}

/**
 * Revoke Google OAuth access token.
 * For production, use the Google API endpoint to revoke the token.
 */
async function revokeGoogleAccess(accessToken: string): Promise<void> {
  const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`
  const res = await fetch(revokeUrl, {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to revoke Google token: ${res.status} ${await res.text()}`)
  }
}
