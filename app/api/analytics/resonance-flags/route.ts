import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { db } from "@/lib/db/drizzle"
import { resonanceFlagAnalytics } from "@/lib/db/schema/analytics"
import { eq, desc, sql } from "drizzle-orm"
import { logger } from "@/lib/utils/logger"
import { AnalyticsFlagsQuerySchema } from "@/lib/schemas/api"

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user has admin role
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())

    // Validate query parameters using centralized schema
    const validationResult = AnalyticsFlagsQuerySchema.safeParse(searchParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { periodType = "daily", limit = 30 } = validationResult.data

    // Get analytics data
    const analyticsData = await db.query.resonanceFlagAnalytics.findMany({
      where: eq(resonanceFlagAnalytics.periodType, periodType),
      orderBy: [desc(resonanceFlagAnalytics.period)],
      limit,
    })

    // Get total flags count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(resonanceFlagAnalytics)
      .where(eq(resonanceFlagAnalytics.periodType, periodType))

    const total = totalResult[0]?.count || 0

    return NextResponse.json({
      data: analyticsData,
      meta: {
        total,
        periodType,
        limit,
      },
    })
  } catch (error) {
    logger.error("Error retrieving resonance flag analytics:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
