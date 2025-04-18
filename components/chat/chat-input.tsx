"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { autoResizeTextarea } from "@/lib/utils/chat-utils"

interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  isDisabled: boolean
}

export function ChatInput({ value, onChange, isDisabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current)
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
      e.preventDefault()
      // The form submission is now handled by the parent component
      const form = textareaRef.current?.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <div className="relative flex items-end rounded-lg border bg-white shadow-sm">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Message Pulse..."
        className="min-h-[60px] max-h-[200px] flex-1 resize-none border-0 p-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={isDisabled}
        rows={1}
      />
      <div className="flex-shrink-0 p-2">
        <Button
          type="submit"
          disabled={isDisabled || !value.trim()}
          className="h-10 w-10 rounded-full bg-purple-600 p-2 hover:bg-purple-700"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
