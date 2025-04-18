"use client"

import { useState } from "react"
import { Flag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

// Available tags for resonance flags
const RESONANCE_FLAG_TAGS = [
  "Misunderstood me",
  "Inaccurate information",
  "Unhelpful response",
  "Too verbose",
  "Too technical",
  "Missed context",
  "Tone issue",
  "Other",
]

interface ResonanceFlagButtonProps {
  sessionId: string
  flaggedInteractionId: string
  precedingInteractionId?: string
  variant?: "icon" | "text" | "both"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ResonanceFlagButton({
  sessionId,
  flaggedInteractionId,
  precedingInteractionId,
  variant = "icon",
  size = "sm",
  className = "",
}: ResonanceFlagButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState("")

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleQuickFlag = async () => {
    await submitFlag()
  }

  const handleDetailedSubmit = async () => {
    await submitFlag(selectedTags, comment)
  }

  const submitFlag = async (tags: string[] = [], userComment = "") => {
    try {
      setIsSubmitting(true)

      // Capture client timestamp at the moment of submission
      const clientTimestamp = new Date().toISOString()

      const response = await fetch("/api/feedback/resonance-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          flaggedInteractionId,
          precedingInteractionId: precedingInteractionId || null,
          selectedTags: tags.length > 0 ? tags : null,
          optionalComment: userComment.trim() || null,
          clientTimestamp,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      toast({
        title: "Feedback submitted",
        description: "Thank you for helping us improve.",
      })

      // Reset state and close dialog
      setSelectedTags([])
      setComment("")
      setIsOpen(false)
    } catch (error) {
      console.error("Error submitting resonance flag:", error)
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine button size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  }

  // Determine button content based on variant
  const buttonContent = () => {
    switch (variant) {
      case "icon":
        return <Flag className="h-4 w-4" />
      case "text":
        return "Flag"
      case "both":
        return (
          <>
            <Flag className="mr-2 h-4 w-4" /> Flag
          </>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "icon" ? "icon" : "sm"}
          className={`text-muted-foreground hover:text-foreground ${
            variant === "icon" ? sizeClasses[size] : ""
          } ${className}`}
          aria-label="Flag this response"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {buttonContent()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Flag this response</DialogTitle>
          <DialogDescription>Help us understand why this response didn't resonate with you.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-wrap gap-2">
            {RESONANCE_FLAG_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-primary" : ""}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTagToggle(tag)
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>
          <Textarea
            placeholder="Optional: Tell us more about why this response didn't work for you..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button type="button" variant="secondary" onClick={handleQuickFlag} disabled={isSubmitting}>
            Just Flag
          </Button>
          <Button type="button" onClick={handleDetailedSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit with Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
