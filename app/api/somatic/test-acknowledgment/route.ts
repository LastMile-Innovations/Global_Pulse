import { type NextRequest, NextResponse } from "next/server"
import { generateSomaticAcknowledgment } from "@/lib/somatic/somatic-service"
import { logger } from "@/lib/utils/logger"

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json()

    // Validate required fields
    if (!userId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields: userId, sessionId" }, { status: 400 })
    }

    // Test generateSomaticAcknowledgment
    const acknowledgment = await generateSomaticAcknowledgment(userId, sessionId)

    return NextResponse.json({
      acknowledgment,
    })
  } catch (error) {
    logger.error(`Error in somatic test-acknowledgment API: ${error}`)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
