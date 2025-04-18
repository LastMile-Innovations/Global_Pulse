import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  processDailyAnalytics,
  processWeeklyAnalytics,
  processMonthlyAnalytics,
} from "@/lib/analytics/scheduled-analytics"
import { logger } from "@/lib/utils/logger"
import { AnalyticsProcessPayloadSchema } from "@/lib/schemas/api"

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = AnalyticsProcessPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { type } = validationResult.data

    // Process analytics based on type
    let results = {}

    if (type === "daily" || type === "all") {
      results = { ...results, daily: await processDailyAnalytics() }
    }

    if (type === "weekly" || type === "all") {
      results = { ...results, weekly: await processWeeklyAnalytics() }
    }

    if (type === "monthly" || type === "all") {
      results = { ...results, monthly: await processMonthlyAnalytics() }
    }

    return NextResponse.json({
      message: "Analytics processing completed",
      results,
    })
  } catch (error) {
    logger.error("Error processing analytics:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
