import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Get topic from query params if available
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get("topic")

  // Create a new chat
  const chatId = nanoid()
  const { error } = await supabase.from("chats").insert({
    id: chatId,
    user_id: user.id,
    title: topic || "New Conversation",
  })

  if (error) {
    console.error("Error creating chat:", error)
    return NextResponse.redirect(new URL("/chat", request.url))
  }

  // If a topic was provided, create an initial system message
  if (topic) {
    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      role: "system",
      content: `This conversation is about ${topic}.`,
    })
  }

  // Redirect to the new chat
  return NextResponse.redirect(new URL(`/chat/${chatId}`, request.url))
}
