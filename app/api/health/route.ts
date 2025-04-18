import { NextResponse } from "next/server"
import { db } from "@/lib/db/drizzle"
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver"
import { logger } from "@/lib/utils/logger"
import { sql } from "drizzle-orm"
import type { Driver } from "neo4j-driver"

type HealthStatus = "healthy" | "unhealthy" | "degraded" | "unknown"

interface ServiceHealth {
  status: HealthStatus
  error: string | null
  latencyMs?: number
}

interface HealthResponse {
  status: "ok" | "error"
  timestamp: string
  uptimeSeconds: number
  services: {
    postgres: ServiceHealth
    neo4j: ServiceHealth
  }
}

const serviceStartTime = Date.now()

export async function GET() {
  const startTime = Date.now()
  let pgHealth: ServiceHealth = { status: "unknown", error: null }
  let neo4jHealth: ServiceHealth = { status: "unknown", error: null }
  let neo4jDriverInstance: Driver | null = null

  // Check PostgreSQL connection (via Drizzle)
  const pgStart = Date.now()
  try {
    // Use the exported db instance from drizzle.ts
    await db.execute(sql`SELECT 1`)
    pgHealth = {
      status: "healthy",
      error: null,
      latencyMs: Date.now() - pgStart,
    }
    logger.info("PostgreSQL connection successful (Health Check).")
  } catch (error: any) {
    pgHealth = {
      status: "unhealthy",
      error: error?.message || "Unknown PG Error",
      latencyMs: Date.now() - pgStart,
    }
    logger.error(`Health check failed: PostgreSQL connection error: ${pgHealth.error}`)
  }

  // Check Neo4j connection
  const neo4jStart = Date.now()
  try {
    neo4jDriverInstance = getNeo4jDriver()
    // verifyConnectivity checks authentication and reachability
    await neo4jDriverInstance.verifyConnectivity()
    neo4jHealth = {
      status: "healthy",
      error: null,
      latencyMs: Date.now() - neo4jStart,
    }
    logger.info("Neo4j connection successful (Health Check).")
  } catch (error: any) {
    neo4jHealth = {
      status: "unhealthy",
      error: error?.message || "Unknown Neo4j Error",
      latencyMs: Date.now() - neo4jStart,
    }
    logger.error(`Health check failed: Neo4j connection error: ${neo4jHealth.error}`)
  }

  // Optionally, add more health checks here (e.g., Redis, external APIs, etc.)

  // Compute overall status
  const allHealthy = pgHealth.status === "healthy" && neo4jHealth.status === "healthy"
  const overallStatus: "ok" | "error" = allHealthy ? "ok" : "error"
  const httpStatus = overallStatus === "ok" ? 200 : 503 // Service Unavailable

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - serviceStartTime) / 1000),
    services: {
      postgres: pgHealth,
      neo4j: neo4jHealth,
    },
  }

  // Add a response header for cache control (never cache health checks)
  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Content-Type": "application/json",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  })
}
