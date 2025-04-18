import { type NextRequest, NextResponse } from "next/server"
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver"
import { KgService } from "@/lib/db/graph/kg-service"
import { invalidateConsentCache } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { ConsentUpdatePayloadSchema, type ConsentUpdatePayload } from "@/lib/schemas/api"

/**
 * GET /api/profile/consents
 * Retrieves the current consent settings for the authenticated user.
 * - Authenticates the user
 * - Returns the user's consent profile (creates a default if missing)
 * - Robust error handling and logging
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  try {
    // --- Authenticate the request ---
    const userId = await auth(request)
    if (!userId) {
      logger.warn(`[${requestId}] Unauthorized attempt to access consent settings`)
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 })
    }

    // --- Get the user's consent profile ---
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)
    let consentProfile
    try {
      consentProfile = await kgService.getConsentProfile(userId)
    } catch (err) {
      logger.error(`[${requestId}] Error fetching consent profile for user ${userId}: ${err}`)
      return NextResponse.json({ error: "Failed to retrieve consent settings", requestId }, { status: 500 })
    }

    // --- If not found, create a default profile ---
    if (!consentProfile) {
      logger.warn(`[${requestId}] Consent profile not found for user ${userId}, creating default`)
      let profileId
      try {
        profileId = await kgService.createConsentProfileNode(userId)
      } catch (err) {
        logger.error(`[${requestId}] Failed to create consent profile node for user ${userId}: ${err}`)
        return NextResponse.json({ error: "Failed to create consent profile", requestId }, { status: 500 })
      }

      if (!profileId) {
        logger.error(`[${requestId}] Profile ID not returned after creation for user ${userId}`)
        return NextResponse.json({ error: "Failed to create consent profile", requestId }, { status: 500 })
      }

      try {
        consentProfile = await kgService.getConsentProfile(userId)
      } catch (err) {
        logger.error(`[${requestId}] Failed to retrieve created consent profile for user ${userId}: ${err}`)
        return NextResponse.json({ error: "Failed to retrieve created consent profile", requestId }, { status: 500 })
      }

      if (!consentProfile) {
        logger.error(`[${requestId}] Consent profile still missing after creation for user ${userId}`)
        return NextResponse.json({ error: "Failed to retrieve created consent profile", requestId }, { status: 500 })
      }
    }

    // --- Return the consent profile (excluding internal IDs) ---
    const { profileID, ...consentSettings } = consentProfile
    const latencyMs = Date.now() - startTime
    logger.info(`[${requestId}] Consent profile retrieved for user ${userId} (latencyMs=${latencyMs})`)
    return NextResponse.json({ ...consentSettings, requestId, latencyMs })
  } catch (error) {
    logger.error(`Error retrieving consent settings:`, error)
    return NextResponse.json({ error: "Failed to retrieve consent settings" }, { status: 500 })
  }
}

/**
 * PUT /api/profile/consents
 * Updates the consent settings for the authenticated user.
 * - Authenticates the user
 * - Validates input using Zod schema
 * - Updates the consent profile in the database
 * - Invalidates cache
 * - Robust error handling, logging, and metrics
 */
export async function PUT(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  try {
    // --- Authenticate the request ---
    const userId = await auth(request)
    if (!userId) {
      logger.warn(`[${requestId}] Unauthorized attempt to update consent settings`)
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 })
    }

    // --- Parse and validate the request body ---
    let body: unknown
    try {
      body = await request.json()
    } catch (err) {
      logger.warn(`[${requestId}] Invalid JSON in request body from user ${userId}`)
      return NextResponse.json({ error: "Invalid JSON in request body", requestId }, { status: 400 })
    }

    const validationResult = ConsentUpdatePayloadSchema.safeParse(body)
    if (!validationResult.success) {
      logger.warn(`[${requestId}] Validation failed for consent update from user ${userId}`)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
          requestId,
        },
        { status: 400 }
      )
    }

    const updates: ConsentUpdatePayload = validationResult.data

    // --- Prepare the updates for the database ---
    // Convert dataSourceConsents and featureConsent objects to JSON strings if provided
    const dbUpdates: Record<string, any> = { ...updates }
    if (updates.dataSourceConsents && typeof updates.dataSourceConsents === "object") {
      dbUpdates.dataSourceConsents = JSON.stringify(updates.dataSourceConsents)
    }
    if (updates.featureConsent && typeof updates.featureConsent === "object") {
      dbUpdates.featureConsent = JSON.stringify(updates.featureConsent)
    }

    // --- Update the consent profile ---
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)
    let success = false
    try {
      success = await kgService.updateConsentProfile(userId, dbUpdates)
    } catch (err) {
      logger.error(`[${requestId}] Error updating consent settings for user ${userId}: ${err}`)
      return NextResponse.json({ error: "Failed to update consent settings", requestId }, { status: 500 })
    }

    if (!success) {
      logger.error(`[${requestId}] Failed to update consent settings for user ${userId}`)
      return NextResponse.json({ error: "Failed to update consent settings", requestId }, { status: 500 })
    }

    // --- Invalidate the consent cache for this user ---
    try {
      await invalidateConsentCache(userId)
    } catch (err) {
      logger.warn(`[${requestId}] Failed to invalidate consent cache for user ${userId}: ${err}`)
      // Not fatal, continue
    }

    // --- Return success ---
    const latencyMs = Date.now() - startTime
    logger.info(`[${requestId}] Consent settings updated successfully for user ${userId} (latencyMs=${latencyMs})`)
    return NextResponse.json({
      success: true,
      message: "Consent settings updated successfully",
      requestId,
      latencyMs,
    })
  } catch (error) {
    logger.error(`Error updating consent settings:`, error)
    return NextResponse.json({ error: "Failed to update consent settings" }, { status: 500 })
  }
}

// --- Utility: Generate a simple request ID for logging and tracing ---
function generateRequestId(): string {
  // Simple random hex string, not cryptographically secure
  return Math.random().toString(16).slice(2, 10) + Date.now().toString(36)
}
