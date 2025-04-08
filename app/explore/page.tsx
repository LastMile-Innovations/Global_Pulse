import { Suspense } from "react"
import { getTopics } from "@/lib/supabase/cached-queries"
import TopicEngagement from "@/components/topic-engagement"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Loading component for Suspense
function TopicsLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Topics component that fetches data
async function Topics() {
  // Use React.cache wrapped function
  const topics = await getTopics({ limit: 5 })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{topic.name}</span>
                <span className="text-sm text-muted-foreground">{topic.engagement_count} engagements</span>
              </div>
              <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(topic.engagement_count / 10, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{topic.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ExplorePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Explore Global Pulse</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Use Suspense for streaming */}
        <Suspense fallback={<TopicsLoading />}>
          <Topics />
        </Suspense>

        <TopicEngagement />
      </div>
    </div>
  )
}
