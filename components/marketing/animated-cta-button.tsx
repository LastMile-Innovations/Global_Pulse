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
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Animation logic: pulse on mount and every 8s
  useEffect(() => {
    // Start initial animation after 2s
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(true)
      animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 1000) // Pulse duration
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
    // Use standard button primary styles (defined in globals/ui/button)
    "gap-2 h-14 text-base group relative overflow-hidden rounded-full font-semibold transition-all",
    // Add focus styles
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Apply subtle scaling animation for pulse
    isAnimating ? "scale-[1.03] animate-in fade-in duration-300" : "scale-100 animate-out fade-out duration-300",
    className, // Allow parent override
    disabled ? "opacity-60 pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ")

  // Compose class names for the arrow icon
  const arrowClasses = [
    "h-5 w-5 ml-1 transition-transform duration-300",
    // Move arrow on hover/focus or during pulse animation
    isAnimating || isHoveredOrFocused ? "translate-x-1" : "",
    !isAnimating && !isHoveredOrFocused ? "group-hover:translate-x-1 group-focus:translate-x-1" : "",
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
      onMouseEnter={() => setIsHoveredOrFocused(true)} // Track hover/focus together
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
    >
      <Link
        href={href}
        prefetch={prefetch}
        aria-label={computedAriaLabel}
        tabIndex={disabled ? -1 : tabIndex} // Manage tabIndex based on disabled state
        draggable={false}
      >
        <span className="relative z-10 flex items-center">
          {children}
          <ArrowRight className={arrowClasses} />
        </span>
        {/* Removed background gradient and highlight spans */}
      </Link>
    </Button>
  )
}
