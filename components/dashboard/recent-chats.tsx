import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, ChevronRight, CornerDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorDisplay } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"

interface ChatMessage {
  content: string | object;
  role: "user" | "assistant";
  created_at: string;
}

interface Chat {
  id: string;
  title: string | null;
  updated_at: string;
  messages: ChatMessage[];
}

interface RecentChatsProps {
  userId: string
}

async function RecentChatsComponent({ userId }: RecentChatsProps) {
  const supabase = await createClient()
  let chats: Chat[] | null = null;
  let fetchError: Error | null = null;

  try {
    const { data, error } = await supabase
      .from("chats")
      .select(
        `
        id,
        title,
        updated_at,
        messages:chat_messages!inner(content, role, created_at)
      `,
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .order("created_at", { foreignTable: "chat_messages", ascending: false })
      .limit(1, { foreignTable: "chat_messages" })
      .limit(5)

    if (error) throw error;
    chats = data;

  } catch (err) {
    console.error("Error fetching recent chats:", err)
    fetchError = err instanceof Error ? err : new Error(String(err));
  }

  if (fetchError) {
    return <ErrorDisplay message="Could not load recent conversations." details={fetchError.message} />
  }

  if (!chats?.length) {
    return (
      <div className="text-center py-8">
        <div className="bg-muted/30 inline-flex p-3 rounded-full mb-4">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-muted-foreground mb-4">Start your first chat with Pulse to see it here.</p>
        <Button asChild>
          <Link href="/chat/new">Start a conversation</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {chats.map((chat) => {
        const lastMessage = chat.messages?.[0]

        const timeAgo = chat.updated_at
          ? formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })
          : "recently"

        return (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={`block border rounded-lg p-4 hover:bg-muted/30 transition-colors relative group ${lastMessage?.role === 'assistant' ? 'border-primary/40 bg-primary/5' : ''}`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium truncate pr-8">{chat.title || "Untitled Chat"}</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
            </div>

            {lastMessage?.content && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                <span className="font-medium">{lastMessage.role === "assistant" ? "Pulse" : "You"}: </span>
                {typeof lastMessage.content === 'string' ? lastMessage.content : '[Interaction]'}
              </p>
            )}

            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
              {lastMessage?.role === 'assistant' && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                  <CornerDownRight className="h-3 w-3" />
                  Jump back in
                </Badge>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

RecentChatsComponent.Loading = function RecentChatsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export default RecentChatsComponent
