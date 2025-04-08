import { NextResponse } from "next/server"
import { getCache, setCache } from "@/lib/redis/client"

// Sample topics - in a real app, these would come from your database
const sampleTopics = [
  { id: "1", name: "Climate Change", count: 0 },
  { id: "2", name: "Technology", count: 0 },
  { id: "3", name: "Healthcare", count: 0 },
  { id: "4", name: "Education", count: 0 },
  { id: "5", name: "Economy", count: 0 },
]

export async function GET() {
  try {
    // Try to get cached topics
    const cachedTopics = await getCache<Array<{ id: string; name: string; count: number }>>("trending_topics")

    if (cachedTopics) {
      return NextResponse.json(cachedTopics)
    }

    // If no cached data, use sample data (in production, you'd fetch from your database)
    // Simulate some random engagement counts
    const topics = sampleTopics.map((topic) => ({
      ...topic,
      count: Math.floor(Math.random() * 100),
    }))

    // Sort by count in descending order
    topics.sort((a, b) => b.count - a.count)

    // Cache the result for 1 minute
    await setCache("trending_topics", topics, 60)

    return NextResponse.json(topics)
  } catch (error) {
    console.error("Error fetching topic engagement:", error)
    return NextResponse.json({ error: "Failed to fetch topic engagement" }, { status: 500 })
  }
}
