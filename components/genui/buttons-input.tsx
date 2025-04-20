"use client"

/**
 * GenUI Buttons Input Component
 * 
 * This component renders a set of buttons for multiple-choice questions in the chat interface.
 * It handles the selection, submission, and error states for survey responses.
 * 
 * Security notes:
 * - User authentication is handled server-side in the submitSurveyResponse action
 * - No client-side user ID or sensitive data is stored
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitSurveyResponse } from "@/app/actions/survey"

/**
 * Props for the ButtonsInput component
 * 
 * @property {string} questionId - The ID of the question being answered (will be parsed to a number)
 * @property {Array<{id: string, text: string}>} options - Array of options to display as buttons
 * @property {string} chatId - The ID of the current chat session
 */
interface ButtonsInputProps {
  questionId: string
  options: { id: string; text: string }[]
  chatId: string
}

/**
 * Button-based input component for multiple choice questions
 * 
 * Renders a set of buttons for the user to select an answer. On selection,
 * submits the response to the server and handles success/error states.
 * 
 * @param props - Component props (see ButtonsInputProps interface)
 * @returns React component
 */
export default function ButtonsInput({ questionId, options }: ButtonsInputProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handles the selection of an option button
   * 
   * This function:
   * 1. Validates the question ID format
   * 2. Submits the response to the server action
   * 3. Handles success/error states and updates the UI accordingly
   * 
   * @param optionId - The ID of the selected option
   */
  const handleSelect = async (optionId: string) => {
    if (isSubmitted || isSubmitting) return

    setSelectedOptionId(optionId)
    setIsSubmitting(true)
    setError(null)

    // Attempt to parse questionId
    const numericQuestionId = parseInt(questionId, 10);
    if (isNaN(numericQuestionId)) {
      setError('Invalid question format')
      console.error(`Invalid questionId format: ${questionId}`);
      setIsSubmitting(false)
      return;
    }

    try {
      // Submit the response using the server action
      // The server action will handle authentication and userId
      const result = await submitSurveyResponse({
        questionId: numericQuestionId,
        answer: optionId,
      })

      if (result && 'success' in result) {
        if (result.success) {
          setIsSubmitted(true)
        } else {
          setError(result.error || 'Failed to submit response')
          console.error("Error submitting response:", result.error)
        }
      } else {
        setError('Failed to submit response')
        console.error("Unexpected response format from server action")
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error("Error submitting response:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
    </div>
  )
}
