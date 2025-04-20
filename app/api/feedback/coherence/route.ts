import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db/postgres/drizzle";
import { coherenceFeedback } from "@/lib/db/schema";
import { rateLimit } from "@/lib/redis/rate-limit";
import { CoherenceFeedbackPayloadSchema } from "@/lib/schemas/api";
import { auth } from "@/lib/auth/auth-utils";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

/**
 * POST /api/feedback/coherence
 * Records user feedback on message coherence.
 * - Rate limited (20 requests/minute per user)
 * - Requires authentication
 * - Validates input using centralized schema
 */

const CoherenceFeedbackSchema = z.object({
  contentId: z.string(),
  sessionId: z.string().optional(),
  feedbackScore: z.number().int().min(-1).max(1), // -1 (less coherent), 0 (neutral), 1 (more coherent)
  comment: z.string().optional(),
});

// Define specific limits for this endpoint (User ID based)
const endpointLimit = 20;
const endpointWindow = 600; // 10 minutes

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
  const rateLimitResponse = await rateLimit(request, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "feedback:coherence",
    ipFallback: { enabled: false }, // Requires User ID
  });
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse; // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  const userId = await auth(request);

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
