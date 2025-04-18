export type JsonString = string

// Consent Profile properties
export interface ConsentProfile {
  profileID: string
  userID: string

  // Core consent flags
  consentDataProcessing: boolean // Default true after signup
  allowSomaticPrompts: boolean // Default false
  consentDetailedAnalysisLogging: boolean // Default false
  consentAnonymizedPatternTraining: boolean // Default false
  allowDistressConsentCheck: boolean // Default false
  consentAggregation: boolean // Default false
  consentSaleOptIn: boolean // Default false

  // Flexible consent maps for data sources and features
  dataSourceConsents?: JsonString // JSON map of source IDs to boolean consent values
  featureConsent?: JsonString // JSON map of feature IDs to boolean consent values

  // Metadata
  consentVersion?: string
  lastConsentUpdate: number // timestamp
  createdAt: number // timestamp
  updatedAt: number // timestamp
}

// Permission string types for consent checks
export type ConsentPermissionString =
  | keyof ConsentProfile // Direct properties
  | `CAN_ACCESS_SOURCE_${string}` // Convention for data sources
  | `CAN_USE_FEATURE_${string}` // Convention for features

// Update request type for consent settings
export interface UpdateConsentRequest {
  consentDataProcessing?: boolean
  allowSomaticPrompts?: boolean
  consentDetailedAnalysisLogging?: boolean
  consentAnonymizedPatternTraining?: boolean
  allowDistressConsentCheck?: boolean
  consentAggregation?: boolean
  consentSaleOptIn?: boolean
  dataSourceConsents?: Record<string, boolean> // Will be converted to JSON string
  featureConsent?: Record<string, boolean> // Will be converted to JSON string
}
