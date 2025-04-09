import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cacheQuery, createCacheKey } from "@/lib/redis/enhanced-client"
import { ErrorDisplay } from "@/components/ui/error-display"

interface Topic {
  id: string;
  name: string;
  description: string | null;
}

const CACHE_PREFIX = "dashboard:suggested_topics"
const CACHE_TTL_SECONDS = 3600

async function SuggestedTopicsComponent() {
  const supabase = createClient()
  const cacheKey = createCacheKey(CACHE_PREFIX)
  let topics: Topic[] | null = null
  let fetchError: Error | null = null

  try {
    topics = await cacheQuery<Topic[] | null>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from("topics")
          .select("id, name, description")
          .order("engagement_count", { ascending: false })
          .limit(5)
        if (error) throw error
        return data
      },
      { ttl: CACHE_TTL_SECONDS, tags: ["topics"] },
    )
  } catch (err) {
    console.error("Error fetching/caching suggested topics:", err)
    fetchError = err instanceof Error ? err : new Error(String(err))
  }

  if (fetchError) {
    return <ErrorDisplay message="Could not load suggestions. Please try again later." />
  }

  const topicsToShow = topics?.length
    ? topics
    : [
        { id: "climate-change", name: "Climate Change", description: "Environmental policies and impact" },
        { id: "ai-regulation", name: "AI Regulation", description: "Governance of artificial intelligence" },
        { id: "future-of-work", name: "Future of Work", description: "Remote work and automation trends" },
        { id: "global-economy", name: "Global Economy", description: "Economic trends and forecasts" },
        { id: "space-exploration", name: "Space Exploration", description: "Latest missions and discoveries" },
      ]

  return (
    <div className="space-y-3">
      {topicsToShow.map((topic: Topic) => (
        <Link
          key={topic.id}
          href={`/chat/new?topic=${encodeURIComponent(topic.name)}`}
          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
        >
          <div className="bg-primary/10 p-1.5 rounded-full mt-0.5 group-hover:bg-primary/20 transition-colors">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">{topic.name}</div>
            {topic.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{topic.description}</div>}
          </div>
        </Link>
      ))}
    </div>
  )
}

SuggestedTopicsComponent.Loading = function SuggestedTopicsLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
          <Skeleton className="h-7 w-7 rounded-full mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default SuggestedTopicsComponent
