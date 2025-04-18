import { NextResponse } from "next/server"
import { getDrizzle } from "@/lib/db/drizzle" // Use correct path
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver" // Use correct path
import { logger } from "@/lib/utils/logger" // Use correct path
import { sql } from "drizzle-orm"
import type { Driver } from "neo4j-driver"

export async function GET() {
  let pgHealth = false
  let neo4jHealth = false
  let pgError: string | null = null
  let neo4jError: string | null = null
  let neo4jDriverInstance: Driver | null = null

  // Check PostgreSQL connection (via Drizzle)
  try {
    const db = getDrizzle()
    // Drizzle doesn't have a direct 'ping'. Execute a simple query.
    await db.execute(sql`SELECT 1`)
    pgHealth = true
    logger.info("PostgreSQL connection successful (Health Check).")
  } catch (error: any) {
    pgError = error.message || "Unknown PG Error"
    logger.error(`Health check failed: PostgreSQL connection error: ${pgError}`)
  }

  // Check Neo4j connection
  try {
    neo4jDriverInstance = getNeo4jDriver()
    // verifyConnectivity checks authentication and reachability
    await neo4jDriverInstance.verifyConnectivity()
    neo4jHealth = true
    logger.info("Neo4j connection successful (Health Check).")
  } catch (error: any) {
    neo4jError = error.message || "Unknown Neo4j Error"
    logger.error(`Health check failed: Neo4j connection error: ${neo4jError}`)
  } finally {
    // Close driver if it was successfully created, even if verify failed
    // Note: getNeo4jDriver manages a singleton, so closing might affect other requests.
    // Consider creating a temporary driver *just* for the health check if needed,
    // or rely on verifyConnectivity's internal handling. For simplicity,
    // we assume the singleton driver check is sufficient.
    // if (neo4jDriverInstance) { await neo4jDriverInstance.close(); }
  }

  const overallStatus = pgHealth && neo4jHealth ? "ok" : "error"
  const httpStatus = overallStatus === "ok" ? 200 : 503 // Service Unavailable

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        postgres: { status: pgHealth ? "healthy" : "unhealthy", error: pgError },
        neo4j: { status: neo4jHealth ? "healthy" : "unhealthy", error: neo4jError },
      },
    },
    { status: httpStatus },
  )
}
