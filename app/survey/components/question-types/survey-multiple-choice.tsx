"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Option {
  id: string
  text: string
}

interface SurveyMultipleChoiceProps {
  options: Option[]
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  disabled?: boolean
}

export default function SurveyMultipleChoice({
  options,
  selectedOptionId,
  onSelect,
  disabled = false,
}: SurveyMultipleChoiceProps) {
  return (
    <RadioGroup value={selectedOptionId || ""} onValueChange={onSelect} className="space-y-3 pt-2">
      {options.map((option) => (
        <div
          key={option.id}
          className={`
            flex items-center space-x-3 rounded-md border p-3 transition-colors
            ${selectedOptionId === option.id ? "border-primary bg-primary/5" : ""}
            ${disabled ? "opacity-70 cursor-not-allowed" : "hover:bg-muted/50 cursor-pointer"}
          `}
          onClick={() => !disabled && onSelect(option.id)}
        >
          <RadioGroupItem value={option.id} id={option.id} disabled={disabled} className="sr-only" />
          <div
            className={`
            h-4 w-4 rounded-full border flex-shrink-0 transition-colors
            ${selectedOptionId === option.id ? "border-primary bg-primary" : "border-muted-foreground"}
          `}
          >
            {selectedOptionId === option.id && <div className="h-2 w-2 bg-primary-foreground rounded-full m-auto" />}
          </div>
          <Label htmlFor={option.id} className={`flex-grow cursor-pointer ${disabled ? "cursor-not-allowed" : ""}`}>
            {option.text}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
