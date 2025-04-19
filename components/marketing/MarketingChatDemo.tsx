"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// --- Types for Demo ---
type DemoRole = "user" | "assistant" | "ui" | "ui_response"

interface DemoMessageBase {
  id: string
  role: DemoRole
}

interface TextMessage extends DemoMessageBase {
  role: "user" | "assistant"
  content: string
  explanation?: string // Optional explanation for assistant messages
}

interface UiMessage extends DemoMessageBase {
  role: "ui"
  uiType: "multipleChoice" | "buttons" | "slider"
  question: string
  options?: { id: string; text: string }[]
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
}

interface UiResponseMessage extends DemoMessageBase {
  role: "ui_response"
  content: string // Display text like "Selected: 'Option A'"
  originalUiId: string // ID of the UI message it responds to
}

type DemoMessage = TextMessage | UiMessage | UiResponseMessage

// --- The Final Conversation Script ---
type ConversationScriptItem =
  | { role: "assistant"; content: string; explanation?: string }
  | { role: "user"; content: string }
  | {
      role: "ui"
      uiType: "multipleChoice" | "buttons" | "slider"
      question: string
      options?: { id: string; text: string }[]
      min?: number
      max?: number
      minLabel?: string
      maxLabel?: string
    }

const conversationScript: ConversationScriptItem[] = [
  {
    role: "assistant",
    content: "Hello, I'm Pulse. I'm here to help you reflect on your thoughts and feelings about technology and its impact. What's on your mind today?",
  },
  { role: "user", content: "I've been thinking about the challenges of AI safety and alignment." },
  {
    role: "assistant",
    content: "That's a crucial topic. When you think about AI safety, which of these areas feels most important to you right now?",
    explanation: "This question helps the user focus on a specific aspect of AI safety, making the conversation more meaningful.",
  },
  {
    role: "ui",
    uiType: "multipleChoice",
    question: "Which aspect of AI safety concerns you most?",
    options: [
      { id: "unintended", text: "Unintended consequences" },
      { id: "misuse", text: "Misuse by bad actors" },
      { id: "alignment", text: "Difficulty aligning AI with human values" },
      { id: "transparency", text: "Lack of transparency/understanding" },
      { id: "other", text: "Other" },
    ],
  },
  {
    role: "assistant",
    content:
      "Thank you for sharing. Many people share concerns about that. In your view, how likely is it that we will make significant progress on AI alignment in the next decade?",
    explanation:
      "This question gauges the user's optimism and helps transition to a more quantitative assessment.",
  },
  {
    role: "ui",
    uiType: "multipleChoice",
    question: "How optimistic are you about solving the AI alignment problem in the next 10 years?",
    options: [
      { id: "opt-very-opt", text: "Very Optimistic" },
      { id: "opt-somewhat-opt", text: "Somewhat Optimistic" },
      { id: "opt-neutral", text: "Neutral" },
      { id: "opt-somewhat-pes", text: "Somewhat Pessimistic" },
      { id: "opt-very-pes", text: "Very Pessimistic" },
    ],
  },
  {
    role: "assistant",
    content:
      "That's insightful. When it comes to ensuring AI is developed safely, who do you think should bear the greatest responsibility?",
    explanation:
      "This question explores the user's perspective on accountability and the roles of different stakeholders.",
  },
  {
    role: "ui",
    uiType: "buttons",
    question: "Who should have the primary responsibility for AI safety?",
    options: [
      { id: "resp-devs", text: "AI Developers/Companies" },
      { id: "resp-gov", text: "Governments/Regulators" },
      { id: "resp-independent", text: "Independent Bodies" },
      { id: "resp-shared", text: "Shared Responsibility" },
    ],
  },
  {
    role: "assistant",
    content:
      "Thank you. Assigning responsibility is complex and often involves balancing innovation, regulation, and public interest. What do you think is the biggest barrier to effective AI safety?",
    explanation:
      "This question encourages deeper reflection on the obstacles to progress, inviting the user to consider systemic challenges.",
  },
  {
    role: "ui",
    uiType: "multipleChoice",
    question: "What do you see as the biggest barrier to effective AI safety?",
    options: [
      { id: "tech-limits", text: "Technical limitations" },
      { id: "incentives", text: "Misaligned incentives" },
      { id: "coordination", text: "Lack of global coordination" },
      { id: "awareness", text: "Insufficient public awareness" },
      { id: "other", text: "Other" },
    ],
  },
  {
    role: "assistant",
    content: "Would you like to keep exploring this topic, or would you prefer to pause here?",
    explanation:
      "This open-ended question gives the user agency to continue or conclude, respecting their preferences.",
  },
  {
    role: "ui",
    uiType: "buttons",
    question: "Would you like to continue or pause?",
    options: [
      { id: "continue", text: "Continue" },
      { id: "pause", text: "Pause" },
    ],
  },
  // If "Continue" is selected, show a slider and more dialog. If "Pause", show a closing message.
  // We'll handle this branching in the code, not the script.
  // The following are "continue" branch:
  {
    role: "assistant",
    content: "Let's go a bit deeper. On a scale from 1 (not at all) to 10 (extremely), how concerned are you personally about the risks of advanced AI?",
    explanation: "This question uses a slider to personalize the conversation and quantify the user's concern.",
  },
  {
    role: "ui",
    uiType: "slider",
    question: "Your level of concern about advanced AI risks",
    min: 1,
    max: 10,
    minLabel: "Not at all",
    maxLabel: "Extremely",
  },
  {
    role: "assistant",
    content: "Thank you for sharing your perspective. If you could ask one question to leading AI researchers or policymakers, what would it be?",
    explanation: "This question invites the user to express their curiosity or priorities, making the conversation more interactive.",
  },
  {
    role: "ui",
    uiType: "buttons",
    question: "Would you like to share a question or finish?",
    options: [
      { id: "share-question", text: "Share a question" },
      { id: "finish", text: "Finish" },
    ],
  },
  // If "share-question" is selected, ask for a freeform input (not implemented, so just simulate a user message)
  {
    role: "assistant",
    content: "Please type your question for AI researchers or policymakers.",
    explanation: "Prompting the user to share their question.",
  },
  {
    role: "user",
    content: "What steps are being taken to ensure AI systems are transparent and accountable?",
  },
  {
    role: "assistant",
    content: "That's an excellent question. Transparency and accountability are key areas of ongoing research and policy development. Thank you for your thoughtful participation in this conversation.",
    explanation: "A closing message that acknowledges the user's input and encourages further engagement.",
  },
  // The following is the "pause" or "finish" branch:
  {
    role: "assistant",
    content: "Thank you for the thoughtful conversation! If you want to continue later, just restart the demo.",
    explanation: "A polite closing for users who choose to pause or finish.",
  },
]
// --- End Script ---

