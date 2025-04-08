import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import EmptyState from "./empty-state"

interface ChatListProps {
  userId: string
}

export default async function ChatList({ userId }: ChatListProps) {
  const supabase = createClient()

  // Fetch user's chats from Supabase
  const { data: chats } = await supabase
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
    .limit(10)
    .throwOnError()

  if (!chats?.length) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      {chats.map((chat) => {
        // Get the last message for preview
        const messages = (chat.messages as any[]) || []
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
