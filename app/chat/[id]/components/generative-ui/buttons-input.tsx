"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { submitSurveyResponse } from "@/actions/survey"
import { createClient } from "@/utils/supabase/client"

interface ButtonsInputProps {
  questionId: string
  options: { id: string; text: string }[]
  chatId: string
}

export default function ButtonsInput({ questionId, options, chatId }: ButtonsInputProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Fetch the user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    
    fetchUser()
  }, [])

  const handleSelect = async (optionId: string) => {
    if (isSubmitted || isSubmitting) return

    setSelectedOptionId(optionId)
    setIsSubmitting(true)

    if (!user) {
      console.error("User not found, cannot submit response.")
      // TODO: Add user-facing error handling
      setIsSubmitting(false)
      return
    }

    // Attempt to parse questionId
    const numericQuestionId = parseInt(questionId, 10);
    if (isNaN(numericQuestionId)) {
      console.error(`Invalid questionId format: ${questionId}`);
      // TODO: Add user-facing error handling
      setIsSubmitting(false)
      return;
    }

    try {
      // Construct the correct payload
      const payload = {
        userId: user.id,
        questionId: numericQuestionId,
        answer: optionId,
      }

      // Submit the response using the server action
      await submitSurveyResponse(payload)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting response:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.id}
          variant={selectedOptionId === option.id ? "default" : "outline"}
          onClick={() => handleSelect(option.id)}
          disabled={isSubmitted && selectedOptionId !== option.id}
          className={isSubmitting ? "cursor-not-allowed" : ""}
        >
          {option.text}
        </Button>
      ))}
    </div>
  )
}
