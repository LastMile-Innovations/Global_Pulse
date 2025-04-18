"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { NavLinks } from "./header"
import { UserAuth, ThemeToggle, ThemeLogo } from "./header-client"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change for better UX
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Trap focus inside the sheet when open (accessibility improvement)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    },
    []
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[80vw] sm:w-[350px] pr-0 flex flex-col h-full bg-background text-foreground"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col gap-6 px-2 h-full">
          <div className="flex items-center justify-between pt-2">
            <div className="flex-1">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={() => setOpen(false)}
                aria-label="Global Pulse Home"
                tabIndex={0}
              >
                {/* Use ThemeLogo for brand consistency */}
                <span className="h-8 w-auto">
                  <ThemeLogo />
                </span>
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav aria-label="Mobile main navigation">
            <NavLinks
              pathname={pathname}
              className="flex flex-col space-y-2"
              onClick={() => setOpen(false)}
            />
          </nav>

          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
            <UserAuth />
            <Button
              asChild
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-standard shadow-glow"
              size="lg"
            >
              <Link href="/waitlist" onClick={() => setOpen(false)}>
                Join Waitlist
              </Link>
            </Button>
          </div>

          <div className="mt-auto pt-4 border-t border-border flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
