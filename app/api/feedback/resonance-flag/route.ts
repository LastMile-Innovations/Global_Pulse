import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-utils";
import { logger } from "@/lib/utils/logger";
import { db } from "@/lib/db/drizzle";
import { resonanceFlags } from "@/lib/db/schema/feedback";
import { getEngagementMode } from "@/lib/session/mode-manager";
import { getKgService } from "@/lib/db/graph/kg-service-factory";
import { ResonanceFlagPayloadSchema } from "@/lib/schemas/api";
import { rateLimit } from "@/lib/redis/rate-limit";

/**
 * POST /api/feedback/resonance-flag
 * Records a resonance flag for a given interaction.
 * - Rate limited (30 requests/minute per user)
 * - Requires authentication
 * - Validates input using centralized schema
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting: 30 requests per minute per user
  const rateLimitResult = await rateLimit(request, { limit: 30, window: 60 });
  if (rateLimitResult instanceof NextResponse) return rateLimitResult;

  try {
    // Authenticate the request
    const userId = await auth(request);
    if (!userId) {
      logger.warn("Unauthorized attempt to flag resonance");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.warn("Invalid JSON in resonance flag request body");
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validationResult = ResonanceFlagPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Validation failed for resonance flag", validationResult.error.format());
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const {
      sessionId,
      flaggedInteractionId,
      precedingInteractionId,
      selectedTags,
      optionalComment,
      clientTimestamp,
    } = validationResult.data;

    // Get the engagement mode at the time of the flag
    let modeAtTimeOfFlag: string | null = null;
    try {
      modeAtTimeOfFlag = await getEngagementMode(userId, sessionId);
    } catch (err) {
      logger.warn(
        `Could not determine engagement mode for user ${userId} and session ${sessionId}: ${err}`
      );
      modeAtTimeOfFlag = null;
    }

    // Get the KgService instance
    const kgService = getKgService();

    // Get the response type from Neo4j (fallback to "UNKNOWN" if not available)
    let responseTypeAtTimeOfFlag: string = "UNKNOWN";
    logger.warn("getInteractionResponseType not implemented on KgService; using 'UNKNOWN' as responseTypeAtTimeOfFlag");

    // Convert client timestamp to Date object, fallback to now if invalid
    let timestamp: Date;
    if (clientTimestamp) {
      const parsed = new Date(clientTimestamp);
      timestamp = isNaN(parsed.getTime()) ? new Date() : parsed;
    } else {
      timestamp = new Date();
    }

    // Prepare insert object, matching schema fields
    const insertObj = {
      sessionId,
      userId,
      flaggedInteractionId,
      precedingInteractionId: precedingInteractionId || null,
      modeAtTimeOfFlag: modeAtTimeOfFlag || "UNKNOWN",
      responseTypeAtTimeOfFlag,
      selectedTags,
      optionalComment,
      clientTimestamp: timestamp,
      // serverTimestamp, reviewed, reviewNotes, processedAt are handled by defaults or not required for insert
    };

    // Insert the resonance flag into the database
    try {
      await db.insert(resonanceFlags).values(insertObj);
    } catch (dbError) {
      logger.error(
        `Database error creating resonance flag for user ${userId}, interaction ${flaggedInteractionId}: ${dbError}`
      );
      return NextResponse.json(
        { error: "Failed to record resonance flag" },
        { status: 500 }
      );
    }

    logger.info(
      `Resonance flag created for user ${userId}, interaction ${flaggedInteractionId}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error creating resonance flag: ${error}`);
    return NextResponse.json(
      { error: "Failed to create resonance flag" },
      { status: 500 }
    );
  }
}
