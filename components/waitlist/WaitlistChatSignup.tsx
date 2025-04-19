"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Bot, User, SendHorizontal, CheckCircle, Sparkles, Loader2, AlertCircle, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { joinWaitlist, type JoinWaitlistResult } from "@/actions/waitlist"

// Zod Schema for Validation
const waitlistFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  name: z.string().optional(),
  interest: z.string().optional(),
  referralCode: z.string().optional(),
  privacyAccepted: z.boolean().refine(value => value === true, {
    message: "You must accept the Privacy Policy and Terms.",
  }),
  emailPreferences: z.object({
    newsletter: z.boolean(),
    productUpdates: z.boolean(),
    earlyAccess: z.boolean(),
  }).optional(),
})

type WaitlistFormData = z.infer<typeof waitlistFormSchema>

// Types
type ChatRole = "user" | "assistant"
type ChatStage = "greeting" | "ask_name" | "ask_interest" | "ask_referral" | "confirm_referral" | "final_thanks"

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  stage?: ChatStage
  options?: string[]
  optionsDisabled?: boolean
  selectedOption?: string
}

export default function WaitlistChatSignup() {
  // Form state using react-hook-form
  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      email: "",
      name: "",
      interest: "",
      referralCode: "",
      privacyAccepted: false,
      emailPreferences: {
        newsletter: false,
        productUpdates: false,
        earlyAccess: false,
      },
    },
  })

  // Component State
  const [formError, setFormError] = useState<string | null>(null) // For server-side errors or general errors
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false) // For the initial email/privacy form
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false)
  const [pending, startTransition] = useTransition()

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentStage, setCurrentStage] = useState<ChatStage>("greeting")
  const [userInput, setUserInput] = useState("")
  const [isChatActive, setIsChatActive] = useState(false)
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)

  // Data state
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
        const currentName = form.getValues("name") // Get name from form state
        const currentEmail = form.getValues("email") // Get email from form state
        let messageOptions: string[] | undefined

        switch (nextStage) {
          case "ask_name":
            response = "Thanks! If you're comfortable sharing, could you let me know your name? (Optional)"
            break
          case "ask_interest":
            response = `Got it, ${currentName || 'friend'}. We're exploring ways AI might aid self-reflection. What about that idea interests you most? You can click an option or type your own.`
            messageOptions = ["Self-Reflection", "AI Ethics", "The Technology", "Other"]
            break
          case "ask_referral":
            response = "That's helpful, thank you. Just one last optional question: If someone referred you, you can enter their code here."
            break
          case "confirm_referral":
            response = `Okay, noted that referral code. Thanks!`
            // Short delay before triggering final thanks message + submission
            setTimeout(() => handleAssistantResponse("final_thanks"), 50)
            break
          case "final_thanks":
            response = `Perfect, you're all set! We've added ${currentEmail} to the list. We'll be in touch with updates as we continue building and exploring. Thank you for joining our journey! 🙏`
            // Final submission is triggered by useEffect hook listening for this stage
            break
          default:
            console.warn("Unhandled chat stage for assistant response:", nextStage)
            response = "Okay, noted."
        }
        addMessage("assistant", response, nextStage)
        if (messageOptions) {
          setChatMessages(prev => prev.map(msg => msg.id === `msg-${Date.now()}-${prev.length -1}` ? { ...msg, options: messageOptions } : msg ))
        }
        setCurrentStage(nextStage)
        setIsAssistantTyping(false)
      }, 1300) // Simulate typing delay
    },
    [addMessage, form], // Depend on `form` to get latest values
  )

  // --- User Input Handling (Chat Phase) ---
  const handleUserInput = useCallback(() => {
    if (!userInput.trim() || isAssistantTyping || currentStage === 'final_thanks') return

    const userMessageContent = userInput.trim()
    addMessage("user", userMessageContent)
    setUserInput("")

    let nextStage: ChatStage = currentStage

    switch (currentStage) {
      case "ask_name":
        form.setValue("name", userMessageContent) // Update form state
        nextStage = "ask_interest"
        break
      case "ask_interest":
        form.setValue("interest", userMessageContent) // Update form state
        nextStage = "ask_referral"
        break
      case "ask_referral":
        // Basic check if input seems like a code (not 'no', 'skip', etc.)
        if (userMessageContent.toLowerCase() !== 'no' && userMessageContent.length > 3 && !userMessageContent.toLowerCase().includes('skip') ) {
          form.setValue("referralCode", userMessageContent) // Update form state
          nextStage = "confirm_referral"
        } else {
          form.setValue("referralCode", undefined) // Ensure it's not set if skipped
          nextStage = "final_thanks"
        }
        break
      case "confirm_referral":
        // This stage automatically transitions to final_thanks via handleAssistantResponse
        return // Don't trigger another response here
      default:
        console.warn("Unhandled chat stage for user input:", currentStage)
        nextStage = "final_thanks" // Default to ending if stage is unexpected
    }

    // Trigger the appropriate assistant response or the final sequence
    handleAssistantResponse(nextStage)

  }, [userInput, currentStage, addMessage, handleAssistantResponse, isAssistantTyping, form])

  // --- Handle Clicking a Predefined Option Button ---
  const handleOptionClick = useCallback((option: string, messageId: string) => {
    if (isAssistantTyping || currentStage !== 'ask_interest') return; // Only allow clicks during the interest stage for now

    // 1. Visually disable buttons for this message
    setChatMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, optionsDisabled: true, selectedOption: option } : msg))
    );

    // 2. Set form value
    form.setValue("interest", option === "Other" ? "" : option); // Set empty if 'Other' to encourage typing

    // 3. Add user message reflecting the choice
    addMessage("user", `Selected: ${option}`);

    // 4. If 'Other' was clicked, keep input enabled and don't advance yet
    if (option === "Other") {
       addMessage("assistant", "Okay, please specify your interest.", currentStage);
       return;
    }

    // 5. Trigger next assistant response
    handleAssistantResponse("ask_referral");

  }, [addMessage, form, handleAssistantResponse, isAssistantTyping, currentStage]);

  // --- Handle Skip & Submit ---
  const handleSkipSubmit = useCallback(() => {
    if (isSubmittingFinal) return;
    const finalData = form.getValues();
    submitWaitlistData(finalData, 'final');
  }, [form, isSubmittingFinal]);

  // --- Auto-scroll chat ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isAssistantTyping])


  // --- Final Data Submission (Server Action Call) ---
  const submitWaitlistData = async (data: WaitlistFormData, submissionType: 'initial' | 'final') => {
    // Set appropriate loading state based on submission type
    if (submissionType === 'initial') {
      setIsSubmittingEmail(true)
    } else {
      setIsSubmittingFinal(true)
    }
    setFormError(null)
    setFormSuccess(null)
    setReferralLink(null) // Clear previous link if any

    startTransition(async () => {
      try {
        console.log(`Submitting ${submissionType} data:`, data)
        const result: JoinWaitlistResult = await joinWaitlist(data)

        if (!result.success) {
          setFormError(result.error)
          setFormSuccess(null)
          if (submissionType === 'final') {
              setIsChatActive(false) // Stop chat on error during final save
          }
        } else {
          if (submissionType === 'initial') {
              setFormSuccess("Joined! Starting optional chat...")
              setIsChatActive(true) // Start chat on successful initial submission
              handleAssistantResponse("ask_name") // Trigger first chat question
              // Keep referral link null for initial success message
          } else { // final submission success
              setFormSuccess(`Thanks! We've saved your spot and will keep you updated at ${data.email}`)
              setFormError(null)
              setReferralLink(result.referralLink) // Set referral link on final success
              setIsChatActive(false) // End chat interaction visually
          }
        }
      } catch (error) {
        console.error("Submission error:", error)
        setFormError(`Failed to save details (${submissionType}). Please try again later.`)
        setFormSuccess(null)
        if (submissionType === 'final') {
            setIsChatActive(false) // Stop chat on catch during final save
        }
      } finally {
        // Reset appropriate loading state
        if (submissionType === 'initial') {
          setIsSubmittingEmail(false)
        } else {
          setIsSubmittingFinal(false)
        }
      }
    })
  }

  // --- Initial Email/Privacy Form Submission ---
  const handleInitialSubmit = (data: WaitlistFormData) => {
    // Called by react-hook-form's handleSubmit, data is validated
    // Now call the submission function with type 'initial'
    submitWaitlistData(data, 'initial');
  }

  // --- Auto-submit when chat reaches 'final_thanks' stage ---
  useEffect(() => {
    if (currentStage === 'final_thanks' && !isAssistantTyping && isChatActive && !isSubmittingFinal) {
      // Trigger the final submission using the data collected in the form
      const finalData = form.getValues();
      console.log("Auto-submitting data from useEffect:", finalData)
      submitWaitlistData(finalData, 'final'); // Specify final submission
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStage, isAssistantTyping, isChatActive, isSubmittingFinal, form]); // Add form to dependencies if getValues causes issues


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
          <Form {...form}>
            {/* Use form.handleSubmit for the initial email/privacy check */}
            <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={isSubmittingEmail || isChatActive}
                        className="text-base"
                        aria-required="true"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="privacyAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background/50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmittingEmail || isChatActive}
                        aria-required="true"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs">
                        I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a> and <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms</a>.*
                      </FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailPreferences"
                render={() => (
                  <FormItem>
                     <div className="mb-2">
                        <FormLabel className="text-base font-medium">Email Preferences (optional)</FormLabel>
                        <FormDescription className="text-xs">Choose what emails you'd like to receive.</FormDescription>
                     </div>
                    <div className="space-y-2 pl-1">
                      <FormField
                          control={form.control}
                          name="emailPreferences.newsletter"
                          render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmittingEmail || isChatActive}/>
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Subscribe to newsletter</FormLabel>
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="emailPreferences.productUpdates"
                          render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmittingEmail || isChatActive}/>
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Product updates</FormLabel>
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="emailPreferences.earlyAccess"
                          render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmittingEmail || isChatActive}/>
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Early access invites</FormLabel>
                              </FormItem>
                          )}
                      />
                    </div>
                    <FormMessage /> {/* For potential errors related to the 'emailPreferences' object itself */}
                  </FormItem>
                )}
              />

              {/* Display general/server errors */}
              {formError && (
                <div className="flex items-center gap-2 text-destructive text-sm mt-2 p-2 bg-destructive/10 rounded" aria-live="polite">
                  <AlertCircle className="h-4 w-4" /> {formError}
                </div>
              )}
               {/* Display general success message (post-final submission) */}
              {formSuccess && !isChatActive && (
                 <div className="flex items-center gap-2 text-green-600 text-sm mt-2 p-2 bg-green-500/10 rounded" aria-live="polite">
                    <CheckCircle className="h-4 w-4" /> {formSuccess}
                </div>
              )}
              {/* Display referral link if available (post-final submission) */}
              {referralLink && !isChatActive && (
                <div className="flex items-center gap-2 text-primary text-xs mt-2 p-2 bg-primary/10 rounded" aria-live="polite">
                    <LinkIcon className="h-4 w-4" />
                    <span>Your referral link: <a href={referralLink} className="underline break-all" target="_blank" rel="noopener noreferrer">{referralLink}</a></span>
                </div>
              )}

              <Button type="submit" className="w-full font-semibold" disabled={isSubmittingEmail || isChatActive}>
                {isSubmittingEmail ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : isChatActive ? (
                   "Joined! See Chat Below..."
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          // --- Chat Interface ---
          <div className="flex flex-col h-[350px]">
            {/* Chat description */}
            <div className="mb-2 text-xs text-muted-foreground text-center">
              This chat is optional. You can answer, skip, or submit at any time.
            </div>
            {/* Chat messages display area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/30" aria-live="polite">
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
                  {/* Render Options if available and not disabled */}
                  {message.role === 'assistant' && message.options && !message.optionsDisabled && (
                    <div className="flex flex-wrap gap-2 mt-2 pl-9">
                      {message.options.map((option) => (
                        <Button
                          key={option}
                          variant={message.selectedOption === option ? "default" : "outline"}
                          size="sm"
                          className={cn("text-xs h-7", message.selectedOption === option && "ring-2 ring-primary")}
                          onClick={() => handleOptionClick(option, message.id)}
                          disabled={isAssistantTyping || message.optionsDisabled}
                          aria-disabled={isAssistantTyping || message.optionsDisabled}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
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
            {/* Divider above input */}
            <div className="border-t border-border my-2" />
            {/* Chat input area and skip button */}
            {(() => {
              if (currentStage === "final_thanks") {
                if (isSubmittingFinal) {
                  return (
                    <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2 border-t pt-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Finishing up...
                    </div>
                  );
                } else {
                  return (
                    <div className="mt-4 border-t pt-4 text-center text-sm text-green-600">
                      <CheckCircle className="h-5 w-5 inline mr-1" /> All set! Thanks for joining.
                    </div>
                  );
                }
              }
              // Otherwise, render the input and skip button
              let inputPlaceholder = "Type your response...";
              let inputAutoComplete = "off";
              if (currentStage === "ask_name") {
                inputPlaceholder = "Your name (optional)...";
                inputAutoComplete = "name";
              } else if (currentStage === "ask_interest") {
                inputPlaceholder = "Click an option above or type here...";
              } else if (currentStage === "ask_referral") {
                inputPlaceholder = "Referral code (optional)...";
              }
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && userInput.trim()) { e.preventDefault(); handleUserInput(); } }}
                      disabled={isAssistantTyping || isSubmittingFinal}
                      className="flex-1"
                      aria-label="Chat input"
                      autoComplete={inputAutoComplete}
                      placeholder={inputPlaceholder}
                    />
                    <Button
                      size="icon"
                      type="button"
                      onClick={handleUserInput}
                      disabled={isAssistantTyping || !userInput.trim() || isSubmittingFinal}
                      aria-label="Send message"
                      aria-disabled={isAssistantTyping || !userInput.trim() || isSubmittingFinal}
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-xs mt-1"
                    onClick={handleSkipSubmit}
                    disabled={isSubmittingFinal}
                    aria-disabled={isSubmittingFinal}
                  >
                    {isSubmittingFinal ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      "Skip & Submit"
                    )}
                  </Button>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground p-4 border-t text-center">
        We respect your privacy and will only use your email for Global Pulse updates.
      </CardFooter>
    </Card>
  )
} 