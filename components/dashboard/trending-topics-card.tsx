import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cacheQuery, createCacheKey } from "@/lib/redis/client"
import { ErrorDisplay } from "@/components/ui/error-display"

interface TrendingTopic {
  id: string;
  name: string;
  engagement_count: number | null;
}

const CACHE_PREFIX = "dashboard:trending_topics"
const CACHE_TTL_SECONDS = 3600 // 1 hour

async function TrendingTopicsCardComponent() {
  const supabase = await createClient()
  const cacheKey = createCacheKey(CACHE_PREFIX)
  let topics: TrendingTopic[] | null = null
  let fetchError: Error | null = null

  try {
    topics = await cacheQuery<TrendingTopic[] | null>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from("topics")
          .select("id, name, engagement_count")
          .order("engagement_count", { ascending: false })
          .limit(5) // Show top 5 trending
        if (error) throw error
        return data
      },
      { ttl: CACHE_TTL_SECONDS, tags: ["topics"] },
    )
  } catch (err) {
    console.error("Error fetching/caching trending topics:", err)
    fetchError = err instanceof Error ? err : new Error(String(err))
  }

  if (fetchError) {
    return <ErrorDisplay message="Could not load trending topics. Please try again later." />
  }

  const topicsToShow = topics?.length
    ? topics
    : [
        { id: "climate-change", name: "Climate Change", engagement_count: 1250 },
        { id: "ai-regulation", name: "AI Regulation", engagement_count: 980 },
        { id: "future-of-work", name: "Future of Work", engagement_count: 875 },
        { id: "global-economy", name: "Global Economy", engagement_count: 720 },
        { id: "healthcare", name: "Healthcare", engagement_count: 650 },
      ]

  if (!topicsToShow.length) {
    return <p className="text-sm text-muted-foreground">No trending topics currently available.</p>
  }

  return (
    <div className="space-y-4">
      {topicsToShow.map((topic: TrendingTopic) => (
        <div key={topic.id} className="flex items-center justify-between hover:bg-muted/30 p-2 -m-2 rounded-md transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-sm">{topic.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{topic.engagement_count?.toLocaleString() ?? 0}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/explore?topic=${encodeURIComponent(topic.name)}`}>
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Explore {topic.name}</span>
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

TrendingTopicsCardComponent.Loading = function TrendingTopicsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrendingTopicsCardComponent;
