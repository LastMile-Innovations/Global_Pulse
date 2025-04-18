"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
  accentColorClass?: string // e.g. "card-blue", "card-green", etc.
  onClick?: () => void
  tabIndex?: number
  "aria-label"?: string
}

/**
 * FeatureCard
 * A visually engaging card for marketing features.
 * - Animated hover/focus effects
 * - Accessible (keyboard, ARIA)
 * - Customizable accent color
 */
export default function FeatureCard({
  icon,
  title,
  description,
  className = "",
  accentColorClass = "",
  onClick,
  tabIndex,
  "aria-label": ariaLabel,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Combine hover and focus for animation
  const isActive = isHovered || isFocused

  return (
    <Card
      ref={cardRef}
      className={cn(
        "border-2 transition-all duration-300 overflow-hidden group relative h-full rounded-standard outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive
          ? "border-primary/60 shadow-glow translate-y-[-6px] scale-[1.025] z-10"
          : "border-border hover:shadow-md",
        accentColorClass,
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={onClick}
      tabIndex={tabIndex ?? 0}
      role="region"
      aria-label={ariaLabel ?? title}
      aria-pressed={!!onClick ? isActive : undefined}
      data-testid="feature-card"
    >
      {/* Animated background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none transition-opacity duration-300",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        aria-hidden="true"
      />

      <CardHeader>
        <div
          className={cn(
            "p-3 w-16 h-16 rounded-standard-xl flex items-center justify-center mb-4 transition-all duration-300 shadow-md",
            isActive
              ? "bg-primary/20 scale-110 animate-pulse-subtle shadow-glow"
              : "bg-primary/10"
          )}
        >
          {icon}
        </div>
        <CardTitle
          className={cn(
            "text-xl font-bold transition-all duration-300 text-balance",
            isActive ? "text-primary drop-shadow" : ""
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed text-balance">{description}</p>
      </CardContent>

      {/* Decorative corner accent */}
      <div
        className={cn(
          "absolute bottom-0 right-0 w-12 h-12 bg-primary/10 rounded-standard-xl pointer-events-none transition-opacity duration-300",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        aria-hidden="true"
      />
      {/* Optional focus ring for accessibility */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-standard ring-2 ring-primary ring-offset-2 transition-all duration-200",
          isFocused ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />
    </Card>
  )
}
