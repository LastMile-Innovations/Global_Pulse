"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { fetchNextQuestion, submitSurveyResponse } from "../../app/actions/survey"
import SurveyQuestionCard from "./survey-question-card"
import SurveyFilters from "./survey-filters"
import SurveyComplete from "./survey-complete"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Topic {
  id: string
  name: string
}

interface SurveyQuestion {
  id: number
  text: string
  type: string
  parameters: Record<string, unknown> // More specific than 'any', can be refined further based on question types
  topicId: string | null
  topicName: string | null
}

interface SurveyFeedProps {
  initialTopics: Topic[]
}

export default function SurveyFeed({ initialTopics }: SurveyFeedProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState<SurveyQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [filters, setFilters] = useState<{ topicId: string | null }>({ topicId: null })

  // Function to fetch the next question
  const fetchQuestion = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchNextQuestion({
        topicId: filters.topicId,
      })

      if (result.success) {
        if (result.question) {
          setCurrentQuestion(result.question as SurveyQuestion)
          setIsComplete(false)
        } else {
          setCurrentQuestion(null)
          setIsComplete(true)
        }
      } else {
        setError(result.error || "Failed to fetch question")
      }
    } catch (err) {
      console.error("Error fetching question:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [filters.topicId])

  // Fetch first question on mount and when filters change
  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  // Handle filter changes
  const handleFilterChange = (newFilters: { topicId: string | null }) => {
    setFilters(newFilters)
  }

  // Handle answer selection
  const handleAnswerSelect = (answer: string | number) => {
    setSelectedAnswer(answer)
  }

  // Handle answer submission
  const handleSubmit = async () => {
    if (!currentQuestion || !selectedAnswer) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitSurveyResponse({
        questionId: currentQuestion.id,
        answer: selectedAnswer,
      })

      if (result.success) {
        // Reset selected answer
        setSelectedAnswer(null)

        // Fetch the next question
        await fetchQuestion()

        // Refresh the page to update any global stats
        router.refresh()
      } else {
        setError(result.error || "Failed to submit answer")
      }
    } catch (err) {
      console.error("Error submitting answer:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle retry on error
  const handleRetry = () => {
    fetchQuestion()
  }

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <SurveyFilters
        topics={initialTopics}
        selectedTopicId={filters.topicId}
        onFilterChange={handleFilterChange}
        disabled={isLoading || isSubmitting}
      />

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <button onClick={handleRetry} className="text-sm underline" disabled={isLoading || isSubmitting}>
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Survey question card */}
      {!isLoading && !isComplete && currentQuestion && (
        <SurveyQuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Completion state */}
      {!isLoading && isComplete && <SurveyComplete onReset={() => setFilters({ topicId: null })} />}
    </div>
  )
}
