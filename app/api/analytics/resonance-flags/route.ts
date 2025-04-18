import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { db } from "@/lib/db/drizzle"
import { resonanceFlagAnalytics } from "@/lib/db/schema/analytics"
import { eq, desc, sql } from "drizzle-orm"
import { logger } from "@/lib/utils/logger"
import { AnalyticsFlagsQuerySchema } from "@/lib/schemas/api"

/**
 * GET /api/analytics/resonance-flags
 * Returns resonance flag analytics for admins.
 * Query params: periodType (daily|weekly|monthly), limit (default 30, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client and get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user has admin role
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userFetchError) {
      logger.error("Error fetching user for analytics flags:", userFetchError)
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const validationResult = AnalyticsFlagsQuerySchema.safeParse(searchParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    // Extract and sanitize query params
    let { periodType = "daily", limit = 30 } = validationResult.data
    limit = Math.max(1, Math.min(Number(limit) || 30, 100)) // Clamp limit between 1 and 100

    // Fetch analytics data
    const analyticsData = await db
      .select()
      .from(resonanceFlagAnalytics)
      .where(eq(resonanceFlagAnalytics.periodType, periodType))
      .orderBy(desc(resonanceFlagAnalytics.period))
      .limit(limit)

    // Fetch total count for the given periodType
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(resonanceFlagAnalytics)
      .where(eq(resonanceFlagAnalytics.periodType, periodType))

    const total = totalResult[0]?.count ?? 0

    return NextResponse.json({
      data: analyticsData,
      meta: {
        total,
        periodType,
        limit,
      },
    })
  } catch (error: any) {
    logger.error("Error retrieving resonance flag analytics:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
