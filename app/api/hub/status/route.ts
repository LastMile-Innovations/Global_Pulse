import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { checkConsent } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"

type ConnectionStatus = "connected" | "disconnected" | "error"

interface SourceStatus {
  name: string
  displayName: string
  consentGranted: boolean
  connection: {
    status: ConnectionStatus
    lastSyncedAt: string | null
    errorMessage: string | null
    [key: string]: any
  }
}

interface HubStatusResponse {
  status: "ok" | "error"
  timestamp: string
  sources: SourceStatus[]
  summary: {
    totalSources: number
    connected: number
    disconnected: number
    withConsent: number
    withoutConsent: number
    errors: number
  }
}

/**
 * GET /api/hub/status
 * Returns the status of all external data sources (connections, consent, etc.) for the authenticated user.
 * Production MVP: robust error handling, type safety, summary, extensible for more sources.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized attempt to fetch data hub status")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const externalSourceService = new ExternalSourceService()

    // Get all connections for the user
    let connections: Array<any> = []
    try {
      connections = await externalSourceService.getUserConnections(userId)
      if (!Array.isArray(connections)) {
        logger.error("User connections is not an array")
        connections = []
      }
    } catch (connErr) {
      logger.error("Failed to fetch user connections:", connErr)
      // Continue, but connections will be empty
    }

    // Define all supported sources here
    const sourcesConfig: Array<{
      name: string
      displayName: string
      consentKey: string
    }> = [
      {
        name: "google_calendar",
        displayName: "Google Calendar",
        consentKey: "CAN_ACCESS_SOURCE_google_calendar",
      },
      // Add more sources here as they become available
      // {
      //   name: "microsoft_outlook",
      //   displayName: "Microsoft Outlook",
      //   consentKey: "CAN_ACCESS_SOURCE_microsoft_outlook",
      // },
    ]

    // Build the sources status array
    const sources: SourceStatus[] = await Promise.all(
      sourcesConfig.map(async (source) => {
        let consentGranted = false
        try {
          consentGranted = await checkConsent(userId, source.consentKey)
        } catch (consentErr) {
          logger.warn(
            `Consent check failed for ${source.name} (user: ${userId}): ${String(consentErr)}`
          )
        }

        // Find the connection for this source
        const found = connections.find(
          (c: any) => c && c.sourceName === source.name
        )

        let connection: SourceStatus["connection"]
        if (found) {
          connection = {
            status: found.status as ConnectionStatus || "connected",
            lastSyncedAt: found.lastSyncedAt
              ? new Date(found.lastSyncedAt).toISOString()
              : null,
            errorMessage: found.errorMessage || null,
            ...found, // include any additional fields
          }
        } else {
          connection = {
            status: "disconnected",
            lastSyncedAt: null,
            errorMessage: null,
          }
        }

        return {
          name: source.name,
          displayName: source.displayName,
          consentGranted,
          connection,
        }
      })
    )

    // Compute summary
    const summary = {
      totalSources: sources.length,
      connected: sources.filter(
        (s) => s.connection.status === "connected"
      ).length,
      disconnected: sources.filter(
        (s) => s.connection.status === "disconnected"
      ).length,
      withConsent: sources.filter((s) => s.consentGranted).length,
      withoutConsent: sources.filter((s) => !s.consentGranted).length,
      errors: sources.filter(
        (s) => s.connection.status === "error" || !!s.connection.errorMessage
      ).length,
    }

    const response: HubStatusResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      sources,
      summary,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    logger.error("Error in hub status API:", error)
    return NextResponse.json(
      { error: "Failed to fetch data hub status" },
      { status: 500 }
    )
  }
}
