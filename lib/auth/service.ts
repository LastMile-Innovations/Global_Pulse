import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { User } from '@supabase/supabase-js';

/**
 * Checks if the currently authenticated user has the 'admin' role.
 * Uses the Supabase server client to get the user session.
 * @returns Promise<boolean> True if the user is an admin, false otherwise.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Fetch user role from your database
  const dbUser = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    // columns: { role: true } // 'role' does not exist on profiles table
  });

  // Check if user exists in profiles, if not, they aren't an admin
  if (!dbUser) {
    return false;
  }

  // Admin status is not stored in profiles table. 
  // Implement actual admin check logic here (e.g., via Supabase custom claims or a separate admin table).
  // For now, returning false.
  // return dbUser?.role === 'admin';
  return false;
}

/**
 * Gets the currently authenticated Supabase user.
 * @returns Promise<User | null> The Supabase user object or null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
} 