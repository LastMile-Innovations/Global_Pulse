import { logger } from "@/lib/utils/logger"

export interface CrisisResource {
  countryIso: string // ISO 3166-1 alpha-2 code or "DEFAULT"
  phone: string // Primary phone number
  textline?: string // Text line number/code (optional)
  description?: string // Brief description (e.g., "US Suicide & Crisis Lifeline")
}

// IMPORTANT: NUMBERS BELOW ARE EXAMPLES. MUST BE VERIFIED AND KEPT UP-TO-DATE
// SOURCE FROM RELIABLE INTERNATIONAL DIRECTORIES (e.g., Wikipedia's List, Befrienders Worldwide)
export const CRISIS_RESOURCES: CrisisResource[] = [
  { countryIso: "US", phone: "988", textline: "988", description: "US Suicide & Crisis Lifeline" },
  { countryIso: "GB", phone: "116 123", textline: "SHOUT to 85258", description: "Samaritans UK" },
  { countryIso: "CA", phone: "1-833-456-4566", textline: "45645", description: "Canada Talk Suicide" },
  { countryIso: "AU", phone: "13 11 14", textline: "0477 13 11 14", description: "Lifeline Australia" },
  { countryIso: "NZ", phone: "1737", textline: "1737", description: "Need to talk? (New Zealand)" },
  { countryIso: "IN", phone: "9152987821", description: "AASRA" },
  { countryIso: "IE", phone: "116 123", textline: "Text HELLO to 50808", description: "Samaritans Ireland" },
  // Add more verified entries...
  // MUST have a default entry
  {
    countryIso: "DEFAULT",
    phone: "your local emergency services",
    textline: "a local crisis textline if available",
    description: "Local Emergency/Crisis Services",
  },
]

/**
 * Gets crisis resources based on user locale (e.g., 'en-US', 'en-GB', 'fr-CA').
 * Falls back to DEFAULT if locale is unrecognized or has no specific entry.
 * @param locale - The user's locale string (optional).
 * @returns The best matching CrisisResource object.
 */
export function getCrisisResources(locale?: string): CrisisResource {
  const defaultResource = CRISIS_RESOURCES.find((r) => r.countryIso === "DEFAULT")
  if (!defaultResource) {
    // This should never happen if the array is configured correctly
    logger.error("CRITICAL: DEFAULT crisis resource is missing in distress-resources.config.ts!")
    return {
      countryIso: "DEFAULT",
      phone: "Emergency Services",
      description: "Please contact local emergency services.",
    }
  }

  if (!locale) {
    logger.warn("No locale provided for crisis resource lookup, using DEFAULT.")
    return defaultResource
  }

  try {
    // Attempt to extract country code (last part of locale, uppercase)
    const parts = locale.split(/[_-]/) // Handles en-US, en_GB, fr-CA etc.
    const countryCode = parts[parts.length - 1]?.toUpperCase()

    if (!countryCode) {
      logger.warn(`Could not extract country code from locale '${locale}', using DEFAULT.`)
      return defaultResource
    }

    const resource = CRISIS_RESOURCES.find((r) => r.countryIso === countryCode)
    return resource || defaultResource
  } catch (error) {
    logger.error(`Error fetching crisis resources for locale '${locale}', returning DEFAULT:`, error)
    return defaultResource
  }
}
