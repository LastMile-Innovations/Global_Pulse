import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-utils";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";
import { KgService, type TimeRangeOption } from "@/lib/db/graph/kg-service";
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver";


// Define the schema for query parameters
const QueryParamsSchema = z.object({
  view: z.enum(["mood", "attachments", "patterns", "all"]).default("all"),
  timeRange: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
  aggregation: z.enum(["day", "week"]).default("day"),
  attachmentType: z.enum(["Value", "Goal", "both"]).default("both"),
  limit: z.coerce.number().int().positive().default(5),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(request as unknown as NextRequest);
    if (!userId) {
      logger.warn("Unauthorized access attempt to dashboard insights API");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    let validatedParams;
    try {
      validatedParams = QueryParamsSchema.parse({
        userId,
        view: searchParams.get("view") || "all",
        timeRange: searchParams.get("timeRange") || "30d",
        aggregation: searchParams.get("aggregation") || "day",
        attachmentType: searchParams.get("attachmentType") || "both",
        limit: searchParams.get("limit") || 5,
      });
    } catch (validationError) {
      const errorDetails = validationError instanceof z.ZodError ? JSON.stringify(validationError.errors) : String(validationError);
      logger.warn(`Invalid query parameters for dashboard insights: ${errorDetails}`);
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationError instanceof z.ZodError ? validationError.errors : undefined },
        { status: 400 }
      );
    }

    // Get Neo4j driver and create KgService
    const driver = await getNeo4jDriver();
    const kgService = new KgService(driver);

    // Check if user has consented to detailed analysis logging
    let consentProfile;
    try {
      consentProfile = await kgService.getConsentProfile(userId);
    } catch (consentError) {
      logger.error("Failed to fetch consent profile", consentError);
      return NextResponse.json(
        { error: "Failed to fetch consent profile" },
        { status: 500 }
      );
    }

    if (!consentProfile || !consentProfile.consentDetailedAnalysisLogging) {
      return NextResponse.json(
        {
          error: "Consent required",
          message: "You need to enable detailed analysis logging in your settings to view insights.",
          consentRequired: true,
        },
        { status: 403 }
      );
    }

    // Initialize response object with metadata
    const response: Record<string, any> = {
      timeRange: validatedParams.timeRange,
      aggregation: validatedParams.aggregation,
      view: validatedParams.view,
      meta: {
        userId,
        timestamp: new Date().toISOString(),
      },
    };

    // Fetch requested data based on view parameter
    if (validatedParams.view === "all" || validatedParams.view === "mood") {
      try {
        const moodData = await kgService.getUserStateTimeSeries(
          userId,
          validatedParams.timeRange as TimeRangeOption,
          validatedParams.aggregation
        );
        response.moodData = moodData ?? [];
      } catch (moodError) {
        logger.error("Error fetching mood data", moodError);
        response.moodData = [];
        response.moodDataError = "Failed to fetch mood data";
      }
    }

    if (validatedParams.view === "all" || validatedParams.view === "attachments") {
      try {
        if (validatedParams.attachmentType === "both") {
          const [values, goals] = await Promise.all([
            kgService.getTopAttachments(userId, "Value", validatedParams.limit),
            kgService.getTopAttachments(userId, "Goal", validatedParams.limit),
          ]);
          response.attachments = {
            values: values ?? [],
            goals: goals ?? [],
          };
        } else {
          const attachments = await kgService.getTopAttachments(
            userId,
            validatedParams.attachmentType as "Value" | "Goal",
            validatedParams.limit
          );
          response.attachments = {
            [validatedParams.attachmentType.toLowerCase() + "s"]: attachments ?? [],
          };
        }
      } catch (attachmentsError) {
        logger.error("Error fetching attachments", attachmentsError);
        response.attachments = {};
        response.attachmentsError = "Failed to fetch attachments";
      }
    }

    if (validatedParams.view === "all" || validatedParams.view === "patterns") {
      try {
        const patterns = await kgService.getBasicTriggerPatterns(userId, validatedParams.limit);
        response.patterns = patterns ?? [];
      } catch (patternsError) {
        logger.error("Error fetching patterns", patternsError);
        response.patterns = [];
        response.patternsError = "Failed to fetch patterns";
      }
    }

    // If no data was fetched for any view, return a helpful message
    if (
      !response.moodData &&
      !response.attachments &&
      !response.patterns
    ) {
      response.message = "No insights data available for the selected parameters.";
    }

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error in dashboard insights API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
