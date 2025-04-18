import Link from "next/link"
import { cn } from "@/lib/utils"
import MobileNav from "./mobile-nav"
import { ThemeLogo, ThemeToggle, UserAuth } from "./header-client"
import { Button } from "@/components/ui/button"

interface NavLink {
  href: string
  label: string
  prefetch: boolean
}

const marketingLinks: NavLink[] = [
  { href: "/mission", label: "Our Mission", prefetch: true },
  { href: "/features", label: "Features", prefetch: true },
  { href: "/about", label: "About", prefetch: true },
  { href: "/faq", label: "FAQ", prefetch: true },
  { href: "/contact", label: "Contact", prefetch: false },
  { href: "/terms", label: "Terms", prefetch: false },
]

const appLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", prefetch: true },
  { href: "/explore", label: "Explore", prefetch: true },
  { href: "/survey", label: "Survey", prefetch: true },
  { href: "/chat", label: "Chat", prefetch: true },
]

interface NavLinksProps {
  pathname: string
  className?: string
  onClick?: () => void
}

export function NavLinks({ pathname, className, onClick }: NavLinksProps) {
  const isMarketing = pathname === "/" || pathname.startsWith("/(marketing)")
  const links = isMarketing ? marketingLinks : appLinks

  return (
    <nav
      className={cn("flex items-center", className)}
      aria-label="Main navigation"
    >
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={link.prefetch}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
            onClick={onClick}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Header({ pathname = "/" }: { pathname?: string }) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <ThemeLogo />
        </div>
        <div className="hidden md:flex md:items-center md:gap-3">
          <NavLinks pathname={pathname} className="space-x-1" />
          <Button
            size="sm"
            className="h-9 rounded-standard shadow-glow animate-pulse-subtle px-4 bg-primary hover:bg-primary/90"
            asChild
          >
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
          <UserAuth />
          <ThemeToggle />
        </div>
        <div className="flex md:hidden">
          {MobileNav ? <MobileNav /> : <NavLinks pathname={pathname} />}
        </div>
      </div>
    </header>
  )
}
