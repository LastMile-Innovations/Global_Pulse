import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { getKgService } from '@/lib/db/graph/kg-service-factory';
import type { NextRequest } from 'next/server';
import { cookies as nextCookies } from 'next/headers';

// Function to get Supabase client for server components/actions
async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
}

/**
 * Gets the currently authenticated Supabase user object server-side.
 * Returns null if not authenticated or an error occurs.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Log error without exposing PII
      logger.error(`getCurrentUser: Error fetching user from Supabase`, { code: error.code, message: error.message });
      return null;
    }
    return user;
  } catch (err) {
    logger.error(`getCurrentUser: Unexpected error`, { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

// Type for Drizzle profile
export type Profile = typeof profiles.$inferSelect;

/**
 * Finds an existing profile by Supabase User ID or creates a new one.
 * Ensures corresponding Neo4j :User node exists (idempotently, no PII).
 * Returns the Drizzle profile record or null on critical DB error.
 */
export async function getOrCreateProfile(user: User): Promise<Profile | null> {
  if (!user || !user.id) {
    logger.error('getOrCreateProfile called with invalid user object');
    return null;
  }
  const userId = user.id;
  let profile: Profile | null = null;
  let kgErrorOccurred = false;

  try {
    // 1. Check if profile exists in DB
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });

    if (existingProfile) {
      logger.debug(`Profile found for user: ${userId}`);
      profile = existingProfile;
    } else {
      // 2. Create profile in DB if not found
      logger.info(`Profile not found for user ${userId}. Creating...`);
      const firstName = user.user_metadata?.firstName || user.user_metadata?.first_name || null;
      const lastName = user.user_metadata?.lastName || user.user_metadata?.last_name || null;

      // --- CRITICAL: Only insert non-PII data ---
      const insertResult = await db.insert(profiles).values({
        id: userId, // Link using Supabase ID
        firstName: firstName,
        lastName: lastName,
        // Add other non-PII defaults from schema if needed
      }).returning();

      if (!insertResult || insertResult.length === 0) {
        throw new Error('Failed to create profile in database after insert.');
      }
      profile = insertResult[0];
      logger.info(`Successfully created profile for user: ${userId}`);

      // 3. (Side Effect) Create/Ensure Neo4j Node (Idempotent, No PII)
      try {
        const kgService = getKgService();
        // --- CRITICAL: Derive a non-PII name for Neo4j ---
        // Use metadata name only if explicitly deemed non-sensitive, else use fallback.
        // Fallback using partial ID is safer regarding PII.
        const derivedName = (firstName && lastName)
          ? `${firstName} ${lastName}` // Example: Use if metadata names are okay
          : `User_${userId.substring(0, 8)}`; // Safer fallback

        await kgService.createUserNode({
          userID: userId,
          name: derivedName,
          // ** Explicitly DO NOT pass email or other PII **
        });
        logger.info(`Ensured Neo4j :User node exists for user: ${userId}`);
      } catch (kgError) {
        kgErrorOccurred = true;
        // Log clearly but DO NOT fail profile creation
        logger.error(`getOrCreateProfile: Failed to create/merge Neo4j node for user ${userId}`, { error: kgError instanceof Error ? kgError.message : String(kgError) });
      }
    }

    // 4. Return the DB profile (even if KG step had non-critical error)
    return profile;

  } catch (dbError) {
    // Log critical DB errors without PII
    logger.error(`getOrCreateProfile: Critical database error for user ${userId}`, { error: dbError instanceof Error ? dbError.message : String(dbError) });
    return null; // Return null on critical DB failure
  }
}

/**
 * Checks if the user associated with the request has the 'admin' role
 * based on Supabase JWT custom claims (app_metadata.roles).
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  // Create a Supabase client specific to this request's cookies
  const cookieStore = request.cookies; // Use request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      logger.error(`isAdmin: Error fetching user`, { code: error.code, message: error.message });
      return false;
    }
    if (!user) {
      // Not authenticated
      return false;
    }

    // --- CRITICAL: Check JWT claims ---
    const roles = user.app_metadata?.roles;

    // Defensive checks: ensure roles exists and is an array
    if (roles && Array.isArray(roles)) {
      const isAdminUser = roles.includes('admin');
      logger.debug(`isAdmin check for user ${user.id}: roles=${JSON.stringify(roles)}, isAdmin=${isAdminUser}`);
      return isAdminUser;
    } else {
      logger.debug(`isAdmin check for user ${user.id}: app_metadata.roles missing or not an array.`);
      return false;
    }
  } catch (err) {
    logger.error(`isAdmin: Unexpected error`, { error: err instanceof Error ? err.message : String(err) });
    return false;
  }
}

// --- Helper for Server Components (if needed) ---
// Note: Directly using isAdmin(request) in API routes is preferred.
// This is only if you need the check inside a Server Component without passing the request.
export async function isAdminFromCookies(): Promise<boolean> {
   const cookieStore = await nextCookies();
   const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );
   try {
     const { data: { user }, error } = await supabase.auth.getUser();
     if (error) {
       logger.error(`isAdminFromCookies: Error fetching user`, { code: error.code, message: error.message });
       return false;
     }
     if (!user) return false;
     const roles = user.app_metadata?.roles;
     if (roles && Array.isArray(roles)) {
       const isAdminUser = roles.includes('admin');
       logger.debug(`isAdminFromCookies check for user ${user.id}: roles=${JSON.stringify(roles)}, isAdmin=${isAdminUser}`);
       return isAdminUser;
     } else {
       logger.debug(`isAdminFromCookies check for user ${user.id}: app_metadata.roles missing or not an array.`);
       return false;
     }
   } catch (err) {
     logger.error(`isAdminFromCookies: Unexpected error`, { error: err instanceof Error ? err.message : String(err) });
     return false;
   }
}

/**
 * Authenticates a request using session cookies and returns the user ID if valid.
 */
export async function auth(request: NextRequest): Promise<string | null> {
  // Create Supabase client scoped to the request
  const cookieStore = request.cookies;
  const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
        },
      }
  );
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      logger.error(`Auth session error`, { code: error.code, message: error.message });
      return null;
    }
    return session?.user?.id ?? null;
  } catch (err) {
    logger.error(`Auth unexpected error`, { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}
