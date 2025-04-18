import { NextResponse } from "next/server"
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver"
import { applyKgMvpSchema, verifyKgMvpSchema } from "@/lib/db/graph/kg-schema-setup"
import { logger } from "@/lib/utils/logger"

/**
 * API route to initialize the UIG schema
 * This should be called during deployment or setup
 */
export async function GET() {
  try {
    const driver = getNeo4jDriver()

    // Apply the schema
    await applyKgMvpSchema(driver)

    // Verify the schema was applied correctly
    const verified = await verifyKgMvpSchema(driver)

    if (!verified) {
      logger.error("UIG schema verification failed")
      return NextResponse.json({ success: false, message: "Schema verification failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "UIG schema initialized successfully" }, { status: 200 })
  } catch (error) {
    logger.error(`Error initializing UIG schema: ${error}`)
    return NextResponse.json({ success: false, message: `Error initializing UIG schema: ${error}` }, { status: 500 })
  }
}