// --- Demo UI Components (Improved Design) ---
const DemoMultipleChoice = ({
  question,
  options = [],
  onSelect,
  disabled,
}: {
  question: string
  options: { id: string; text: string }[]
  onSelect: (optionId: string, optionText: string) => void
  disabled: boolean
}) => (
  <Card className="bg-card border-border shadow-none my-2">
    <CardHeader className="pb-2 pt-4">
      <CardTitle className="text-base font-semibold text-foreground">{question}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 pb-4">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          className={cn(
            "w-full justify-start h-auto py-2 px-3 text-left rounded-lg border-2 transition-all duration-150",
            disabled
              ? "opacity-60 cursor-not-allowed border-muted"
              : "hover:bg-primary/10 hover:border-primary/60 border-border"
          )}
          onClick={() => !disabled && onSelect(option.id, option.text)}
          disabled={disabled}
        >
          {option.text}
        </Button>
      ))}
    </CardContent>
  </Card>
)

const DemoButtons = ({
  question,
  options = [],
  onSelect,
  disabled,
}: {
  question: string
  options: { id: string; text: string }[]
  onSelect: (optionId: string, optionText: string) => void
  disabled: boolean
}) => (
  <Card className="bg-card border-border shadow-none my-2">
    <CardHeader className="pb-2 pt-4">
      <CardTitle className="text-base font-semibold text-foreground">{question}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2 pb-4">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full border-2 transition-all duration-150",
            disabled
              ? "opacity-60 cursor-not-allowed border-muted"
              : "hover:bg-primary/10 hover:border-primary/60 hover:text-primary border-border"
          )}
          onClick={() => !disabled && onSelect(option.id, option.text)}
          disabled={disabled}
        >
          {option.text}
        </Button>
      ))}
    </CardContent>
  </Card>
)

