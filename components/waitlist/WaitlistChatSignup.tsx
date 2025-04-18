"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useTransition } from "react"
import { Bot, User, SendHorizontal, CheckCircle, Sparkles, Loader2, AlertCircle, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { joinWaitlist, type JoinWaitlistResult } from "@/actions/waitlist"

// Types
type ChatRole = "user" | "assistant"
type ChatStage = "greeting" | "ask_name" | "ask_interest" | "ask_referral" | "confirm_referral" | "final_thanks"

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  stage?: ChatStage
}

interface WaitlistFormData {
  email: string
  name?: string
  interest?: string
  referralCode?: string
  privacyAccepted: boolean
  emailPreferences?: {
    newsletter?: boolean
    productUpdates?: boolean
    earlyAccess?: boolean
  }
}

export default function WaitlistChatSignup() {
  // Form state
  const [email, setEmail] = useState("")
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false)
  const [pending, startTransition] = useTransition()

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentStage, setCurrentStage] = useState<ChatStage>("greeting")
  const [userInput, setUserInput] = useState("")
  const [isChatActive, setIsChatActive] = useState(false)
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)

  // Data state
  const [waitlistData, setWaitlistData] = useState<WaitlistFormData>({
    email: "",
    privacyAccepted: false,
    emailPreferences: {
      newsletter: false,
      productUpdates: false,
      earlyAccess: false,
    },
  })
  const [referralLink, setReferralLink] = useState<string | null>(null)

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  const assistantTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // --- Chat Message Handling ---
  const addMessage = useCallback((role: ChatRole, content: string, stage?: ChatStage) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${prev.length}`,
        role,
        content,
        stage,
      },
    ])
    setIsAssistantTyping(false)
  }, [])

  // --- Assistant Response Logic ---
  const handleAssistantResponse = useCallback(
    (nextStage: ChatStage) => {
      setIsAssistantTyping(true)
      if (assistantTimeoutRef.current) {
        clearTimeout(assistantTimeoutRef.current)
      }
      assistantTimeoutRef.current = setTimeout(() => {
        let response = ""
        switch (nextStage) {
          case "ask_name":
            response = "Thanks! If you're comfortable sharing, could you let me know your name? (Optional)"
            break
          case "ask_interest":
            response = `Got it, ${waitlistData.name || 'friend'}. We're exploring ways AI might aid self-reflection. What about that idea interests you most? (e.g., understanding emotions, AI ethics, the tech itself... Optional)`
            break
          case "ask_referral":
            response = "That's helpful, thank you. Just one last optional question: If someone referred you, you can enter their code here."
            break
          case "confirm_referral":
            response = `Okay, noted that referral code. Thanks!`
            setTimeout(() => handleAssistantResponse("final_thanks"), 50)
            break
          case "final_thanks":
            response = `Perfect, you're all set! We've added ${waitlistData.email} to the list. We'll be in touch with updates as we continue building and exploring. Thank you for joining our journey! 🙏`
            break
          default:
            response = "Okay, noted."
        }
        addMessage("assistant", response, nextStage)
        setCurrentStage(nextStage)
        setIsAssistantTyping(false)
      }, 1300)
    },
    [addMessage, waitlistData.name, waitlistData.email],
  )

  // --- User Input Handling ---
  const handleUserInput = useCallback(() => {
    if (!userInput.trim() || isAssistantTyping) return
    const userMessageContent = userInput.trim()
    addMessage("user", userMessageContent)
    setUserInput("")
    let nextStage: ChatStage = currentStage
    switch (currentStage) {
      case "ask_name":
        setWaitlistData((prev) => ({ ...prev, name: userMessageContent }))
        nextStage = "ask_interest"
        break
      case "ask_interest":
        setWaitlistData((prev) => ({ ...prev, interest: userMessageContent }))
        nextStage = "ask_referral"
        break
      case "ask_referral":
        if (userMessageContent.toLowerCase() !== 'no' && userMessageContent.length > 3 && !userMessageContent.toLowerCase().includes('skip') ) {
          setWaitlistData((prev) => ({ ...prev, referralCode: userMessageContent }))
          nextStage = "confirm_referral"
        } else {
          nextStage = "final_thanks"
        }
        break
      case "confirm_referral":
        nextStage = "final_thanks"
        break
      case "final_thanks":
        setIsChatActive(false)
        return
      default:
        addMessage("assistant", "Understood.", "final_thanks")
        setIsChatActive(false)
        return
    }
    if (nextStage !== "final_thanks") {
      handleAssistantResponse(nextStage)
    } else {
      if (currentStage === 'ask_referral' && (userMessageContent.toLowerCase() === 'no' || userMessageContent.toLowerCase().includes('skip') || userMessageContent.length <= 3) ) {
        handleAssistantResponse("final_thanks")
      }
    }
  }, [userInput, currentStage, addMessage, handleAssistantResponse, isAssistantTyping])

  // --- Auto-scroll chat ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isAssistantTyping])

  // --- Email Form Submission (calls server action) ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.")
      return
    }
    if (!privacyAccepted) {
      setFormError("Please agree to the Privacy Policy and Terms.")
      return
    }
    setIsSubmittingEmail(true)
    setFormError(null)
    setFormSuccess(null)
    setReferralLink(null)
    startTransition(async () => {
      try {
        const result: JoinWaitlistResult = await joinWaitlist({
          email,
          privacyAccepted,
          emailPreferences: waitlistData.emailPreferences,
        })
        if (!result.success) {
          setFormError(result.error)
          setIsSubmittingEmail(false)
          return
        }
        setWaitlistData((prev) => ({ ...prev, email, privacyAccepted }))
        setFormSuccess("Got it! Let's chat briefly (entirely optional)...")
        setIsChatActive(true)
        setReferralLink(result.referralLink)
        handleAssistantResponse("ask_name")
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "An unknown error occurred.")
      } finally {
        setIsSubmittingEmail(false)
      }
    })
  }

  // --- Final Data Submission (calls server action) ---
  const submitWaitlistData = async () => {
    setIsSubmittingFinal(true)
    setFormError(null)
    setFormSuccess(null)
    setReferralLink(null)
    startTransition(async () => {
      try {
        const result: JoinWaitlistResult = await joinWaitlist({
          email: waitlistData.email,
          name: waitlistData.name,
          interest: waitlistData.interest,
          referralCode: waitlistData.referralCode,
          privacyAccepted: waitlistData.privacyAccepted,
          emailPreferences: waitlistData.emailPreferences,
        })
        if (!result.success) {
          setFormError(result.error)
          setFormSuccess(null)
        } else {
          setFormSuccess("Thanks! We've saved your spot and will keep you updated at " + waitlistData.email)
          setFormError(null)
          setReferralLink(result.referralLink)
          setIsChatActive(false)
          setWaitlistData((prev) => ({ ...prev }))
        }
      } catch (error) {
        setFormError("Failed to save final details. Please try again later.")
        setFormSuccess(null)
      } finally {
        setIsSubmittingFinal(false)
      }
    })
  }

  // --- Auto-submit when chat ends ---
  useEffect(() => {
    if (currentStage === 'final_thanks' && !isAssistantTyping && isChatActive) {
      const timer = setTimeout(() => {
        submitWaitlistData()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentStage, isAssistantTyping, isChatActive])

  // --- Component Render ---
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden shadow-xl border border-primary/20 bg-card">
      <CardHeader className="text-center p-6 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="inline-block mx-auto mb-3 p-2 bg-primary/10 rounded-full border border-primary/20">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Join the Exploration</CardTitle>
        <CardDescription>
          Be part of our journey building an ethical AI for self-discovery. Sign up for early access updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!isChatActive ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="waitlist-email" className="font-medium mb-1 block">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFormError(null)
                }}
                required
                disabled={isSubmittingEmail || !!formSuccess}
                className="text-base"
                aria-required="true"
              />
            </div>
            <div className="flex items-start space-x-2 mt-3">
              <input
                type="checkbox"
                id="privacy-check-initial"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                required
                className="mt-1 accent-primary focus:ring-primary"
                disabled={isSubmittingEmail || !!formSuccess}
              />
              <Label htmlFor="privacy-check-initial" className="text-xs text-muted-foreground">
                I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a> and <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms</a>.*
              </Label>
            </div>
            <div>
              <Label htmlFor="waitlist-email-preferences" className="font-medium mb-1 block">Email Preferences (optional)</Label>
              <div className="flex flex-col gap-2 pl-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={waitlistData.emailPreferences?.newsletter || false}
                    onChange={e => setWaitlistData(prev => ({
                      ...prev,
                      emailPreferences: {
                        ...prev.emailPreferences,
                        newsletter: e.target.checked,
                      },
                    }))}
                    disabled={isSubmittingEmail || !!formSuccess}
                  />
                  <span>Subscribe to newsletter</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={waitlistData.emailPreferences?.productUpdates || false}
                    onChange={e => setWaitlistData(prev => ({
                      ...prev,
                      emailPreferences: {
                        ...prev.emailPreferences,
                        productUpdates: e.target.checked,
                      },
                    }))}
                    disabled={isSubmittingEmail || !!formSuccess}
                  />
                  <span>Product updates</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={waitlistData.emailPreferences?.earlyAccess || false}
                    onChange={e => setWaitlistData(prev => ({
                      ...prev,
                      emailPreferences: {
                        ...prev.emailPreferences,
                        earlyAccess: e.target.checked,
                      },
                    }))}
                    disabled={isSubmittingEmail || !!formSuccess}
                  />
                  <span>Early access invites</span>
                </label>
              </div>
            </div>
            {formError && (
              <div className="flex items-center gap-2 text-destructive text-sm mt-2" aria-live="polite">
                <AlertCircle className="h-4 w-4" /> {formError}
              </div>
            )}
            {formSuccess && !isChatActive && (
              <div className="flex items-center gap-2 text-green-600 text-sm mt-2" aria-live="polite">
                <CheckCircle className="h-4 w-4" /> {formSuccess}
              </div>
            )}
            {referralLink && !isChatActive && (
              <div className="flex items-center gap-2 text-primary text-xs mt-2" aria-live="polite">
                <LinkIcon className="h-4 w-4" />
                <span>Your referral link: <a href={referralLink} className="underline break-all" target="_blank" rel="noopener noreferrer">{referralLink}</a></span>
              </div>
            )}
            <Button type="submit" className="w-full font-semibold" disabled={isSubmittingEmail || !!formSuccess}>
              {isSubmittingEmail ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : !!formSuccess ? (
                "Email Confirmed!"
              ) : (
                "Join & Start Optional Chat"
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col h-[350px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/30">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 bg-primary/10 text-primary h-7 w-7 rounded-full flex items-center justify-center border border-primary/20 mt-1">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[85%] text-sm shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-background border rounded-bl-none",
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 bg-foreground/5 text-foreground h-7 w-7 rounded-full flex items-center justify-center border border-border mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isAssistantTyping && (
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 bg-primary/10 text-primary h-7 w-7 rounded-full flex items-center justify-center border border-primary/20 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex space-x-1 p-3 bg-background rounded-lg border shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {currentStage !== "final_thanks" as ChatStage && (
              <div className="mt-4 flex gap-2 border-t pt-4">
                <Input
                  type="text"
                  placeholder={
                    currentStage === 'ask_name' ? "Your name (optional)..." :
                    currentStage === 'ask_interest' ? "What interests you? (optional)..." :
                    currentStage === 'ask_referral' ? "Referral code (optional)..." :
                    "Type your response..."
                  }
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleUserInput()}
                  disabled={isAssistantTyping || currentStage === 'final_thanks' || isSubmittingFinal}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleUserInput}
                  disabled={isAssistantTyping || !userInput.trim() || currentStage === 'final_thanks' || isSubmittingFinal}
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isSubmittingFinal && (
              <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving your spot...
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground p-4 border-t text-center">
        We respect your privacy and will only use your email for Global Pulse updates.
      </CardFooter>
    </Card>
  )
} 