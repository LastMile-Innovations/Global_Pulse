import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import ChatInterface from "./components/chat-interface"
import { safeQueryExecution } from "@/lib/supabase/error-handling"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = params
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login if not authenticated
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" asChild>
            <Link href="/chat">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <p className="mb-4 text-muted-foreground">Please log in to view this conversation</p>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Fetch the chat to verify it exists and belongs to the user with safe error handling
  const { data: chat, tableNotFound } = await safeQueryExecution<{id: string, title: string, user_id: string}>(
    () => supabase.from("chats").select("id, title, user_id").eq("id", id).single(),
    null
  )

  // Handle case where database tables don't exist yet
  if (tableNotFound) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" asChild>
            <Link href="/chat">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <p className="mb-4 text-muted-foreground">The chat system is not properly set up yet. Database tables are missing.</p>
          <Button asChild>
            <Link href="/chat">Return to Chat Home</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  if (!chat || chat.user_id !== user.id) {
    return notFound()
  }

  return (
    <div className="container max-w-4xl py-4 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" className="mr-4" asChild>
          <Link href="/chat">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold truncate">{chat.title || "Chat"}</h1>
      </div>

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <ChatInterface chatId={id} />
      </Suspense>
    </div>
  )
}
