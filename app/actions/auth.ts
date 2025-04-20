"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers" // Explicit import
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/utils/supabase/server"
import { updatePasswordSchema } from "@/components/auth/update-password-schema"
import { createUser, getOrCreateProfile } from "@/lib/auth/auth-utils"

// --- Shared State Type for Auth Actions ---
export type AuthActionState = {
  error?: string | null
  message?: string | null
}

// --- Update Password Action ---
export async function updatePassword(
  prevState: unknown,
  formData: FormData,
): Promise<{ error?: string | null }> {
  "use server"

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return { error: "User not authenticated" }
  }

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(", ") }
  }

  const { password } = result.data
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error("Password update error:", error.message)
    return { error: "Failed to update password. Please try again." }
  }

  return { error: null } // Success
}

// --- Login Action ---
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password cannot be empty."),
})

export async function login(
  prevState: AuthActionState, // Previous state from useActionState
  formData: FormData,
): Promise<AuthActionState> { // Return type matches state
  "use server"

  // 1. Validate form data
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    // Return specific validation errors
    const errorMessages = validatedFields.error.errors.map((e) => e.message).join(" \n")
    return { error: `Invalid input:\n${errorMessages}` }
  }

  const { email, password } = validatedFields.data

  // 2. Attempt login with Supabase
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Login error:", error.message) // Log detailed error server-side
    // Return generic but clear error to client for security
    return { error: "Invalid email or password." } 
  }

  // 3. On Success: Ensure profile exists
  if (data.user) {
    const profile = await getOrCreateProfile(data.user)
    if (!profile) {
      console.error(`Failed to get/create profile for user ${data.user.id} during login`)
      // For MVP, log and continue redirect
    }
  }

  // 4. Revalidate cache and redirect
  revalidatePath("/", "layout") // Ensure layout reflects logged-in state
  redirect("/dashboard") // Navigate to the user's dashboard
  // Note: Redirects throw an error, so no state is returned here
}

// --- Signup Action ---
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  // Example: Add password confirmation if needed
  // passwordConfirmation: z.string().min(6),
  password: z.string().min(6, "Password must be at least 6 characters long."),
})
// Example: Add refinement for password matching
// .refine((data) => data.password === data.passwordConfirmation, {
//   message: "Passwords don't match",
//   path: ["passwordConfirmation"], // path of error
// });

export async function signup(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  "use server"

  // Get origin for email redirect link
  const headersList = await headers();
  const origin = headersList.get("origin") || ""

  // 1. Validate form data
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    // Return specific validation errors
    const errorMessages = validatedFields.error.errors.map((e) => e.message).join(" \n")
    return { error: `Invalid input:\n${errorMessages}` }
  }

  const { email, password } = validatedFields.data

  // 2. Attempt signup with Supabase
  const supabase = await createClient()
  const { data: authData, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message || "Could not create account. Please try again later." }
  }

  // 3. Ensure profile exists
  if (authData.user) {
    const profile = await getOrCreateProfile(authData.user)
    if (!profile) {
      console.error(`Failed to create profile for user ${authData.user.id} during signup action`)
      // IMPORTANT: Consider how to handle this. Delete Supabase user? Return error?
      // For MVP, returning an error is safer than leaving inconsistent state.
      return { error: "Account created, but profile setup failed. Please contact support." }
    }
    // Profile created/verified, proceed with redirect
    redirect("/login?message=Check email to complete sign up")
  } else {
    // Handle case where user object is unexpectedly null after signup success
    console.error("Supabase signup succeeded but returned no user object.")
    return { error: "Account creation failed. Please try again." }
  }
}

// --- Logout Action ---
export async function logout() {
  "use server"

  const supabase = await createClient() // Use server client
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error.message) // Log error
    // Attempt redirect even if signout fails server-side, 
    // client state might clear anyway.
    redirect("/?error=Could not log out completely")
  }

  revalidatePath("/", "layout") // Revalidate layout to clear user state
  redirect("/login") // Redirect to login page after logout
}
