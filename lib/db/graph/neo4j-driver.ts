import neo4j, { type Driver } from "neo4j-driver"
import { logger } from "../../utils/logger"

let driver: Driver | null = null

/**
 * Get or create a Neo4j driver instance
 */
export function createDriver(): Driver {
  if (driver) {
    return driver
  }

  const uri = process.env.NEO4J_URI
  const username = process.env.NEO4J_USERNAME
  const password = process.env.NEO4J_PASSWORD

  if (!uri || !username || !password) {
    const error = "Neo4j connection details missing from environment variables"
    logger.error(error)
    throw new Error(error)
  }

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    })

    logger.info("Neo4j driver created successfully")
    return driver
  } catch (error) {
    logger.error(`Error creating Neo4j driver: ${error}`)
    throw error
  }
}

/**
 * Close the Neo4j driver connection
 */
export async function closeDriver(driverToClose: Driver): Promise<void> {
  if (driverToClose) {
    await driverToClose.close()
    logger.info("Neo4j driver closed successfully")
  }
}

/**
 * Get the Neo4j driver instance. Creates one if it doesn't exist.
 */
export function getNeo4jDriver(): Driver {
  if (driver) {
    return driver
  }
  return createDriver()
}
