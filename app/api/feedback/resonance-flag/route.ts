import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { logger } from "@/lib/utils/logger"
import { db } from "@/lib/db/drizzle"
import { resonanceFlags } from "@/lib/db/schema/feedback"
import { getEngagementMode } from "@/lib/session/mode-manager"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { ResonanceFlagPayloadSchema } from "@/lib/schemas/api"
import { rateLimit } from "@/lib/redis/rate-limit"
import type { NextRequest } from "next/server"

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request as unknown as NextRequest, { limit: 30, window: 60 })
  if (rateLimitResult instanceof NextResponse) return rateLimitResult

  try {
    // Authenticate the request
    const userId = await auth(request as unknown as NextRequest)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = ResonanceFlagPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { sessionId, flaggedInteractionId, precedingInteractionId, selectedTags, optionalComment, clientTimestamp } =
      validationResult.data

    // Get the engagement mode at the time of the flag
    const modeAtTimeOfFlag = await getEngagementMode(userId, sessionId)

    // Get the KgService instance
    const kgService = getKgService()

    // Get the response type from Neo4j
    const responseTypeAtTimeOfFlag =
      (await kgService.getInteractionResponseType(flaggedInteractionId, userId)) || "UNKNOWN"

    // Convert client timestamp to Date object
    const timestamp = clientTimestamp ? new Date(clientTimestamp) : new Date()

    // Insert the resonance flag into the database
    await db.insert(resonanceFlags).values({
      userId,
      sessionId,
      flaggedInteractionId,
      precedingInteractionId: precedingInteractionId || null,
      modeAtTimeOfFlag,
      responseTypeAtTimeOfFlag,
      selectedTags,
      optionalComment,
      clientTimestamp: timestamp,
      createdAt: new Date(),
    })

    logger.info(`Resonance flag created for user ${userId}, interaction ${flaggedInteractionId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error creating resonance flag: ${error}`)
    return NextResponse.json({ error: "Failed to create resonance flag" }, { status: 500 })
  }
}
