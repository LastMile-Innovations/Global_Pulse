"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"

type SurveyOption = {
  id: string
  text: string
  count: number
}

type SurveyResultsProps = {
  surveyId: string
  initialOptions: SurveyOption[]
  totalVotes: number
}

export default function RealTimeSurveyResults({
  surveyId,
  initialOptions,
  totalVotes: initialTotal,
}: SurveyResultsProps) {
  const [options, setOptions] = useState<SurveyOption[]>(initialOptions)
  const [totalVotes, setTotalVotes] = useState(initialTotal)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Set up real-time subscription for survey updates
    const channel = supabase
      .channel(`survey-${surveyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "survey_responses",
          filter: `survey_id=eq.${surveyId}`,
        },
        (payload) => {
          // Update the count for the selected option
          const optionId = payload.new.option_id

          setOptions((currentOptions) =>
            currentOptions.map((option) => (option.id === optionId ? { ...option, count: option.count + 1 } : option)),
          )

          setTotalVotes((current) => current + 1)

          // Refresh the data after a short delay to ensure consistency
          setTimeout(() => {
            router.refresh()
          }, 5000)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [surveyId, supabase, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Survey Results</span>
          <span className="text-sm font-normal text-muted-foreground">{totalVotes} votes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.count / totalVotes) * 100) : 0

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.text}</span>
                  <span className="text-sm text-muted-foreground">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
