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
          ? "bg-purple-100 text-purple-800 border-purple-200"
          : "bg-blue-100 text-blue-800 border-blue-200"
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
