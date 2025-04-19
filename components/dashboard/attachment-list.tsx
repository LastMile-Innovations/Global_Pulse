"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface Attachment {
  name: string
  type: string
  powerLevel: number
  valence: number
}

interface AttachmentListProps {
  attachments: Attachment[]
  type: "Value" | "Goal"
}

export function AttachmentList({ attachments, type }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>No {type.toLowerCase()}s available.</AlertDescription>
      </Alert>
    )
  }

  // Function to determine badge color based on valence
  const getValenceBadgeColor = (valence: number) => {
    if (valence > 7) return "bg-primary text-primary-foreground"          // Strong positive
    if (valence > 3) return "bg-primary/70 text-primary-foreground"   // Moderate positive
    if (valence > 0) return "bg-primary/40 text-primary-foreground/90" // Slight positive
    if (valence === 0) return "bg-muted text-muted-foreground"          // Neutral
    if (valence > -4) return "bg-destructive/40 text-destructive-foreground/90" // Slight negative
    if (valence > -8) return "bg-destructive/70 text-destructive-foreground"  // Moderate negative
    return "bg-destructive text-destructive-foreground"            // Strong negative
  }

  return (
    <div className="space-y-4">
      {attachments.map((attachment, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{attachment.name}</h3>
            <Badge className={`text-xs ${getValenceBadgeColor(attachment.valence)}`}>
              {attachment.valence > 0 ? "+" : ""}
              {attachment.valence}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Power Level:</span>
            <Progress value={attachment.powerLevel * 10} className="h-2" />
            <span className="text-sm font-medium">{attachment.powerLevel}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
