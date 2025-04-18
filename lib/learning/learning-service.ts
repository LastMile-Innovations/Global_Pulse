import { db } from "@/lib/db/drizzle"
import { resonanceFlags, coherenceFeedback } from "@/lib/db/schema/feedback"
import { learningUpdates } from "@/lib/db/schema/learning"
import { KgService } from "@/lib/db/graph/kg-service"
import { logger } from "@/lib/utils/logger"
import { eq, isNull } from "drizzle-orm"
import { neo4jDriver } from "@/lib/db/graph/neo4j-driver"

// Types for the learning service
export interface FeedbackContext {
  interactionId: string
  timestamp: number
  relevantAttachments: Array<{
    attachmentId: string
    type: string // 'Value' or 'Goal'
    name: string
    powerLevel: number
    valence: number
    certainty: number
    activationWeight?: number // If available
  }>
}

export interface CalculatedUpdate {
  attachmentId: string
  propertyChanged: "powerLevel" | "valence" | "certainty"
  oldValue: number
  newValue: number
  delta: number
  ruleApplied: string
}

export type FeedbackRecord = {
  id: string
  userId: string
  interactionId: string
  type: "resonance" | "coherence"
  value: string | number // Tag/score
}

/**
 * Service for processing user feedback and updating the UIG
 */
export class LearningService {
  private kgService: KgService

  constructor() {
    this.kgService = new KgService(neo4jDriver)
  }

  /**
   * Process a batch of unprocessed feedback
   */
  async processFeedbackBatch(batchSize = 50): Promise<{
    processed: number
    failed: number
    skipped: number
  }> {
    logger.info(`Starting feedback batch processing (batch size: ${batchSize})`)

    let processed = 0
    let failed = 0
    let skipped = 0

    // Fetch unprocessed resonance flags
    const resonanceFlagsResult = await db
      .select()
      .from(resonanceFlags)
      .where(isNull(resonanceFlags.processedAt))
      .limit(batchSize)

    logger.info(`Found ${resonanceFlagsResult.length} unprocessed resonance flags`)

    // Process resonance flags
    for (const flag of resonanceFlagsResult) {
      try {
        // Convert to common feedback record format
        const feedbackRecord: FeedbackRecord = {
          id: flag.id,
          userId: flag.userId,
          interactionId: flag.flaggedInteractionId,
          type: "resonance",
          value: flag.selectedTags ? flag.selectedTags.join(",") : "",
        }

        // Get context from Neo4j
        const context = await this.getFeedbackContext(flag.flaggedInteractionId, flag.userId)

        if (!context || context.relevantAttachments.length === 0) {
          logger.warn(`No relevant context found for resonance flag ${flag.id}, skipping`)
          skipped++
          continue
        }

        // Calculate updates based on rules
        const updates = this.calculateUigUpdates(feedbackRecord, context)

        if (updates.length === 0) {
          logger.info(`No updates calculated for resonance flag ${flag.id}, marking as processed`)
          // Mark as processed even if no updates were calculated
          await db.update(resonanceFlags).set({ processedAt: new Date() }).where(eq(resonanceFlags.id, flag.id))
          processed++
          continue
        }

        // Apply updates
        let allUpdatesSuccessful = true
        for (const update of updates) {
          const success = await this.applyUigUpdate(flag.userId, flag.id, update)
          if (!success) {
            allUpdatesSuccessful = false
            logger.error(`Failed to apply update for resonance flag ${flag.id}`)
            break
          }
        }

        if (allUpdatesSuccessful) {
          // Mark as processed
          await db.update(resonanceFlags).set({ processedAt: new Date() }).where(eq(resonanceFlags.id, flag.id))
          processed++
        } else {
          failed++
        }
      } catch (error) {
        logger.error(`Error processing resonance flag ${flag.id}:`, error)
        failed++
      }
    }

    // Fetch unprocessed coherence feedback
    const coherenceFeedbackResult = await db
      .select()
      .from(coherenceFeedback)
      .where(isNull(coherenceFeedback.processedAt))
      .limit(batchSize - processed - failed)

    logger.info(`Found ${coherenceFeedbackResult.length} unprocessed coherence feedback items`)

    // Process coherence feedback
    for (const feedback of coherenceFeedbackResult) {
      try {
        // Convert to common feedback record format
        const feedbackRecord: FeedbackRecord = {
          id: feedback.id,
          userId: feedback.userId,
          interactionId: feedback.messageId,
          type: "coherence",
          value: feedback.coherenceScore,
        }

        // Get context from Neo4j
        const context = await this.getFeedbackContext(feedback.messageId, feedback.userId)

        if (!context || context.relevantAttachments.length === 0) {
          logger.warn(`No relevant context found for coherence feedback ${feedback.id}, skipping`)
          skipped++
          continue
        }

        // Calculate updates based on rules
        const updates = this.calculateUigUpdates(feedbackRecord, context)

        if (updates.length === 0) {
          logger.info(`No updates calculated for coherence feedback ${feedback.id}, marking as processed`)
          // Mark as processed even if no updates were calculated
          await db
            .update(coherenceFeedback)
            .set({ processedAt: new Date() })
            .where(eq(coherenceFeedback.id, feedback.id))
          processed++
          continue
        }

        // Apply updates
        let allUpdatesSuccessful = true
        for (const update of updates) {
          const success = await this.applyUigUpdate(feedback.userId, feedback.id, update)
          if (!success) {
            allUpdatesSuccessful = false
            logger.error(`Failed to apply update for coherence feedback ${feedback.id}`)
            break
          }
        }

        if (allUpdatesSuccessful) {
          // Mark as processed
          await db
            .update(coherenceFeedback)
            .set({ processedAt: new Date() })
            .where(eq(coherenceFeedback.id, feedback.id))
          processed++
        } else {
          failed++
        }
      } catch (error) {
        logger.error(`Error processing coherence feedback ${feedback.id}:`, error)
        failed++
      }
    }

    logger.info(`Feedback batch processing complete: ${processed} processed, ${failed} failed, ${skipped} skipped`)
    return { processed, failed, skipped }
  }

