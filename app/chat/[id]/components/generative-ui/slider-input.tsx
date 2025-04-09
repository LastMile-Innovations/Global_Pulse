"use client"

import { useState, useEffect } from "react"
import { submitSurveyResponse } from "@/actions/survey"

interface SliderInputProps {
  questionId: string
  min: number
  max: number
  minLabel?: string
  maxLabel?: string
  step?: number
  defaultValue?: number
  chatId: string
}

export default function SliderInput({
  questionId,
  min,
  max,
  minLabel,
  maxLabel,
  step = 1,
  defaultValue,
  chatId,
}: SliderInputProps) {
  const [value, setValue] = useState(defaultValue || Math.floor((min + max) / 2))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Submit the response when the user stops dragging
  useEffect(() => {
    if (!isDragging && value !== defaultValue && !isSubmitted) {
      const submitResponse = async () => {
        setIsSubmitting(true)

        try {
          // Attempt to parse questionId to a number
          const numericQuestionId = parseInt(questionId, 10);
          if (isNaN(numericQuestionId)) {
            console.error(`Invalid questionId format: ${questionId}`);
            return;
          }

          // Get the current user from localStorage or session if available
          // For now using a placeholder - in a real app, you'd get this from authentication
          const userId = localStorage.getItem('userId') || 'anonymous-user';

          // Submit the response using the server action with the expected parameter structure
          await submitSurveyResponse({
            userId,
            questionId: numericQuestionId,
            answer: value
          })
          setIsSubmitted(true)
        } catch (error) {
          console.error("Error submitting response:", error)
        } finally {
          setIsSubmitting(false)
        }
      }

      submitResponse()
    }
  }, [isDragging, value, defaultValue, questionId, chatId, isSubmitted])

  // Calculate the percentage for the slider position
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="py-4">
      <div className="relative h-10 mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="h-2 w-full bg-muted rounded-full">
            <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={isSubmitted || isSubmitting}
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div
          className="absolute h-6 w-6 bg-primary rounded-full shadow transform -translate-y-1/2 top-1/2"
          style={{ left: `${percentage}%` }}
        >
          <div className="flex items-center justify-center h-full w-full text-xs font-bold text-primary-foreground">
            {value}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minLabel || min}</span>
        <span>{maxLabel || max}</span>
      </div>
    </div>
  )
}
