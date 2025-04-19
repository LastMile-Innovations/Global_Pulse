"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare, Info, ExternalLink } from "lucide-react"
import { getCrisisResources } from "@/lib/config/distress-resources.config"

interface CrisisResourcesProps {
  locale?: string
  onClose?: () => void
  className?: string
}

export function GetCrisisResources({ locale, onClose, className }: CrisisResourcesProps) {
  const [resources, setResources] = useState(getCrisisResources(locale))

  useEffect(() => {
    // Update resources if locale changes
    setResources(getCrisisResources(locale))
  }, [locale])

  return (
    <Card className={`w-full max-w-md shadow-lg ${className}`}>
      <CardHeader className="bg-destructive/10">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Info className="h-5 w-5" />
          Immediate Support Available
        </CardTitle>
        <CardDescription className="text-destructive/90">
          You don't have to face this alone
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            It sounds like things are extremely difficult right now. Please reach out to one of these resources for
            immediate support:
          </p>

          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-medium">Call: {resources.phone}</h3>
                {resources.description && <p className="text-xs text-muted-foreground">{resources.description}</p>}
              </div>
            </div>
          </div>

          {resources.textline && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium">Text: {resources.textline}</h3>
                  <p className="text-xs text-muted-foreground">Text-based crisis support</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm">
            These services provide confidential support from trained professionals who care and want to help.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 pb-4">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => window.open("https://findahelpline.com/i/iasp", "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Find More Resources
        </Button>
      </CardFooter>
    </Card>
  )
}
