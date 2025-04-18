import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db/postgres/drizzle";
import { coherenceFeedback } from "@/lib/db/schema";
import { rateLimit } from "@/lib/redis/rate-limit";
import { CoherenceFeedbackPayloadSchema } from "@/lib/schemas/api";

/**
 * POST /api/feedback/coherence
 * Records user feedback on message coherence.
 * - Rate limited (20 requests/minute per user)
 * - Requires authentication
 * - Validates input using centralized schema
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting: 20 requests per minute per user
  const rateLimitResult = await rateLimit(request, { limit: 20, window: 60 });
  if (rateLimitResult instanceof NextResponse) return rateLimitResult;

  try {
    // Create Supabase client and get authenticated user
    const supabase = createClient();
    const supabaseClient = await supabase;
    // Supabase client is a promise, so we need to resolve it before using
    // See: https://github.com/supabase/supabase-js/issues/405
    // But if createClient is not async, remove the await above

    // Get the authenticated user
    let user, authError;
    try {
      // @ts-ignore
      const { data, error } = await supabaseClient.auth.getUser();
      user = data?.user;
      authError = error;
    } catch (err) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validationResult = CoherenceFeedbackPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, messageId, coherenceScore, feedback } = validationResult.data;

    // Insert feedback into database
    let result;
    try {
      result = await db
        .insert(coherenceFeedback)
        .values({
          userId: user.id,
          sessionId,
          messageId,
          coherenceScore,
          feedback: feedback ?? null,
          createdAt: new Date(),
        })
        .returning({ id: coherenceFeedback.id });
    } catch (dbError) {
      console.error("Database error recording coherence feedback:", dbError);
      return NextResponse.json(
        { error: "Failed to record feedback" },
        { status: 500 }
      );
    }

    if (!result || !result[0] || !result[0].id) {
      return NextResponse.json(
        { error: "Failed to record feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Feedback recorded successfully",
        id: result[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording coherence feedback:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