  /**
   * Get context for a feedback record from Neo4j
   */
  async getFeedbackContext(interactionId: string, userId: string): Promise<FeedbackContext | null> {
    try {
      // Query to get interaction details and relevant attachments
      const cypher = `
        MATCH (i:Interaction {interactionID: $interactionId})
        OPTIONAL MATCH (u:User {userID: $userId})-[r:HOLDS_ATTACHMENT]->(a)
        WHERE 
          // Either the attachment was explicitly linked to this interaction
          EXISTS((i)-[:ACTIVATED_ATTACHMENT]->(a))
          // Or the attachment was updated around the time of this interaction
          OR (r.updatedAt IS NOT NULL AND 
              r.updatedAt >= i.timestamp - 300000 AND // 5 minutes before
              r.updatedAt <= i.timestamp + 300000)    // 5 minutes after
        RETURN 
          i.interactionID as interactionId,
          i.timestamp as timestamp,
          collect({
            id: a.id,
            type: labels(a)[0],
            name: a.name,
            powerLevel: r.powerLevel,
            valence: r.valence,
            certainty: r.certainty,
            activationWeight: CASE WHEN EXISTS((i)-[:ACTIVATED_ATTACHMENT]->(a)) THEN 1.0 ELSE 0.7 END
          }) as relevantAttachments
      `

      const result = await this.kgService.kgLayer.executeCypherSingle(cypher, { interactionId, userId })

      if (!result) {
        logger.warn(`No interaction found with ID ${interactionId}`)
        return null
      }

      const interactionData = result.get("interactionId")
      const timestamp = result.get("timestamp")
      const attachments = result.get("relevantAttachments")

      // Filter out null attachments (if any)
      const validAttachments = attachments.filter((a: any) => a.id !== null && a.powerLevel !== null)

      return {
        interactionId: interactionData,
        timestamp,
        relevantAttachments: validAttachments,
      }
    } catch (error) {
      logger.error(`Error retrieving feedback context for interaction ${interactionId}:`, error)
      return null
    }
  }

