import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import SurveyFeed from "./components/survey-feed"
import SurveyFeedSkeleton from "./components/survey-feed-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { safeQueryExecution } from "@/lib/supabase/error-handling"

export default async function SurveyPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Survey Feed</h1>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="py-6 text-center">
            <p className="mb-6 text-muted-foreground">Please log in to participate in surveys</p>
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch available topics for filters with safe error handling
  const { data: topics, tableNotFound } = await safeQueryExecution(
    () => supabase.from("topics").select("id, name").order("name").limit(20),
    [] // Fallback to empty array if table doesn't exist
  )

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Survey Feed</h1>
      <p className="text-muted-foreground mb-8">
        Answer questions one at a time and contribute to the global pulse. Your responses help build a clearer picture
        of global opinion.
      </p>

      <Suspense fallback={<SurveyFeedSkeleton />}>
        <SurveyFeed userId={user.id} initialTopics={topics || []} />
      </Suspense>
    </div>
  )
}
