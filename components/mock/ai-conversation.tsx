"use client"

import { useState, useEffect } from "react"
import { Bot, User, SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AiConversation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "What's your opinion on climate action and global cooperation?",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentTypingText, setCurrentTypingText] = useState("")

  useEffect(() => {
    if (messages.length === 2 && messages[1].role === "user") {
      setIsTyping(true)
      let i = 0
      const responseText =
        "Thanks for sharing. How do you feel about the role of developed vs. developing nations in addressing climate change?"
      const typingInterval = setInterval(() => {
        if (i < responseText.length) {
          setCurrentTypingText(responseText.substring(0, i + 1))
          i++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
          setMessages([
            ...messages,
            {
              role: "assistant",
              content: responseText,
            },
          ])
          setCurrentTypingText("")
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          role: "user",
          content: inputValue,
        },
      ])
      setInputValue("")
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-background shadow-md flex flex-col h-[400px]">
      <div className="bg-muted/30 p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">AI Conversation</span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
          >
            {message.role === "assistant" && (
              <div className="bg-primary/20 text-primary rounded-full p-1">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border/50"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="bg-background border border-primary/20 text-primary rounded-full p-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-start gap-2">
            <div className="bg-primary/20 text-primary rounded-full p-1">
              <Bot className="h-4 w-4" />
            </div>
            <div className="max-w-[80%] rounded-lg p-3 bg-muted border border-border/50">
              <p className="text-sm">{currentTypingText}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Share your thoughts..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage()
            }}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSendMessage}>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