  /**
   * Calculate UIG updates based on feedback and context
   */
  calculateUigUpdates(feedback: FeedbackRecord, context: FeedbackContext): CalculatedUpdate[] {
    const updates: CalculatedUpdate[] = []

    // Get the most relevant attachments (highest activation weight)
    const sortedAttachments = [...context.relevantAttachments].sort(
      (a, b) => (b.activationWeight || 0) - (a.activationWeight || 0),
    )

    // Take top 3 most relevant attachments
    const topAttachments = sortedAttachments.slice(0, 3)

    if (topAttachments.length === 0) {
      logger.info(`No relevant attachments found for feedback ${feedback.id}`)
      return updates
    }

    // Apply rules based on feedback type
    if (feedback.type === "resonance") {
      // Handle resonance flags (non-resonant content)
      // Parse tags from the value
      const tags = typeof feedback.value === "string" ? feedback.value.split(",") : []

      // Rule R1: If "Doesn't reflect my values" tag, decrease PL of top Value attachments
      if (tags.includes("values_mismatch")) {
        const valueAttachments = topAttachments.filter((a) => a.type === "Value")
        for (const attachment of valueAttachments) {
          const oldValue = attachment.powerLevel
          // Decrease PL by 0.5, but not below 1
          const newValue = Math.max(1, oldValue - 0.5)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "powerLevel",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "R1_VALUES_MISMATCH",
            })
          }
        }
      }

      // Rule R2: If "Misunderstands my goals" tag, decrease PL of top Goal attachments
      if (tags.includes("goals_mismatch")) {
        const goalAttachments = topAttachments.filter((a) => a.type === "Goal")
        for (const attachment of goalAttachments) {
          const oldValue = attachment.powerLevel
          // Decrease PL by 0.5, but not below 1
          const newValue = Math.max(1, oldValue - 0.5)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "powerLevel",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "R2_GOALS_MISMATCH",
            })
          }
        }
      }

      // Rule R3: If "Too negative" tag, increase Valence of top attachments
      if (tags.includes("too_negative")) {
        for (const attachment of topAttachments) {
          const oldValue = attachment.valence
          // Increase Valence by 1, but not above 10
          const newValue = Math.min(10, oldValue + 1)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "valence",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "R3_TOO_NEGATIVE",
            })
          }
        }
      }

      // Rule R4: If "Too positive" tag, decrease Valence of top attachments
      if (tags.includes("too_positive")) {
        for (const attachment of topAttachments) {
          const oldValue = attachment.valence
          // Decrease Valence by 1, but not below -10
          const newValue = Math.max(-10, oldValue - 1)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "valence",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "R4_TOO_POSITIVE",
            })
          }
        }
      }

      // Rule R5: If "Incorrect assumption" tag, decrease Certainty of top attachments
      if (tags.includes("incorrect_assumption")) {
        for (const attachment of topAttachments) {
          const oldValue = attachment.certainty
          // Decrease Certainty by 0.1, but not below 0.05
          const newValue = Math.max(0.05, oldValue - 0.1)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "certainty",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "R5_INCORRECT_ASSUMPTION",
            })
          }
        }
      }
    } else if (feedback.type === "coherence") {
      // Handle coherence feedback
      const score = typeof feedback.value === "string" ? Number.parseInt(feedback.value, 10) : feedback.value

      // Rule C1: If low coherence score (1-2), decrease Certainty of top attachments
      if (score <= 2) {
        for (const attachment of topAttachments) {
          const oldValue = attachment.certainty
          // Decrease Certainty by 0.1, but not below 0.05
          const newValue = Math.max(0.05, oldValue - 0.1)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "certainty",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "C1_LOW_COHERENCE",
            })
          }
        }
      }

      // Rule C2: If high coherence score (4-5), increase Certainty of top attachments
      if (score >= 4) {
        for (const attachment of topAttachments) {
          const oldValue = attachment.certainty
          // Increase Certainty by 0.05, but not above 1.0
          const newValue = Math.min(1.0, oldValue + 0.05)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "certainty",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "C2_HIGH_COHERENCE",
            })
          }
        }
      }

      // Rule C3: If high coherence score (4-5), slightly increase PL of top attachments
      if (score >= 4) {
        for (const attachment of topAttachments) {
          const oldValue = attachment.powerLevel
          // Increase PL by 0.2, but not above 10
          const newValue = Math.min(10, oldValue + 0.2)

          if (newValue !== oldValue) {
            updates.push({
              attachmentId: attachment.attachmentId,
              propertyChanged: "powerLevel",
              oldValue,
              newValue,
              delta: newValue - oldValue,
              ruleApplied: "C3_HIGH_COHERENCE_PL",
            })
          }
        }
      }
    }

    return updates
  }

  /**
   * Apply a calculated update to the UIG and log it
   */
  async applyUigUpdate(userId: string, feedbackId: string, update: CalculatedUpdate): Promise<boolean> {
    try {
      // Prepare props object for KgService
      const props: Record<string, number> = {}
      props[update.propertyChanged] = update.newValue

      // Update the attachment property in Neo4j
      const success = await this.kgService.updateAttachmentProperties(userId, update.attachmentId, props as any)

      if (!success) {
        logger.error(`Failed to update attachment ${update.attachmentId} for user ${userId}`)
        return false
      }

      // Log the update in PostgreSQL
      await db.insert(learningUpdates).values({
        feedbackId,
        userId,
        attachmentId: update.attachmentId,
        propertyChanged: update.propertyChanged,
        oldValue: update.oldValue,
        newValue: update.newValue,
        delta: update.delta,
        ruleApplied: update.ruleApplied,
      })

      logger.info(
        `Applied UIG update: ${update.ruleApplied} to ${update.attachmentId} (${update.propertyChanged}: ${update.oldValue} → ${update.newValue})`,
      )
      return true
    } catch (error) {
      logger.error(`Error applying UIG update:`, error)
      return false
    }
  }
}
