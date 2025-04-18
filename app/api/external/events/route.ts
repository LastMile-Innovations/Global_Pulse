import { NextResponse } from "next/server"
import { getDriver } from "@/lib/db/graph/neo4j-driver"
import { KgService } from "@/lib/db/graph/kg-service"
import { logger } from "@/lib/utils/logger"

/**
 * API endpoint to fetch external events from the UIG Layer 2
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10)
    const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10)

    // Create KgService
    const driver = await getDriver()
    const kgService = new KgService(driver)

    // Fetch recent information events
    const events = await kgService.getRecentInformationEvents(limit, offset)

    return NextResponse.json({
      success: true,
      events,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Error fetching external events: ${errorMessage}`)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
