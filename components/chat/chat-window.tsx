"use client"

import { useChat } from "ai/react"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { ChatSidebar } from "./chat-sidebar"
import { ChatHeader } from "./chat-header"
import { useState, useEffect } from "react"
import { logger } from "@/lib/utils/logger"

interface ChatWindowProps {
  userId: string
  sessionId: string
}

export function ChatWindow({ userId, sessionId }: ChatWindowProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<"insight" | "listening">("insight") // Default to insight

  // Fetch initial mode on mount
  useEffect(() => {
    async function fetchInitialMode() {
      try {
        const response = await fetch(`/api/session/mode?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentMode(data.mode)
        }
      } catch (error) {
        logger.error("Error fetching initial mode:", error)
      }
    }

    fetchInitialMode()
  }, [sessionId])

  // Handle mode change
  const handleModeChange = (mode: "insight" | "listening") => {
    setCurrentMode(mode)
  }

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    reload,
    stop,
    setMessages,
    addToolResult,
  } = useChat({
    api: "/api/chat",
    id: sessionId,
    body: {
      userId,
      sessionId,
    },
    onError: (error) => {
      logger.error("Chat error:", error)
    },
    onToolCall: async ({ toolCall }) => {
      // Handle client-side tools
      try {
        if (toolCall.toolName === "getClientLocation") {
          // Check if geolocation is available
          if (!navigator.geolocation) {
            return {
              error: "Geolocation is not supported by this browser.",
            }
          }

          // Get the user's location
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                try {
                  // Get city name from coordinates using a reverse geocoding service
                  const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
                  )
                  const data = await response.json()

                  resolve({
                    city: data.city || "Unknown city",
                    locality: data.locality || "Unknown locality",
                    countryName: data.countryName || "Unknown country",
                    coordinates: {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                    },
                  })
                } catch (error) {
                  resolve({
                    coordinates: {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                    },
                    error: "Could not determine city name",
                  })
                }
              },
              (error) => {
                let errorMessage = "Unknown error occurred while retrieving location."

                switch (error.code) {
                  case error.PERMISSION_DENIED:
                    errorMessage = "Location permission denied by user."
                    break
                  case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable."
                    break
                  case error.TIMEOUT:
                    errorMessage = "The request to get location timed out."
                    break
                }

                resolve({ error: errorMessage })
              },
            )
          })
        }

        // For askForConfirmation, we don't return anything here
        // as it will be handled by the UI components
        if (toolCall.toolName === "askForConfirmation") {
          return undefined // Let the UI handle this
        }

        return { error: `Unknown client tool: ${toolCall.toolName}` }
      } catch (error) {
        logger.error(`Error in onToolCall for ${toolCall.toolName}:`, error)
        return { error: `Error executing client tool: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader
        userId={userId}
        sessionId={sessionId}
        mode={currentMode}
        onModeChange={handleModeChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-auto p-4">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              sessionId={sessionId}
              addToolResult={addToolResult}
            />
          </div>
          <div className="border-t p-4">
            <ChatInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
