import { type NextRequest, NextResponse } from "next/server"
import {
  getTemplatedResponse,
  type TemplateContextParams,
  type TemplateFillingOptions,
} from "@/lib/responses/template-filler"
import { logger } from "@/lib/utils/logger"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { intentKey, contextParams, options } = body

    // Validate required fields
    if (!intentKey) {
      return NextResponse.json({ success: false, error: "Intent key is required" }, { status: 400 })
    }

    if (!contextParams || typeof contextParams !== "object") {
      return NextResponse.json({ success: false, error: "Context parameters are required" }, { status: 400 })
    }

    // Ensure required context parameters
    const validatedContextParams: TemplateContextParams = {
      userId: contextParams.userId || "anonymous",
      sessionId: contextParams.sessionId || "anonymous-session",
      user_message: contextParams.user_message || "",
      ...contextParams,
    }

    // Validate options
    const validatedOptions: TemplateFillingOptions = {
      useLlmAssistance: options?.useLlmAssistance !== undefined ? options.useLlmAssistance : true,
      templateId: options?.templateId || undefined,
      llmModelId: options?.llmModelId || undefined,
    }

    // Get templated response
    logger.info(`Generating templated response for intent: ${intentKey}`)
    const text = await getTemplatedResponse(intentKey, validatedContextParams, validatedOptions)

    // Return response
    return NextResponse.json({ success: true, text })
  } catch (error) {
    // Log error
    logger.error("Error generating templated response:", error)

    // Return error response
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
