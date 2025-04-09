import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DatabaseErrorFallbackProps {
  title?: string
  message?: string
  showHomeButton?: boolean
  compact?: boolean
}

export function DatabaseErrorFallback({
  title = "Database Error",
  message = "The database tables may not be set up yet.",
  showHomeButton = false,
  compact = false
}: DatabaseErrorFallbackProps) {
  return (
    <Card className={`${compact ? "p-4" : ""} border-destructive/50 bg-destructive/10`}>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className={`flex items-center ${compact ? "text-base font-medium" : ""} text-destructive`}>
          <AlertCircle className={`${compact ? "h-4 w-4" : "h-5 w-5"} mr-2`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`${compact ? "text-sm" : "mb-4"}`}>{message}</p>
        {showHomeButton && (
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
