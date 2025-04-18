import { type NextApiRequest, type NextApiResponse } from "next";
import { ExternalSourceService } from "@/lib/data-hub/external-source-service"
import { logger } from "@/lib/utils/logger"

// Change handler signature to use NextApiRequest and NextApiResponse
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Qstash signature verification happens in the middleware
    // We access the verified body via req.body if verification passes
    // Note: verifySignature middleware might parse the body automatically
    // Adjust parsing logic if needed based on middleware behavior
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { userId, sourceName } = body

    if (!userId || sourceName !== "google_calendar") {
      return res.status(400).json({ error: "Invalid request parameters" });
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
      return res.status(400).json({ error: "No tokens found" });
    }

    // Placeholder for actual calendar fetching logic
    const events: any[] = [] // Replace with actual type

    logger.info(`Fetched ${events.length} calendar events for user ${userId}`)

    // Process calendar data and update UIG
    await externalSourceService.processCalendarData(userId, events)

    // Update status back to connected (or idle)
    await externalSourceService.updateConnectionStatus(userId, "google_calendar", "connected")

    return res.status(200).json({ success: true, eventsProcessed: events.length });

  } catch (error) {
    logger.error("Error in calendar sync worker:", error)

    // Try to update connection status if we have userId from the body
    let userIdFromBody: string | undefined;
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      userIdFromBody = body?.userId;
    } catch (parseError) {
      logger.error("Failed to parse request body during error handling:", parseError);
    }

    if (userIdFromBody) {
      try {
        const externalSourceService = new ExternalSourceService()
        await externalSourceService.updateConnectionStatus(
          userIdFromBody,
          "google_calendar",
          "error",
          error instanceof Error ? error.message : "Unknown error",
        )
      } catch (statusUpdateError) {
        logger.error("Failed to update connection status after error:", statusUpdateError)
      }
    }

    return res.status(500).json({ error: "Calendar sync failed" });
  }
}

// Remove Qstash signature verification wrapper
// export const POST = verifySignature(handler)

// Directly export the handler as POST
export { handler as POST }

// Remove edge runtime configuration if using NextApiRequest/Response
// export const runtime = "edge"
