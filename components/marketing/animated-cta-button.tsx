"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface AnimatedCTAButtonProps {
  href: string
  children: React.ReactNode
  prefetch?: boolean
  className?: string
  disabled?: boolean
  tabIndex?: number
  "aria-label"?: string
}

/**
 * AnimatedCTAButton
 * A visually engaging call-to-action button with periodic attention-grabbing animation and interactive highlight.
 * - Animates on mount and every 8 seconds.
 * - Arrow icon animates on hover and during pulse.
 * - Accessible and customizable.
 */
export default function AnimatedCTAButton({
  href,
  children,
  prefetch = false,
  className = "",
  disabled = false,
  tabIndex,
  "aria-label": ariaLabel,
}: AnimatedCTAButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Animation logic: pulse on mount and every 8s
  useEffect(() => {
    // Start initial animation after 2s
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(true)
      animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 1000)
    }, 2000)

    // Repeat animation every 8s
    intervalRef.current = setInterval(() => {
      setIsAnimating(true)
      animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 1000)
    }, 8000)

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Compose class names for the button
  const buttonClasses = [
    "gap-2 h-14 text-base group relative overflow-hidden rounded-full font-semibold transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    isAnimating ? "animate-pulse-slow shadow-glow" : "",
    className,
    disabled ? "opacity-60 pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ")

  // Compose class names for the highlight effect
  const highlightClasses = [
    "absolute inset-0 bg-white/20 skew-x-[-20deg] pointer-events-none",
    isAnimating || isHovered ? "animate-gradient-x" : "transition-none",
    isAnimating || isHovered ? "opacity-60" : "opacity-0",
    "duration-700"
  ].join(" ")

  // Compose class names for the background gradient on hover
  const bgGradientClasses =
    "absolute inset-0 bg-gradient-to-r from-primary to-blue-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"

  // Compose class names for the arrow icon
  const arrowClasses = [
    "h-5 w-5 ml-1 transition-transform duration-300",
    isAnimating || isHovered ? "translate-x-1" : "",
    !isAnimating && !isHovered ? "group-hover:translate-x-1" : "",
  ]
    .filter(Boolean)
    .join(" ")

  // Accessibility: use provided aria-label or fallback
  const computedAriaLabel =
    ariaLabel ||
    (typeof children === "string"
      ? children
      : "Call to action")

  return (
    <Button
      size="lg"
      className={buttonClasses}
      asChild
      disabled={disabled}
      tabIndex={tabIndex}
      aria-disabled={disabled}
    >
      <Link
        href={href}
        prefetch={prefetch}
        aria-label={computedAriaLabel}
        tabIndex={disabled ? -1 : tabIndex}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        draggable={false}
      >
        <span className="relative z-10 flex items-center">
          {children}
          <ArrowRight className={arrowClasses} />
        </span>
        {/* Hover background gradient */}
        <span className={bgGradientClasses} aria-hidden="true"></span>
        {/* Animated highlight effect */}
        <span className={highlightClasses} aria-hidden="true"></span>
      </Link>
    </Button>
  )
}
