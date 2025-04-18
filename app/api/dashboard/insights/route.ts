import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { logger } from "@/lib/utils/logger"
import { z } from "zod"
import { KgService, type TimeRangeOption } from "@/lib/db/graph/kg-service"
import { neo4jDriver } from "@/lib/db/graph/neo4j-driver"

// Define the schema for query parameters
const QueryParamsSchema = z.object({
  view: z.enum(["mood", "attachments", "patterns", "all"]).default("all"),
  timeRange: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
  aggregation: z.enum(["day", "week"]).default("day"),
  attachmentType: z.enum(["Value", "Goal", "both"]).default("both"),
  limit: z.coerce.number().int().positive().default(5),
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const validatedParams = QueryParamsSchema.parse({
      view: searchParams.get("view") || "all",
      timeRange: searchParams.get("timeRange") || "30d",
      aggregation: searchParams.get("aggregation") || "day",
      attachmentType: searchParams.get("attachmentType") || "both",
      limit: searchParams.get("limit") || 5,
    })

    // Check if user has consented to detailed analysis logging
    const kgService = new KgService(neo4jDriver)
    const consentProfile = await kgService.getConsentProfile(userId)

    if (!consentProfile || !consentProfile.consentDetailedAnalysisLogging) {
      return NextResponse.json(
        {
          error: "Consent required",
          message: "You need to enable detailed analysis logging in your settings to view insights.",
          consentRequired: true,
        },
        { status: 403 },
      )
    }

    // Initialize response object
    const response: any = {
      timeRange: validatedParams.timeRange,
      aggregation: validatedParams.aggregation,
    }

    // Fetch requested data based on view parameter
    if (validatedParams.view === "all" || validatedParams.view === "mood") {
      const moodData = await kgService.getUserStateTimeSeries(
        userId,
        validatedParams.timeRange as TimeRangeOption,
        validatedParams.aggregation,
      )
      response.moodData = moodData
    }

    if (validatedParams.view === "all" || validatedParams.view === "attachments") {
      // If both attachment types are requested, fetch them separately
      if (validatedParams.attachmentType === "both") {
        const values = await kgService.getTopAttachments(userId, "Value", validatedParams.limit)
        const goals = await kgService.getTopAttachments(userId, "Goal", validatedParams.limit)
        response.attachments = {
          values,
          goals,
        }
      } else {
        // Fetch only the requested attachment type
        const attachments = await kgService.getTopAttachments(
          userId,
          validatedParams.attachmentType as "Value" | "Goal",
          validatedParams.limit,
        )
        response.attachments = {
          [validatedParams.attachmentType.toLowerCase() + "s"]: attachments,
        }
      }
    }

    if (validatedParams.view === "all" || validatedParams.view === "patterns") {
      const patterns = await kgService.getBasicTriggerPatterns(userId, validatedParams.limit)
      response.patterns = patterns
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error("Error in dashboard insights API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
