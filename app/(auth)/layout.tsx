import type React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <Alert variant="destructive" className="mb-6 max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
        This is a proof of concept and prototype. Features beyond /signup and /login might not work or be incomplete as this is pre-beta.
        </AlertDescription>
      </Alert>
      {children}
    </main>
  )
}
