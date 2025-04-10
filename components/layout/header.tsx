// Server Components
import Link from "next/link"
import { cn } from "@/lib/utils"
import MobileNav from "./mobile-nav"
import { ThemeLogo, ThemeToggle, UserAuth } from "./header-client"

// NavLinks - Server Component
// Define the link type for better type safety
interface NavLink {
  href: string;
  label: string;
  prefetch?: boolean;
}

export function NavLinks({ pathname, className, onClick }: { pathname: string, className?: string, onClick?: () => void }) {
  const isMarketingPage = pathname === "/" || pathname.startsWith("/(marketing)")

  const marketingLinks: NavLink[] = [
    { href: "/mission", label: "Our Mission", prefetch: true },
    { href: "/features", label: "Features", prefetch: true },
    { href: "/about", label: "About", prefetch: true },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms" },
  ]

  const appLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", prefetch: true },
    { href: "/explore", label: "Explore", prefetch: true },
    { href: "/survey", label: "Survey", prefetch: true },
    { href: "/chat", label: "Chat", prefetch: true }, 
  ]

  const links = isMarketingPage ? marketingLinks : appLinks

  return (
    <nav className={cn("flex items-center", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={link.prefetch}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
            pathname === link.href || pathname.startsWith(`${link.href}/`)
              ? "text-foreground"
              : "text-muted-foreground",
          )}
          onClick={onClick}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

// Main Header - Server Component
export function Header({ pathname = "/" }: { pathname?: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-30 items-center justify-between">
        <div className="flex items-center gap-2">
          <ThemeLogo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <NavLinks pathname={pathname} className="space-x-1" />
          <UserAuth />
          <ThemeToggle />
        </div>

        {/* Mobile Navigation - Client Component */}
        <div className="flex md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
