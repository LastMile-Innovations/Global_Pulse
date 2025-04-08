"use client"

import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"

interface SurveySliderScaleProps {
  min: number
  max: number
  step?: number
  minLabel?: string
  maxLabel?: string
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}

export default function SurveySliderScale({
  min,
  max,
  step = 1,
  minLabel,
  maxLabel,
  value,
  onChange,
  disabled = false,
}: SurveySliderScaleProps) {
  // Use internal state to handle the slider value
  const [sliderValue, setSliderValue] = useState<number[]>([value || Math.floor((min + max) / 2)])

  // Update the parent component when the slider value changes
  useEffect(() => {
    if (sliderValue[0] !== value) {
      onChange(sliderValue[0])
    }
  }, [sliderValue, onChange, value])

  // Update internal state when the prop value changes
  useEffect(() => {
    if (value !== null && value !== sliderValue[0]) {
      setSliderValue([value])
    }
  }, [value, sliderValue])

  return (
    <div className="py-6 px-2">
      <Slider
        value={sliderValue}
        min={min}
        max={max}
        step={step}
        onValueChange={setSliderValue}
        disabled={disabled}
        className="mb-6"
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{minLabel || min}</div>
        <div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">{sliderValue[0]}</div>
        <div className="text-sm text-muted-foreground">{maxLabel || max}</div>
      </div>
    </div>
  )
}
