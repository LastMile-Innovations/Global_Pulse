import { db } from "../lib/db/postgres/drizzle"
import { users } from "../lib/db/schema"
import { sql } from "drizzle-orm"
import "dotenv/config"

async function main() {
  try {
    console.log("Verifying database connection...")

    // Test a simple query
    const result = await db.select({ count: sql`count(*)` }).from(users)

    console.log("Database connection successful!")
    console.log(`Users table exists with ${result[0].count} records`)

    process.exit(0)
  } catch (error) {
    console.error("Database verification failed:", error)
    process.exit(1)
  }
}

main()
