"use client"

import { Link } from "@/components/ui/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/AuthProvider"
import LogoutButton from "@/components/auth/LogoutButton"
import { cn } from "@/lib/utils"

export default function HeaderNav() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  const isMarketingPage = pathname === "/" || pathname.startsWith("/(marketing)")

  // Marketing navigation links
  const marketingLinks = [
    { href: "/mission", label: "Our Mission" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
  ]

  // App navigation links
  const appLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
    { href: "/survey", label: "Surveys" },
  ]

  const links = isMarketingPage ? marketingLinks : appLinks

  return (
    <>
      <nav className="flex items-center space-x-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
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
        {!isLoading && !user ? (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account">My Account</Link>
            </Button>
            <LogoutButton />
          </>
        )}
      </div>
    </>
  )
}
