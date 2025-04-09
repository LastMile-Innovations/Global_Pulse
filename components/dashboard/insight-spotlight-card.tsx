import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Lightbulb, ArrowRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cacheQuery, createCacheKey } from "@/lib/redis/enhanced-client"
import { ErrorDisplay } from "@/components/ui/error-display"

interface InsightSpotlight {
  id: string;
  title: string;
  content: string;
  topic_id: string;
  topic_name: string;
}

const CACHE_PREFIX = "dashboard:insight_spotlight"
const CACHE_TTL_SECONDS = 3600 // 1 hour

async function InsightSpotlightCardComponent() {
  const supabase = createClient()
  const cacheKey = createCacheKey(CACHE_PREFIX)
  let insight: InsightSpotlight | null = null
  let fetchError: Error | null = null

  try {
    // Try to get from cache first, then fetch from DB if not available
    insight = await cacheQuery<InsightSpotlight | null>(
      cacheKey,
      async () => {
        // In a real implementation, this would query a dedicated highlighted_insights table
        // For now, we'll simulate with a query to get a random insight from topics
        const { data, error } = await supabase
          .from("topics")
          .select("id, name")
          .order("engagement_count", { ascending: false })
          .limit(1)
          
        if (error) throw error
        
        if (data && data.length > 0) {
          // Create a simulated insight based on the topic
          return {
            id: `insight-${data[0].id}`,
            title: "Did you know?",
            content: `${data[0].name} is one of the most discussed topics on Global Pulse. Join the conversation to share your perspective.`,
            topic_id: data[0].id,
            topic_name: data[0].name
          }
        }
        
        return null
      },
      { ttl: CACHE_TTL_SECONDS, tags: ["insights"] },
    )
  } catch (err) {
    console.error("Error fetching/caching insight spotlight:", err)
    fetchError = err instanceof Error ? err : new Error(String(err))
  }

  if (fetchError) {
    return <ErrorDisplay message="Could not load insight. Please try again later." />
  }

  // Fallback if no insight is available
  const fallbackInsight = {
    id: "fallback-insight",
    title: "Global Pulse Insight",
    content: "Discover trending topics and join meaningful conversations about issues that matter worldwide.",
    topic_id: "explore",
    topic_name: "Explore"
  }

  const insightToShow = insight || fallbackInsight

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10">
        <Lightbulb className="h-24 w-24 -mt-4 -mr-4 text-primary" />
      </div>
      
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-primary">{insightToShow.title}</h3>
        <p className="text-sm">{insightToShow.content}</p>
        
        <Button variant="link" className="p-0 h-auto w-fit text-sm flex items-center gap-1 text-primary" asChild>
          <Link href={`/explore/${insightToShow.topic_id}`}>
            Explore {insightToShow.topic_name} <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

InsightSpotlightCardComponent.Loading = function InsightSpotlightLoading() {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-5 relative overflow-hidden">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-24 mt-2" />
      </div>
    </div>
  )
}

export default InsightSpotlightCardComponent
