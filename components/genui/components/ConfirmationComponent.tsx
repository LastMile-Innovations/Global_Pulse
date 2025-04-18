"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ConfirmationComponent as ConfirmationComponentType } from "@/lib/ai-sdk/schemas/ui_components"

interface ConfirmationComponentProps extends ConfirmationComponentType {
  onSubmit: (data: any) => void
}

export function ConfirmationComponent({
  message,
  description,
  confirmLabel = "Confirm",
  denyLabel = "Cancel",
  confirmStyle = "primary",
  onSubmit,
}: ConfirmationComponentProps) {
  const handleConfirm = () => {
    onSubmit({
      confirmed: true,
      message,
    })
  }

  const handleDeny = () => {
    onSubmit({
      confirmed: false,
      message,
    })
  }

  // Map confirmStyle to button variant
  const getButtonVariant = () => {
    switch (confirmStyle) {
      case "success":
        return "success"
      case "danger":
        return "destructive"
      case "warning":
        return "warning"
      case "info":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confirmation</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-base">{message}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleDeny}>
          {denyLabel}
        </Button>
        <Button variant={getButtonVariant()} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
