import { createClient } from "@/utils/supabase/server"
import { db } from "@/lib/db/postgres/drizzle"
import { schema, profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { User } from "@supabase/supabase-js"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { logger } from "@/lib/utils/logger"

/**
 * Gets the currently authenticated Supabase user.
 * @returns Promise<User | null> The Supabase user object or null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Checks if the currently authenticated user has the 'admin' role.
 * NOTE: This function currently returns false as roles are not stored in the profiles table.
 * Update this logic based on how roles are managed (e.g., Supabase JWT claims).
 * @returns Promise<boolean> True if the user is an admin, false otherwise.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) {
    return false
  }

  // TODO: Implement actual role check based on Supabase JWT claims or other mechanism
  // Example: const claims = await supabase.auth.getSession(); user.app_metadata?.roles?.includes('admin');
  logger.warn(`isAdmin check is currently a placeholder returning false. Implement role check for user: ${user.id}`)
  return false
}

/**
 * Creates a user in Supabase Auth and creates the corresponding profile in our database.
 * Also creates user-related nodes in Neo4j.
 *
 * @param email - User's email
 * @param password - User's password
 * @param metadata - Additional user metadata (firstName, lastName)
 * @returns The created Supabase user object or null if creation failed
 */
export async function createUser(
  email: string,
  password: string,
  metadata: {
    firstName?: string
    lastName?: string
  } = {},
): Promise<User | null> {
  const supabase = await createClient()

  let userId: string | undefined
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.firstName,
          last_name: metadata.lastName,
        },
      },
    })

    if (authError || !authData.user) {
      logger.error(`Supabase Auth signUp error: ${authError?.message || 'Unknown error'}`)
      return null
    }

    const user = authData.user
    userId = user.id // Store for potential cleanup
    logger.info(`Created Supabase Auth user: ${userId}`)

    // Create profile in our database
    await db.insert(profiles).values({
      id: user.id, // Use Supabase user ID as profile ID
      firstName: metadata.firstName,
      lastName: metadata.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    logger.info(`Created profile for user: ${userId}`)

    // --- Post-creation actions (Neo4j) ---
    try {
      const kgService = await getKgService()
      const neo4jName = `${metadata.firstName || ""} ${metadata.lastName || ""}`.trim() || email.split("@")[0]
      await kgService.createUserNode({
        userID: user.id,
        email: user.email!,
        name: neo4jName,
      })
      await kgService.createConsentProfileNode(user.id)
      logger.info(`Added user ${userId} and consent profile to Knowledge Graph.`)
    } catch (kgError) {
      logger.error(`Failed to add user ${userId} to KG: ${kgError instanceof Error ? kgError.message : String(kgError)}`)
      // Consider compensating transaction (delete profile? delete Supabase user?)
      // For now, log and continue, returning the created Supabase user
    }
    // --- End Post-creation actions ---

    return user
  } catch (dbError) {
    logger.error(`Error during profile/KG creation for user ${userId || email}: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
    // Attempt to clean up Supabase user if DB/KG steps failed
    if (userId) {
      logger.warn(`Attempting to delete Supabase user ${userId} due to error during profile/KG creation.`)
      // Use service role client for deletion if needed
      // const adminSupabase = createSupabaseAdminClient(); 
      // await adminSupabase.auth.admin.deleteUser(userId);
      logger.error(`Manual cleanup of Supabase user ${userId} might be required.`)
    }
    return null
  }
}

/**
 * Signs in a user with email and password.
 *
 * @param email - User's email
 * @param password - User's password
 * @returns The signed-in Supabase user object or null if sign-in failed
 */
export async function signInUser(email: string, password: string): Promise<User | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logger.error(`Error signing in user ${email}: ${error.message}`)
      return null
    }

    // Ensure profile exists after sign-in
    if (data.user) {
      await getOrCreateProfile(data.user)
    }

    return data.user
  } catch (error) {
    logger.error(`Exception during signInUser for ${email}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

/**
 * Signs out the current user.
 *
 * @returns True if sign-out was successful, false otherwise
 */
export async function signOutUser(): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      logger.error(`Error signing out user: ${error.message}`)
      return false
    }

    return true
  } catch (error) {
    logger.error(`Exception during signOutUser: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Sends a password reset email to the specified email address.
 *
 * @param email - The email address to send the reset link to
 * @returns True if the reset email was sent successfully, false otherwise
 */
export async function resetPassword(email: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`, // Ensure this URL is correct
    })

    if (error) {
      logger.error(`Error sending reset password email for ${email}: ${error.message}`)
      return false
    }

    logger.info(`Password reset email sent to ${email}`)
    return true
  } catch (error) {
    logger.error(`Exception during resetPassword for ${email}: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Updates the current user's password.
 *
 * @param newPassword - The new password
 * @returns True if the password was updated successfully, false otherwise
 */
export async function updatePassword(newPassword: string): Promise<boolean> {
  const supabase = await createClient()
  // Get current user first to ensure someone is logged in
  const { data: { user }, error: getUserError } = await supabase.auth.getUser()

  if (getUserError || !user) {
    logger.error(`UpdatePassword error: User not authenticated. ${getUserError?.message || ''}`)
    return false
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      logger.error(`Error updating password for user ${user.id}: ${error.message}`)
      return false
    }
    logger.info(`Password updated successfully for user ${user.id}`)
    return true
  } catch (error) {
    logger.error(`Exception during updatePassword for user ${user.id}: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Fetches the internal user profile based on the Supabase Auth user.
 * If the profile doesn't exist in the internal DB, it creates one.
 */
export async function getOrCreateProfile(supabaseUser: User): Promise<typeof schema.profiles.$inferSelect | null> {
  if (!supabaseUser) {
    logger.warn("getOrCreateProfile called with null user")
    return null
  }

  try {
    // Attempt to find the profile by Supabase Auth ID
    let profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, supabaseUser.id),
    })

    if (!profile) {
      logger.info(`Profile for user ${supabaseUser.id} not found in internal DB, creating...`)

      // Extract potential names from metadata or email
      const firstName = supabaseUser.user_metadata?.first_name
      const lastName = supabaseUser.user_metadata?.last_name

      profile = await db.insert(profiles)
        .values({
          id: supabaseUser.id, // Use Supabase ID for profile ID
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .then((res) => res[0])

      if (!profile) {
        throw new Error("Failed to create profile for new user after insert.")
      }
      logger.info(`Created profile for user: ${profile.id}`)

      // --- Post-creation actions (like adding to knowledge graph) ---
      try {
        const kgService = await getKgService()
        const neo4jName = `${firstName || ""} ${lastName || ""}`.trim() || supabaseUser.email!.split("@")[0]
        await kgService.createUserNode({
          userID: profile.id,
          email: supabaseUser.email!, // Pass email from Supabase user
          name: neo4jName,
        })
        await kgService.createConsentProfileNode(profile.id)
        logger.info(`Added user ${profile.id} and consent profile to Knowledge Graph.`)
      } catch (kgError) {
        logger.error(`Failed to add user ${profile.id} to KG during getOrCreateProfile: ${kgError instanceof Error ? kgError.message : String(kgError)}`)
        // Decide if this should be a fatal error or just logged
      }
      // --- End Post-creation actions ---
    } else {
      logger.debug(`Profile found for user: ${profile.id}`)
    }

    return profile
  } catch (error) {
    logger.error(`Error fetching or creating profile for user ${supabaseUser.id}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

/**
 * Fetches the internal user profile based on the current Supabase session.
 * Returns the profile object.
 */
export async function getCurrentProfile(): Promise<typeof schema.profiles.$inferSelect | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    if (error) logger.error(`Supabase auth error getting user: ${error.message}`)
    return null
  }

  // Use the function to get/create profile
  return getOrCreateProfile(user)
}
