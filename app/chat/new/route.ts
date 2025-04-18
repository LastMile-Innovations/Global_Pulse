import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get the current user session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.user) {
    // Not logged in, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = session.user;

  // Get topic from query params if available
  const searchParams = request.nextUrl.searchParams;
  const topic = searchParams.get("topic");

  // Create a new chat
  const chatId = nanoid();

  // Insert new chat row
  const { error: chatError } = await supabase.from("chats").insert([
    {
      id: chatId,
      user_id: user.id,
      title: topic ? topic : "New Conversation",
    },
  ]);

  if (chatError) {
    console.error("Error creating chat:", chatError);
    // fallback: redirect to chat list
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // If a topic was provided, create an initial system message
  if (topic) {
    const { error: msgError } = await supabase.from("chat_messages").insert([
      {
        chat_id: chatId,
        role: "system",
        content: `This conversation is about ${topic}.`,
      },
    ]);
    if (msgError) {
      console.error("Error creating initial system message:", msgError);
      // Still redirect to chat, but log error
    }
  }

  // Redirect to the new chat
  return NextResponse.redirect(new URL(`/chat/${chatId}`, request.url));
}
