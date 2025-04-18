import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import "dotenv/config"

// This script runs migrations on the database
async function main() {
  console.log("Running migrations...")

  const connectionString = process.env.POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    throw new Error("POSTGRES_URL_NON_POOLING environment variable is not defined")
  }

  // Create a postgres client with the connection string
  const sql = postgres(connectionString, {
    max: 1,
    ssl: "require",
  })

  // Create a drizzle client with the postgres client
  const db = drizzle(sql)

  // Run migrations
  await migrate(db, { migrationsFolder: "drizzle" })

  console.log("Migrations completed successfully")

  // Close the connection
  await sql.end()
}

main().catch((error) => {
  console.error("Migration failed:", error)
  process.exit(1)
})
