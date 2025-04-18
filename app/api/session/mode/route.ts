import { NextResponse } from "next/server"
import { getEngagementMode, setEngagementMode } from "@/lib/session/mode-manager"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { SessionModePutPayloadSchema } from "@/lib/schemas/api"

export async function GET(request: Request) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 })
    }

    const mode = await getEngagementMode(userId, sessionId)
    return NextResponse.json({ mode })
  } catch (error) {
    logger.error(`Error getting engagement mode: ${error}`)
    return NextResponse.json({ error: "Failed to get engagement mode" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()

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
    const success = await setEngagementMode(userId, sessionId, mode)

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
