import type { Driver, Session, Record as Neo4jRecord } from "neo4j-driver"
import { logger } from "../../utils/logger"

/**
 * Base class for interacting with the Neo4j graph database
 */
export class KgInteractionLayer {
  private driver: Driver

  constructor(driver: Driver) {
    this.driver = driver
  }

  /**
   * Execute a Cypher query with parameters
   */
  async executeCypher(cypher: string, params: Record<string, any> = {}, database = "neo4j"): Promise<Neo4jRecord[]> {
    const session: Session = this.driver.session({ database })

    try {
      const result = await session.run(cypher, params)
      return result.records
    } catch (error) {
      logger.error(`Error executing Cypher query: ${error}`)
      throw error
    } finally {
      await session.close()
    }
  }

  /**
   * Execute a Cypher query and return a single record
   */
  async executeCypherSingle(
    cypher: string,
    params: Record<string, any> = {},
    database = "neo4j",
  ): Promise<Neo4jRecord | null> {
    const records = await this.executeCypher(cypher, params, database)
    return records.length > 0 ? records[0] : null
  }

  /**
   * Execute a Cypher query and return the first value of the first record
   */
  async executeCypherScalar<T>(
    cypher: string,
    params: Record<string, any> = {},
    database = "neo4j",
  ): Promise<T | null> {
    const record = await this.executeCypherSingle(cypher, params, database)
    if (!record) return null

    const keys = record.keys
    if (keys.length === 0) return null

    return record.get(keys[0]) as T
  }

  /**
   * Execute a Cypher query in a transaction
   */
  async executeTransaction(
    queries: { cypher: string; params: Record<string, any> }[],
    database = "neo4j",
  ): Promise<Neo4jRecord[][]> {
    const session: Session = this.driver.session({ database })
    const results: Neo4jRecord[][] = []

    try {
      const txResult = await session.executeWrite(async (tx) => {
        for (const query of queries) {
          const result = await tx.run(query.cypher, query.params)
          results.push(result.records)
        }
        return results
      })

      return txResult
    } catch (error) {
      logger.error(`Error executing transaction: ${error}`)
      throw error
    } finally {
      await session.close()
    }
  }

  /**
   * Execute a MERGE operation with proper property handling
   * This ensures idempotent operations when creating or updating nodes
   */
  async mergeNodeWithProperties(
    label: string,
    identityProps: Record<string, any>,
    updateProps: Record<string, any> = {},
    database = "neo4j",
  ): Promise<Neo4jRecord | null> {
    // Build the Cypher query for MERGE with proper property handling
    const identityPropsKeys = Object.keys(identityProps)
    const identityPropsString = identityPropsKeys.map((key) => `${key}: $${key}`).join(", ")

    // Create parameter object combining identity and update properties
    const params = { ...identityProps, ...updateProps }

    // Build the SET clause for update properties if any exist
    const setClauses = []
    if (Object.keys(updateProps).length > 0) {
      // For each update property, create a SET clause
      for (const [key, value] of Object.entries(updateProps)) {
        setClauses.push(`n.${key} = $${key}`)
      }
    }

    // Build the complete Cypher query
    let cypher = `
      MERGE (n:${label} {${identityPropsString}})
    `

    // Add SET clauses if any exist
    if (setClauses.length > 0) {
      cypher += `SET ${setClauses.join(", ")}`
    }

    cypher += ` RETURN n`

    // Execute the query
    return this.executeCypherSingle(cypher, params, database)
  }
}
