import { db } from "../lib/db/postgres/drizzle"
// import { users } from "../lib/db/schema" // Commented out: users table no longer exists
import { sql } from "drizzle-orm"
import "dotenv/config"

async function main() {
  try {
    console.log("Verifying database connection...")

    // Test a simple query (Original query commented out as users table is removed)
    // const result = await db.select({ count: sql`count(*)` }).from(users)

    // Perform a different simple query to verify connection
    const connectionCheck = await db.execute(sql`SELECT 1`)

    if (!connectionCheck) {
      throw new Error("Simple SELECT 1 query failed.")
    }

    console.log("Database connection successful!")
    // console.log(`Users table exists with ${result[0].count} records`) // Commented out

    process.exit(0)
  } catch (error) {
    console.error("Database verification failed:", error)
    process.exit(1)
  }
}

main()
