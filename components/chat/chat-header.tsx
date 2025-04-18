"use client"

import { ModeIndicator } from "../mode/mode-indicator"
import { ModeToggle } from "../mode/mode-toggle"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  userId: string
  sessionId: string
  mode: "insight" | "listening"
  onModeChange?: (mode: "insight" | "listening") => void
  onSettingsClick?: () => void
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
}

export function ChatHeader({
  userId,
  sessionId,
  mode,
  onModeChange,
  onSettingsClick,
  sidebarOpen,
  setSidebarOpen,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b p-3">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Pulse Agent</h1>
        <ModeIndicator mode={mode} />
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle userId={userId} sessionId={sessionId} onModeChange={onModeChange} />
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </div>
  )
}
