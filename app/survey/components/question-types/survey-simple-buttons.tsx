"use client"

import { Button } from "@/components/ui/button"

interface Option {
  id: string
  text: string
}

interface SurveySimpleButtonsProps {
  options: Option[]
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  disabled?: boolean
}

export default function SurveySimpleButtons({
  options,
  selectedOptionId,
  onSelect,
  disabled = false,
}: SurveySimpleButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3 py-2">
      {options.map((option) => (
        <Button
          key={option.id}
          variant={selectedOptionId === option.id ? "default" : "outline"}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          className="min-w-[100px]"
        >
          {option.text}
        </Button>
      ))}
    </div>
  )
}
