"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Plus, MessageSquare, Settings, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ChatSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 left-3 z-50 md:hidden"
        onClick={toggleMobileSidebar}
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and new chat */}
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-sidebar-primary" />
              <span className="text-lg font-bold">Global Pulse</span>
            </Link>
          </div>

          {/* New chat button */}
          <div className="px-3 py-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-sidebar-border bg-sidebar-primary/10 text-sidebar-primary-foreground/80 hover:bg-sidebar-primary/20 hover:text-sidebar-primary-foreground"
              onClick={() => {
                // Clear chat history logic would go here
                setIsMobileOpen(false)
              }}
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          {/* Chat history would go here */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  pathname === "/chat" && "bg-sidebar-primary/10 text-sidebar-foreground",
                )}
                asChild
              >
                <Link href="/chat" onClick={() => setIsMobileOpen(false)}>
                  <MessageSquare className="h-4 w-4" />
                  Current Chat
                </Link>
              </Button>
              {/* Chat history items would be mapped here */}
            </div>
          </div>

          {/* Bottom links */}
          <div className="border-t border-sidebar-border p-3">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground" asChild>
                <Link href="/settings" onClick={() => setIsMobileOpen(false)}>
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
