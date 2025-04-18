import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { logger } from "@/lib/utils/logger"
import { NarrativeHidePayloadSchema } from "@/lib/schemas/api"
import { rateLimit } from "@/lib/redis/rate-limit"

/**
 * POST /api/feedback/narrative_hide
 *
 * Allows users to hide specific ERInstance nodes from their narrative
 *
 * @param request The incoming request containing interactionID
 * @returns 200 OK if successful, appropriate error codes otherwise
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, { limit: 30, window: 60 })
  if (rateLimitResult instanceof NextResponse) return rateLimitResult

  try {
    // Authenticate the user
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized attempt to hide narrative")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = NarrativeHidePayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { interactionID } = validationResult.data

    // Get the KG service and call the hideErInstance method
    const kgService = getKgService()
    const success = await kgService.hideErInstance(userId, interactionID)

    if (success) {
      logger.info(`Successfully hid ERInstance for interaction ${interactionID} by user ${userId}`)
      return NextResponse.json({
        success: true,
        message: "Inference hidden successfully.",
      })
    } else {
      logger.warn(
        `Failed to hide ERInstance: interaction ${interactionID} not found or not accessible by user ${userId}`,
      )
      return NextResponse.json(
        {
          success: false,
          error: "Interaction or related inference not found.",
        },
        { status: 404 },
      )
    }
  } catch (error) {
    logger.error(`Error hiding narrative: ${error}`)
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
