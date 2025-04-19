"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
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

// ThemeLogo - Uses Tailwind + globals.css color system
export function ThemeLogo() {
  return (
    <Link
      href="/"
      prefetch={true}
      className="flex items-center gap-3 group select-none"
      aria-label="Global Pulse Home"
    >
      <span className="inline-flex items-center justify-center rounded-standard-full bg-gradient-to-br from-primary/80 to-secondary/80 shadow-glow p-1 transition-transform group-hover:scale-110">
        <svg
          width="48"
          height="48"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 drop-shadow-lg transition-transform"
          aria-hidden="true"
        >
          {/* Globe */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="url(#pulseGradient)"
            stroke="currentColor"
            strokeWidth="2.5"
            opacity="0.95"
          />
          {/* Heartbeat */}
          <path
            d="M10 36 H22 L26 28 L30 44 L34 20 L38 44 L42 32 H54"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-pulse"
          />
          <defs>
            <radialGradient id="pulseGradient" cx="0.5" cy="0.5" r="0.7">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </radialGradient>
          </defs>
        </svg>
      </span>
      <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-foreground drop-shadow-sm">
        Global Pulse
      </span>
    </Link>
  )
}

// ThemeToggle - Uses Tailwind + globals.css color system
export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-standard-full border border-border hover:bg-accent/60 transition-all shadow-glow-sm"
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all text-accent dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.3rem] w-[1.3rem] rotate-90 scale-0 transition-all text-primary dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem] shadow-glow rounded-standard-xl border border-border bg-popover/95 backdrop-blur">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4 text-accent" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4 text-primary" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2"
        >
          <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// User Authentication - Uses Tailwind + globals.css color system
export function UserAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted/60" />
      ) : !user ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-standard-full px-4 font-semibold text-foreground hover:bg-primary/10 transition-all"
          >
            <Link href="/login">Log In</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="rounded-standard-full px-4 font-semibold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 transition-all"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-standard-full border border-border shadow-glow-sm hover:bg-accent/60 transition-all p-0"
              aria-label="Open user menu"
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/60 ring-offset-2 ring-offset-background transition-all">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 rounded-standard-xl shadow-glow border border-border bg-popover/95 backdrop-blur"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-base font-semibold leading-none text-foreground">My Account</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="hover:bg-primary/10 transition-all rounded-md">
              <Link href="/account" className="flex items-center w-full cursor-pointer py-2">
                <UserIcon className="mr-2 h-4 w-4 text-primary" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-0 cursor-pointer hover:bg-destructive/10 transition-all rounded-md">
              <form action={logout} className="w-full">
                <button
                  type="submit"
                  className="flex items-center w-full px-3 py-2 text-sm text-destructive font-semibold"
                >
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
