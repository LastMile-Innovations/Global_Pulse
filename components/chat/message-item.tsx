"use client"

import { useState, useEffect } from "react"
import type { Message } from "@/lib/types/chat-types"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ResonanceFlagButton } from "./resonance-flag-button"
import { formatMessageTime } from "@/lib/utils/chat-utils"
import { CoherenceFeedbackChoice } from "@/lib/types/feedback-types"
import { toast } from "@/components/ui/use-toast"
import { logger } from "@/lib/utils/logger"
import useChatStore from "@/lib/store/chat-store"
import { Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnalysisFitFeedbackPayload } from '@/lib/types/feedback-types';

interface MessageItemProps {
  message: Message
  sessionId: string
  previousMessageId?: string
  isLastMessage?: boolean
}

export function MessageItem({ message, sessionId, previousMessageId, isLastMessage = false }: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(message.metadata?.feedbackSent ?? false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comment, setComment] = useState("")
  const [showXai, setShowXai] = useState(false)
  const [fitFeedbackSubmitted, setFitFeedbackSubmitted] = useState(false)
  const [fitFeedbackLoading, setFitFeedbackLoading] = useState(false)

  // Parse the streamed metadata
  const [isCheckIn, setIsCheckIn] = useState(false)
  const [reviewInteractionId, setReviewInteractionId] = useState<string | undefined>(undefined)

  // Get explanations from the store
  const xaiExplanations = useChatStore((state) => state.xaiExplanations)
  const explanationFromState = xaiExplanations[message.id]

  const isUser = message.role === "user"

  // Extract metadata from the message on component mount
  useEffect(() => {
    // Check if the message has data property (streamed metadata)
    if (message.data && Array.isArray(message.data) && message.data.length > 0) {
      // Find the check-in data object
      const checkInData = message.data.find((d) => typeof d === "object" && d !== null && d.isCheckIn === true)

      if (checkInData) {
        setIsCheckIn(true)

        // Extract the reviewInteractionId if it exists and is a string
        if (typeof checkInData.reviewInteractionId === "string") {
          setReviewInteractionId(checkInData.reviewInteractionId)
        } else {
          const logContext = { messageId: message.id, checkInData };
          logger.warn(`Check-in data found but reviewInteractionId is missing or invalid: ${JSON.stringify(logContext)}`);
        }
      }
    } else if (message.content.includes("How well did my previous response") && !isCheckIn) {
      // Log warning if we detect check-in text but metadata is missing
      const logContext = { messageId: message.id, data: message.data };
      logger.warn(
        `Detected potential check-in text but metadata missing or invalid: ${JSON.stringify(logContext)}`
      )
    }
  }, [message, isCheckIn])

  // Handle feedback button click
  const handleFeedbackClick = async (choice: CoherenceFeedbackChoice) => {
    if (feedbackSent || !reviewInteractionId) {
      if (!reviewInteractionId) {
        logger.error("Cannot submit feedback: reviewInteractionId is missing", {
          messageId: message.id,
        })
        toast({
          title: "Error",
          description: "Cannot submit feedback due to missing reference ID.",
          variant: "destructive",
          duration: 3000,
        })
      }
      return
    }

    setIsSubmitting(true)

    try {
      const currentComment = comment.trim()

      const response = await fetch("/api/feedback/coherence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          messageId: reviewInteractionId,
          coherenceScore: choice,
          feedback: currentComment ? currentComment : null, // Send null if empty
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setFeedbackSent(true)
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper: Should show 'Does this fit?' UI
  const showFitFeedback =
    !isUser &&
    !isCheckIn &&
    !fitFeedbackSubmitted &&
    message.metadata?.responseRationaleSource?.startsWith('PCE-Informed');

  async function handleFitFeedback(fits: boolean) {
    setFitFeedbackLoading(true);
    try {
      const payload: AnalysisFitFeedbackPayload = {
        assistantInteractionId: message.id,
        fitsExperience: fits,
      };
      const res = await fetch('/api/feedback/analysis-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      setFitFeedbackSubmitted(true);
      toast({ title: 'Feedback submitted', description: 'Thank you for your feedback!' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to submit feedback.', variant: 'destructive' });
    } finally {
      setFitFeedbackLoading(false);
    }
  }

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} max-w-[85%]`}>
        <Avatar className="h-8 w-8 mr-2">{/* Avatar content here */}</Avatar>

        <div className="flex flex-col">
          <Card className={`p-3 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <div className="whitespace-pre-wrap">{message.content}</div>

            {/* Render feedback buttons for check-in messages */}
            {isCheckIn && !isUser && (
              <div className="mt-3 flex flex-col gap-2">
                <div className={`flex flex-wrap gap-2 ${feedbackSent ? "opacity-50" : ""}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedbackClick(CoherenceFeedbackChoice.Helpful)}
                    disabled={feedbackSent || isSubmitting}
                  >
                    Helpful
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedbackClick(CoherenceFeedbackChoice.Neutral)}
                    disabled={feedbackSent || isSubmitting}
                  >
                    Neutral
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedbackClick(CoherenceFeedbackChoice.FeltOff)}
                    disabled={feedbackSent || isSubmitting}
                  >
                    Felt Off
                  </Button>
                </div>

                {/* Add textarea for optional comment */}
                {!feedbackSent && (
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Optional: Add a comment..."
                    className="mt-2 text-sm resize-none"
                    rows={2}
                    disabled={isSubmitting}
                  />
                )}

                {/* Show submitted comment if feedback was sent and there was a comment */}
                {feedbackSent && comment.trim() && (
                  <p className="mt-2 text-xs text-muted-foreground italic border-l-2 pl-2">Your comment: {comment}</p>
                )}
              </div>
            )}

            {showFitFeedback && (
              <div className="mt-3 flex flex-col gap-2">
                <span className="text-xs mb-1">Does this fit?</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFitFeedback(true)}
                    disabled={fitFeedbackSubmitted || fitFeedbackLoading}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFitFeedback(false)}
                    disabled={fitFeedbackSubmitted || fitFeedbackLoading}
                  >
                    Not Quite
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* XAI Explanation Display */}
          {!isUser && explanationFromState && showXai && (
            <Card className="mt-2 p-3 bg-muted/60 border border-primary/20 text-xs">
              <p className="text-xs italic text-muted-foreground">
                <strong className="font-semibold text-foreground not-italic">Explanation:</strong><br/>
                <span className="whitespace-pre-wrap">{explanationFromState}</span>
              </p>
            </Card>
          )}

          <div
            className={`flex items-center mt-1 text-xs text-muted-foreground ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <span>{formatMessageTime(message.timestamp)}</span>

            {/* Only show flag button for assistant messages that are not check-ins */}
            {!isUser && !isCheckIn && (
              <div className={`ml-2 transition-opacity ${isHovered || isLastMessage ? "opacity-100" : "opacity-0"}`}>
                <ResonanceFlagButton
                  sessionId={sessionId}
                  flaggedInteractionId={message.id}
                  precedingInteractionId={previousMessageId}
                  variant="icon"
                  size="sm"
                />
              </div>
            )}

            {/* XAI "Why?" Button */}
            {!isUser && explanationFromState && (
              <div className={cn("ml-2 transition-opacity", isHovered || showXai ? "opacity-100" : "opacity-0")}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowXai(!showXai)}
                  title={showXai ? "Hide explanation" : "Show explanation"}
                  className="h-5 w-5 p-0.5"
                >
                  <Lightbulb className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
