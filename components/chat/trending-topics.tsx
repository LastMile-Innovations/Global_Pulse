import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Zap } from "lucide-react"
import { safeQueryExecution } from "@/utils/supabase/error-handling"

export default async function TrendingTopics() {
  const supabase = await createClient()

  // Fetch trending topics from Supabase with safe error handling
  const { data: topics } = await safeQueryExecution<{id: string, name: string}[]>(
    async () => supabase
      .from("topics")
      .select("id, name")
      .order("engagement_count", { ascending: false })
      .limit(3),
    { fallbackData: [] } // Fallback via options
  )

  // If no topics are found, use fallback topics
  const topicsToShow = topics?.length
    ? topics
    : [
        { id: "climate-change", name: "Climate Change" },
        { id: "ai-regulation", name: "AI Regulation" },
        { id: "future-of-work", name: "Future of Work" },
      ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {topicsToShow.map((topic) => (
        <Link
          key={topic.id}
          href={`/chat/new?topic=${encodeURIComponent(topic.name)}`}
          className="flex items-center justify-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
        >
          <Zap className="h-4 w-4 text-primary" />
          <span>{topic.name}</span>
        </Link>
      ))}
    </div>
  )
}
