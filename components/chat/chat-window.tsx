"use client"

import { useChat, type Message } from "ai/react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatHeader } from "./chat-header"
import ChatInput from "./chat-input"
import { MessageList } from "./message-list"
import { useState, useEffect } from "react"
import { logger } from "@/lib/utils/logger"
import type { ChatRequestOptions } from "ai"
import ChatList from "./chat-list"

interface ChatWindowProps {
  endpoint: string
  initialMessages?: Message[]
  initialInput?: string
  chatId: string
}

export function ChatWindow({
  endpoint,
  initialMessages = [],
  initialInput = "",
  chatId,
}: ChatWindowProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<"insight" | "listening">("insight")

  useEffect(() => {
    async function fetchInitialMode() {
      try {
        const response = await fetch(`/api/session/mode?sessionId=${chatId}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentMode(data.mode)
        }
      } catch (error) {
        logger.error("Error fetching initial mode:", error)
      }
    }
    fetchInitialMode()
  }, [chatId])

  const handleModeChange = (mode: "insight" | "listening") => {
    setCurrentMode(mode)
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: endpoint,
    initialMessages,
    initialInput,
    id: chatId,
    body: {
      id: chatId,
    },
    onResponse(response) {
      if (response.status === 401) {
        console.error("Unauthorized chat response")
      }
    },
    onError(error) {
      console.error("Chat error:", error)
    },
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ChatSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader 
          userId={undefined as any}
          sessionId={chatId}
          mode={currentMode}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <MessageList messages={messages as any} isLoading={isLoading} sessionId={chatId} />
        </div>

        <div className="border-t bg-background p-4 md:p-6">
          <ChatInput 
            input={input}
            handleInputChange={handleInputChange as any}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
