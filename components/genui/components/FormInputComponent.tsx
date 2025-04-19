"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormInputComponent as FormInputComponentType } from "@/lib/ai-sdk/schemas/ui_components"

interface FormInputComponentProps extends FormInputComponentType {
  onSubmit: (data: any) => void
}

export function FormInputComponent({
  label,
  inputType,
  placeholder,
  defaultValue = "",
  required = false,
  description,
  validation,
  onSubmit,
}: FormInputComponentProps) {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)

    // Clear error when user types
    if (error) {
      setError(null)
    }
  }

  const validateInput = (): boolean => {
    // Required validation
    if (required && !value.trim()) {
      setError("This field is required")
      return false
    }

    // Validation rules if provided
    if (validation) {
      // Pattern validation
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        setError("Invalid format")
        return false
      }

      // Length validation
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        setError(`Must be at least ${validation.minLength} characters`)
        return false
      }

      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        setError(`Must be no more than ${validation.maxLength} characters`)
        return false
      }
    }

    return true
  }

  const handleSubmit = () => {
    if (validateInput()) {
      onSubmit({
        value,
        label,
        inputType,
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="input-field" className="text-sm font-medium">
            {required ? <span className="text-destructive">*</span> : null} {label}
          </Label>
          <Input
            id="input-field"
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={required}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
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
