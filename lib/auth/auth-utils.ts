import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { logger } from "../utils/logger"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import type { User } from "@supabase/supabase-js"
import { profiles } from "@/lib/db/schema/users"

/**
 * Authenticates a request and returns the user ID if valid
 * Uses Supabase authentication to validate the session
 */
export async function auth(request: NextRequest): Promise<string | null> {
  try {
    // Create Supabase client
    const supabase = await createClient()

    // Get the session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Return the user ID if session exists
    if (session?.user) {
      return session.user.id
    }

    return null
  } catch (error) {
    logger.error(`Auth error: ${error}`)
    return null
  }
}

/**
 * Checks if the user has admin role
 * This is a helper function that can be used in API routes
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const userId = await auth(request)

    if (!userId) {
      return false // Not authenticated
    }

    // Query the users table for the authenticated user
    const dbUser = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      // No columns specified, fetch all profile fields
    })

    if (!dbUser) {
      logger.warn(`isAdmin check failed: User with ID ${userId} found in auth but not in users table.`)
      return false // User exists in auth system but not in our user table
    }

    // No role column exists, so always return false
    return false
  } catch (error) {
    logger.error(`Admin check error: ${error}`)
    return false // Default to false on any error
  }
}

/**
 * Fetches the user ID from the current Supabase session.
 * @returns The user ID string or null if not authenticated.
 */
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    logger.error(`Error fetching user ID: ${error?.message || 'Unknown error'}`)
    return null
  }
  return user.id
}

/**
 * Retrieves the user profile from the local database based on Supabase user ID.
 * @param userId - The Supabase user ID.
 * @returns The user profile object or null if not found.
 */
export const getUserProfile = async (userId: string): Promise<typeof profiles.$inferSelect | null> => {
  if (!userId) return null
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      // No columns specified, fetch all profile fields
    })
    return profile || null
  } catch (error) {
    logger.error(`Error fetching profile for user ${userId}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

/**
 * Synchronizes the Supabase user data with the local profile database.
 * Creates a profile if one doesn't exist for the given Supabase user ID.
 * @param user - The Supabase user object.
 * @param name - Optional name to use for the profile (falls back to metadata or email).
 * @returns The Supabase user object if sync was successful (or user already existed).
 * @throws Will throw an error if the database operation fails.
 */
export const syncUserProfileWithDB = async (user: User, name?: string) => {
  if (!user || !user.id || !user.email) {
    logger.error("syncUserProfileWithDB called with invalid user object.")
    throw new Error("Invalid user object provided for profile sync.")
  }

  try {
    // Check if profile exists using the profiles table
    const existingProfile = await db.select({ id: profiles.id })
      .from(profiles) 
      .where(eq(profiles.id, user.id)) 
      .limit(1)

    if (existingProfile.length === 0) {
      logger.info(`Profile for user ${user.id} (${user.email}) not found in DB. Creating new profile.`)
      // Profile doesn't exist, insert it
      const profileName = name || user.user_metadata?.full_name || user.email
      await db.insert(profiles).values({ 
        id: user.id,
        firstName: profileName.split(' ')[0] || null, // Basic split for first name
        lastName: profileName.split(' ').slice(1).join(' ') || null, // Basic split for last name
        // Add other necessary default profile fields here
        // Ensure createdAt/updatedAt are handled by DB defaults or added here if needed
      })
      logger.info(`Created profile for user ${user.id}`)
    } else {
      logger.info(`Profile for user ${user.id} (${user.email}) already exists in DB.`)
      // Optionally, update profile data if needed (e.g., name changes)
      // await db.update(profiles).set({ firstName: ..., lastName: ... }).where(eq(profiles.id, user.id));
    }

    return user // Return the original Supabase user

  } catch (error) {
    logger.error(`Error syncing profile for user ${user.id}: ${error instanceof Error ? error.message : String(error)}`)
    throw error // Rethrow the error to be handled by the caller
  }
}
