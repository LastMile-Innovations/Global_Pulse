import { NextResponse } from "next/server"
import { MonitoringServiceFactory } from "@/lib/monitoring/monitoring-service-factory"
import { logger } from "@/lib/utils/logger"

/**
 * Scheduled job to run the monitoring service
 * This endpoint is called by a scheduler (e.g., Vercel Cron)
 */
export async function GET(request: Request) {
  try {
    // Verify the request is authorized (e.g., using a secret token)
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    // Simple authorization check - in production, use a more secure method
    if (token !== process.env.MONITORING_CRON_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the NewsAPI key from environment variables
    const newsApiKey = process.env.NEWS_API_KEY
    if (!newsApiKey) {
      logger.error("NEWS_API_KEY environment variable is not set")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Create and run the monitoring service
    const monitoringService = await MonitoringServiceFactory.create(newsApiKey)
    const result = await monitoringService.runMonitoringCycle()

    logger.info(`Monitoring cycle completed: ${JSON.stringify(result)}`)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Error in monitoring cron job: ${errorMessage}`)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
