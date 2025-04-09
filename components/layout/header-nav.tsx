"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Link from "next/link" 
import { usePathname } from "next/navigation"
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
import { LogOut, User as UserIcon } from "lucide-react" 
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client" 
import { logout } from "@/actions/auth" 

// Memoize the HeaderNav component to prevent unnecessary re-renders
const HeaderNav = memo(function HeaderNav() {
  const pathname = usePathname()
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

  const isMarketingPage = pathname === "/" || pathname.startsWith("/(marketing)")

  const marketingLinks = [
    { href: "/mission", label: "Our Mission" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ]

  const appLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
    { href: "/survey", label: "Surveys" },
    { href: "/chat", label: "Chat" }, 
  ]

  const links = isMarketingPage ? marketingLinks : appLinks

  return (
    <>
      <nav className="flex items-center space-x-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={true}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-2">
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted" /> 
        ) : !user ? (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login" prefetch={true}>Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup" prefetch={true}>Sign Up</Link>
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
                <Link href="/account" prefetch={true} className="flex items-center w-full cursor-pointer">
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
    </>
  )
})

export default HeaderNav
