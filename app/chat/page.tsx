import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import TrendingTopics from "@/components/chat/trending-topics";
import ChatList from "@/components/chat/chat-list";
import { DatabaseErrorFallback } from "@/components/database-error-fallback";

export default async function ChatIndexPage() {
  let user;
  try {
    const supabase = await createClient();
    const {
      data: { user: supaUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }
    user = supaUser;
  } catch (error) {
    // Database or auth error
    console.error("Error in chat page:", error);
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>
        <DatabaseErrorFallback
          message="There was an error connecting to the database. The database tables may not be set up yet."
          showHomeButton={true}
        />
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to login
    redirect("/login?next=/chat");
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
          disabled
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
  );
}
