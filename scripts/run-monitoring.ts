import { MonitoringServiceFactory } from "../lib/monitoring/monitoring-service-factory"
import { logger } from "../lib/utils/logger"

/**
 * Script to manually run the monitoring service
 * Usage: npx tsx scripts/run-monitoring.ts
 */
async function main() {
  try {
    // Get the NewsAPI key from environment variables
    const newsApiKey = process.env.NEWS_API_KEY
    if (!newsApiKey) {
      logger.error("NEWS_API_KEY environment variable is not set")
      process.exit(1)
    }

    logger.info("Starting monitoring service...")

    // Create and run the monitoring service
    const monitoringService = await MonitoringServiceFactory.create(newsApiKey)
    const result = await monitoringService.runMonitoringCycle()

    logger.info("Monitoring cycle completed:")
    logger.info(`- Total items fetched: ${result.totalItemsFetched}`)
    logger.info(`- Items passed filter: ${result.itemsPassedFilter}`)
    logger.info(`- Entities extracted: ${result.entitiesExtracted}`)
    logger.info(`- Events created: ${result.eventsCreated}`)
    logger.info(`- Entities created: ${result.entitiesCreated}`)
    logger.info(`- Relationships created: ${result.relationshipsCreated}`)

    if (result.errors.length > 0) {
      logger.warn(`- Errors encountered: ${result.errors.length}`)
      result.errors.forEach((error, index) => {
        logger.warn(`  ${index + 1}. [${error.stage}] ${error.message} ${error.item ? `(${error.item})` : ""}`)
      })
    }

    process.exit(0)
  } catch (error) {
    logger.error(`Error running monitoring service: ${error}`)
    process.exit(1)
  }
}

main()
