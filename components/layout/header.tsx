"use client"

import Link from "next/link"
import { MessageSquareIcon } from "lucide-react"
import HeaderNav from "./header-nav"
import MobileNav from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2" aria-label="Global Pulse Home">
            <MessageSquareIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="hidden font-bold sm:inline-block">Global Pulse</span>
          </Link>
        </div>

        {/* Desktop Navigation - Server Component */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <HeaderNav />
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
