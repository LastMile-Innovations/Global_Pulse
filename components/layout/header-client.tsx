"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon, Moon, Sun } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { logout } from "@/actions/auth"
import { Header } from "./header"

// ThemeLogo - Client Component
export function ThemeLogo() {
  return (
    <Link href="/" prefetch={true} className="flex items-center space-x-3 group" aria-label="Global Pulse Home">
      <span className="inline-flex items-center justify-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 drop-shadow-md transition-transform group-hover:scale-105 animate-pulse-slow"
          aria-hidden="true"
        >
          {/* Solid monochrome globe */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            opacity="0.95"
          />
          {/* Subtle latitude and longitude lines */}
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="9"
            stroke="currentColor"
            strokeWidth="0.7"
            opacity="0.25"
            fill="none"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="9"
            ry="22"
            stroke="currentColor"
            strokeWidth="0.7"
            opacity="0.25"
            fill="none"
          />
          {/* Bold monochrome heartbeat line */}
          <path
            d="M10 36 H22 L26 28 L30 44 L34 20 L38 44 L42 32 H54"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      <span className="font-extrabold text-2xl md:text-3xl text-foreground tracking-tight">Global Pulse</span>
    </Link>
  )
}

// ThemeToggle - Client Component
export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// User Authentication - Client Component
export function UserAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Use useCallback to memoize the fetchSession function
  const fetchSession = useCallback(async () => {
    const supabase = createClient()
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error fetching session:", error.message)
      } else {
        setUser(session?.user ?? null)
      }
    } catch (error) {
      console.error("Unexpected error fetching session:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return (
    <div className="flex items-center gap-2 ml-2">
      {isLoading ? (
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted" /> 
      ) : !user ? (
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">My Account</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center w-full cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-0 cursor-pointer">
              <form action={logout} className="w-full">
                <button type="submit" className="flex items-center w-full px-2 py-1.5 text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// HeaderWrapper - Client Component for the entire header
export function HeaderWrapper() {
  const pathname = usePathname()
  return <Header pathname={pathname} />
}
