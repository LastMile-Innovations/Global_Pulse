import { type NextRequest, NextResponse } from "next/server"
import { LearningService } from "@/lib/learning/learning-service"
import { logger } from "@/lib/utils/logger"

// This is an internal API endpoint that should be secured
// It's designed to be called by a cron job or other scheduled process

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for authorization (this should be improved in production)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    // In production, use a proper secret comparison
    if (token !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    // Get batch size from query params or use default
    const url = new URL(request.url)
    const batchSizeParam = url.searchParams.get("batchSize")
    const batchSize = batchSizeParam ? Number.parseInt(batchSizeParam, 10) : 50

    // Process feedback
    const learningService = new LearningService()
    const result = await learningService.processFeedbackBatch(batchSize)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error("Error processing feedback batch:", error)
    return NextResponse.json({ error: "Internal server error", message: (error as Error).message }, { status: 500 })
  }
}
