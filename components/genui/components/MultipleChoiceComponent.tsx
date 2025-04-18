"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { MultipleChoiceComponent as MultipleChoiceComponentType } from "@/ai-sdk/schemas/ui_components"

interface MultipleChoiceComponentProps extends MultipleChoiceComponentType {
  onSubmit: (data: any) => void
}

export function MultipleChoiceComponent({
  question,
  description,
  options,
  allowMultiple = false,
  defaultSelected = [],
  onSubmit,
}: MultipleChoiceComponentProps) {
  // For multiple selection (checkboxes)
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    defaultSelected
  )

  // For single selection (radio buttons)
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    defaultSelected.length > 0 ? defaultSelected[0] : undefined
  )

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions((prev) => [...prev, optionValue])
    } else {
      setSelectedOptions((prev) => prev.filter((item) => item !== optionValue))
    }
  }

  const handleRadioChange = (optionValue: string) => {
    setSelectedOption(optionValue)
  }

  const handleSubmit = () => {
    onSubmit({
      selectedOptions: allowMultiple ? selectedOptions : [selectedOption],
      question,
      allowMultiple,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{question}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {allowMultiple ? (
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option.value)}
                  onCheckedChange={(checked) => handleCheckboxChange(option.value, checked === true)}
                  disabled={option.disabled}
                />
                <Label htmlFor={`option-${index}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup value={selectedOption} onValueChange={handleRadioChange}>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`option-${index}`} disabled={option.disabled} />
                  <Label htmlFor={`option-${index}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={allowMultiple ? selectedOptions.length === 0 : !selectedOption}
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
