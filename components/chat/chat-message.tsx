"use client"
import type { Message as AIMessage } from "ai"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/shared/icons"
import { Separator } from "@/components/ui/separator"
import { type Message } from "ai/react"
import MultipleChoiceInput from "../genui/multiple-choice-input"
import SliderInput from "../genui/slider-input"
import ButtonsInput from "../genui/buttons-input"
import { CoherenceCheck } from "./coherence-check"

// Define the structure of parts within message.content when it's an array
// Based on usage within the component
type MessagePart = 
  | { type: 'text'; text: string }
  | { type: 'tool_call'; tool_call: { id: string; name: string; parameters: Record<string, unknown> } };

// Extend the Message type from the AI package to support our custom content format
type Message = Omit<AIMessage, 'content'> & {
  content: string | MessagePart[]
};

interface ChatMessageProps {
  message: Message
  isLastMessage?: boolean
}

export default function ChatMessage({ message, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  // Function to render different parts of the message
  const renderMessageContent = () => {
    // If the message is a simple text message
    if (typeof message.content === "string") {
      return <p className="whitespace-pre-wrap">{message.content}</p>
    }

    // If the message has parts (for Generative UI)
    if (Array.isArray(message.content)) {
      return message.content.map((part: MessagePart, index: number) => {
        // Text part
        if (part.type === "text") {
          return (
            <p key={index} className="whitespace-pre-wrap mb-4">
              {part.text}
            </p>
          )
        }

        // Tool calls for Generative UI
        if (part.type === "tool_call") {
          const toolCall = part.tool_call

          // Multiple choice question
          if (toolCall.name === "multiple_choice_question") {
            const params = toolCall.parameters as {
              question_id: string
              question_text: string
              options: { id: string; text: string }[]
            }

            return (
              <div key={index} className="mt-4">
                <p className="font-medium mb-2">{params.question_text}</p>
                <MultipleChoiceInput questionId={params.question_id} options={params.options} chatId={message.id} />
              </div>
            )
          }

          // Slider scale question
          if (toolCall.name === "slider_scale_question") {
            const params = toolCall.parameters as {
              question_id: string
              question_text: string
              min: number
              max: number
              min_label?: string
              max_label?: string
              step?: number
              default_value?: number
            }

            return (
              <div key={index} className="mt-4">
                <p className="font-medium mb-2">{params.question_text}</p>
                <SliderInput
                  questionId={params.question_id}
                  min={params.min}
                  max={params.max}
                  minLabel={params.min_label}
                  maxLabel={params.max_label}
                  step={params.step || 1}
                  defaultValue={params.default_value || Math.floor((params.min + params.max) / 2)}
                  chatId={message.id}
                />
              </div>
            )
          }

          // Buttons question
          if (toolCall.name === "buttons_question") {
            const params = toolCall.parameters as {
              question_id: string
              question_text: string
              options: { id: string; text: string }[]
            }

            return (
              <div key={index} className="mt-4">
                <p className="font-medium mb-2">{params.question_text}</p>
                <ButtonsInput questionId={params.question_id} options={params.options} chatId={message.id} />
              </div>
            )
          }

          // Default case for unknown tool calls
          return (
            <p key={index} className="text-muted-foreground italic">
              Unsupported interaction
            </p>
          )
        }

        return null
      })
    }

    return null
  }

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar for assistant */}
      {isAssistant && (
        <div className="flex-shrink-0 bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center">
          <Bot className="h-5 w-5" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "rounded-lg px-4 py-3 max-w-[85%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted border",
          isLastMessage && isAssistant && "animate-pulse",
        )}
      >
        {renderMessageContent()}
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div className="flex-shrink-0 bg-background border border-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}
