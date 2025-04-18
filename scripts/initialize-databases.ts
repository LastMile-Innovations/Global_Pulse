import { runMigrations } from "../lib/db/drizzle"
import { executeSchemaSetup } from "../lib/db/graph/schema-executor"
import { logger } from "../lib/utils/logger"

/**
 * Initialize both PostgreSQL and Neo4j databases
 * This should be run during application startup or deployment
 */
export async function initializeDatabases(): Promise<boolean> {
  logger.info("Starting database initialization...")

  try {
    // Initialize PostgreSQL schema via Drizzle migrations
    logger.info("Running PostgreSQL migrations...")
    const pgSuccess = await runMigrations()
    if (!pgSuccess) {
      logger.error("PostgreSQL migrations failed")
      return false
    }
    logger.info("PostgreSQL migrations completed successfully")

    // Initialize Neo4j schema
    logger.info("Setting up Neo4j schema...")
    const neo4jSuccess = await executeSchemaSetup()
    if (!neo4jSuccess) {
      logger.error("Neo4j schema setup failed")
      return false
    }
    logger.info("Neo4j schema setup completed successfully")

    logger.info("Database initialization completed successfully")
    return true
  } catch (error) {
    logger.error(`Error during database initialization: ${error}`)
    return false
  }
}

// If this file is executed directly (e.g., during deployment)
if (require.main === module) {
  initializeDatabases()
    .then((success) => {
      if (success) {
        logger.info("Database initialization completed successfully")
        process.exit(0)
      } else {
        logger.error("Database initialization failed")
        process.exit(1)
      }
    })
    .catch((error) => {
      logger.error(`Unhandled error during database initialization: ${error}`)
      process.exit(1)
    })
}