const DemoSlider = ({
  question,
  min = 1,
  max = 10,
  minLabel,
  maxLabel,
  onSelect,
  disabled,
}: {
  question: string
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  onSelect: (value: number) => void
  disabled: boolean
}) => {
  const [value, setValue] = useState(Math.floor((min + max) / 2))

  return (
    <Card className="bg-card border-border shadow-none my-2">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base font-semibold text-foreground">{question}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="relative flex flex-col items-center">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
            onMouseUp={() => !disabled && onSelect(value)}
            onTouchEnd={() => !disabled && onSelect(value)}
            disabled={disabled}
            className={cn(
              "w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
              "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          />
          <div className="flex justify-between w-full mt-2 text-xs text-muted-foreground">
            <span>{minLabel ?? min}</span>
            <span>{maxLabel ?? max}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- End Demo UI Components ---

// --- Main Demo Component ---
export default function MarketingChatDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentTypingMessage, setCurrentTypingMessage] = useState<TextMessage | null>(null)
  const [displayedContent, setDisplayedContent] = useState("")
  const [uiInteractionState, setUiInteractionState] = useState<Record<string, boolean>>({})
  const [activeExplanation, setActiveExplanation] = useState<string | null>(null)
  const [branch, setBranch] = useState<"main" | "continue" | "pause" | "finish" | "share-question" | null>(null)
  const [sliderValue, setSliderValue] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Helper to get the next script item, handling branching
  const getScriptItem = (index: number): ConversationScriptItem | null => {
    // Branching logic for the improved, more complete script
    // 0-12: main flow, 13+: continue branch, 18: closing
    if (index === 12 && branch === "pause") {
      return conversationScript[conversationScript.length - 1]
    }
    if (index === 12 && branch === "continue") {
      return conversationScript[12]
    }
    if (index === 13 && branch === "continue") {
      return conversationScript[13]
    }
    if (index === 14 && branch === "continue") {
      return conversationScript[14]
    }
    if (index === 15 && branch === "continue") {
      return conversationScript[15]
    }
    if (index === 16 && branch === "continue") {
      return conversationScript[16]
    }
    if (index === 17 && branch === "share-question") {
      return conversationScript[17]
    }
    if (index === 18 && branch === "share-question") {
      return conversationScript[18]
    }
    if (index === 19 && branch === "share-question") {
      return conversationScript[conversationScript.length - 1]
    }
    if (index === 15 && branch === "finish") {
      return conversationScript[conversationScript.length - 1]
    }
    if (index < conversationScript.length) {
      return conversationScript[index]
    }
    return null
  }

  // Function to add the next message or UI element from the script
  const processNextScriptItem = useCallback(() => {
    let idx = currentScriptIndex
    let item = getScriptItem(idx)
    if (!item) {
      setIsSimulating(false)
      return
    }

    const messageId = `msg-${idx}-${Date.now()}`

    if (item.role === "user" || item.role === "assistant") {
      const newMessage: TextMessage = {
        id: messageId,
        role: item.role,
        content: item.content,
        explanation: (item as any).explanation,
      }
      if (item.role === "assistant") {
        setIsTyping(true)
        setCurrentTypingMessage(newMessage)
        setDisplayedContent("")
        const words = newMessage.content.split(" ")
        let wordIndex = 0
        typingIntervalRef.current = setInterval(() => {
          if (wordIndex < words.length) {
            setDisplayedContent((prev) => prev + (wordIndex > 0 ? " " : "") + words[wordIndex])
            wordIndex++
          } else {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
            setIsTyping(false)
            setCurrentTypingMessage(null)
            setMessages((prev) => [...prev, newMessage])
            setCurrentScriptIndex((prev) => prev + 1)
          }
        }, 100)
      } else {
        setMessages((prev) => [...prev, newMessage])
        setCurrentScriptIndex((prev) => prev + 1)
      }
    } else if (item.role === "ui") {
      const newUiMessage: UiMessage = {
        id: messageId,
        role: "ui",
        uiType: item.uiType,
        question: item.question,
        options: item.options,
        min: item.min,
        max: item.max,
        minLabel: item.minLabel,
        maxLabel: item.maxLabel,
      }
      setMessages((prev) => [...prev, newUiMessage])
      setIsSimulating(false)
    }
  }, [currentScriptIndex, branch])

  // Simulation control effect
  useEffect(() => {
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current)
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)

    if (isSimulating) {
      const item = getScriptItem(currentScriptIndex)
      if (item) {
        const delay = item.role === "assistant" ? 1200 : 600
        simulationTimeoutRef.current = setTimeout(processNextScriptItem, delay)
      } else {
        setIsSimulating(false)
      }
    } else {
      setIsTyping(false)
      setCurrentTypingMessage(null)
      setDisplayedContent("")
    }

    return () => {
      if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current)
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
    }
  }, [isSimulating, currentScriptIndex, processNextScriptItem])

  // Controlled scroll behavior
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current && messagesEndRef.current) {
      const windowScrollY = window.scrollY
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
      window.scrollTo({ top: windowScrollY, behavior: "auto" })
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }, [messages, isTyping, displayedContent, scrollToBottom])

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const preventPageScroll = (e: WheelEvent) => {
      const isScrollable = chatContainer.scrollHeight > chatContainer.clientHeight
      if (!isScrollable) return

      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      const isAtTop = e.deltaY < 0 && scrollTop === 0
      const isAtBottom = e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 1

      if (isAtTop || isAtBottom) {
        e.preventDefault()
      }
    }

    chatContainer.addEventListener("wheel", preventPageScroll, { passive: false })
    return () => chatContainer.removeEventListener("wheel", preventPageScroll)
  }, [])

  // Start/Restart simulation
  const startSimulation = () => {
    const windowScrollY = window.scrollY
    setMessages([])
    setCurrentScriptIndex(0)
    setIsSimulating(true)
    setIsTyping(false)
    setCurrentTypingMessage(null)
    setDisplayedContent("")
    setUiInteractionState({})
    setActiveExplanation(null)
    setBranch(null)
    setSliderValue(null)
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = 0
    setTimeout(() => window.scrollTo({ top: windowScrollY, behavior: "auto" }), 50)
  }

  // Handle interaction with simulated UI components
  const handleUiInteraction = (uiId: string, selectedValue: string, selectedText: string) => {
    const windowScrollY = window.scrollY

    // Special handling for branching at "Would you like to continue or pause?"
    if (selectedValue === "continue" || selectedValue === "pause" || selectedValue === "finish" || selectedValue === "share-question") {
      setBranch(selectedValue as any)
      setUiInteractionState((prev) => ({ ...prev, [uiId]: true }))
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `resp-${uiId}`,
          role: "ui_response",
          content: `Selected: "${selectedText}"`,
          originalUiId: uiId,
        },
      ])
      setCurrentScriptIndex((prevIndex) => prevIndex + 1)
      setIsSimulating(true)
      setTimeout(() => window.scrollTo({ top: windowScrollY, behavior: "auto" }), 50)
      return
    }

    // For all other UI interactions
    const responseMessage: UiResponseMessage = {
      id: `resp-${uiId}`,
      role: "ui_response",
      content: `Selected: "${selectedText}"`,
      originalUiId: uiId,
    }
    setMessages((prevMessages) => [...prevMessages, responseMessage])
    setUiInteractionState((prev) => ({ ...prev, [uiId]: true }))
    setCurrentScriptIndex((prevIndex) => prevIndex + 1)
    setIsSimulating(true)
    setTimeout(() => window.scrollTo({ top: windowScrollY, behavior: "auto" }), 50)
  }

  // Handle slider interaction
  const handleSliderInteraction = (uiId: string, value: number) => {
    const windowScrollY = window.scrollY
    setSliderValue(value)
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `resp-${uiId}`,
        role: "ui_response",
        content: `Selected: ${value}`,
        originalUiId: uiId,
      },
    ])
    setUiInteractionState((prev) => ({ ...prev, [uiId]: true }))
    setCurrentScriptIndex((prevIndex) => prevIndex + 1)
    setIsSimulating(true)
    setTimeout(() => window.scrollTo({ top: windowScrollY, behavior: "auto" }), 50)
  }

  // Toggle explanation visibility
  const toggleExplanation = (explanation?: string) => {
    setActiveExplanation(activeExplanation === explanation ? null : explanation || null)
  }

  return (
    <Card className="rounded-lg overflow-hidden bg-gradient-to-br from-background via-muted/60 to-background shadow-2xl flex flex-col h-[600px] max-w-lg mx-auto border-0 ring-1 ring-primary/10">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-muted/30 p-4 border-b-0 flex-row items-center justify-between space-y-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-7 w-7 text-primary drop-shadow" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2"> {/* Use theme color for live indicator */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary/70 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight text-primary">Pulse AI Demo</CardTitle>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Live Simulation
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startSimulation}
          className="h-8 text-xs rounded-full px-4 border-2 border-primary/30 hover:border-primary/60 transition-all"
        >
          {messages.length > 0 || isSimulating ? "Restart" : "Start"} Demo
        </Button>
      </CardHeader>

      {/* Messages Area */}
      <CardContent
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-5 isolate bg-gradient-to-b from-background/80 to-muted/40"
        style={{ scrollbarWidth: "thin" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-end gap-2 animate-fade-in-up",
              message.role === "user" || message.role === "ui_response" ? "justify-end" : "justify-start"
            )}
            style={{ "--animation-delay": "50ms" } as React.CSSProperties}
          >
            {/* Assistant/UI Avatar */}
            {(message.role === "assistant" || message.role === "ui") && (
              <div className="flex-shrink-0 bg-primary/10 text-primary h-9 w-9 rounded-full flex items-center justify-center border-2 border-primary/20 shadow">
                <Bot className="h-5 w-5" />
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={cn(
                "rounded-lg px-5 py-3 max-w-[80%] shadow-md transition-all duration-150",
                message.role === "user"
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-2 border-primary/30 ml-2"
                  : message.role === "ui_response"
                    ? "bg-accent/80 text-accent-foreground italic text-sm border-2 border-accent/40"
                    : "bg-card/90 border-2 border-border"
              )}
            >
              {(message.role === "user" || message.role === "assistant" || message.role === "ui_response") && (
                <p className="text-base whitespace-pre-wrap leading-relaxed">
                  {(message as TextMessage | UiResponseMessage).content}
                </p>
              )}
              {message.role === "ui" && message.uiType === "multipleChoice" && (
                <DemoMultipleChoice
                  question={message.question}
                  options={message.options || []}
                  onSelect={(id, text) => handleUiInteraction(message.id, id, text)}
                  disabled={uiInteractionState[message.id]}
                />
              )}
              {message.role === "ui" && message.uiType === "buttons" && (
                <DemoButtons
                  question={message.question}
                  options={message.options || []}
                  onSelect={(id, text) => handleUiInteraction(message.id, id, text)}
                  disabled={uiInteractionState[message.id]}
                />
              )}
              {message.role === "ui" && message.uiType === "slider" && (
                <DemoSlider
                  question={message.question}
                  min={message.min}
                  max={message.max}
                  minLabel={message.minLabel}
                  maxLabel={message.maxLabel}
                  onSelect={(value) => handleSliderInteraction(message.id, value)}
                  disabled={uiInteractionState[message.id]}
                />
              )}

              {/* "Why?" Button */}
              {message.role === "assistant" && (message as TextMessage).explanation && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs h-auto p-0 mt-2 text-primary hover:underline focus:outline-none"
                  onClick={() => toggleExplanation((message as TextMessage).explanation)}
                  aria-expanded={activeExplanation === (message as TextMessage).explanation}
                  aria-controls={`explanation-${message.id}`}
                >
                  {activeExplanation === (message as TextMessage).explanation ? "Hide why" : "Why?"}
                </Button>
              )}
            </div>

            {/* User Avatar */}
            {(message.role === "user" || message.role === "ui_response") && (
              <div className="flex-shrink-0 bg-foreground/10 text-foreground h-9 w-9 rounded-full flex items-center justify-center border-2 border-primary/10 shadow">
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}

        {/* Explanation Panel */}
        {activeExplanation && (
          <div className="w-full pl-14 pr-2 animate-fade-in">
            {/* Use theme colors for explanation panel */}
            <div className="explanation-panel p-3 mt-2 text-xs bg-primary/10 dark:bg-primary/20 text-primary/90 dark:text-primary/80 border-l-4 border-primary rounded-r-lg shadow">
              {activeExplanation}
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && currentTypingMessage && (
          <div
            className="flex items-end gap-2 animate-fade-in-up"
            style={{ "--animation-delay": "50ms" } as React.CSSProperties}
          >
            <div className="flex-shrink-0 bg-primary/10 text-primary h-9 w-9 rounded-full flex items-center justify-center border-2 border-primary/20 shadow">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-lg px-5 py-3 max-w-[80%] bg-card/90 border-2 border-border shadow-md">
              <p className="text-base whitespace-pre-wrap leading-relaxed">
                {displayedContent}
                <span className="animate-pulse text-primary ml-1">▋</span>
              </p>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground p-3 border-t-0 bg-gradient-to-r from-muted/30 to-background/60 font-medium tracking-wide">
        Simulated Conversation
        <span className="ml-2 text-[11px] text-muted-foreground/70">
          {branch === "continue" && sliderValue !== null
            ? ` (You rated concern: ${sliderValue}/10)`
            : null}
        </span>
      </div>
    </Card>
  )
}
