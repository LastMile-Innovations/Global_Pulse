"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Scroll to top on route changes
    window.scrollTo({
      top: 0,
      behavior: "instant", // Use "smooth" for animated scrolling
    })
  }, [pathname, searchParams])

  // This component doesn't render anything
  return null
}
