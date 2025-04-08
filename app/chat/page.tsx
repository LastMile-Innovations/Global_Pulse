import { Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import TrendingTopics from "./components/trending-topics"
import ChatList from "./components/chat-list"

export default async function ChatIndexPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login if not authenticated
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">Please log in to start or view conversations</p>
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>

      {/* Optional Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search chats..."
          className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
        />
      </div>

      {/* Start New Chat Button */}
      <Button size="lg" className="w-full mb-8 py-6 text-base" asChild>
        <Link href="/chat/new">
          <Plus className="mr-2 h-5 w-5" />
          Start New Chat with Pulse
        </Link>
      </Button>

      {/* Trending Topics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Suggested Topics</h2>
        <Suspense
          fallback={
            <div className="h-24 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <TrendingTopics />
        </Suspense>
      </div>

      {/* Recent Chats Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Chats</h2>
        <Suspense
          fallback={
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <ChatList userId={user.id} />
        </Suspense>
      </div>
    </div>
  )
}
