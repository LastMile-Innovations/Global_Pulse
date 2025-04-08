"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

type AuthContextType = {
  supabase: SupabaseClient
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a singleton Supabase client to prevent multiple instances
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseClient(), []) // Use singleton pattern
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start loading initially

  useEffect(() => {
    // Use an AbortController to handle cleanup
    const controller = new AbortController()
    const { signal } = controller

    // Function to fetch session
    const fetchSession = async () => {
      try {
        setIsLoading(true)
        const { data } = await supabase.auth.getSession()

        // Only update state if the component is still mounted
        if (!signal.aborted) {
          setSession(data.session)
          setUser(data.session?.user ?? null)
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        if (!signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    // Fetch initial session
    fetchSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false) // Stop loading once state is confirmed
    })

    // Cleanup listener on unmount
    return () => {
      controller.abort()
      subscription?.unsubscribe()
    }
  }, [supabase.auth]) // Depend on supabase.auth

  // Memoize the signOut function to prevent unnecessary re-renders
  const handleSignOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase.auth])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      supabase,
      session,
      user,
      isLoading,
      signOut: handleSignOut,
    }),
    [supabase, session, user, isLoading, handleSignOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
