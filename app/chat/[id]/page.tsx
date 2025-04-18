import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import * as chatsSchema from "@/lib/db/schema/chats";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ChatInterface from "@/components/chat/chat-interface";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import type { Message as AIMessage } from "ai";

// --- Types ---
type ChatPageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

// --- Metadata for SEO ---
export async function generateMetadata(
  props: ChatPageProps
): Promise<Metadata> {
  const chatId = props.params.id;
  // Optionally fetch chat title for SEO here
  return {
    title: `Chat ${chatId} - Global Pulse`,
    description: "Engage in meaningful conversations about global topics.",
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  // --- Auth ---
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?next=/chat/${params.id}`);
  }

  const userId = session.user.id;
  const chatId = params.id;

  // --- Fetch Chat ---
  const chat = await db
    .select({
      id: chatsSchema.chats.id,
      title: chatsSchema.chats.title,
      userId: chatsSchema.chats.userId,
    })
    .from(chatsSchema.chats)
    .where(eq(chatsSchema.chats.id, chatId))
    .limit(1)
    .then((res) => res[0]);

  if (!chat) {
    notFound();
  }

  if (chat.userId !== userId) {
    notFound();
  }

  // --- Fetch Messages ---
  const messages = await db
    .select()
    .from(chatsSchema.chatMessages)
    .where(eq(chatsSchema.chatMessages.chatId, chatId))
    .orderBy(chatsSchema.chatMessages.createdAt);

  // --- Map to UI Message Format ---
  type UIMessage = {
    id: string;
    role: AIMessage["role"];
    content: string;
    toolCalls?: unknown;
    toolResults?: unknown;
  };

  const initialMessages: UIMessage[] = messages.map((m) => ({
    id: String(m.id),
    role: m.role as AIMessage["role"],
    content: m.content,
    toolCalls: m.toolCalls ? m.toolCalls : undefined,
    toolResults: m.toolResults ? m.toolResults : undefined,
  }));

  // MVP: No suspense needed for server component
  return (
    <div className="container max-w-4xl py-4 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" className="mr-4" asChild>
          <Link href="/chat" prefetch={true}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold truncate">
          {chat.title || "Chat"}
        </h1>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <ChatInterface chatId={chatId} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
