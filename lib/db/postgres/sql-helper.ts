import { sql } from "drizzle-orm"
import { getDrizzle } from "./drizzle"
import { logger } from "../../utils/logger"

/**
 * Execute a raw SQL query
 */
export async function executeRawQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const db = getDrizzle()
    const result = await db.execute(sql.raw(query, params))
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
  const db = getDrizzle()
  const pool = db.driver

  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    logger.error(`Transaction error: ${error}`)
    throw error
  } finally {
    client.release()
  }
}
