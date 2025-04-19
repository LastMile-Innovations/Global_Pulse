"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { SliderComponent as SliderComponentType } from "@/lib/ai-sdk/schemas/ui_components"

interface SliderComponentProps extends SliderComponentType {
  onSubmit: (data: any) => void
}

export function SliderComponent({
  label,
  description,
  min,
  max,
  step = 1,
  defaultValue,
  minLabel,
  maxLabel,
  showValue = true,
  onSubmit,
}: SliderComponentProps) {
  const initialValue = defaultValue !== undefined ? defaultValue : Math.floor((min + max) / 2)
  const [value, setValue] = useState(initialValue)

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue[0])
  }

  const handleSubmit = () => {
    onSubmit({
      value,
      label,
      min,
      max,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Slider
            value={[value]}
            min={min}
            max={max}
            step={step}
            onValueChange={handleValueChange}
            aria-label={label}
          />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{minLabel || min}</span>
            {showValue && <span className="font-medium text-primary">{value}</span>}
            <span>{maxLabel || max}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
