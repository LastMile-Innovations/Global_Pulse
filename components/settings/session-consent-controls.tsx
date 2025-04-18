"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SessionConsentControlsProps {
  userId: string
  sessionId: string
  // Main consent flags from user profile
  consentAggregation: boolean
  consentAnonymizedPatternTraining: boolean
}

export function SessionConsentControls({
  userId,
  sessionId,
  consentAggregation,
  consentAnonymizedPatternTraining,
}: SessionConsentControlsProps) {
  const [sessionPauseAggregation, setSessionPauseAggregation] = useState(false)
  const [sessionPauseTraining, setSessionPauseTraining] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Fetch current session pause settings
  useEffect(() => {
    async function fetchSessionSettings() {
      try {
        const response = await fetch(`/api/session/settings?userId=${userId}&sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setSessionPauseAggregation(data.sessionPauseAggregation || false)
          setSessionPauseTraining(data.sessionPauseTraining || false)
        }
      } catch (error) {
        console.error("Error fetching session settings:", error)
      }
    }

    fetchSessionSettings()
  }, [userId, sessionId])

  // Update session pause settings
  const updateSessionPause = async (type: "aggregation" | "training", paused: boolean) => {
    setLoading(true)

    try {
      const response = await fetch("/api/session/settings/pause_contributions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sessionId,
          aggregationPaused: type === "aggregation" ? paused : sessionPauseAggregation,
          trainingPaused: type === "training" ? paused : sessionPauseTraining,
        }),
      })

      if (response.ok) {
        if (type === "aggregation") {
          setSessionPauseAggregation(paused)
        } else {
          setSessionPauseTraining(paused)
        }

        toast({
          title: "Session settings updated",
          description: `Contributions to ${type === "aggregation" ? "Aggregate Insights" : "AI Training"} ${
            paused ? "paused" : "resumed"
          } for this session.`,
        })
      } else {
        throw new Error("Failed to update session settings")
      }
    } catch (error) {
      console.error(`Error updating session pause settings:`, error)
      toast({
        title: "Error",
        description: "Failed to update session settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Temporary Session Controls</CardTitle>
        <CardDescription>
          These settings apply to the current session only and will reset when you log out or your session expires.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="outline" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Session-Level Controls</AlertTitle>
          <AlertDescription className="text-blue-700">
            These temporary controls allow you to pause contributions for your current session only, without changing
            your permanent consent settings.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sessionPauseAggregation" className="text-base font-medium">
                Pause Contributions to Aggregate Insights
              </Label>
              <p className="text-sm text-gray-500">
                Temporarily stop your data from being included in anonymized aggregate insights
              </p>
            </div>
            <Switch
              id="sessionPauseAggregation"
              checked={sessionPauseAggregation}
              onCheckedChange={(checked) => updateSessionPause("aggregation", checked)}
              disabled={loading || !consentAggregation}
            />
          </div>

          {!consentAggregation && (
            <Alert variant="outline" className="bg-gray-50 border-gray-200 mt-1">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700 text-xs">
                This control is inactive because you have not enabled Aggregate Insights in your main consent settings.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sessionPauseTraining" className="text-base font-medium">
                Pause Contributions to AI Training
              </Label>
              <p className="text-sm text-gray-500">
                Temporarily stop your data from being used for anonymized pattern training
              </p>
            </div>
            <Switch
              id="sessionPauseTraining"
              checked={sessionPauseTraining}
              onCheckedChange={(checked) => updateSessionPause("training", checked)}
              disabled={loading || !consentAnonymizedPatternTraining}
            />
          </div>

          {!consentAnonymizedPatternTraining && (
            <Alert variant="outline" className="bg-gray-50 border-gray-200 mt-1">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700 text-xs">
                This control is inactive because you have not enabled AI Training in your main consent settings.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
