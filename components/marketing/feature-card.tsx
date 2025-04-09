"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export default function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-300 overflow-hidden group relative h-full",
        isHovered ? "border-primary/50 shadow-lg translate-y-[-5px]" : "border-border hover:shadow-md",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader>
        <div
          className={cn(
            "p-3 w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
            isHovered ? "bg-primary/20 scale-110" : "bg-primary/10",
          )}
        >
          {icon}
        </div>
        <CardTitle className={cn("text-xl transition-all duration-300", isHovered ? "text-primary" : "")}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-primary/10 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Card>
  )
}
