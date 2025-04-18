import * as learning from "./learning"
// Rename import as it now only contains profiles and userRoleEnum
import * as profilesSchema from "./users"
import * as feedback from "./feedback"
import * as analytics from "./analytics"
import * as buyerIntentDeclarations from "./buyerIntentDeclarations"
import * as dataAccessRequests from "./dataAccessRequests"
import * as externalConnections from "./externalConnections"
import * as contactMessages from "./contactMessages"

// Import newly created schema files
import * as chats from "./chats"
import * as surveys from "./surveys"
import * as marketplace from "./marketplace"
import * as waitlist from "./waitlist"
import * as notifications from "./notifications"
import * as admin from "./admin"

// --- Export Combined Schema ---
export const schema = {
  // Tables from existing files
  ...learning,
  ...profilesSchema,
  ...feedback,
  ...analytics,
  ...buyerIntentDeclarations,
  ...dataAccessRequests,
  ...externalConnections,
  ...contactMessages,

  // Tables and relations from new files
  ...chats,
  ...surveys,
  ...marketplace,
  ...waitlist,
  ...notifications,
  ...admin,
}

// Export relevant types (like WaitlistUser) if needed directly
export type { WaitlistUser, NewWaitlistUser } from "./waitlist"

// Re-export profiles table and userRoleEnum if needed individually elsewhere
export { profiles, userRoleEnum } from "./users"

export { coherenceFeedback } from "./feedback"
export { dataAccessRequests } from "./dataAccessRequests"
export { contactMessages, contactCategoryEnum, contactStatusEnum } from "./contactMessages"
