import { type NextRequest, NextResponse } from "next/server"
import { getNeo4jDriver } from "@/lib/db/graph/neo4j-driver"
import { KgService } from "@/lib/db/graph/kg-service"
import { invalidateConsentCache } from "@/lib/ethics/consent"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils" //Auth-utils to perform authetication
import { ConsentUpdatePayloadSchema, type ConsentUpdatePayload } from "@/lib/schemas/api"

/**
 * GET /api/profile/consents
 * Retrieves the current consent settings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized attempt to access consent settings")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's consent profile
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)
    const consentProfile = await kgService.getConsentProfile(userId)

    if (!consentProfile) {
      logger.warn(`Consent profile not found for user ${userId}`)

      // Create a default profile if it doesn't exist
      const profileId = await kgService.createConsentProfileNode(userId)

      if (!profileId) {
        return NextResponse.json({ error: "Failed to create consent profile" }, { status: 500 })
      }

      // Fetch the newly created profile
      const newProfile = await kgService.getConsentProfile(userId)

      if (!newProfile) {
        return NextResponse.json({ error: "Failed to retrieve created consent profile" }, { status: 500 })
      }

      // Return the new profile (excluding internal IDs)
      const { profileID, ...consentSettings } = newProfile
      return NextResponse.json(consentSettings)
    }

    // Return the consent profile (excluding internal IDs)
    const { profileID, ...consentSettings } = consentProfile
    return NextResponse.json(consentSettings)
  } catch (error) {
    logger.error(`Error retrieving consent settings: ${error}`)
    return NextResponse.json({ error: "Failed to retrieve consent settings" }, { status: 500 })
  }
}

/**
 * PUT /api/profile/consents
 * Updates the consent settings for the authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate the request
    const userId = await auth(request)
    if (!userId) {
      logger.warn("Unauthorized attempt to update consent settings")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate the request body
    const body = await request.json()

    // Use the centralized schema for validation
    const validationResult = ConsentUpdatePayloadSchema.safeParse(body)

    if (!validationResult.success) {
      logger.warn(`Invalid consent update request from user ${userId}`, {
        errors: validationResult.error.format(),
      })
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      )
    }

    const updates: ConsentUpdatePayload = validationResult.data

    // Prepare the updates for the database
    // Convert dataSourceConsents and featureConsent objects to JSON strings if provided
    const dbUpdates: Record<string, any> = { ...updates }

    if (updates.dataSourceConsents && typeof updates.dataSourceConsents === "object") {
      dbUpdates.dataSourceConsents = JSON.stringify(updates.dataSourceConsents)
    }

    if (updates.featureConsent && typeof updates.featureConsent === "object") {
      dbUpdates.featureConsent = JSON.stringify(updates.featureConsent)
    }

    // Update the consent profile
    const driver = getNeo4jDriver()
    const kgService = new KgService(driver)
    const success = await kgService.updateConsentProfile(userId, dbUpdates)

    if (!success) {
      logger.error(`Failed to update consent settings for user ${userId}`)
      return NextResponse.json({ error: "Failed to update consent settings" }, { status: 500 })
    }

    // Invalidate the consent cache for this user
    await invalidateConsentCache(userId)

    // Return success
    logger.info(`Consent settings updated successfully for user ${userId}`)
    return NextResponse.json({ success: true, message: "Consent settings updated successfully" })
  } catch (error) {
    logger.error(`Error updating consent settings: ${error}`)
    return NextResponse.json({ error: "Failed to update consent settings" }, { status: 500 })
  }
}

// Remove the isValidConsentUpdate function as it's now replaced by the Zod schema
