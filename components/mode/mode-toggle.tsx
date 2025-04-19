"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Brain, Headphones } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ModeToggleProps {
  userId: string
  sessionId: string
  onModeChange?: (mode: "insight" | "listening") => void
}

export function ModeToggle({ userId, sessionId, onModeChange }: ModeToggleProps) {
  const [isInsightMode, setIsInsightMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch initial mode on component mount
  useEffect(() => {
    async function fetchMode() {
      try {
        const response = await fetch(`/api/session/mode?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setIsInsightMode(data.mode === "insight")
        }
      } catch (error) {
        console.error("Error fetching mode:", error)
      }
    }

    fetchMode()
  }, [sessionId])

  const handleToggle = async (checked: boolean) => {
    const newMode = checked ? "insight" : "listening"
    setIsLoading(true)

    try {
      const response = await fetch("/api/session/mode", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          mode: newMode,
        }),
      })

      if (response.ok) {
        setIsInsightMode(checked)

        if (onModeChange) {
          onModeChange(newMode)
        }

        toast({
          title: `${newMode.charAt(0).toUpperCase() + newMode.slice(1)} Mode Activated`,
          description: checked
            ? "Pulse will provide deeper insights and analysis."
            : "Pulse will listen and acknowledge without deep analysis.",
        })
      } else {
        throw new Error("Failed to update mode")
      }
    } catch (error) {
      console.error("Error updating mode:", error)
      toast({
        title: "Error",
        description: "Failed to update mode. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Headphones className={`h-5 w-5 transition-colors ${!isInsightMode ? "text-primary" : "text-muted-foreground/70"}`} />
        <Label htmlFor="mode-toggle" className="cursor-pointer">
          {isInsightMode ? "Insight Mode" : "Listening Mode"}
        </Label>
        <Brain className={`h-5 w-5 transition-colors ${isInsightMode ? "text-primary" : "text-muted-foreground/70"}`} />
      </div>
      <Switch
        id="mode-toggle"
        checked={isInsightMode}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        aria-label="Toggle between Insight and Listening mode"
      />
    </div>
  )
}
