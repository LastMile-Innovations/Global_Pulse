"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PulseButtonProps {
  href: string
  children: React.ReactNode
  prefetch?: boolean
  className?: string
  disabled?: boolean
  tabIndex?: number
  "aria-label"?: string
  variant?: "primary" | "secondary" | "accent"
}

/**
 * PulseButton
 * A visually engaging call-to-action button with periodic attention-grabbing animation and interactive highlight.
 * - Animates on mount and every 8 seconds.
 * - Arrow icon animates on hover and during pulse.
 * - Features gradient background and shine effect.
 * - Fully accessible and customizable.
 */
export default function PulseButton({
  href,
  children,
  prefetch = false,
  className = "",
  disabled = false,
  tabIndex,
  "aria-label": ariaLabel,
  variant = "primary",
}: PulseButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false)
  const [isShining, setIsShining] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const shineTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Animation logic: pulse on mount and every 8s
  useEffect(() => {
    // Start initial animation after 2s
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(true)

      // Trigger shine effect 200ms after pulse starts
      shineTimeoutRef.current = setTimeout(() => {
        setIsShining(true)

        // Reset shine after animation completes
        shineTimeoutRef.current = setTimeout(() => {
          setIsShining(false)
        }, 1000)
      }, 200)

      // Reset pulse after animation completes
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false)
      }, 1000)
    }, 2000)

    // Repeat animation every 8s
    intervalRef.current = setInterval(() => {
      setIsAnimating(true)

      // Trigger shine effect 200ms after pulse starts
      shineTimeoutRef.current = setTimeout(() => {
        setIsShining(true)

        // Reset shine after animation completes
        shineTimeoutRef.current = setTimeout(() => {
          setIsShining(false)
        }, 1000)
      }, 200)

      // Reset pulse after animation completes
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false)
      }, 1000)
    }, 8000)

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (shineTimeoutRef.current) clearTimeout(shineTimeoutRef.current)
    }
  }, [])

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          button: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          gradient: "from-secondary/80 to-secondary",
          shine: "from-white/0 via-white/30 to-white/0",
        }
      case "accent":
        return {
          button: "bg-accent text-accent-foreground hover:bg-accent/90",
          gradient: "from-accent/80 to-accent",
          shine: "from-white/0 via-white/30 to-white/0",
        }
      case "primary":
      default:
        return {
          button: "bg-primary text-primary-foreground hover:bg-primary/90",
          gradient: "from-primary/80 to-primary",
          shine: "from-white/0 via-white/30 to-white/0",
        }
    }
  }

  const variantStyles = getVariantStyles()

  // Accessibility: use provided aria-label or fallback
  const computedAriaLabel = ariaLabel || (typeof children === "string" ? children : "Call to action")

  return (
    <Button
      size="lg"
      className={cn(
        // Base styles
        "h-14 text-base font-semibold relative overflow-hidden rounded-full",
        // Animation styles
        "transition-all duration-300",
        // Focus styles
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Variant styles
        variantStyles.button,
        // Animation state
        isAnimating ? "scale-[1.03] shadow-lg" : "scale-100",
        // Disabled state
        disabled ? "opacity-60 pointer-events-none" : "",
        // Custom class
        className,
      )}
      asChild
      disabled={disabled}
      tabIndex={tabIndex}
      aria-disabled={disabled}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
    >
      <Link
        href={href}
        prefetch={prefetch}
        aria-label={computedAriaLabel}
        tabIndex={disabled ? -1 : tabIndex}
        draggable={false}
        className="group"
      >
        {/* Content layer (above animations) */}
        <span className="relative z-20 flex items-center justify-center gap-2 px-6">
          {children}
          <ArrowRight
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              isAnimating || isHoveredOrFocused
                ? "translate-x-1"
                : "group-hover:translate-x-1 group-focus:translate-x-1",
            )}
          />
        </span>

        {/* Background gradient */}
        <span
          className={cn(
            "absolute inset-0 z-10 bg-gradient-to-r transition-opacity duration-300",
            variantStyles.gradient,
            isHoveredOrFocused || isAnimating ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Shine effect */}
        <span
          className={cn(
            "absolute inset-0 z-10 bg-gradient-to-r -skew-x-12 translate-x-[-100%] transition-transform duration-1000",
            variantStyles.shine,
            isShining ? "translate-x-[200%]" : "translate-x-[-100%]",
          )}
        />

        {/* Pulse ring (appears during animation) */}
        <span
          className={cn(
            "absolute inset-0 -m-1 rounded-full opacity-0 transition-all duration-1000 border-2",
            isAnimating ? "scale-[1.08] opacity-30 border-current" : "scale-100 opacity-0",
          )}
        />
      </Link>
    </Button>
  )
} 