import type { Driver, Record as Neo4jRecord } from "neo4j-driver"
import { KgInteractionLayer } from "./kg-interaction-layer"
import { logger } from "@/lib/utils/logger"

/**
 * Attachment types
 */
type AttachmentType = "Value" | "Goal"

/**
 * Time range options for dashboard queries
 */
export type TimeRangeOption = "7d" | "30d" | "90d" | "all"

/**
 * Service for interacting with the knowledge graph
 */
export class KgService {
  kgLayer: KgInteractionLayer

  constructor(driver: Driver) {
    this.kgLayer = new KgInteractionLayer(driver)
  }

  /**
   * Create a user node
   */
  async createUserNode(params: { userID: string; email: string; name: string }): Promise<void> {
    const cypher = `
    CREATE (u:User {
      userID: $userID,
      email: $email,
      name: $name,
      createdAt: timestamp(),
      bootstrappingComplete: false
    })
  `
    await this.kgLayer.executeCypher(cypher, params)
  }

  /**
   * Log an interaction
   */
  async logInteraction(params: {
    userID: string
    sessionID: string
    userInput: string
    agentResponse: string
    interactionType: string
  }): Promise<string> {
    // Generate a unique ID for the interaction if not provided
    const interactionID = `int-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // First, create the Interaction node with MERGE to ensure idempotency
    const interactionProps = {
      interactionID,
      userID: params.userID,
      sessionID: params.sessionID,
      userInput: params.userInput,
      agentResponse: params.agentResponse,
      interactionType: params.interactionType,
      timestamp: Date.now(),
    }

    const result = await this.kgLayer.mergeNodeWithProperties("Interaction", { interactionID }, interactionProps)

    if (!result) {
      throw new Error("Failed to create Interaction node")
    }

    // Now create the relationship between User and Interaction
    const relationshipCypher = `
    MATCH (u:User {userID: $userID})
    MATCH (i:Interaction {interactionID: $interactionID})
    MERGE (u)-[:PARTICIPATED_IN]->(i)
    RETURN i.interactionID as interactionID
  `

    const relationshipResult = await this.kgLayer.executeCypherScalar<string>(relationshipCypher, {
      userID: params.userID,
      interactionID,
    })

    return relationshipResult || interactionID
  }

  /**
   * Log a guardrail alert
   */
  async logGuardrailAlert(alertData: {
    userID: string
    interactionID: string
    alertType: string
    triggeringData: string
    candidateResponseSnippet: string
  }): Promise<void> {
    const cypher = `
    CREATE (g:GuardrailAlert {
      alertID: randomUUID(),
      timestamp: timestamp(),
      userID: $userID,
      interactionID: $interactionID,
      alertType: $alertType,
      triggeringData: $triggeringData,
      actionTaken: 'Blocked_Replaced',
      status: 'MVP_Logged',
      candidateResponseSnippet: $candidateResponseSnippet
    })
  `
    await this.kgLayer.executeCypher(cypher, alertData)
  }

  /**
   * Create EWEF processing instances
   */
  async createEWEFProcessingInstances(
    userID: string,
    interactionID: string,
    moodParams: { moodEstimate: number; stressEstimate: number },
    pInstanceParams: {
      mhhSource: string
      mhhPerspective: string
      mhhTimeframe: string
      mhhAcceptanceState: string
      pValuationShift: number
      pPowerLevel: number
      pAppraisalConfidence: number
    },
    erInstanceParams: { vadV: number; vadA: number; vadD: number; confidence: number },
    eligibleForTraining = false,
  ): Promise<void> {
    const cypher = `
    MATCH (i:Interaction {interactionID: $interactionID})
    CREATE (m:UserStateInstance {
      moodEstimate: $moodEstimate,
      stressEstimate: $stressEstimate,
      timestamp: timestamp(),
      eligibleForTraining: $eligibleForTraining
    })
    CREATE (p:PInstance {
      mhhSource: $mhhSource,
      mhhPerspective: $mhhPerspective,
      mhhTimeframe: $mhhTimeframe,
      mhhAcceptanceState: $mhhAcceptanceState,
      pValuationShift: $pValuationShift,
      pPowerLevel: $pPowerLevel,
      pAppraisalConfidence: $pAppraisalConfidence,
      timestamp: timestamp(),
      eligibleForTraining: $eligibleForTraining
    })
    CREATE (e:ERInstance {
      vadV: $vadV,
      vadA: $vadA,
      vadD: $vadD,
      confidence: $confidence,
      timestamp: timestamp(),
      eligibleForTraining: $eligibleForTraining
    })
    CREATE (i)-[:HAS_STATE]->(m)
    CREATE (i)-[:GENERATED_DURING]->(p)
    CREATE (i)-[:GENERATED_DURING]->(e)
  `

    const params = {
      interactionID,
      ...moodParams,
      ...pInstanceParams,
      ...erInstanceParams,
      eligibleForTraining,
    }

    await this.kgLayer.executeCypher(cypher, params)
  }

  /**
   * Get a user's consent profile
   */
  async getConsentProfile(userID: string): Promise<any | null> {
    const cypher = `
    MATCH (u:User {userID: $userID})-[:HAS_CONSENT]->(cp:ConsentProfile)
    RETURN cp
  `
    const record = await this.kgLayer.executeCypherSingle(cypher, { userID })
    if (!record) return null

    return record.get("cp").properties
  }

  /**
   * Create a consent profile node
   */
  async createConsentProfileNode(userID: string): Promise<string> {
    const profileID = `cp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    const cypher = `
    MATCH (u:User {userID: $userID})
    CREATE (cp:ConsentProfile {
      profileID: $profileID,
      userID: $userID,
      consentDataProcessing: true,
      allowSomaticPrompts: false,
      consentDetailedAnalysisLogging: false,
      consentAnonymizedPatternTraining: false,
      allowDistressConsentCheck: false,
      consentAggregation: false,
      consentSaleOptIn: false,
      lastConsentUpdate: timestamp(),
      createdAt: timestamp(),
      updatedAt: timestamp()
    })
    CREATE (u)-[:HAS_CONSENT]->(cp)
    RETURN cp.profileID as profileID
  `

    const result = await this.kgLayer.executeCypherScalar<string>(cypher, { userID, profileID })
    return result || ""
  }

