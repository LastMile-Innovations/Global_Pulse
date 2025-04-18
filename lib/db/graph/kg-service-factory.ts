import { KgService } from "./kg-service"
import { getNeo4jDriver } from "./neo4j-driver"

// Singleton instance
let kgServiceInstance: KgService | null = null

/**
 * Get the KgService instance
 * @returns The KgService instance
 */
export function getKgService(): KgService {
  if (!kgServiceInstance) {
    const driver = getNeo4jDriver()
    kgServiceInstance = new KgService(driver)
  }
  return kgServiceInstance
}
