"use client"

import { Brain, Headphones } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ModeIndicatorProps {
  mode: "insight" | "listening"
}

export function ModeIndicator({ mode }: ModeIndicatorProps) {
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 ${
        mode === "insight"
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-secondary/10 text-secondary border-secondary/20"
      }`}
      aria-label={`Current mode: ${mode === "insight" ? "Insight" : "Listening"}`}
    >
      {mode === "insight" ? (
        <>
          <Brain className="h-3 w-3" aria-hidden="true" />
          <span>Insight Mode</span>
        </>
      ) : (
        <>
          <Headphones className="h-3 w-3" aria-hidden="true" />
          <span>Listening Mode</span>
        </>
      )}
    </Badge>
  )
}
