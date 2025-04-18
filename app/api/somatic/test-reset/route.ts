import { type NextRequest, NextResponse } from "next/server"
import { resetSomaticState } from "@/lib/somatic/somatic-service"
import { logger } from "@/lib/utils/logger"

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json()

    // Validate required fields
    if (!userId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields: userId, sessionId" }, { status: 400 })
    }

    // Test resetSomaticState
    await resetSomaticState(userId, sessionId)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    logger.error(`Error in somatic test-reset API: ${error}`)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
