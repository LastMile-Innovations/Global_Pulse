import { MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EmptyState() {
  return (
    <div className="border rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
      <p className="text-muted-foreground mb-6">
        Start a new chat with Pulse to share your thoughts and opinions on global topics.
      </p>
      <Button asChild>
        <Link href="/chat/new">Start a conversation</Link>
      </Button>
    </div>
  )
}
