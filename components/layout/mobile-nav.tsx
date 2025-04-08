"use client"

import { useState } from "react"
import { Link } from "@/components/ui/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/AuthProvider"
import LogoutButton from "@/components/auth/LogoutButton"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, MessageSquareIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  const isMarketingPage = pathname === "/" || pathname.startsWith("/(marketing)")

  // Marketing navigation links
  const marketingLinks = [
    { href: "/mission", label: "Our Mission" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ]

  // App navigation links
  const appLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
    { href: "/surveys", label: "Surveys" },
    { href: "/account", label: "My Account" },
  ]

  const links = isMarketingPage ? marketingLinks : appLinks

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

          <nav className="flex flex-col space-y-3">
            {links.map((link) => (
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

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
            {!isLoading && !user ? (
              <>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link href="/login">Log In</Link>
                </Button>
              </>
            ) : (
              <LogoutButton variant="default" />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
