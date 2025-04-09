"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import HeaderNav from "./header-nav"
import MobileNav from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const { theme } = useTheme()
  const logo = theme === "dark" ? "/global_pulse_logo_dark.png" : "/global_pulse_logo_light.png"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-30 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2" aria-label="Global Pulse Home">
            <Image
              src={logo}
              alt="Global Pulse Logo"
              width={100}
              height={100}
              className=""
            />
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
