import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquareText, BarChartBig, Zap, ArrowRight, Plus, Settings } from "lucide-react"
import RecentChats from "../../components/dashboard/recent-chats"
import SuggestedTopics from "../../components/dashboard/suggested-topics"
import TrendingTopicsCard from "../../components/dashboard/trending-topics-card"
import UserStatsCard from "../../components/dashboard/user-stats-card"
import InsightSpotlightCard from "../../components/dashboard/insight-spotlight-card"
import GettingStartedChecklist from "../../components/dashboard/getting-started-checklist"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get the current user (already checked in layout, but good practice)
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    redirect("/login") // Should be caught by layout, but belt-and-suspenders
  }

  // Fetch user profile for personalized greeting - wrapped in try/catch
  let profile: { first_name: string | null; last_name: string | null } | null = null
  try {
    const results = await db
      .select({
        first_name: schema.profiles.firstName,
        last_name: schema.profiles.lastName,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userData.user.id))
      .limit(1);
    profile = results.length > 0 ? results[0] : null;

  } catch (error) {
    console.error("Error fetching profile:", error)
    // Continue without profile data if fetch fails
  }

  // Determine greeting name (first name, email part, or generic 'there')
  const userName = profile?.first_name || userData.user.email?.split("@")[0] || "there"

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Personalized greeting */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground">
              Your dashboard for global opinions and insights. Start a conversation or explore trending topics.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/account">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Account Settings</span>
            </Link>
          </Button>
        </div>

        {/* Primary actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" className="h-auto py-6 text-base sm:text-lg" asChild>
            <Link href="/chat/new">
              <MessageSquareText className="mr-2 h-5 w-5" />
              Start New Chat with Pulse
            </Link>
          </Button>
          <div className="flex flex-col gap-2">
            <Button size="lg" variant="outline" className="h-auto py-6 text-base sm:text-lg" asChild>
              <Link href="/survey">
                <Zap className="mr-2 h-5 w-5" />
                Answer Quick Surveys
              </Link>
            </Button>
            <div className="flex gap-2 justify-center">
              <Button variant="ghost" size="sm" className="text-xs flex-1" asChild>
                <Link href="/survey?topic=Technology">
                  Tech Surveys
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs flex-1" asChild>
                <Link href="/survey?topic=World+News">
                  World News Surveys
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs flex-1" asChild>
                <Link href="/survey?topic=Climate">
                  Climate Surveys
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Getting Started Checklist (conditionally rendered) */}
        <Suspense fallback={null}>
          <GettingStartedChecklist userId={userData.user.id} />
        </Suspense>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent chats section */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm" asChild>
                <Link href="/chat">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<RecentChats.Loading />}>
                <RecentChats userId={userData.user.id} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Suggested topics section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Suggested Topics</CardTitle>
                <CardDescription>Start a conversation about these</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/chat">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Start Chat</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SuggestedTopics.Loading />}>
                <SuggestedTopics />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Secondary dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trending topics card */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>What the World is Talking About</CardTitle>
                <CardDescription>Trending topics across Global Pulse</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm" asChild>
                <Link href="/explore">
                  Explore <BarChartBig className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TrendingTopicsCard.Loading />}>
                <TrendingTopicsCard />
              </Suspense>
            </CardContent>
          </Card>

          {/* User stats card */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your Contributions</CardTitle>
                <CardDescription>Your impact on Global Pulse</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<UserStatsCard.Loading />}>
                  <UserStatsCard userId={userData.user.id} />
                </Suspense>
              </CardContent>
            </Card>
            
            {/* Insight Spotlight Card */}
            <Card className="border-0 p-0 shadow-none overflow-hidden">
              <Suspense fallback={<InsightSpotlightCard.Loading />}>
                <InsightSpotlightCard />
              </Suspense>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
