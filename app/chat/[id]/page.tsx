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
import { unstable_cache } from "next/cache"

import type { Metadata } from 'next'

// Define standard PageProps structure - Reverted
type ChatPageProps = {
  params: Promise<{
    id: string
  }>;
  searchParams?: Record<string, string | string[] | undefined>;
};

// Generate metadata for SEO
export const generateMetadata = async (props: ChatPageProps): Promise<Metadata> => {
  const params = await props.params;
  // Fetch minimal chat data for title if needed, or just use ID
  const chatId = params.id;
  // Potentially fetch chat title here if important for SEO
  return {
    title: `Chat ${chatId} - Global Pulse`, // Use chat ID in title
    description: 'Engage in meaningful conversations about global topics.'
  }
}

export default async function ChatPage(props: ChatPageProps) {
  const params = await props.params;
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

  // Cached chat fetching function with tag-based revalidation
  const getChatById = unstable_cache(
    async (chatId: string, userId: string) => {
      try {
        const results = await db
          .select({
            id: schema.chats.id,
            title: schema.chats.title,
            userId: schema.chats.userId,
          })
          .from(schema.chats)
          .where(eq(schema.chats.id, chatId))
          .limit(1);

        return results.length > 0 ? results[0] : null;
      } catch (error) {
        console.error("Error fetching chat:", error);
        return null;
      }
    },
    ['chat-by-id'],
    { tags: [`chat:${id}`], revalidate: 60 } // Cache for 60 seconds with tag-based invalidation
  );

  // Fetch the chat to verify it exists and belongs to the user
  const chat = await getChatById(id, userData.user.id);

  if (!chat || chat.userId !== userData.user.id) {
    return notFound()
  }

  return (
    <div className="container max-w-4xl py-4 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" className="mr-4" asChild>
          <Link href="/chat" prefetch={true}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold truncate">{chat.title || "Chat"}</h1>
      </div>

      {/* Use Suspense boundary for streaming UI */}
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
