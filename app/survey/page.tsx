import { Suspense } from "react"
import { db, schema } from "@/lib/db"
import { asc } from "drizzle-orm"
import { createClient } from "@/utils/supabase/server"
import SurveyFeed from "@/components/survey/survey-feed"
import SurveyFeedSkeleton from "@/components/survey/survey-feed-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SurveyPage() {
  const supabase = await createClient()
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

  // Fetch available topics for filters with Drizzle and basic error handling
  let topics: { id: string; name: string }[] = [];
  try {
    const dbTopics = await db
      .select({ id: schema.topics.id, name: schema.topics.name })
      .from(schema.topics)
      .orderBy(asc(schema.topics.name))
      .limit(20);
    
    // Map results to convert numeric ID to string
    topics = dbTopics.map(topic => ({
      ...topic,
      id: topic.id.toString(), 
    }));

  } catch (error) {
    console.error("Error fetching topics:", error);
    // Fallback to empty array on error
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Survey Feed</h1>
      <p className="text-muted-foreground mb-8">
        Answer questions one at a time and contribute to the global pulse. Your responses help build a clearer picture
        of global opinion.
      </p>

      <Suspense fallback={<SurveyFeedSkeleton />}>
        <SurveyFeed initialTopics={topics} />
      </Suspense>
    </div>
  )
}
