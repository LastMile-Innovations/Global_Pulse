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
  const [isFocused, setIsFocused] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <Card
      ref={cardRef}
      className={cn(
        "transition-all duration-300 overflow-hidden group relative h-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
        accentColorClass
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={onClick}
      tabIndex={tabIndex ?? 0}
      role="region"
      aria-label={ariaLabel ?? title}
      aria-pressed={!!onClick ? isFocused : undefined}
      data-testid="feature-card"
    >
      <CardHeader>
        <div
          className={cn(
            "p-3 w-16 h-16 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300",
            "bg-primary/10 group-hover:bg-primary/20 group-focus-visible:bg-primary/20"
          )}
        >
          {icon}
        </div>
        <CardTitle
          className={cn(
            "text-xl font-bold transition-colors duration-300 text-balance",
            "group-hover:text-primary group-focus-visible:text-primary"
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed text-balance">{description}</p>
      </CardContent>
    </Card>
  )
}
