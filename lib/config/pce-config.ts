import { logger } from '../utils/logger'

/**
 * Configuration settings related to the Person Cognitive Engine (PCE).
 */

/**
 * The minimum analysis confidence score (0-1) required from the PCE
 * before the system attempts to generate a deeper, PCE-informed insightful response.
 * If the confidence is below this threshold, the system will fall back to a simpler
 * response, such as a listening acknowledgment.
 *
 * This acts as an "Epistemic Boundary" for V1.
 *
 * Loaded from the `PCE_CONFIDENCE_THRESHOLD` environment variable.
 * Defaults to 0.6 if the environment variable is not set or invalid.
 *
 * @see INTEGRITY-V1-001
 * @default 0.6
 */
export const MIN_CONFIDENCE_FOR_INSIGHTFUL_RESPONSE: number = (() => {
  const envValue = process.env.PCE_CONFIDENCE_THRESHOLD
  const defaultValue = 0.6

  if (envValue) {
    const parsedValue = parseFloat(envValue)
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 1) {
      logger.info(
        `Using PCE confidence threshold from ENV: ${parsedValue}`
      )
      return parsedValue
    } else {
      logger.warn(
        `Invalid PCE_CONFIDENCE_THRESHOLD env value: "${envValue}". Must be a number between 0 and 1. Falling back to default: ${defaultValue}`
      )
    }
  } else {
    logger.info(`PCE_CONFIDENCE_THRESHOLD not set. Using default: ${defaultValue}`)
  }
  return defaultValue
})()

// Add other PCE-related configurations here as needed. 