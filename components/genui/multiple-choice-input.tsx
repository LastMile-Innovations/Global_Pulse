"use client"

import { useState } from "react"
import { submitSurveyResponse } from "@/app/actions/survey"

interface MultipleChoiceInputProps {
  questionId: string
  options: { id: string; text: string }[]
  chatId: string
}

export default function MultipleChoiceInput({ questionId, options }: MultipleChoiceInputProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSelect = async (optionId: string) => {
    if (isSubmitted || isSubmitting) return

    setSelectedOption(optionId)
    setIsSubmitting(true)

    try {
      // Attempt to parse questionId to a number
      const numericQuestionId = parseInt(questionId, 10);
      if (isNaN(numericQuestionId)) {
        console.error(`Invalid questionId format: ${questionId}`);
        return;
      }

      // Submit the response using the server action with the expected parameter structure
      await submitSurveyResponse({
        questionId: numericQuestionId,
        answer: optionId
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting response:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div
          key={option.id}
          className={`
            p-3 rounded-md border transition-colors cursor-pointer
            ${selectedOption === option.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50 border-border"}
            ${isSubmitted && selectedOption !== option.id ? "opacity-50" : ""}
            ${isSubmitting ? "cursor-not-allowed" : ""}
          `}
          onClick={() => handleSelect(option.id)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              h-4 w-4 rounded-full border flex-shrink-0
              ${selectedOption === option.id ? "border-primary bg-primary" : "border-muted-foreground"}
            `}
            >
              {selectedOption === option.id && <div className="h-2 w-2 bg-primary-foreground rounded-full m-auto" />}
            </div>
            <span>{option.text}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
