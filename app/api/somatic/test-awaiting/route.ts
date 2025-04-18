import { type NextRequest, NextResponse } from "next/server"
import { isAwaitingSomaticResponse } from "@/lib/somatic/somatic-service"
import { logger } from "@/lib/utils/logger"
import { SomaticTestPayloadSchema } from "@/lib/schemas/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = SomaticTestPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { userId, sessionId } = validationResult.data

    // Test isAwaitingSomaticResponse
    const isAwaiting = await isAwaitingSomaticResponse(userId, sessionId)

    return NextResponse.json({
      isAwaiting,
    })
  } catch (error) {
    logger.error(`Error in somatic test-awaiting API: ${error}`)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
