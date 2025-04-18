"use client"

import { experimental_useObject } from "ai/react"
import { UIComponentSchema } from "@/lib/ai-sdk/schemas/ui_components"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { SliderComponent } from "@/components/genui/components/SliderComponent"
import { MultipleChoiceComponent } from "@/components/genui/components/MultipleChoiceComponent"
import { ConfirmationComponent } from "@/components/genui/components/ConfirmationComponent"
import { InfoCardComponent } from "@/components/genui/components/InfoCardComponent"
import { FormInputComponent } from "@/components/genui/components/FormInputComponent"
import type {
  UIComponent,
  SliderComponent as SliderProps,
  MultipleChoiceComponent as MultipleChoiceProps,
  ConfirmationComponent as ConfirmationProps,
  InfoCardComponent as InfoCardProps,
  FormInputComponent as FormInputProps,
} from "@/lib/ai-sdk/schemas/ui_components"

interface DynamicUIRendererProps {
  sessionId?: string
  onSubmit?: (result: any) => void
  onError?: (error: Error) => void
  components: UIComponent[]
}

export function DynamicUIRenderer({ sessionId, onSubmit, onError, components }: DynamicUIRendererProps) {
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
  const handleComponentSubmit = async (componentIndex: number, data: any) => {
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
  return (
    <div className="space-y-8">
      {components.map((component, index) => {
        const key = index // Use index as key

        switch (component.type) {
          case "slider":
            // component is now narrowed to SliderProps
            return (
              <SliderComponent
                key={key}
                type={component.type}
                label={component.label}
                description={component.description}
                min={component.min}
                max={component.max}
                step={component.step}
                defaultValue={component.defaultValue}
                minLabel={component.minLabel}
                maxLabel={component.maxLabel}
                showValue={component.showValue}
                onSubmit={(data) => handleComponentSubmit(index, data)}
              />
            )
          case "multipleChoice":
            // component is now narrowed to MultipleChoiceProps
            return (
              <MultipleChoiceComponent
                key={key}
                type={component.type} // Pass the literal type
                question={component.question}
                description={component.description}
                options={component.options}
                allowMultiple={component.allowMultiple}
                defaultSelected={component.defaultSelected}
                onSubmit={(data) => handleComponentSubmit(index, data)}
              />
            )
          case "confirmation":
            // component is now narrowed to ConfirmationProps
            return (
              <ConfirmationComponent
                key={key}
                type={component.type}
                message={component.message}
                description={component.description}
                confirmLabel={component.confirmLabel}
                denyLabel={component.denyLabel}
                confirmStyle={component.confirmStyle}
                onSubmit={(data) => handleComponentSubmit(index, data)}
              />
            )
          case "infoCard":
            // component is now narrowed to InfoCardProps
            return (
              <InfoCardComponent
                key={key}
                type={component.type}
                title={component.title}
                content={component.content}
                imageUrl={component.imageUrl}
                footer={component.footer}
                variant={component.variant}
                // No onSubmit for InfoCard
              />
            )
          case "formInput":
            // component is now narrowed to FormInputProps
            return (
              <FormInputComponent
                key={key}
                type={component.type}
                label={component.label}
                inputType={component.inputType}
                placeholder={component.placeholder}
                defaultValue={component.defaultValue}
                required={component.required}
                description={component.description}
                validation={component.validation}
                onSubmit={(data) => handleComponentSubmit(index, data)}
              />
            )
          default:
            const exhaustiveCheck: never = component;
            console.warn(`Unsupported component type: ${(exhaustiveCheck as any)?.type}`)
            return null
        }
      })}
    </div>
  )
}

// Export the generateUI function for external use
