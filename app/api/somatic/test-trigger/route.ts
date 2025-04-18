import { type NextRequest, NextResponse } from "next/server"
import { shouldTriggerSomaticPrompt, generateSomaticPrompt } from "@/lib/somatic/somatic-service"
import { logger } from "@/lib/utils/logger"
import { SomaticTriggerTestPayloadSchema } from "@/lib/schemas/api"
import { VADOutput } from "@/lib/types/pce-types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = SomaticTriggerTestPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { userId, sessionId, vad: inputVad, userMessage, currentTurn } = validationResult.data

    // Transform VAD input to expected VADOutput structure
    const vad: VADOutput = {
      valence: inputVad.v,
      arousal: inputVad.a,
      dominance: inputVad.d,
      confidence: 1.0, // Assuming confidence 1.0 as it's not in the input schema
    };

    // Test shouldTriggerSomaticPrompt
    const shouldTrigger = await shouldTriggerSomaticPrompt(userId, sessionId, vad, currentTurn)

    // Test generateSomaticPrompt
    const prompt = await generateSomaticPrompt(userId, sessionId, userMessage, vad, currentTurn)

    return NextResponse.json({
      shouldTrigger,
      prompt,
    })
  } catch (error) {
    logger.error(`Error in somatic test-trigger API: ${error}`)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