  /**
   * Update a consent profile
   */
  async updateConsentProfile(userID: string, updates: Record<string, any>): Promise<boolean> {
    // Create the SET clause dynamically based on the updates
    const setClause = Object.entries(updates)
      .map(([key, _]) => `cp.${key} = ${key}`)
      .join(", ")

    const cypher = `
    MATCH (u:User {userID: $userID})-[:HAS_CONSENT]->(cp:ConsentProfile)
    SET ${setClause}, cp.updatedAt = timestamp(), cp.lastConsentUpdate = timestamp()
    RETURN count(cp) as updated
  `

    const result = await this.kgLayer.executeCypherScalar<number>(cypher, { userID, ...updates })
    return result === 1
  }

  /**
   * Check if bootstrapping is complete for a user
   */
  async isBootstrappingComplete(userID: string): Promise<boolean> {
    const cypher = `
    MATCH (u:User {userID: $userID})
    RETURN u.bootstrappingComplete as complete
  `
    const result = await this.kgLayer.executeCypherScalar<boolean>(cypher, { userID })
    return result === true
  }

  /**
   * Mark bootstrapping as complete for a user
   */
  async markBootstrappingComplete(userID: string): Promise<void> {
    const cypher = `
    MATCH (u:User {userID: $userID})
    SET u.bootstrappingComplete = true
  `
    await this.kgLayer.executeCypher(cypher, { userID })
  }

  /**
   * Check if a user has sufficient core attachments
   */
  async checkUserHasCoreAttachments(
    userID: string,
    types: string[] = ["Value", "Goal"],
    minCount = 1,
    minPL = 7,
  ): Promise<boolean> {
    const cypher = `
    MATCH (u:User {userID: $userID})-[r:HOLDS_ATTACHMENT]->(a)
    WHERE a:Value OR a:Goal
    AND r.powerLevel >= $minPL
    RETURN count(a) >= $minCount AS hasEnough
  `
    const result = await this.kgLayer.executeCypherScalar<boolean>(cypher, { userID, types, minCount, minPL })
    return result === true
  }

