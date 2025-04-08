"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type TopicEngagement = {
  id: string
  name: string
  count: number
}

export default function TopicEngagement() {
  const [topics, setTopics] = useState<TopicEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Memoize the fetch function to avoid recreating it on each render
  const fetchTopics = useCallback(async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch("/api/topics/engagement", {
        signal: controller.signal,
        cache: "no-store", // Ensure we get fresh data
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error("Failed to fetch topic engagement data")
      }

      const data = await response.json()
      setTopics(data)
      setError(null)
    } catch (err) {
      // Only set error if component is still mounted and it's not an abort error
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Error loading topic engagement data")
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch with a small delay to prioritize more important resources
    fetchTimeoutRef.current = setTimeout(() => {
      fetchTopics()

      // Set up polling for real-time updates
      pollingIntervalRef.current = setInterval(fetchTopics, 5000)
    }, 100)

    // Cleanup function
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current)
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [fetchTopics])

  // Optimize rendering by memoizing the content
  const renderContent = () => {
    if (loading) {
      return <p className="text-sm text-muted-foreground">Loading trending topics...</p>
    }

    if (error) {
      return <p className="text-sm text-destructive">{error}</p>
    }

    if (topics.length > 0) {
      return (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{topic.name}</span>
              <div className="flex items-center">
                <div
                  className="h-2 bg-primary rounded-full"
                  style={{
                    width: `${Math.min(topic.count * 5, 100)}px`,
                    willChange: "width", // Hint to browser for animation optimization
                  }}
                />
                <span className="ml-2 text-sm text-muted-foreground">{topic.count}</span>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return <p className="text-sm text-muted-foreground">No trending topics yet.</p>
  }

  return <div>{renderContent()}</div>
}
