import { createDriver, closeDriver } from "./neo4j-driver"
import { applyKgMvpSchema, verifyKgMvpSchema } from "./kg-schema-setup"
import { logger } from "../../utils/logger"

/**
 * Execute the schema setup process
 * This can be called during deployment or application initialization
 */
export async function executeSchemaSetup(): Promise<boolean> {
  logger.info("Starting UIG schema setup process")

  try {
    // Create a Neo4j driver instance
    const driver = await createDriver()

    // Apply the schema
    await applyKgMvpSchema(driver)

    // Verify the schema was applied correctly
    const verificationResult = await verifyKgMvpSchema(driver)

    // Close the driver
    await closeDriver(driver)

    if (!verificationResult.success) {
      logger.error(`Schema verification failed: ${verificationResult.details}`)
      return false
    }

    logger.info("UIG schema setup completed successfully")
    return true
  } catch (error) {
    logger.error(`Error during schema setup: ${error}`)
    return false
  }
}

// If this file is executed directly (e.g., during deployment)
if (require.main === module) {
  executeSchemaSetup()
    .then((success) => {
      if (success) {
        logger.info("Schema setup completed successfully")
        process.exit(0)
      } else {
        logger.error("Schema setup failed")
        process.exit(1)
      }
    })
    .catch((error) => {
      logger.error(`Unhandled error during schema setup: ${error}`)
      process.exit(1)
    })
}
