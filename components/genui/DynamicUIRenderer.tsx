"use client"

import { experimental_useObject } from "ai/react"
import { UIComponentSchema } from "@/lib/ai-sdk/schemas/ui_components"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { SliderComponent } from "./components/SliderComponent"
import { MultipleChoiceComponent } from "./components/MultipleChoiceComponent"
import { ConfirmationComponent } from "./components/ConfirmationComponent"
import { InfoCardComponent } from "./components/InfoCardComponent"
import { FormInputComponent } from "./components/FormInputComponent"

interface DynamicUIRendererProps {
  sessionId?: string
  onSubmit?: (result: any) => void
  onError?: (error: Error) => void
}

export function DynamicUIRenderer({ sessionId, onSubmit, onError }: DynamicUIRendererProps) {
  const [context, setContext] = useState<Record<string, any> | null>(null)
  const [targetSchema, setTargetSchema] = useState<string | null>(null)

  const { object, submit, error, isLoading } = experimental_useObject({
    api: "/api/genui",
    schema: UIComponentSchema,
  })

  // Function to trigger UI generation
  const generateUI = (schemaName: string, contextData: Record<string, any>) => {
    setContext(contextData)
    setTargetSchema(schemaName)
    submit({
      targetSchemaName: schemaName,
      context: contextData,
      sessionId,
    })
  }

  // Handle submission from UI components
  const handleComponentSubmit = async (data: any) => {
    if (!targetSchema || !context) return

    try {
      const response = await fetch("/api/genui/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          componentType: targetSchema,
          data,
          sessionId,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.statusText}`)
      }

      const result = await response.json()

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(result)
      }
    } catch (err) {
      console.error("Error submitting UI data:", err)
      if (onError && err instanceof Error) {
        onError(err)
      }
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to generate UI component: {error.message}</AlertDescription>
      </Alert>
    )
  }

  // If no object yet, return null
  if (!object) {
    return null
  }

  // Render the appropriate component based on the type
  switch (object.type) {
    case "slider":
      return <SliderComponent {...object} onSubmit={handleComponentSubmit} />
    case "multipleChoice":
      return <MultipleChoiceComponent {...object} onSubmit={handleComponentSubmit} />
    case "confirmation":
      return <ConfirmationComponent {...object} onSubmit={handleComponentSubmit} />
    case "infoCard":
      return <InfoCardComponent {...object} />
    case "formInput":
      return <FormInputComponent {...object} onSubmit={handleComponentSubmit} />
    default:
      return <div>Unsupported component type</div>
  }
}

// Export the generateUI function for external use
