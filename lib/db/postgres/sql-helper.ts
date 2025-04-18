import { sql } from "drizzle-orm"
import { db } from "./drizzle"
import { logger } from "../../utils/logger"

/**
 * Execute a raw SQL query
 */
export async function executeRawQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await db.execute(sql.raw(query))
    return result as T[]
  } catch (error) {
    logger.error(`Error executing raw query: ${error}`)
    throw error
  }
}

/**
 * Execute a transaction with multiple queries
 */
export async function executeTransaction<T = any>(callback: (tx: any) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    try {
      const result = await callback(tx)
      return result
    } catch (error) {
      logger.error(`Transaction error: ${error}`)
      throw error
    }
  })
}
