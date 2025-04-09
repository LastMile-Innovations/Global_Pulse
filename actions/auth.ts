"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers" // Explicit import
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { updatePasswordSchema } from "@/components/auth/update-password-schema"

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

  const supabase = createClient()
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
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Login error:", error.message) // Log detailed error server-side
    // Return generic but clear error to client for security
    return { error: "Invalid email or password." } 
  }

  // 3. On Success: Revalidate cache and redirect
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
  // @ts-ignore - Suppressing persistent lint error, headers() is synchronous in Server Actions
  const origin = headers().get("origin") 

  // 1. Validate form data
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    // Return specific validation errors
    const errorMessages = validatedFields.error.errors.map((e) => e.message).join(" \n")
    return { error: `Invalid input:\n${errorMessages}` }
  }

  const { email, password } = validatedFields.data

  // 2. Attempt signup with Supabase
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Link to send in the confirmation email
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup error:", error.message) // Log detailed error server-side
    // Provide specific common errors, otherwise generic
    if (error.message.includes("User already registered")) {
      return { error: "An account with this email already exists. Try logging in." }
    }
    return { error: "Could not create account. Please try again later." }
  }

  // 3. On Success: Redirect user to login with a confirmation message
  redirect("/login?message=Check email to complete sign up")
  // Note: Redirects throw an error, so no state is returned here
}

// --- Logout Action ---
export async function logout() {
  "use server"

  const supabase = createClient() // Use server client
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
