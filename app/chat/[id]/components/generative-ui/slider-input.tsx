"use client"

/**
 * GenUI Slider Input Component
 * 
 * This component renders a slider for numeric-response questions in the chat interface.
 * It handles the value selection, submission, and error states for survey responses.
 * 
 * Security notes:
 * - User authentication is handled server-side in the submitSurveyResponse action
 * - No client-side user ID or sensitive data is stored
 */

import { useState, useEffect, useCallback } from "react"
import { submitSurveyResponse } from "@/actions/survey"

/**
 * Props for the SliderInput component
 * 
 * @property {string} questionId - The ID of the question being answered (will be parsed to a number)
 * @property {number} min - Minimum value of the slider
 * @property {number} max - Maximum value of the slider
 * @property {number} [step=1] - Step increment of the slider (default: 1)
 * @property {string} [minLabel] - Optional label for the minimum value
 * @property {string} [maxLabel] - Optional label for the maximum value
 * @property {number} [defaultValue] - Optional default value for the slider
 * @property {string} chatId - The ID of the current chat session
 */
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

/**
 * Slider-based input component for numeric questions
 * 
 * Renders a slider control for the user to select a numeric value. On submission,
 * sends the response to the server and handles success/error states.
 * 
 * @param props - Component props (see SliderInputProps interface)
 * @returns React component
 */
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
  const [error, setError] = useState<string | null>(null)

  /**
   * Handles the submission of the slider value
   * 
   * This function:
   * 1. Validates the question ID format
   * 2. Submits the selected value to the server action
   * 3. Handles success/error states and updates the UI accordingly
   */
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Attempt to parse questionId to a number
      const numericQuestionId = parseInt(questionId, 10);
      if (isNaN(numericQuestionId)) {
        setError(`Invalid question format`);
        setIsSubmitting(false);
        return;
      }

      // Submit the response
      const response = await submitSurveyResponse({
        questionId: numericQuestionId,
        answer: value
      })

      if (response && 'success' in response) {
        if (response.success) {
          setIsSubmitted(true)
        } else {
          setError(response.error || 'Failed to submit response')
        }
      } else {
        setError('Failed to submit response')
      }
    } catch (err) {
      console.error('Error submitting slider response:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }, [questionId, value, setIsSubmitting, setError, setIsSubmitted])

  // Submit the response when the user stops dragging
  useEffect(() => {
    if (!isDragging && value !== defaultValue && !isSubmitted) {
      handleSubmit()
    }
  }, [isDragging, value, defaultValue, questionId, chatId, isSubmitted, handleSubmit])

  // Calculate the percentage for the slider position
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="py-4">
      {error && (
        <div className="mb-2 p-2 text-sm text-red-500 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}
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
