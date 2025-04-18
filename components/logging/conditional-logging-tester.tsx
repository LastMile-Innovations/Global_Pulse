"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

export function ConditionalLoggingTester() {
  const [userId, setUserId] = useState("test-user")
  const [sessionId, setSessionId] = useState("test-session")
  const [message, setMessage] = useState("")
  const [insightMode, setInsightMode] = useState(true)
  const [detailedLoggingConsent, setDetailedLoggingConsent] = useState(false)
  const [trainingConsent, setTrainingConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const updateConsent = async (consentType: string, value: boolean) => {
    try {
      setLoading(true)

      const response = await fetch("/api/profile/consents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          [consentType]: value,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update consent")
      }

      if (consentType === "consentDetailedAnalysisLogging") {
        setDetailedLoggingConsent(value)
      } else if (consentType === "consentAnonymizedPatternTraining") {
        setTrainingConsent(value)
      }
    } catch (error) {
      console.error("Error updating consent:", error)
      alert("Failed to update consent")
    } finally {
      setLoading(false)
    }
  }

  const toggleInsightMode = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/session/mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sessionId,
          active: !insightMode,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle insight mode")
      }

      setInsightMode(!insightMode)
    } catch (error) {
      console.error("Error toggling insight mode:", error)
      alert("Failed to toggle insight mode")
    } finally {
      setLoading(false)
    }
  }

  const processMessage = async () => {
    if (!message.trim()) return

    try {
      setLoading(true)

      const response = await fetch("/api/pulse/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: userId,
          sessionID: sessionId,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process message")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error processing message:", error)
      alert("Failed to process message")
    } finally {
      setLoading(false)
    }
  }

  const fetchConsents = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/profile/consents?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch consents")
      }

      const data = await response.json()
      setDetailedLoggingConsent(data.consentDetailedAnalysisLogging || false)
      setTrainingConsent(data.consentAnonymizedPatternTraining || false)
    } catch (error) {
      console.error("Error fetching consents:", error)
      alert("Failed to fetch consents")
    } finally {
      setLoading(false)
    }
  }

  const fetchInsightMode = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/session/mode?userId=${userId}&sessionId=${sessionId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch insight mode")
      }

      const data = await response.json()
      setInsightMode(data.insightMode)
    } catch (error) {
      console.error("Error fetching insight mode:", error)
      alert("Failed to fetch insight mode")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Conditional Logging Tester</CardTitle>
        <CardDescription>
          Test the conditional logging of EWEF analysis results based on insight mode and consent settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionId">Session ID</Label>
            <Input id="sessionId" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={fetchConsents} disabled={loading}>
            Fetch Consents
          </Button>
          <Button variant="outline" size="sm" onClick={fetchInsightMode} disabled={loading}>
            Fetch Insight Mode
          </Button>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Insight Mode</h3>
              <p className="text-xs text-gray-500">Controls whether detailed analysis is stored</p>
            </div>
            <Switch checked={insightMode} onCheckedChange={toggleInsightMode} disabled={loading} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Detailed Analysis Logging</h3>
              <p className="text-xs text-gray-500">Consent to store detailed EWEF analysis</p>
            </div>
            <Switch
              checked={detailedLoggingConsent}
              onCheckedChange={(value) => updateConsent("consentDetailedAnalysisLogging", value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Anonymized Pattern Training</h3>
              <p className="text-xs text-gray-500">Consent to use data for training</p>
            </div>
            <Switch
              checked={trainingConsent}
              onCheckedChange={(value) => updateConsent("consentAnonymizedPatternTraining", value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Enter a message to process..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium mb-2">Processing Result</h3>
            <div className="text-xs overflow-auto max-h-[200px]">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={processMessage} disabled={loading || !message.trim()} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Message"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
