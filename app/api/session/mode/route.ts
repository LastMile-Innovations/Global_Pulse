import { type NextRequest, NextResponse } from "next/server"
import { getEngagementMode, setEngagementMode } from "@/lib/session/mode-manager"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { SessionModePutPayloadSchema } from "@/lib/schemas/api"

/**
 * GET /api/session/mode?sessionId=...
 * Returns the engagement mode for a session for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get sessionId from query params
    const sessionId = request.nextUrl.searchParams.get("sessionId")
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 })
    }

    // Get the engagement mode
    const mode = await getEngagementMode(userId, sessionId)
    return NextResponse.json({ mode })
  } catch (error) {
    logger.error(`Error getting engagement mode: ${error}`)
    return NextResponse.json({ error: "Failed to get engagement mode" }, { status: 500 })
  }
}

/**
 * PUT /api/session/mode
 * Body: { sessionId: string, mode: string }
 * Sets the engagement mode for a session for the authenticated user.
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    let body: unknown
    try {
      body = await request.json()
    } catch (err) {
      logger.warn("Invalid JSON in PUT /api/session/mode")
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Validate input using centralized schema
    const validationResult = SessionModePutPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { sessionId, mode } = validationResult.data

    // Update the mode
    let success = false
    try {
      success = await setEngagementMode(userId, sessionId, mode)
    } catch (err) {
      logger.error(`Error in setEngagementMode: ${err}`)
      return NextResponse.json({ error: "Failed to update engagement mode" }, { status: 500 })
    }

    if (success) {
      return NextResponse.json({ success: true, mode })
    } else {
      return NextResponse.json({ error: "Failed to update engagement mode" }, { status: 500 })
    }
  } catch (error) {
    logger.error(`Error updating engagement mode: ${error}`)
    return NextResponse.json({ error: "Failed to update engagement mode" }, { status: 500 })
  }
}
