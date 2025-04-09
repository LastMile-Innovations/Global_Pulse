'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-semibold mb-4">Something went wrong!</h2>
          <p className="text-muted-foreground mb-6">
            An application-level error occurred. Please try refreshing the page.
          </p>
          {/* Note: The reset function might not always work for global errors,
              especially if the root layout itself is broken. 
              A full page refresh might be necessary. */}
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  )
}
