"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, RefreshCw } from "lucide-react"

interface SurveyCompleteProps {
  onReset: () => void
}

export default function SurveyComplete({ onReset }: SurveyCompleteProps) {
  return (
    <Card className="w-full text-center">
      <CardContent className="pt-6 pb-4">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Survey Submitted!
        </h2>
        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Thank you for sharing your perspective. Your insights help paint a clearer picture of the world&apos;s pulse.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset Filters
        </Button>
      </CardFooter>
    </Card>
  )
}
