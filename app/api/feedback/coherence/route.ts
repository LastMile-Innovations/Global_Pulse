import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { db } from "@/lib/db/postgres/drizzle"
import { coherenceFeedback } from "@/lib/db/schema"
import { rateLimit } from "@/lib/redis/rate-limit"
import { CoherenceFeedbackPayloadSchema } from "@/lib/schemas/api"

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, { limit: 20, window: 60 })
  if (rateLimitResult instanceof NextResponse) return rateLimitResult

  try {
    // Create Supabase client
    const supabase = createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = CoherenceFeedbackPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { sessionId, messageId, coherenceScore, feedback } = validationResult.data

    // Insert feedback into database
    const result = await db
      .insert(coherenceFeedback)
      .values({
        userId: user.id,
        sessionId,
        messageId,
        coherenceScore,
        feedback, // This will be null if not provided
        createdAt: new Date(),
      })
      .returning({ id: coherenceFeedback.id })

    return NextResponse.json(
      {
        message: "Feedback recorded successfully",
        id: result[0].id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error recording coherence feedback:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
