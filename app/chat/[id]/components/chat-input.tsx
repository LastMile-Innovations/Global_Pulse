"use client"

import type React from "react"

import type { FormEvent } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        className="flex-1 p-3 border rounded-md resize-none bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="Type your message here..."
        value={input}
        onChange={handleInputChange}
        rows={1}
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (input.trim()) {
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }
          }
        }}
      />
      <Button type="submit" disabled={isLoading || !input.trim()}>
        <SendHorizontal className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  )
}