  /**
   * Find or create an attachment node (Value or Goal)
   */
  async findOrCreateAttachmentNode(name: string, type: "Value" | "Goal"): Promise<string> {
    // Normalize the name (lowercase, trim)
    const normalizedName = name.toLowerCase().trim()

    const cypher = `
    MERGE (a:${type} {name: $normalizedName})
    ON CREATE SET a.createdAt = timestamp()
    RETURN a.id as id
  `
    const result = await this.kgLayer.executeCypherScalar<string>(cypher, { normalizedName })
    return result || ""
  }

  /**
   * Link a user to an attachment node
   */
  async linkUserAttachment(
    userID: string,
    attachmentID: string,
    props: {
      powerLevel: number
      valuation: number
      certainty: number
      classification: string
    },
  ): Promise<boolean> {
    const cypher = `
    MATCH (u:User {userID: $userID})
    MATCH (a {id: $attachmentID})
    MERGE (u)-[r:HOLDS_ATTACHMENT]->(a)
    ON CREATE SET 
      r.powerLevel = $powerLevel,
      r.valuation = $valuation,
      r.certainty = $certainty,
      r.classification = $classification,
      r.createdAt = timestamp()
    ON MATCH SET 
      r.powerLevel = $powerLevel,
      r.valuation = $valuation,
      r.certainty = $certainty,
      r.classification = $classification,
      r.updatedAt = timestamp()
    RETURN count(r) as created
  `
    const result = await this.kgLayer.executeCypherScalar<number>(cypher, {
      userID,
      attachmentID,
      powerLevel: props.powerLevel,
      valuation: props.valuation,
      certainty: props.certainty,
      classification: props.classification,
    })
    return result === 1
  }

  /**
   * Updates properties on a HOLDS_ATTACHMENT relationship between a User and an Attachment
   *
   * @param userId - The ID of the user
   * @param attachmentId - The ID of the attachment node
   * @param props - Object containing properties to update (powerLevel, valence, certainty)
   * @returns Promise resolving to true if successful, false otherwise
   */
  async updateAttachmentProperties(
    userId: string,
    attachmentId: string,
    props: {
      powerLevel?: number
      valence?: number
      certainty?: number
    },
  ): Promise<boolean> {
    // Input validation
    if (!userId || !attachmentId || !props || Object.keys(props).length === 0) {
      logger.error("updateAttachmentProperties: Invalid input parameters")
      return false
    }

    // Validate property values are within acceptable ranges
    if (props.powerLevel !== undefined && (props.powerLevel < 1 || props.powerLevel > 10)) {
      logger.error(`updateAttachmentProperties: Invalid powerLevel value: ${props.powerLevel}`)
      return false
    }

    if (props.valence !== undefined && (props.valence < -10 || props.valence > 10)) {
      logger.error(`updateAttachmentProperties: Invalid valence value: ${props.valence}`)
      return false
    }

    if (props.certainty !== undefined && (props.certainty < 0.05 || props.certainty > 1.0)) {
      logger.error(`updateAttachmentProperties: Invalid certainty value: ${props.certainty}`)
      return false
    }

    try {
      // Build the SET clause dynamically based on provided properties
      const setClauses = []
      const params: Record<string, any> = { userId, attachmentId }

      if (props.powerLevel !== undefined) {
        setClauses.push("r.powerLevel = $powerLevel")
        params.powerLevel = props.powerLevel
      }

      if (props.valence !== undefined) {
        setClauses.push("r.valence = $valence")
        params.valence = props.valence
      }

      if (props.certainty !== undefined) {
        setClauses.push("r.certainty = $certainty")
        params.certainty = props.certainty
      }

      // Always update the timestamp
      setClauses.push("r.updatedAt = timestamp()")

      const cypher = `
        MATCH (u:User {userID: $userId})-[r:HOLDS_ATTACHMENT]->(a {id: $attachmentId})
        SET ${setClauses.join(", ")}
        RETURN count(r) as updatedCount
      `

      const result = await this.kgLayer.executeCypherScalar<number>(cypher, params)
      return result === 1
    } catch (error) {
      logger.error(`Error updating attachment properties for user ${userId}, attachment ${attachmentId}:`, error)
      return false
    }
  }

