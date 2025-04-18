import { NextResponse } from "next/server"
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver"
import { KgService } from "@/lib/db/graph/kg-service"
import { getRedisClient } from "@/lib/db/redis/redis-client"
import { logger } from "@/lib/utils/logger"
import { BootstrapResetPayloadSchema } from "@/lib/schemas/api"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = BootstrapResetPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { userID, sessionID } = validationResult.data

    // Reset bootstrapping state in Neo4j
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)

    // Update the user node
    const cypher = `
      MATCH (u:User {userID: $userID})
      SET u.bootstrappingComplete = false
    `
    await kgService.kgLayer.executeCypher(cypher, { userID })

    // Remove any existing attachments
    const removeAttachmentsCypher = `
      MATCH (u:User {userID: $userID})-[r:HOLDS_ATTACHMENT]->()
      DELETE r
    `
    await kgService.kgLayer.executeCypher(removeAttachmentsCypher, { userID })

    // Clear Redis state
    const redis = getRedisClient()
    await redis.del(`session:awaiting_bootstrap:${sessionID}`)

    logger.info(`Reset bootstrapping state for user ${userID}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error resetting bootstrapping state: ${error}`)
    return NextResponse.json({ error: "Failed to reset bootstrapping state" }, { status: 500 })
  }
}
