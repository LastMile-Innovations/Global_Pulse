import { db } from "@/lib/db/drizzle"
import { schema } from "@/lib/db/schema"
import { resonanceAnalytics } from "./resonance-analytics-service"
import { logger } from "@/lib/utils/logger"
import { sql, gte, lt, and } from "drizzle-orm"

/**
 * Process analytics for the previous day
 */
export async function processDailyAnalytics() {
  try {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split("T")[0]

    logger.info(`Processing daily analytics for ${dateStr}`)

    const startDate = new Date(dateStr)
    const endDate = new Date(dateStr)
    endDate.setDate(endDate.getDate() + 1)

    const flags = await db
      .select()
      .from(schema.resonanceFlags)
      .where(
        and(
          gte(schema.resonanceFlags.clientTimestamp, startDate),
          lt(schema.resonanceFlags.clientTimestamp, endDate)
        )
      )

    logger.info(`Found ${flags.length} flags for ${dateStr}`)

    for (const flag of flags) {
      const flagForProcessing = {
        ...flag,
        flaggedInteractionID: flag.flaggedInteractionId,
        precedingInteractionID: flag.precedingInteractionId || "",
        createdAt: flag.clientTimestamp,
        flaggedInteractionId: undefined,
        precedingInteractionId: undefined,
        clientTimestamp: undefined,
      };
      delete flagForProcessing.flaggedInteractionId;
      delete flagForProcessing.precedingInteractionId;
      delete flagForProcessing.clientTimestamp;

      await resonanceAnalytics.processFlag(flagForProcessing)
    }

    logger.info(`Completed daily analytics processing for ${dateStr}`)
    return { success: true, processed: flags.length }
  } catch (error) {
    logger.error("Error processing daily analytics:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Process analytics for the previous week
 */
export async function processWeeklyAnalytics() {
  try {
    const now = new Date()
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    const year = lastWeek.getFullYear()
    const weekNum = getWeekNumber(lastWeek)
    const weekStr = `${year}-W${weekNum.toString().padStart(2, "0")}`

    logger.info(`Processing weekly analytics for ${weekStr}`)

    const { startDate, endDate } = getPeriodDates("weekly", weekStr)

    const flags = await db
      .select()
      .from(schema.resonanceFlags)
      .where(
        and(
          gte(schema.resonanceFlags.clientTimestamp, startDate),
          lt(schema.resonanceFlags.clientTimestamp, endDate)
        )
      )

    logger.info(`Found ${flags.length} flags for week ${weekStr}`)

    for (const flag of flags) {
      const flagForProcessing = {
        ...flag,
        flaggedInteractionID: flag.flaggedInteractionId,
        precedingInteractionID: flag.precedingInteractionId || "",
        createdAt: flag.clientTimestamp,
        flaggedInteractionId: undefined,
        precedingInteractionId: undefined,
        clientTimestamp: undefined,
      };
      delete flagForProcessing.flaggedInteractionId;
      delete flagForProcessing.precedingInteractionId;
      delete flagForProcessing.clientTimestamp;

      await resonanceAnalytics.processFlag(flagForProcessing)
    }

    logger.info(`Completed weekly analytics processing for ${weekStr}`)
    return { success: true, processed: flags.length }
  } catch (error) {
    logger.error("Error processing weekly analytics:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Process analytics for the previous month
 */
export async function processMonthlyAnalytics() {
  try {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthStr = lastMonth.toISOString().substring(0, 7) // YYYY-MM

    logger.info(`Processing monthly analytics for ${monthStr}`)

    const startDate = new Date(`${monthStr}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const flags = await db
      .select()
      .from(schema.resonanceFlags)
      .where(
        and(
          gte(schema.resonanceFlags.clientTimestamp, startDate),
          lt(schema.resonanceFlags.clientTimestamp, endDate)
        )
      )

    logger.info(`Found ${flags.length} flags for month ${monthStr}`)

    for (const flag of flags) {
      const flagForProcessing = {
        ...flag,
        flaggedInteractionID: flag.flaggedInteractionId,
        precedingInteractionID: flag.precedingInteractionId || "",
        createdAt: flag.clientTimestamp,
        flaggedInteractionId: undefined,
        precedingInteractionId: undefined,
        clientTimestamp: undefined,
      };
      delete flagForProcessing.flaggedInteractionId;
      delete flagForProcessing.precedingInteractionId;
      delete flagForProcessing.clientTimestamp;

      await resonanceAnalytics.processFlag(flagForProcessing)
    }

    logger.info(`Completed monthly analytics processing for ${monthStr}`)
    return { success: true, processed: flags.length }
  } catch (error) {
    logger.error("Error processing monthly analytics:", error)
    return { success: false, error: String(error) }
  }
}

// Helper functions
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getPeriodDates(periodType: string, period: string): { startDate: Date; endDate: Date } {
  let startDate: Date
  let endDate: Date

  if (periodType === "weekly") {
    // Period format: YYYY-WXX
    const [year, weekStr] = period.split("-W")
    const weekNum = Number.parseInt(weekStr, 10)
    startDate = getDateOfWeek(Number.parseInt(year, 10), weekNum)
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

function getDateOfWeek(year: number, week: number): Date {
  const date = new Date(year, 0, 1)
  const dayOffset = date.getDay() || 7
  date.setDate(date.getDate() + (week - 1) * 7 + (1 - dayOffset))
  return date
}
