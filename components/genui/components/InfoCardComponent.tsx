"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { InfoCardComponent as InfoCardComponentType } from "@/ai-sdk/schemas/ui_components"

interface InfoCardComponentProps extends InfoCardComponentType {}

export function InfoCardComponent({ title, content, imageUrl, footer, variant = "default" }: InfoCardComponentProps) {
  // Map variant to card styles
  const getCardClassName = () => {
    switch (variant) {
      case "info":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "danger":
        return "border-red-200 bg-red-50"
      default:
        return ""
    }
  }

  return (
    <Card className={`w-full ${getCardClassName()}`}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      {imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title || "Information card image"}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-t-lg"
          />
        </div>
      )}
      <CardContent className={title ? "" : "pt-6"}>
        <div className="prose prose-sm max-w-none">{content}</div>
      </CardContent>
      {footer && (
        <CardFooter>
          <CardDescription>{footer}</CardDescription>
        </CardFooter>
      )}
    </Card>
  )
}
