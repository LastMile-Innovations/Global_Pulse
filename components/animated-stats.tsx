"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"

interface AnimatedStatProps {
  value: string
  label: string
  icon: React.ReactNode
}

export default function AnimatedStat({ value, label, icon }: AnimatedStatProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView) {
      setIsVisible(true)
    }
  }, [inView])

  // Extract numeric part for animation
  const numericValue = Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  const suffix = value.replace(/[0-9]/g, "").trim()
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    let start = 0
    const end = Math.min(numericValue, 1000) // Cap at 1000 for performance
    const duration = 2000 // 2 seconds
    const increment = end / (duration / 16) // 60fps

    const timer = setInterval(() => {
      start += increment
      setDisplayValue(Math.min(Math.floor(start), end))

      if (start >= end) {
        clearInterval(timer)
        setDisplayValue(numericValue)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, numericValue])

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center p-8 bg-background rounded-2xl border-2 border-primary/10 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } card-hover-effect`}
    >
      <div className="mb-6 p-4 rounded-full bg-primary/10 text-primary transform transition-transform duration-700 hover:scale-110 hover:bg-primary/20">
        {icon}
      </div>
      <div className="text-4xl font-bold mb-2 flex items-baseline">
        <span className="tabular-nums">{displayValue}</span>
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
