import { getRedisClient } from "../db/redis/redis-client"
import { KgService } from "../db/graph/kg-service"
import { getNeo4jDriver } from "../db/graph/neo4j-driver"
import type { KgConsentProfile } from "../types/kg-types"
import { logger } from "@/lib/utils/logger"

/**
 * Checks if a user has granted a specific permission based on their ConsentProfile.
 * Defaults to FALSE (denied) if profile, property, or explicit true value is missing.
 * Handles direct boolean flags and keys within JSON map properties.
 *
 * @param userId The user's ID
 * @param permission The specific permission string to check
 * @param kgService Optional KgService instance (if not provided, one will be created)
 * @returns Promise<boolean> - True if consent is explicitly granted, false otherwise
 */
export async function checkConsent(userId: string, permission: string, kgService?: KgService): Promise<boolean> {
  // --- Input Validation ---
  if (!userId || typeof userId !== "string" || !permission || typeof permission !== "string") {
    logger.error("checkConsent: Invalid userId or permission provided", { userId, permission })
    return false // Deny if inputs invalid
  }

  try {
    // Get Redis client for caching
    const redis = getRedisClient()

    // Try to get from cache first
    const cacheKey = `consent:${userId}:${permission}`
    const cachedValue = await redis.get(cacheKey)

    if (cachedValue !== null) {
      return cachedValue === "true"
    }

    // If not in cache, query the database
    const service = kgService || new KgService(getNeo4jDriver())
    const consentProfile = await service.getConsentProfile(userId)

    if (!consentProfile) {
      logger.warn(`No consent profile found for user ${userId}. Denying permission '${permission}'.`)
      return false // Deny if profile doesn't exist
    }

    // --- Check Specific Permission ---
    let hasConsent = false

    // Handle Data Source Consent (e.g., CAN_ACCESS_SOURCE_google_calendar)
    if (permission.startsWith("CAN_ACCESS_SOURCE_")) {
      const sourceId = permission.substring("CAN_ACCESS_SOURCE_".length)
      if (!sourceId) return false

      const consentsMap = parseJsonString<Record<string, boolean>>(consentProfile.dataSourceConsents)
      if (!consentsMap) return false // Map missing or invalid JSON

      hasConsent = consentsMap[sourceId] === true
    }
    // Handle Feature Consent (e.g., CAN_USE_FEATURE_aggregateComparison)
    else if (permission.startsWith("CAN_USE_FEATURE_")) {
      const featureId = permission.substring("CAN_USE_FEATURE_".length)
      if (!featureId) return false

      const consentsMap = parseJsonString<Record<string, boolean>>(consentProfile.featureConsent)
      if (!consentsMap) return false // Map missing or invalid JSON

      hasConsent = consentsMap[featureId] === true
    }
    // Handle direct boolean properties (e.g., consentDetailedAnalysisLogging)
    else if (permission in consentProfile) {
      hasConsent = consentProfile[permission as keyof KgConsentProfile] === true
    }
    // Unknown permission
    else {
      logger.warn(`Unknown permission string: ${permission}. Denying.`)
      return false
    }

    // Cache the result with a short TTL to allow for quick updates
    await redis.set(cacheKey, hasConsent.toString(), { ex: 60 }) // 60 seconds TTL

    logger.info(`Consent check for ${permission}: ${hasConsent} (User: ${userId})`)
    return hasConsent
  } catch (error) {
    logger.error(`Error checking consent: ${error}. Denying.`)
    return false // Default to false (no consent) on error
  }
}

/**
 * Safely parses a JSON string, returning null on error
 */
function parseJsonString<T>(jsonString?: string): T | null {
  if (!jsonString) return null

  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    logger.error(`Failed to parse JSON string: ${error}`)
    return null
  }
}

/**
 * Invalidates the consent cache for a user
 * Called after updating consent settings
 */
export async function invalidateConsentCache(userId: string): Promise<void> {
  try {
    const redis = getRedisClient()
    const keys = await redis.keys(`consent:${userId}:*`)

    if (keys.length > 0) {
      await redis.del(...keys)
      logger.info(`Invalidated ${keys.length} consent cache entries for user ${userId}`)
    }
  } catch (error) {
    logger.error(`Error invalidating consent cache: ${error}`)
  }
}
