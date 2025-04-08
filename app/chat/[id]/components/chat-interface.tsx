"use client"

import { useEffect, useRef } from "react"
import { useChat } from "ai/react"
import type { Message } from "ai"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatMessage from "./chat-message"
import ChatInput from "./chat-input"

interface ChatInterfaceProps {
  chatId: string
  initialMessages?: Message[]
}

export default function ChatInterface({ chatId, initialMessages = [] }: ChatInterfaceProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: `/api/chat/${chatId}`,
    id: chatId,
    initialMessages,
    onFinish: () => {
      // Refresh the page to update the chat title if needed
      router.refresh()
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Share your thoughts with Pulse. Your perspective helps build a clearer picture of global opinion.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} isLastMessage={index === messages.length - 1 && isLoading} />
          ))
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
            <p>Something went wrong. Please try again.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => router.refresh()}>
              Reload
            </Button>
          </div>
        )}

        {/* Loading indicator for when AI is generating */}
        {isLoading && (
          <div className="flex items-center text-muted-foreground text-sm">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Pulse is thinking...
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
