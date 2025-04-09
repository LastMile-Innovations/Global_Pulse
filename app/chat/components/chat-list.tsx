import { createClient } from "@/utils/supabase/server"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import EmptyState from "./empty-state"
import { safeQueryExecution } from "@/utils/supabase/error-handling"

interface ChatSummary {
  id: string;
  title: string | null;
  created_at: Date | string; // Allow string initially, formatDistanceToNow handles it
  updated_at: Date | string; // Allow string initially, formatDistanceToNow handles it
  messages: Array<{ role: string; content: string; created_at: string | Date }>;
}

interface ChatListProps {
  userId: string
}

export default async function ChatList({ userId }: ChatListProps) {
  const supabase = await createClient()

  // Fetch user's chats from Supabase with safe error handling
  const { data: chats, tableNotFound } = await safeQueryExecution<ChatSummary[]>(
    async () => await supabase
      .from("chats")
      .select(`
        id,
        title,
        created_at,
        updated_at,
        messages:chat_messages(content, role, created_at)
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5),
    { fallbackData: [] } // Use fallbackData
  )

  // Handle case where database tables don't exist yet
  if (tableNotFound) {
    return (
      <EmptyState 
        title="Database Not Set Up"
        description="The chat system is not properly set up yet. Database tables are missing."
      />
    )
  }
  
  if (!chats?.length) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      {chats.map((chat: ChatSummary) => {
        // Get the last message for preview
        const messages = chat.messages || []
        const lastMessage = messages.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0]

        // Format the timestamp
        const timeAgo = chat.updated_at
          ? formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })
          : "recently"

        return (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="block border rounded-lg p-4 hover:bg-muted/30 transition-colors relative group"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{chat.title || "Untitled Chat"}</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {lastMessage && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                <span className="font-medium">{lastMessage.role === "assistant" ? "Pulse" : "You"}: </span>
                {lastMessage.content}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
          </Link>
        )
      })}
    </div>
  )
}
