"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { InfoCardComponent as InfoCardComponentType } from "@/lib/ai-sdk/schemas/ui_components"

interface InfoCardComponentProps extends InfoCardComponentType {}

export function InfoCardComponent({ title, content, imageUrl, footer, variant = "default" }: InfoCardComponentProps) {
  // Map variant to card styles
  const getCardClassName = () => {
    switch (variant) {
      case "info":
        return "border-primary/30 bg-primary/10 text-primary"
      case "success":
        return "border-secondary/30 bg-secondary/10 text-secondary"
      case "warning":
        return "border-accent/30 bg-accent/10 text-accent"
      case "danger":
        return "border-destructive/30 bg-destructive/10 text-destructive"
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
