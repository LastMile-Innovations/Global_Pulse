import { validateConfiguredProviders } from "./providers"
import { logger } from "../utils/logger"

/**
 * Initializes the AI SDK module
 * Validates configured providers and logs warnings for missing API keys
 */
export function initializeAiSdk(): void {
  logger.info("Initializing AI SDK module...")
  validateConfiguredProviders()
  logger.info("AI SDK module initialized")
}
