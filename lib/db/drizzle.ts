import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { logger } from "@/lib/utils/logger"
import { migrate } from "drizzle-orm/postgres-js/migrator"

// For migrations and one-off scripts (non-pooled)
const migrationConnectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!migrationConnectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL environment variable for migrations");
}
export const migrationClient = postgres(migrationConnectionString, {
  max: 1,
  ssl: process.env.NODE_ENV === 'production' ? "require" : undefined, // Often require SSL in prod
  prepare: false,
})

// For application use (connection pooling)
const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("Missing POSTGRES_URL environment variable for application");
}
const pooledClient = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? "require" : undefined, // Often require SSL in prod
  max: 10, // Connection pool size
  idle_timeout: 20, // How long a connection can stay idle in pool
  connect_timeout: 10, // Connection timeout when connecting to the PostgreSQL server
})

// Initialize Drizzle with our schema
export const db = drizzle(pooledClient, { schema, logger: process.env.NODE_ENV !== 'production' }); // Enable logger in dev

/**
 * Runs database migrations programmatically.
 * This can be used in deployment scripts or for testing.
 */
export async function runMigrations() {
  logger.info("Running database migrations...")
  let migrationDbInstance;
  try {
    // Use the migration client for migrations
    migrationDbInstance = drizzle(migrationClient);

    await migrate(migrationDbInstance, { migrationsFolder: "db/migrations" });

    logger.info("Migrations completed successfully");
    return true;
  } catch (error) {
    logger.error("Migration failed:", error);
    return false;
  } finally {
    // Ensure the migration client connection is closed
    await migrationClient.end();
    logger.info("Migration client connection closed.");
  }
}
