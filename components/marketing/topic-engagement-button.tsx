"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { incrementTopicEngagement } from "@/app/api/topics/engagement/route"

type TopicEngagementButtonProps = {
  topicId: string
  initialCount: number
}

export default function TopicEngagementButton({ topicId, initialCount }: TopicEngagementButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  // Use optimistic updates for instant feedback
  const [optimisticCount, addOptimisticCount] = useOptimistic(count, (state) => state + 1)

  const handleClick = () => {
    // Optimistically update the UI
    addOptimisticCount()

    // Then perform the actual update
    startTransition(async () => {
      const result = await incrementTopicEngagement(topicId)

      if (result.success) {
        setCount(result.count)
      }
    })
  }

  return (
    <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleClick} disabled={isPending}>
      <ArrowUp className="h-4 w-4" />
      <span>{optimisticCount}</span>
    </Button>
  )
}
