"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

interface AnimatedStatsProps {
  value: string | number
  label: string
  icon: React.ReactNode
  durationMs?: number
  className?: string
  valueClassName?: string
  labelClassName?: string
  iconClassName?: string
  formatValue?: (n: number) => string
  ariaLabel?: string
}

/**
 * AnimatedStats
 * Displays a stat with animated counting, icon, and label.
 * - Animates when scrolled into view.
 * - Supports custom formatting, duration, and accessibility.
 */
export default function AnimatedStats({
  value,
  label,
  icon,
  durationMs = 1800,
  className = "",
  valueClassName = "",
  labelClassName = "",
  iconClassName = "",
  formatValue,
  ariaLabel,
}: AnimatedStatsProps) {
  // Parse value and suffix
  let numericValue: number
  let suffix: string
  if (typeof value === "number") {
    numericValue = value
    suffix = ""
  } else {
    // e.g. "1,234+" or "1.2k"
    const match = value.match(/^([\d,\.]+)\s*([^\d,\.]*)$/)
    if (match) {
      numericValue = Number(match[1].replace(/,/g, "")) || 0
      suffix = match[2].trim()
    } else {
      numericValue = Number(value.replace(/[^0-9.]/g, "")) || 0
      suffix = value.replace(/[0-9.,]/g, "").trim()
    }
  }

  // Animate when in view
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.25,
    triggerOnce: true,
  })
  const animationFrame = useRef<number | null>(null)

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true)
      let start: number | null = null
      const from = 0
      const to = numericValue
      const animate = (timestamp: number) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / durationMs, 1)
        const current = Math.floor(from + (to - from) * progress)
        setDisplayValue(current)
        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(animate)
        } else {
          setDisplayValue(to)
        }
      }
      animationFrame.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, numericValue, durationMs])

  // Format value for display
  const formattedValue =
    typeof formatValue === "function"
      ? formatValue(displayValue)
      : displayValue.toLocaleString()

  return (
    <div
      ref={ref}
      aria-label={ariaLabel || `${formattedValue}${suffix} ${label}`}
      className={[
        "flex flex-col items-center text-center p-8 bg-background rounded-2xl border-2 border-primary/10 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-700",
        hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        "card-hover-effect",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      role="region"
    >
      <div
        className={[
          "mb-6 p-4 rounded-full bg-primary/10 text-primary transform transition-transform duration-700 hover:scale-110 hover:bg-primary/20",
          iconClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div
        className={[
          "text-4xl font-bold mb-2 flex items-baseline tabular-nums",
          valueClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span>{formattedValue}</span>
        {suffix && (
          <span className="text-primary ml-1">{suffix}</span>
        )}
      </div>
      <div
        className={[
          "text-sm text-muted-foreground",
          labelClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </div>
    </div>
  )
}
