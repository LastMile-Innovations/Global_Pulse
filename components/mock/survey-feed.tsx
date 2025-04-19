"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SurveyOption {
  id: string
  text: string
  selected?: boolean
  percentage?: number
}

interface Survey {
  id: string
  question: string
  options: SurveyOption[]
  category: string
  answered?: boolean
}

export default function SurveyFeed() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: "1",
      question: "Should AI development be regulated by international standards?",
      category: "Technology",
      options: [
        { id: "1a", text: "Yes, strict regulation needed", percentage: 42 },
        { id: "1b", text: "Some oversight, but limited", percentage: 38 },
        { id: "1c", text: "No, let innovation flourish", percentage: 15 },
        { id: "1d", text: "Unsure", percentage: 5 },
      ],
    },
    {
      id: "2",
      question: "What work arrangement do you prefer post-pandemic?",
      category: "Work",
      options: [
        { id: "2a", text: "Fully remote" },
        { id: "2b", text: "Hybrid (mix of remote and office)" },
        { id: "2c", text: "Fully in-office" },
        { id: "2d", text: "Flexible, based on needs" },
      ],
    },
    {
      id: "3",
      question: "Which global issue should receive the most urgent attention?",
      category: "Global Issues",
      options: [
        { id: "3a", text: "Climate change" },
        { id: "3b", text: "Economic inequality" },
        { id: "3c", text: "Public health" },
        { id: "3d", text: "Political instability" },
      ],
    },
  ])

  const handleOptionSelect = (optionId: string) => {
    setSurveys(
      surveys.map((survey, idx) => {
        if (idx === currentIndex) {
          return {
            ...survey,
            answered: true,
            options: survey.options.map((option) => ({
              ...option,
              selected: option.id === optionId,
              percentage: option.id === optionId ? 42 : option.id[1] === "a" ? 28 : option.id[1] === "b" ? 18 : 12,
            })),
          }
        }
        return survey
      }),
    )
  }

  const currentSurvey = surveys[currentIndex]

  const handleNext = () => {
    if (currentIndex < surveys.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="relative">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">
                {currentSurvey.category}
              </span>
              <span className="text-xs text-muted-foreground">Question {currentIndex + 1} of 3</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNext}
                disabled={currentIndex === surveys.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-xl mt-2">{currentSurvey.question}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {currentSurvey.options.map((option) => (
              <div
                key={option.id}
                className={`relative rounded-lg border p-3 transition-all ${
                  option.selected
                    ? "border-primary bg-primary/10"
                    : currentSurvey.answered
                      ? "border-muted bg-muted/30"
                      : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                }`}
                onClick={() => !currentSurvey.answered && handleOptionSelect(option.id)}
              >
                <div className="flex justify-between items-center">
                  <span className={option.selected ? "font-medium" : ""}>{option.text}</span>
                  {currentSurvey.answered && <span className="text-sm font-medium">{option.percentage}%</span>}
                </div>
                {currentSurvey.answered && (
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        option.selected ? "bg-primary" : "bg-primary/30"
                      } transition-all`}
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t p-3 flex justify-between items-center bg-muted/10">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BarChart2 className="h-3 w-3" />
            <span>10,482 responses so far</span>
          </div>
          {!currentSurvey.answered && <div className="text-xs text-muted-foreground">Tap an option to vote</div>}
        </CardFooter>
      </Card>
    </div>
  )
}
