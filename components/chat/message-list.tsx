"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/lib/types/chat-types"
import { MessageItem } from "./message-item"

interface MessageListProps {
  messages: Message[]
  sessionId: string
  isLoading?: boolean
}

export function MessageList({ messages, sessionId, isLoading = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex flex-col w-full overflow-y-auto px-4 py-4">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          sessionId={sessionId}
          previousMessageId={index > 0 ? messages[index - 1].id : undefined}
          isLastMessage={index === messages.length - 1 && !isLoading}
        />
      ))}

      {isLoading && (
        <div className="flex items-center justify-start mb-4">
          <div className="flex space-x-2 p-3 bg-muted rounded-md">
            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-75" />
            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-150" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
