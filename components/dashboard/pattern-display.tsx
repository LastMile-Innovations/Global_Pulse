"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface Pattern {
  triggerContext: string
  commonReaction: string
  frequency: number
}

interface PatternDisplayProps {
  patterns: Pattern[]
}

export function PatternDisplay({ patterns }: PatternDisplayProps) {
  if (!patterns || patterns.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>No patterns detected yet.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">Trigger Context</h3>
              <p className="text-sm text-muted-foreground">{pattern.triggerContext}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Frequency</span>
              <p className="font-medium">{pattern.frequency}x</p>
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-medium">Common Reaction</h4>
            <p className="text-sm">{pattern.commonReaction}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
