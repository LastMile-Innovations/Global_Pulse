export interface NewsItem {
  title: string
  description?: string
  content?: string
  url?: string
  publishedAt: string
  source?: string
}

/**
 * Represents an entity processed by NER
 */
export interface ProcessedEntity {
  text: string
  type: string
  inTitle?: boolean
  confidence?: number
}

/**
 * Result of a monitoring cycle
 */
export interface MonitoringResult {
  totalItemsFetched: number
  itemsPassedFilter: number
  entitiesExtracted: number
  eventsCreated: number
  entitiesCreated: number
  relationshipsCreated: number
  errors: Array<{
    stage: string
    message: string
    item?: string
  }>
}

/**
 * Configuration for the monitoring service
 */
export interface MonitoringConfig {
  newsApiKey: string
  monitoringInterval: number // in minutes
  relevantKeywords?: string[]
}