  /**
   * Hides an ERInstance node associated with a specific interaction
   * This supports the principle of Narrative Sovereignty by allowing users
   * to hide emotional inferences they don't want displayed
   *
   * @param userId The ID of the user making the request
   * @param interactionId The ID of the interaction associated with the ERInstance
   * @returns Promise resolving to true if at least one ERInstance was hidden, false otherwise
   */
  async hideErInstance(userId: string, interactionId: string): Promise<boolean> {
    // Input validation
    if (!userId || !interactionId) {
      logger.warn(`Invalid input for hideErInstance: userId=${userId}, interactionId=${interactionId}`)
      return false
    }

    try {
      // Cypher query to hide ERInstance nodes
      // This query ensures:
      // 1. The interaction belongs to the requesting user
      // 2. Only ERInstance nodes linked to the specified interaction are updated
      // 3. The isHiddenByUser property is set to true
      const cypher = `
       MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction {interactionID: $interactionId})
       MATCH (i)-[:GENERATED_DURING]->(e:ERInstance)
       WHERE e.isHiddenByUser IS NULL OR e.isHiddenByUser = false
       SET e.isHiddenByUser = true, e.hiddenAt = timestamp()
       RETURN count(e) as updatedCount
     `

      const updateCount = await this.kgLayer.executeCypherScalar<number>(cypher, {
        userId,
        interactionId,
      })

      return typeof updateCount === 'number' && updateCount > 0
    } catch (error) {
      logger.error(`Error hiding ERInstance for interaction ${interactionId} by user ${userId}: ${error}`)
      return false
    }
  }

  /**
   * @deprecated Use specific setter methods (setInteractionResponseType, setInteractionAgentResponse) or updateInteractionProperties instead.
   * Sets or updates a specific property on an Interaction node
   * @param interactionID The ID of the interaction node
   * @param propertyName The name of the property to set
   * @param propertyValue The value to set the property to
   * @returns Promise resolving to true if successful
   */
  async setInteractionProperty(interactionID: string, propertyName: string, propertyValue: any): Promise<boolean> {
    if (!interactionID || typeof interactionID !== "string" || !propertyName || typeof propertyName !== "string") {
      logger.error("setInteractionProperty: Invalid interactionID or propertyName.")
      return false
    }

    // Basic sanitization for property name to prevent injection
    const safePropertyName = propertyName.replace(/[^a-zA-Z0-9_]/g, "")
    if (safePropertyName !== propertyName) {
      logger.error(`setInteractionProperty: Invalid characters in propertyName: ${propertyName}`)
      return false
    }

    const cypher = `
    MATCH (i:Interaction {interactionID: $interactionID})
    SET i.${safePropertyName} = $propertyValue
    RETURN count(i) as updatedCount
  `

    try {
      const result = await this.kgLayer.executeCypherScalar<number>(cypher, {
        interactionID,
        propertyValue,
      })

      return result === 1
    } catch (error) {
      logger.error(`Error setting property ${safePropertyName} on interaction ${interactionID}:`, error)
      return false
    }
  }

  /**
   * Sets the responseType property on an Interaction node
   * @param interactionId The ID of the interaction node
   * @param responseType The response type to set
   * @returns Promise resolving to true if successful
   */
  async setInteractionResponseType(interactionId: string, responseType: string): Promise<boolean> {
    if (!interactionId || typeof interactionId !== "string") {
      logger.error("setInteractionResponseType: Invalid interactionID.")
      return false
    }

    const cypher = `
    MATCH (i:Interaction {interactionID: $interactionId})
    SET i.responseType = $responseType
    RETURN count(i) as updatedCount
  `

    try {
      const result = await this.kgLayer.executeCypherScalar<number>(cypher, {
        interactionId,
        responseType,
      })

      return result === 1
    } catch (error) {
      logger.error(`Error setting responseType on interaction ${interactionId}:`, error)
      return false
    }
  }

  /**
   * Sets the agentResponse property on an Interaction node
   * @param interactionId The ID of the interaction node
   * @param agentResponse The agent response to set
   * @returns Promise resolving to true if successful
   */
  async setInteractionAgentResponse(interactionId: string, agentResponse: string): Promise<boolean> {
    if (!interactionId || typeof interactionId !== "string") {
      logger.error("setInteractionAgentResponse: Invalid interactionID.")
      return false
    }

    const cypher = `
    MATCH (i:Interaction {interactionID: $interactionId})
    SET i.agentResponse = $agentResponse
    RETURN count(i) as updatedCount
  `

    try {
      const result = await this.kgLayer.executeCypherScalar<number>(cypher, {
        interactionId,
        agentResponse,
      })

      return result === 1
    } catch (error) {
      logger.error(`Error setting agentResponse on interaction ${interactionId}:`, error)
      return false
    }
  }

