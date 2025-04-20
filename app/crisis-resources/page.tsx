"use client"

import { useState } from "react"
import { GetCrisisResources } from "@/components/distress/get-crisis-resources"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CrisisResourcesDemo() {
  const [locale, setLocale] = useState<string>("en-US")

  const locales = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "en-CA", label: "English (Canada)" },
    { value: "en-AU", label: "English (Australia)" },
    { value: "en-NZ", label: "English (New Zealand)" },
    { value: "en-IN", label: "English (India)" },
    { value: "en-IE", label: "English (Ireland)" },
    { value: "fr-FR", label: "French (France)" },
    { value: "unknown", label: "Unknown (Default)" },
  ]

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Crisis Resources Component Demo</CardTitle>
          <CardDescription>
            This demonstrates how the crisis resources component adapts to different locales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select User Locale:</label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select locale" />
              </SelectTrigger>
              <SelectContent>
                {locales.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-8">
            <GetCrisisResources locale={locale} onClose={() => console.log("Close clicked")} />
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
        <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">⚠️ Important Implementation Notes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All crisis numbers must be verified with official sources before deployment</li>
          <li>This component should only be shown in response to detected critical distress</li>
          <li>The guardrails service should log when this component is displayed</li>
          <li>Consider adding more localized resources over time</li>
          <li>Ensure the component is accessible and works on all devices</li>
        </ul>
      </div>
    </div>
  )
}
