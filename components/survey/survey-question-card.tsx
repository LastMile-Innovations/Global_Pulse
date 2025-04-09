"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import SurveyMultipleChoice from "./question-types/survey-multiple-choice"
import SurveySliderScale from "./question-types/survey-slider-scale"
import SurveySimpleButtons from "./question-types/survey-simple-buttons"

// Define the structure for a survey question (matching SurveyFeed)
interface SurveyQuestion {
  id: number
  text: string
  type: string
  parameters: {
    options?: Array<{ id: string; text: string }>
    min?: number
    max?: number
    step?: number
    minLabel?: string
    maxLabel?: string
  }
  topicId: string | null
  topicName: string | null
}

interface SurveyQuestionCardProps {
  question: SurveyQuestion
  selectedAnswer: string | number | null
  onAnswerSelect: (answer: string | number) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function SurveyQuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  onSubmit,
  isSubmitting,
}: SurveyQuestionCardProps) {
  // Determine if the submit button should be enabled
  const canSubmit = !!selectedAnswer && !isSubmitting

  // Render the appropriate input component based on question type
  const renderQuestionInput = () => {
    switch (question.type) {
      case "multipleChoice":
        return question.parameters.options ? (
          <SurveyMultipleChoice
            options={question.parameters.options}
            selectedOptionId={typeof selectedAnswer === 'string' ? selectedAnswer : null}
            onSelect={onAnswerSelect}
            disabled={isSubmitting}
          />
        ) : null
      case "sliderScale":
        return (
          <SurveySliderScale
            min={question.parameters.min ?? 0}
            max={question.parameters.max ?? 100}
            step={question.parameters.step ?? 1}
            minLabel={question.parameters.minLabel ?? ''}
            maxLabel={question.parameters.maxLabel ?? ''}
            value={typeof selectedAnswer === 'number' ? selectedAnswer : null}
            onChange={onAnswerSelect}
            disabled={isSubmitting}
          />
        )
      case "buttons":
        return question.parameters.options ? (
          <SurveySimpleButtons
            options={question.parameters.options}
            selectedOptionId={typeof selectedAnswer === 'string' ? selectedAnswer : null}
            onSelect={onAnswerSelect}
            disabled={isSubmitting}
          />
        ) : null
      default:
        return (
          <div className="p-4 bg-muted rounded-md text-muted-foreground">
            Unsupported question type: {question.type}
          </div>
        )
    }
  }

  return (
    <Card className="w-full shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {question.topicName && (
            <Badge variant="outline" className="mb-2">
              {question.topicName}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>{renderQuestionInput()}</CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">Your response is anonymous and helps build global insights</div>
        <Button onClick={onSubmit} disabled={!canSubmit}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit & Next"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