  /**
   * Gets user state time series data for dashboard visualization
   * @param userId The ID of the user
   * @param timeRange The time range to query (7d, 30d, 90d, all)
   * @param aggregationInterval The interval to aggregate data by (day, week)
   * @returns Promise resolving to an array of time series data points
   */
  async getUserStateTimeSeries(
    userId: string,
    timeRange: TimeRangeOption = "30d",
    aggregationInterval: "day" | "week" = "day",
  ): Promise<Array<{ period: string; avgMood: number | null; avgStress: number | null }>> {
    try {
      // Calculate start time based on timeRange
      const now = Date.now()
      let startTime = 0

      switch (timeRange) {
        case "7d":
          startTime = now - 7 * 24 * 60 * 60 * 1000 // 7 days ago
          break
        case "30d":
          startTime = now - 30 * 24 * 60 * 60 * 1000 // 30 days ago
          break
        case "90d":
          startTime = now - 90 * 24 * 60 * 60 * 1000 // 90 days ago
          break
        case "all":
          startTime = 0 // All time
          break
      }

      // Build the Cypher query based on aggregation interval
      let cypher: string
      if (aggregationInterval === "day") {
        cypher = `
          MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)-[:HAS_STATE]->(s:UserStateInstance)
          WHERE i.timestamp >= $startTime AND i.timestamp <= $endTime
          WITH date(datetime({epochMillis: i.timestamp})) AS day, 
               avg(s.moodEstimate) AS avgMood, 
               avg(s.stressEstimate) AS avgStress
          ORDER BY day ASC
          RETURN toString(day) as period, avgMood, avgStress
        `
      } else {
        // Weekly aggregation
        cypher = `
          MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)-[:HAS_STATE]->(s:UserStateInstance)
          WHERE i.timestamp >= $startTime AND i.timestamp <= $endTime
          WITH date(datetime({epochMillis: i.timestamp})) AS day, 
               s.moodEstimate AS mood, 
               s.stressEstimate AS stress
          WITH day.week AS weekNum, 
               day.year AS year,
               avg(mood) AS avgMood, 
               avg(stress) AS avgStress
          ORDER BY year, weekNum
          RETURN year + '-W' + weekNum as period, avgMood, avgStress
        `
      }

      const result = await this.kgLayer.executeCypher(cypher, {
        userId,
        startTime,
        endTime: now,
      })

      // Check if the result is a non-empty array
      if (!result || !Array.isArray(result) || result.length === 0) {
        return []
      }

      // Map directly over the result array
      return result.map((record: Neo4jRecord) => ({ // Use Neo4jRecord type
        period: record.get('period')?.toString() ?? '',
        avgMood: record.get('avgMood') ?? null,
        avgStress: record.get('avgStress') ?? null,
      }))
    } catch (error) {
      logger.error(`Error getting user state time series for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Gets top attachments for a user based on power level
   * @param userId The ID of the user
   * @param attachmentType The type of attachment to query (Value, Goal)
   * @param limit The maximum number of attachments to return
   * @returns Promise resolving to an array of attachment data
   */
  async getTopAttachments(
    userId: string,
    attachmentType: "Value" | "Goal" = "Value",
    limit = 5,
  ): Promise<Array<{ name: string; type: string; powerLevel: number; valence: number }>> {
    try {
      const cypher = `
        MATCH (u:User {userID: $userId})-[r:HOLDS_ATTACHMENT]->(a:${attachmentType})
        WHERE r.powerLevel IS NOT NULL
        RETURN a.name as name, 
               labels(a)[0] as type, 
               r.powerLevel as powerLevel, 
               r.valence as valence
        ORDER BY r.powerLevel DESC
        LIMIT $limit
      `

      const result = await this.kgLayer.executeCypher(cypher, {
        userId,
        limit,
      })

      // Check if the result is a non-empty array
      if (!result || !Array.isArray(result) || result.length === 0) {
        return []
      }

      // Map directly over the result array
      return result.map((record: Neo4jRecord) => ({ // Use Neo4jRecord type
        name: record.get('name') ?? 'Unknown',
        type: record.get('type') ?? 'Unknown',
        powerLevel: record.get('powerLevel') ?? 0,
        valence: record.get('valence') ?? 0,
      }))
    } catch (error) {
      logger.error(`Error getting top attachments for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Gets basic trigger patterns for a user
   * @param userId The ID of the user
   * @param limit The maximum number of patterns to return
   * @returns Promise resolving to an array of trigger pattern data
   */
  async getBasicTriggerPatterns(
    userId: string,
    limit = 5,
  ): Promise<Array<{ triggerContext: string; commonReaction: string; frequency: number }>> {
    try {
      // This is a simplified version for V1
      // In a real implementation, this would involve more sophisticated pattern detection
      const cypher = `
        MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)-[:GENERATED_DURING]->(e:ERInstance)
        WHERE e.vadV < -0.3 AND e.isHiddenByUser IS NULL OR e.isHiddenByUser = false
        WITH i.userInput as input, 
             CASE 
               WHEN e.vadV < -0.7 THEN 'Strong negative reaction'
               WHEN e.vadV < -0.3 THEN 'Moderate negative reaction'
               ELSE 'Mild negative reaction'
             END as reaction,
             count(*) as frequency
        ORDER BY frequency DESC
        LIMIT $limit
        RETURN 
          CASE 
            WHEN length(input) > 50 THEN substring(input, 0, 47) + '...' 
            ELSE input 
          END as triggerContext,
          reaction as commonReaction,
          frequency
      `

      const result = await this.kgLayer.executeCypher(cypher, {
        userId,
        limit,
      })

      // Check if the result is a non-empty array
      if (!result || !Array.isArray(result) || result.length === 0) {
        return []
      }

      // Map directly over the result array
      return result.map((record: Neo4jRecord) => ({ // Add Neo4jRecord type
        triggerContext: record.get("triggerContext"),
        commonReaction: record.get("commonReaction"),
        frequency: record.get("frequency").toNumber(),
      }))
    } catch (error) {
      logger.error(`Error getting basic trigger patterns for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Create an activity node in the knowledge graph
   */
  async createActivityNode(params: {
    userId: string
    activityType: string
    title: string
    description?: string
    startTime: number
    endTime: number
    metadata?: Record<string, any>
  }): Promise<string> {
    try {
      // Generate a unique ID for the activity
      const activityId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

      // Create the Activity node
      const cypher = `
        MATCH (u:User {userID: $userId})
        CREATE (a:Activity {
          activityId: $activityId,
          userId: $userId,
          activityType: $activityType,
          title: $title,
          description: $description,
          startTime: $startTime,
          endTime: $endTime,
          metadata: $metadata,
          createdAt: timestamp()
        })
        CREATE (u)-[:PARTICIPATED_IN]->(a)
        RETURN a.activityId as activityId
      `

      const result = await this.kgLayer.executeCypherScalar<string>(cypher, {
        userId: params.userId,
        activityId,
        activityType: params.activityType,
        title: params.title,
        description: params.description || "",
        startTime: params.startTime,
        endTime: params.endTime,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      })

      return result || activityId
    } catch (error) {
      logger.error(`Error creating activity node for user ${params.userId}:`, error)
      throw new Error("Failed to create activity node")
    }
  }

  /**
   * Gets recent user ERInstances from the knowledge graph
   * @param userId The ID of the user
   * @param timeWindowMinutes The time window to query (in minutes)
   * @param limit The maximum number of ERInstances to return
   * @returns Promise resolving to an array of recent ERInstances
   */
  async getRecentUserERs(
    userId: string,
    timeWindowMinutes: number,
    limit: number,
  ): Promise<Array<{ timestamp: number; vadV: number; vadA: number; vadD: number }>> {
    try {
      const startTime = Date.now() - timeWindowMinutes * 60 * 1000

      const cypher = `
        MATCH (u:User {userID: $userId})-[:PARTICIPATED_IN]->(i:Interaction)-[:GENERATED_DURING]->(er:ERInstance)
        WHERE er.timestamp >= $startTime
        RETURN er.timestamp as timestamp, er.vadV as vadV, er.vadA as vadA, er.vadD as vadD
        ORDER BY er.timestamp DESC
        LIMIT $limit
      `

      const result = await this.kgLayer.executeCypher(cypher, { userId, startTime, limit })

      // Check if the result is a non-empty array
      if (!result || !Array.isArray(result) || result.length === 0) {
        return []
      }

      // Map directly over the result array
      return result.map((record: Neo4jRecord) => ({ // Add Neo4jRecord type
        timestamp: record.get("timestamp").toNumber(),
        vadV: record.get("vadV"),
        vadA: record.get("vadA"),
        vadD: record.get("vadD"),
      }))
    } catch (error) {
      logger.error(`Error getting recent ERInstances for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Find or create a tracked entity node in the UIG Layer 2
   * @param name The name of the entity
   * @param type The type of entity (Person, Organization, Location, etc.)
   * @returns Promise resolving to the entity ID
   */
  async findOrCreateTrackedEntity(name: string, type: string): Promise<string> {
    try {
      // Normalize the name and type
      const normalizedName = name.trim()
      const normalizedType = type.trim()

      if (!normalizedName || !normalizedType) {
        throw new Error("Entity name and type are required")
      }

      // Generate a unique ID for the entity if it doesn't exist
      const cypher = `
        MERGE (e:TrackedEntity {name: $name, type: $type})
        ON CREATE SET 
          e.entityId = 'entity-' + randomUUID(),
          e.firstSeen = timestamp(),
          e.lastUpdated = timestamp(),
          e.mentionCount = 1
        ON MATCH SET 
          e.lastUpdated = timestamp(),
          e.mentionCount = e.mentionCount + 1
        RETURN e.entityId as entityId
      `

      const result = await this.kgLayer.executeCypherScalar<string>(cypher, {
        name: normalizedName,
        type: normalizedType,
      })

      if (!result) {
        throw new Error(`Failed to find or create tracked entity: ${normalizedName}`)
      }

      return result
    } catch (error) {
      logger.error(`Error in findOrCreateTrackedEntity: ${error}`)
      throw error
    }
  }

  /**
   * Create an information event node in the UIG Layer 2
   * @param eventData The data for the information event
   * @returns Promise resolving to the event ID
   */
  async createInformationEvent(eventData: {
    eventId: string
    sourceType: string
    sourceUrl?: string
    title: string
    summary?: string
    publishedAt: number
    rawContentSnippet?: string
  }): Promise<string> {
    try {
      // Validate required fields
      if (!eventData.eventId || !eventData.title || !eventData.sourceType) {
        throw new Error("Event ID, title, and source type are required")
      }

      // Create the InformationEvent node
      const cypher = `
        MERGE (e:InformationEvent {eventId: $eventId})
        ON CREATE SET 
          e.sourceType = $sourceType,
          e.sourceUrl = $sourceUrl,
          e.title = $title,
          e.summary = $summary,
          e.publishedAt = $publishedAt,
          e.rawContentSnippet = $rawContentSnippet,
          e.createdAt = timestamp(),
          e.lastUpdated = timestamp()
        ON MATCH SET
          e.sourceType = $sourceType,
          e.sourceUrl = $sourceUrl,
          e.title = $title,
          e.summary = $summary,
          e.publishedAt = $publishedAt,
          e.rawContentSnippet = $rawContentSnippet,
          e.lastUpdated = timestamp()
        RETURN e.eventId as eventId
      `

      const result = await this.kgLayer.executeCypherScalar<string>(cypher, {
        eventId: eventData.eventId,
        sourceType: eventData.sourceType,
        sourceUrl: eventData.sourceUrl || null,
        title: eventData.title,
        summary: eventData.summary || null,
        publishedAt: eventData.publishedAt,
        rawContentSnippet: eventData.rawContentSnippet || null,
      })

      if (!result) {
        throw new Error(`Failed to create information event: ${eventData.title}`)
      }

      return result
    } catch (error) {
      logger.error(`Error in createInformationEvent: ${error}`)
      throw error
    }
  }

  /**
   * Link an information event to a tracked entity
   * @param eventId The ID of the information event
   * @param entityId The ID of the tracked entity
   * @param relationshipType The type of relationship (MENTIONS or ABOUT_ENTITY)
   * @returns Promise resolving to void
   */
  async linkEventToEntity(
    eventId: string,
    entityId: string,
    relationshipType: "MENTIONS" | "ABOUT_ENTITY",
  ): Promise<void> {
    try {
      // Validate inputs
      if (!eventId || !entityId || !relationshipType) {
        throw new Error("Event ID, entity ID, and relationship type are required")
      }

      if (relationshipType !== "MENTIONS" && relationshipType !== "ABOUT_ENTITY") {
        throw new Error("Relationship type must be either MENTIONS or ABOUT_ENTITY")
      }

      // Create the relationship
      const cypher = `
        MATCH (e:InformationEvent {eventId: $eventId})
        MATCH (t:TrackedEntity {entityId: $entityId})
        MERGE (e)-[r:${relationshipType}]->(t)
        ON CREATE SET r.createdAt = timestamp()
        RETURN count(r) as created
      `

      const result = await this.kgLayer.executeCypherScalar<number>(cypher, {
        eventId,
        entityId,
      })

      if (result !== 1) {
        throw new Error(`Failed to link event ${eventId} to entity ${entityId}`)
      }
    } catch (error) {
      logger.error(`Error in linkEventToEntity: ${error}`)
      throw error
    }
  }

  /**
   * Get recent information events from the UIG Layer 2
   * @param limit The maximum number of events to return
   * @param offset The offset for pagination
   * @returns Promise resolving to an array of information events
   */
  async getRecentInformationEvents(
    limit = 10,
    offset = 0,
  ): Promise<
    Array<{
      eventId: string
      title: string
      summary: string
      sourceType: string
      sourceUrl: string
      publishedAt: number
      entities: Array<{ entityId: string; name: string; type: string; relationshipType: string }>
    }>
  > {
    try {
      const cypher = `
        MATCH (e:InformationEvent)
        OPTIONAL MATCH (e)-[r:MENTIONS|ABOUT_ENTITY]->(t:TrackedEntity)
        WITH e, collect({
          entityId: t.entityId,
          name: t.name,
          type: t.type,
          relationshipType: type(r)
        }) as entities
        RETURN 
          e.eventId as eventId,
          e.title as title,
          e.summary as summary,
          e.sourceType as sourceType,
          e.sourceUrl as sourceUrl,
          e.publishedAt as publishedAt,
          entities
        ORDER BY e.publishedAt DESC
        SKIP $offset
        LIMIT $limit
      `

      const result = await this.kgLayer.executeCypher(cypher, { limit, offset })

      // Check if the result is a non-empty array
      if (!result || !Array.isArray(result) || result.length === 0) {
        return []
      }

      // Map directly over the result array
      return result.map((record: Neo4jRecord) => ({ // Add Neo4jRecord type
        eventId: record.get("eventId"),
        title: record.get("title"),
        summary: record.get("summary"),
        sourceType: record.get("sourceType"),
        sourceUrl: record.get("sourceUrl"),
        publishedAt: record.get("publishedAt"),
        entities: record.get("entities").filter((e: any) => e.entityId !== null),
      }))
    } catch (error) {
      logger.error(`Error in getRecentInformationEvents: ${error}`)
      return []
    }
  }

  /**
   * Get information events related to a specific entity
   * @param entityId The ID of the tracked entity
   * @param limit The maximum number of events to return
   * @returns Promise resolving to an array of information events
   */
  async getEventsForEntity(
    entityId: string,
    limit = 10,
  ): Promise<
    Array<{
      eventId: string
      title: string
      summary: string
      sourceType: string
      publishedAt: number
      relationshipType: string
    }>
  > {
    try {
      const cypher = `
        MATCH (e:InformationEvent)-[r:MENTIONS|ABOUT_ENTITY]->(t:TrackedEntity {entityId: $entityId})
        RETURN 
          e.eventId as eventId,
          e.title as title,
          e.summary as summary,
          e.sourceType as sourceType,
          e.publishedAt as publishedAt,
          type(r) as relationshipType
        ORDER BY e.publishedAt DESC
        LIMIT $limit
      `

      const result = await this.kgLayer.executeCypher(cypher, { entityId, limit })

      // Check if the result is a non-empty array
      if (!result || !Array.isArray(result) || result.length === 0) {
        return []
      }

      // Map directly over the result array
      return result.map((record: Neo4jRecord) => ({ // Add Neo4jRecord type
        eventId: record.get("eventId"),
        title: record.get("title"),
        summary: record.get("summary"),
        sourceType: record.get("sourceType"),
        publishedAt: record.get("publishedAt"),
        relationshipType: record.get("relationshipType"),
      }))
    } catch (error) {
      logger.error(`Error in getEventsForEntity: ${error}`)
      return []
    }
  }
}
