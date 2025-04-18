import { db } from "@/lib/db/drizzle"
import { resonanceFlags } from "@/lib/db/schema/feedback"
import { resonanceFlagAnalytics, anonymizedFlagData } from "@/lib/db/schema/analytics"
import { createHash } from "crypto"
import { and, count, eq, gte, lt } from "drizzle-orm"
import { logger } from "@/lib/utils/logger"
import { checkConsent } from "@/lib/ethics/consent"

export class ResonanceAnalyticsService {
  /**
   * Process a new resonance flag for analytics
   */
  async processFlag(flagData: {
    id: string
    userId: string
    sessionId: string
    flaggedInteractionID: string
    precedingInteractionID: string
    modeAtTimeOfFlag: string
    responseTypeAtTimeOfFlag: string
    selectedTags: string[] | null
    optionalComment: string | null
    createdAt: Date
  }) {
    try {
      // Check if user has consented to analytics
      const hasConsent = await this.checkAnalyticsConsent(flagData.userId)
      if (!hasConsent) {
        logger.info(`User ${flagData.userId} has not consented to analytics. Skipping analytics processing.`)
        return
      }

      // Store anonymized individual flag data
      await this.storeAnonymizedFlagData(flagData)

      // Update aggregated analytics
      await this.updateDailyAnalytics(flagData.createdAt)
      await this.updateWeeklyAnalytics(flagData.createdAt)
      await this.updateMonthlyAnalytics(flagData.createdAt)
    } catch (error) {
      logger.error(`Error processing flag for analytics: ${error}`)
    }
  }

  /**
   * Check if user has consented to analytics
   */
  private async checkAnalyticsConsent(userId: string): Promise<boolean> {
    try {
      // Use the central checkConsent function to check for consentAggregation permission
      return await checkConsent(userId, "consentAggregation")
    } catch (error) {
      logger.error(`Error checking analytics consent for user ${userId}: ${error}`)
      // Default to false on error
      return false
    }
  }

  /**
   * Store anonymized flag data for deeper analysis
   */
  private async storeAnonymizedFlagData(flagData: {
    id: string
    userId: string
    sessionId: string
    flaggedInteractionID: string
    precedingInteractionID: string
    modeAtTimeOfFlag: string
    responseTypeAtTimeOfFlag: string
    selectedTags: string[] | null
    optionalComment: string | null
    createdAt: Date
  }) {
    // Create one-way hashes of user and session IDs
    const userHash = this.hashIdentifier(flagData.userId)
    const sessionHash = this.hashIdentifier(flagData.sessionId)

    // Get flag sequence number in session
    const flagSequence = await this.getFlagSequenceInSession(flagData.sessionId, flagData.createdAt)

    // Calculate time since session start (if available)
    const timeSinceStart = await this.getTimeSinceSessionStart(flagData.sessionId, flagData.createdAt)

    // Store anonymized data
    await db.insert(anonymizedFlagData).values({
      userHash,
      sessionHash,
      flaggedAt: flagData.createdAt,
      mode: flagData.modeAtTimeOfFlag,
      responseType: flagData.responseTypeAtTimeOfFlag,
      selectedTags: flagData.selectedTags || [],
      commentLength: flagData.optionalComment ? flagData.optionalComment.length : null,
      timeSinceSessionStart: timeSinceStart,
      flagSequenceInSession: flagSequence,
    })
  }

  /**
   * Update daily analytics for a given date
   */
  private async updateDailyAnalytics(date: Date) {
    const dateStr = date.toISOString().split("T")[0] // YYYY-MM-DD
    await this.updatePeriodAnalytics("daily", dateStr, date)
  }

  /**
   * Update weekly analytics for a given date
   */
  private async updateWeeklyAnalytics(date: Date) {
    const year = date.getFullYear()
    const weekNum = this.getWeekNumber(date)
    const weekStr = `${year}-W${weekNum.toString().padStart(2, "0")}`
    await this.updatePeriodAnalytics("weekly", weekStr, date)
  }

  /**
   * Update monthly analytics for a given date
   */
  private async updateMonthlyAnalytics(date: Date) {
    const monthStr = date.toISOString().substring(0, 7) // YYYY-MM
    await this.updatePeriodAnalytics("monthly", monthStr, date)
  }

  /**
   * Update analytics for a specific period
   */
  private async updatePeriodAnalytics(periodType: string, period: string, date: Date) {
    try {
      // Define period start and end dates
      const { startDate, endDate } = this.getPeriodDates(periodType, period)

      // Get all flags for this period
      // FIX: Use processedAt instead of flaggedAt, as flaggedAt does not exist
      const flags = await db
        .select()
        .from(resonanceFlags)
        .where(
          and(
            gte(resonanceFlags.processedAt, startDate),
            lt(resonanceFlags.processedAt, endDate)
          )
        )

      // Calculate distributions
      const tagDistribution = this.calculateTagDistribution(flags)
      const modeDistribution = this.calculateModeDistribution(flags)
      const responseTypeDistribution = this.calculateResponseTypeDistribution(flags)

      // Check for existing analytics record
      const existingRecordArr = await db
        .select()
        .from(resonanceFlagAnalytics)
        .where(and(eq(resonanceFlagAnalytics.periodType, periodType), eq(resonanceFlagAnalytics.period, period)))

      const existingRecord = existingRecordArr[0]

      if (existingRecord) {
        await db
          .update(resonanceFlagAnalytics)
          .set({
            totalFlags: flags.length,
            tagDistribution,
            modeDistribution,
            responseTypeDistribution,
            updatedAt: new Date(),
          })
          .where(and(eq(resonanceFlagAnalytics.periodType, periodType), eq(resonanceFlagAnalytics.period, period)))
      } else {
        await db.insert(resonanceFlagAnalytics).values({
          periodType,
          period,
          totalFlags: flags.length,
          tagDistribution,
          modeDistribution,
          responseTypeDistribution,
        })
      }
    } catch (error) {
      logger.error(`Error updating ${periodType} analytics for period ${period}: ${error}`)
    }
  }

