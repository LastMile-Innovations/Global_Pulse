"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { submitSurveyResponse } from "@/app/api/surveys/actions"

interface ButtonsInputProps {
  questionId: string
  options: { id: string; text: string }[]
  chatId: string
}

export default function ButtonsInput({ questionId, options, chatId }: ButtonsInputProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSelect = async (optionId: string) => {
    if (isSubmitted || isSubmitting) return

    setSelectedOption(optionId)
    setIsSubmitting(true)

    try {
      // Create a FormData object to use with the server action
      const formData = new FormData()
      formData.append("questionId", questionId)
      formData.append("optionId", optionId)
      formData.append("chatId", chatId)

      // Submit the response using the server action
      await submitSurveyResponse(formData)
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
          variant={selectedOption === option.id ? "default" : "outline"}
          onClick={() => handleSelect(option.id)}
          disabled={isSubmitted && selectedOption !== option.id}
          className={isSubmitting ? "cursor-not-allowed" : ""}
        >
          {option.text}
        </Button>
      ))}
    </div>
  )
}
