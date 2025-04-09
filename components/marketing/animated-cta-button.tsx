"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface AnimatedCTAButtonProps {
  href: string
  children: React.ReactNode
  prefetch?: boolean
}

export default function AnimatedCTAButton({ href, children, prefetch = false }: AnimatedCTAButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Initial animation after a delay
    const initialTimeout = setTimeout(() => {
      setIsAnimating(true)

      // Reset animation after it completes
      setTimeout(() => {
        setIsAnimating(false)
      }, 1000)
    }, 2000)

    // Subtle attention animation that repeats occasionally
    const interval = setInterval(() => {
      setIsAnimating(true)

      // Reset animation after it completes
      setTimeout(() => {
        setIsAnimating(false)
      }, 1000)
    }, 8000) // Every 8 seconds

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <Button
      size="lg"
      className={`gap-2 h-14 text-base group relative overflow-hidden ${
        isAnimating ? "animate-pulse shadow-lg shadow-primary/20" : ""
      }`}
      asChild
    >
      <Link href={href} prefetch={prefetch}>
        <span className="relative z-10 flex items-center">
          {children}
          <ArrowRight
            className={`h-5 w-5 ml-1 transition-transform ${
              isAnimating ? "translate-x-1" : "group-hover:translate-x-1"
            }`}
          />
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-200/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>

        {/* Animated highlight effect */}
        <span
          className={`absolute inset-0 bg-white/20 skew-x-[-20deg] translate-x-[-150%] ${
            isAnimating ? "animate-[highlight_1s_ease_forwards]" : ""
          }`}
        ></span>
      </Link>
    </Button>
  )
}
