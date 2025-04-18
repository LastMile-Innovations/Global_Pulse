import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { logger } from "@/lib/utils/logger"
import { migrate } from "drizzle-orm/node-postgres/migrator"

// For migrations and one-off scripts (non-pooled)
export const migrationClient = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  max: 1,
  ssl: "require",
  prepare: false,
})

// For application use (connection pooling)
const connectionString = process.env.POSTGRES_URL!
const pooledClient = postgres(connectionString, {
  ssl: "require",
  max: 10, // Connection pool size
  idle_timeout: 20, // How long a connection can stay idle in pool
  connect_timeout: 10, // Connection timeout when connecting to the PostgreSQL server
})

// Initialize Drizzle with our schema
export const db = drizzle(pooledClient, { schema })

/**
 * Runs database migrations programmatically.
 * This can be used in deployment scripts or for testing.
 */
export async function runMigrations() {
  logger.info("Running database migrations...")

  try {
    const migrationDb = drizzle(migrationClient)

    await migrate(migrationDb, { migrationsFolder: "db/migrations" })

    logger.info("Migrations completed successfully")
    return true
  } catch (error) {
    logger.error("Migration failed:", error)
    return false
  }
}
