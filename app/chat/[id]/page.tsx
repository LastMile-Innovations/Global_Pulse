import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import ChatInterface from "./components/chat-interface"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = params
  const supabase = await createClient()

  // Get the current user
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
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

  // Fetch the chat to verify it exists and belongs to the user
  let chat: { id: string; title: string | null; userId: string } | null = null;
  try {
    const results = await db
      .select({
        id: schema.chats.id,
        title: schema.chats.title,
        userId: schema.chats.userId,
      })
      .from(schema.chats)
      .where(eq(schema.chats.id, id))
      .limit(1);

    if (results.length > 0) {
      chat = results[0];
    }
  } catch (error) {
    console.error("Error fetching chat:", error);
    // Basic error handling: Log and potentially show a generic error or redirect
    // For now, we'll let it proceed to the !chat check below, which will trigger notFound()
  }

  if (!chat || chat.userId !== userData.user.id) {
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
