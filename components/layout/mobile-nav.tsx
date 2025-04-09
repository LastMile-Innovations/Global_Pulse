"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/auth/LogoutButton"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, MessageSquareIcon, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { ThemeToggle } from "./theme-toggle"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
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
    }

    fetchSession()
  }, [])

  const isMarketingPage = pathname === "/" || pathname.startsWith("/(marketing)")

  const marketingLinks = [
    { href: "/mission", label: "Our Mission" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ]

  const appLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
    { href: "/surveys", label: "Surveys" },
    { href: "/chat", label: "Chat" },
  ]

  const linksToDisplay = isMarketingPage ? marketingLinks : appLinks

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] sm:w-[350px] pr-0">
        <div className="flex flex-col gap-6 px-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <MessageSquareIcon className="h-6 w-6 text-primary" />
              <span className="font-bold">Global Pulse</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav className="flex flex-col space-y-2">
            {linksToDisplay.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-base transition-colors hover:text-foreground hover:bg-muted rounded-md",
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "text-foreground font-medium bg-muted/50"
                    : "text-muted-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
            ) : !user ? (
              <>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link href="/login">Log In</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/account"
                  className={cn(
                    "flex items-center px-3 py-2 text-base transition-colors hover:text-foreground hover:bg-muted rounded-md",
                    pathname === "/account" ? "text-foreground font-medium bg-muted/50" : "text-muted-foreground"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  My Account
                </Link>
                <LogoutButton variant="ghost" />
              </>
            )}
          </div>

          <div className="mt-auto pt-4 border-t flex justify-center">
            <ThemeToggle />
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
