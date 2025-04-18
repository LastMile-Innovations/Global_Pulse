import type { Driver } from "neo4j-driver"
import { KgInteractionLayer } from "./kg-interaction-layer"
import { logger } from "../../utils/logger"

/**
 * Apply the minimal MVP schema to the Neo4j database
 * This includes constraints and indexes needed for the UIG
 */
export async function applyKgMvpSchema(driver: Driver): Promise<void> {
  const kgLayer = new KgInteractionLayer(driver)

  try {
    logger.info("Applying UIG MVP schema...")

    // Create constraints
    await kgLayer.executeCypher(`
      CREATE CONSTRAINT user_id_unique IF NOT EXISTS
      FOR (u:User) REQUIRE u.userID IS UNIQUE
    `)

    await kgLayer.executeCypher(`
      CREATE CONSTRAINT consent_profile_id_unique IF NOT EXISTS
      FOR (cp:ConsentProfile) REQUIRE cp.profileID IS UNIQUE
    `)

    await kgLayer.executeCypher(`
      CREATE CONSTRAINT interaction_id_unique IF NOT EXISTS
      FOR (i:Interaction) REQUIRE i.interactionID IS UNIQUE
    `)

    await kgLayer.executeCypher(`
      CREATE CONSTRAINT consent_profile_user_id_required IF NOT EXISTS
      FOR (cp:ConsentProfile) REQUIRE cp.userID IS NOT NULL
    `)

    // Layer 2 constraints
    await kgLayer.executeCypher(`
      CREATE CONSTRAINT tracked_entity_id_unique IF NOT EXISTS
      FOR (e:TrackedEntity) REQUIRE e.entityId IS UNIQUE
    `)

    await kgLayer.executeCypher(`
      CREATE CONSTRAINT information_event_id_unique IF NOT EXISTS
      FOR (e:InformationEvent) REQUIRE e.eventId IS UNIQUE
    `)

    // Create indexes
    await kgLayer.executeCypher(`
      CREATE INDEX user_id_index IF NOT EXISTS
      FOR (u:User) ON (u.userID)
    `)

    await kgLayer.executeCypher(`
      CREATE INDEX interaction_id_index IF NOT EXISTS
      FOR (i:Interaction) ON (i.interactionID)
    `)

    await kgLayer.executeCypher(`
      CREATE INDEX interaction_timestamp_index IF NOT EXISTS
      FOR (i:Interaction) ON (i.timestamp)
    `)

    await kgLayer.executeCypher(`
      CREATE INDEX consent_profile_user_id_index IF NOT EXISTS
      FOR (cp:ConsentProfile) ON (cp.userID)
    `)

    await kgLayer.executeCypher(`
      CREATE INDEX user_state_timestamp_index IF NOT EXISTS
      FOR (s:UserStateInstance) ON (s.timestamp)
    `)

    // Layer 2 indexes
    await kgLayer.executeCypher(`
      CREATE INDEX tracked_entity_name_index IF NOT EXISTS
      FOR (e:TrackedEntity) ON (e.name)
    `)

    await kgLayer.executeCypher(`
      CREATE INDEX tracked_entity_type_index IF NOT EXISTS
      FOR (e:TrackedEntity) ON (e.type)
    `)

    await kgLayer.executeCypher(`
      CREATE INDEX information_event_published_at_index IF NOT EXISTS
      FOR (e:InformationEvent) ON (e.publishedAt)
    `)

    await kgLayer.executeCypher(`
      CREATE INDEX information_event_source_type_index IF NOT EXISTS
      FOR (e:InformationEvent) ON (e.sourceType)
    `)

    logger.info("UIG MVP schema applied successfully")
  } catch (error) {
    logger.error(`Error applying UIG MVP schema: ${error}`)
    throw error
  }
}

/**
 * Verify that the MVP schema has been applied correctly
 * @returns A detailed report of the verification results
 */
export async function verifyKgMvpSchema(driver: Driver): Promise<{
  success: boolean
  missingConstraints: string[]
  missingIndexes: string[]
  details: string
}> {
  const kgLayer = new KgInteractionLayer(driver)
  const result = {
    success: true,
    missingConstraints: [] as string[],
    missingIndexes: [] as string[],
    details: "",
  }

  try {
    // Check constraints
    const constraints = await kgLayer.executeCypher("SHOW CONSTRAINTS")
    const constraintNames = constraints.map((record) => record.get("name"))

    const requiredConstraints = [
      "user_id_unique",
      "consent_profile_id_unique",
      "interaction_id_unique",
      "consent_profile_user_id_required",
      "tracked_entity_id_unique",
      "information_event_id_unique",
    ]

    for (const constraint of requiredConstraints) {
      if (!constraintNames.includes(constraint)) {
        logger.warn(`Missing constraint: ${constraint}`)
        result.missingConstraints.push(constraint)
        result.success = false
      }
    }

    // Check indexes
    const indexes = await kgLayer.executeCypher("SHOW INDEXES")
    const indexNames = indexes.map((record) => record.get("name"))

    const requiredIndexes = [
      "user_id_index",
      "interaction_id_index",
      "interaction_timestamp_index",
      "consent_profile_user_id_index",
      "user_state_timestamp_index",
      "tracked_entity_name_index",
      "tracked_entity_type_index",
      "information_event_published_at_index",
      "information_event_source_type_index",
    ]

    for (const index of requiredIndexes) {
      if (!indexNames.includes(index)) {
        logger.warn(`Missing index: ${index}`)
        result.missingIndexes.push(index)
        result.success = false
      }
    }

    // Build detailed report
    result.details = `Schema verification completed.
    - Constraints: ${result.missingConstraints.length === 0 ? "All present" : `Missing: ${result.missingConstraints.join(", ")}`}
    - Indexes: ${result.missingIndexes.length === 0 ? "All present" : `Missing: ${result.missingIndexes.join(", ")}`}`

    return result
  } catch (error) {
    logger.error(`Error verifying UIG MVP schema: ${error}`)
    result.success = false
    result.details = `Error during verification: ${error}`
    return result
  }
}
