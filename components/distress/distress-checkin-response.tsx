"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface DistressCheckinResponseProps {
  userId: string
  sessionId: string
  onResponse: (choice: string) => void
}

export function DistressCheckinResponse({ userId, sessionId, onResponse }: DistressCheckinResponseProps) {
  const [choice, setChoice] = useState<string>("Pause Both")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/feedback/session_pause_update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sessionId,
          pauseChoice: choice,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update session pause settings")
      }

      onResponse(choice)
    } catch (error) {
      console.error("Error updating session pause settings:", error)
      onResponse("Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Data Contribution Preferences</CardTitle>
        <CardDescription>
          You can temporarily pause data contributions for this session without affecting your overall consent settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={choice} onValueChange={setChoice} className="space-y-3">
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="Pause Both" id="pause-both" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="pause-both" className="font-medium">
                Pause All Contributions
              </Label>
              <p className="text-sm text-muted-foreground">Temporarily pause all data contributions for this session</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="Pause Insights Only" id="pause-insights" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="pause-insights" className="font-medium">
                Pause Aggregate Insights Only
              </Label>
              <p className="text-sm text-muted-foreground">Temporarily pause contributions to aggregate insights only</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="Pause Training Only" id="pause-training" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="pause-training" className="font-medium">
                Pause AI Training Only
              </Label>
              <p className="text-sm text-muted-foreground">Temporarily pause contributions to AI training only</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="Continue Both" id="continue-both" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="continue-both" className="font-medium">
                Continue All Contributions
              </Label>
              <p className="text-sm text-muted-foreground">Continue with your current consent settings</p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Updating..." : "Confirm"}
        </Button>
      </CardFooter>
    </Card>
  )
}
