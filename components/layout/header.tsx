// Server Components
import Link from "next/link"
import { cn } from "@/lib/utils"
import MobileNav from "./mobile-nav"
import { ThemeLogo, ThemeToggle, UserAuth } from "./header-client"
import { Button } from "@/components/ui/button"

/**
 * Type for navigation links
 */
interface NavLink {
  href: string;
  label: string;
  prefetch: boolean;
}

/**
 * Navigation links for marketing and app sections
 */
const marketingLinks: NavLink[] = [
  { href: "/mission", label: "Our Mission", prefetch: true },
  { href: "/features", label: "Features", prefetch: true },
  { href: "/about", label: "About", prefetch: true },
  { href: "/contact", label: "Contact", prefetch: false },
  { href: "/terms", label: "Terms", prefetch: false },
]

const appLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", prefetch: true },
  { href: "/explore", label: "Explore", prefetch: true },
  { href: "/survey", label: "Survey", prefetch: true },
  { href: "/chat", label: "Chat", prefetch: true },
]

/**
 * Props for NavLinks
 */
interface NavLinksProps {
  pathname: string
  className?: string
  onClick?: () => void
}

/**
 * Renders navigation links based on current pathname.
 * @param pathname Current route pathname
 * @param className Optional className for nav
 * @param onClick Optional click handler for links
 */
export function NavLinks({ pathname, className, onClick }: NavLinksProps) {
  const isMarketingPage = pathname === "/" || pathname.startsWith("/(marketing)")
  const links = isMarketingPage ? marketingLinks : appLinks

  return (
    <nav className={cn("flex items-center", className)} aria-label="Main navigation">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={link.prefetch}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            pathname === link.href || pathname.startsWith(`${link.href}/`)
              ? "text-foreground"
              : "text-muted-foreground",
          )}
          aria-current={pathname === link.href ? "page" : undefined}
          onClick={onClick}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Main Header component (server)
 * @param pathname Optional pathname for navigation highlighting
 */
export function Header({ pathname = "/" }: { pathname?: string }) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-transparent bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-sm before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:via-transparent before:to-secondary/10"
      role="banner"
    >
      <div className="container flex h-30 items-center justify-between">
        <div className="flex items-center gap-2">
          <ThemeLogo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-3">
          <NavLinks pathname={pathname} className="space-x-1" />
          {/* Primary CTA */}
          <Button size="sm" className="h-9 rounded-standard shadow-glow animate-pulse-subtle px-4" asChild>
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
          <UserAuth />
          <ThemeToggle />
        </div>

        {/* Mobile Navigation - Client Component */}
        <div className="flex md:hidden">
          {/* If MobileNav is not implemented, show fallback */}
          {MobileNav ? <MobileNav /> : <NavLinks pathname={pathname} />}
        </div>
      </div>
    </header>
  )
}