  /**
   * Calculate distribution of tags from flags
   */
  private calculateTagDistribution(flags: any[]): any {
    const distribution: Record<string, number> = {}

    // Initialize with known tags
    const knownTags = ["Tone wrong", "Didn't understand", "Dismissive", "Response irrelevant", "Other"]
    knownTags.forEach((tag) => {
      distribution[tag] = 0
    })

    // Count occurrences
    flags.forEach((flag) => {
      // Support both DB and query object shapes
      const tags = flag.selectedTags || flag["selectedTags"]
      if (tags && Array.isArray(tags)) {
        tags.forEach((tag: string) => {
          distribution[tag] = (distribution[tag] || 0) + 1
        })
      }
    })

    return distribution
  }

  /**
   * Calculate distribution of modes from flags
   */
  private calculateModeDistribution(flags: any[]): any {
    const distribution: Record<string, number> = {
      insight: 0,
      listening: 0,
    }

    flags.forEach((flag) => {
      // Support both DB and query object shapes
      const mode = (flag.modeAtTimeOfFlag || flag["modeAtTimeOfFlag"] || flag.mode || flag["mode"])?.toLowerCase() || "unknown"
      distribution[mode] = (distribution[mode] || 0) + 1
    })

    return distribution
  }

  /**
   * Calculate distribution of response types from flags
   */
  private calculateResponseTypeDistribution(flags: any[]): any {
    const distribution: Record<string, number> = {
      LLM: 0,
      Templated: 0,
    }

    flags.forEach((flag) => {
      // Support both DB and query object shapes
      const type = flag.responseTypeAtTimeOfFlag || flag["responseTypeAtTimeOfFlag"] || flag.responseType || flag["responseType"] || "unknown"
      distribution[type] = (distribution[type] || 0) + 1
    })

    return distribution
  }

  /**
   * Get period start and end dates
   */
  private getPeriodDates(periodType: string, period: string): { startDate: Date; endDate: Date } {
    let startDate: Date
    let endDate: Date

    if (periodType === "daily") {
      // Period format: YYYY-MM-DD
      startDate = new Date(period)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
    } else if (periodType === "weekly") {
      // Period format: YYYY-WXX
      const [year, weekStr] = period.split("-W")
      const weekNum = Number.parseInt(weekStr, 10)
      startDate = this.getDateOfWeek(Number.parseInt(year, 10), weekNum)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)
    } else if (periodType === "monthly") {
      // Period format: YYYY-MM
      startDate = new Date(`${period}-01`)
      endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      throw new Error(`Invalid period type: ${periodType}`)
    }

    return { startDate, endDate }
  }

  /**
   * Get the date of the first day of a week
   */
  private getDateOfWeek(year: number, week: number): Date {
    // ISO week: week 1 is the week with the first Thursday of the year
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
    const dow = simple.getUTCDay()
    const ISOweekStart = simple
    if (dow <= 4)
      ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1)
    else
      ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay())
    return new Date(ISOweekStart)
  }

  /**
   * Get week number of a date
   */
  private getWeekNumber(date: Date): number {
    // Copy date so don't modify original
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    // Set to nearest Thursday: current date + 4 - current day number
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return weekNo
  }

  /**
   * Create a one-way hash of an identifier
   */
  private hashIdentifier(identifier: string): string {
    return createHash("sha256").update(identifier).digest("hex")
  }

  /**
   * Get the sequence number of this flag in the session
   */
  private async getFlagSequenceInSession(sessionId: string, flagDate: Date): Promise<number> {
    try {
      // FIX: Use processedAt instead of flaggedAt
      const result = await db
        .select({ count: count() })
        .from(resonanceFlags)
        .where(
          and(
            eq(resonanceFlags.sessionId, sessionId),
            lt(resonanceFlags.processedAt, flagDate)
          )
        )

      return (result[0]?.count || 0) + 1
    } catch (error) {
      logger.error(`Error getting flag sequence for session ${sessionId}: ${error}`)
      return 1
    }
  }

  /**
   * Get time since session start in seconds
   */
  private async getTimeSinceSessionStart(sessionId: string, flagDate: Date): Promise<number | null> {
    try {
      // Get the first interaction in this session
      // FIX: Use processedAt instead of flaggedAt
      const firstFlagArr = await db
        .select()
        .from(resonanceFlags)
        .where(eq(resonanceFlags.sessionId, sessionId))
        .orderBy(resonanceFlags.processedAt)
        .limit(1)

      const firstFlag = firstFlagArr[0]

      if (!firstFlag) return null

      // Calculate time difference in seconds
      // FIX: Use processedAt instead of flaggedAt
      if (!firstFlag.processedAt) return null
      return Math.floor((flagDate.getTime() - new Date(firstFlag.processedAt).getTime()) / 1000)
    } catch (error) {
      logger.error(`Error calculating time since session start for ${sessionId}: ${error}`)
      return null
    }
  }
}

// Export singleton instance
export const resonanceAnalytics = new ResonanceAnalyticsService()
