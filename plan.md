Okay, here are the files for the `/dashboard` feature, based on the provided example code and the defined requirements.

**1. Dashboard Layout (Authentication Guard)**

*   **File:** `app/dashboard/layout.tsx`
*   **Purpose:** Ensures only authenticated users can access any page within the `/dashboard` segment.

```tsx
import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login")
  }

  // Render the children (the actual dashboard page) if authenticated
  return <>{children}</>
}
```

**2. Dashboard Loading State**

*   **File:** `app/dashboard/loading.tsx`
*   **Purpose:** Provides an immediate skeleton UI while the dashboard data is being fetched server-side.

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Greeting skeleton */}
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>

        {/* Primary actions skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>

        {/* Main dashboard content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Chats Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Topics Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary dashboard content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trending Topics Skeleton */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Stats Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

**3. Dashboard Page**

*   **File:** `app/dashboard/page.tsx`
*   **Purpose:** Main entry point for the dashboard, orchestrates layout and data fetching via Suspense.

```tsx
import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquareText, BarChartBig, Zap, ArrowRight, Plus } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import RecentChats from "./components/recent-chats"
import SuggestedTopics from "./components/suggested-topics"
import TrendingTopicsCard from "./components/trending-topics-card"
import UserStatsCard from "./components/user-stats-card"
import DashboardLoading from "./loading" // Import the loading component

export default async function DashboardPage() {
  const supabase = createClient()

  // Get the current user (already checked in layout, but good practice)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login") // Should be caught by layout, but belt-and-suspenders
  }

  // Fetch user profile for personalized greeting - wrapped in try/catch
  let profile = null
  try {
    const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle()
    profile = data
  } catch (error) {
    console.error("Error fetching profile:", error)
    // Continue without profile data if fetch fails
  }

  // Determine greeting name (first name, email part, or generic 'there')
  const userName = profile?.first_name || user.email?.split("@")[0] || "there"

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Personalized greeting */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">
            Your dashboard for global opinions and insights. Start a conversation or explore trending topics.
          </p>
        </div>

        {/* Primary actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" className="h-auto py-6 text-base sm:text-lg" asChild>
            <Link href="/chat/new">
              <MessageSquareText className="mr-2 h-5 w-5" />
              Start New Chat with Pulse
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-6 text-base sm:text-lg" asChild>
            <Link href="/survey">
              <Zap className="mr-2 h-5 w-5" />
              Answer Quick Surveys
            </Link>
          </Button>
        </div>

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
                {/* @ts-expect-error Server Component */}
                <RecentChats userId={user.id} />
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
                {/* @ts-expect-error Server Component */}
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
                {/* @ts-expect-error Server Component */}
                <TrendingTopicsCard />
              </Suspense>
            </CardContent>
          </Card>

          {/* User stats card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Contributions</CardTitle>
              <CardDescription>Your impact on Global Pulse</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<UserStatsCard.Loading />}>
                {/* @ts-expect-error Server Component */}
                <UserStatsCard userId={user.id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

**4. Recent Chats Component**

*   **File:** `app/dashboard/components/recent-chats.tsx`
*   **Purpose:** Fetches and displays the user's most recent chat sessions.

```tsx
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentChatsProps {
  userId: string
}

async function RecentChatsComponent({ userId }: RecentChatsProps) {
  const supabase = createClient()

  // Fetch user's recent chats
  // Optimized SELECT: Only fetch needed fields, including limited messages for preview
  const { data: chats, error } = await supabase
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
    // Ensure messages sub-query is also ordered and limited for performance
    .order("created_at", { foreignTable: "chat_messages", ascending: false })
    .limit(1, { foreignTable: "chat_messages" })
    .limit(5) // Limit overall number of chats fetched

  if (error) {
    console.error("Error fetching recent chats:", error)
    return <div className="text-center py-8 text-destructive">Error loading chats.</div>
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
        // Messages should already be limited and ordered by the query
        const lastMessage = chat.messages?.[0]

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
              <h3 className="font-medium truncate pr-8">{chat.title || "Untitled Chat"}</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
            </div>

            {lastMessage?.content && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                <span className="font-medium">{lastMessage.role === "assistant" ? "Pulse" : "You"}: </span>
                {typeof lastMessage.content === 'string' ? lastMessage.content : '[Interaction]'}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
          </Link>
        )
      })}
    </div>
  )
}

// Static Loading component attached to the main component
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
```

**5. Suggested Topics Component**

*   **File:** `app/dashboard/components/suggested-topics.tsx`
*   **Purpose:** Fetches and displays topics to encourage user engagement.

```tsx
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

async function SuggestedTopicsComponent() {
  const supabase = createClient()

  // Fetch trending topics from Supabase
  // Add description for better context
  const { data: topics, error } = await supabase
    .from("topics")
    .select("id, name, description")
    .order("engagement_count", { ascending: false })
    .limit(5) // Fetch 5 suggestions

  if (error) {
    console.error("Error fetching suggested topics:", error)
    return <div className="text-sm text-destructive">Error loading suggestions.</div>
  }

  // If no topics are found, use fallback topics
  const topicsToShow = topics?.length
    ? topics
    : [
        { id: "climate-change", name: "Climate Change", description: "Environmental policies and impact" },
        { id: "ai-regulation", name: "AI Regulation", description: "Governance of artificial intelligence" },
        { id: "future-of-work", name: "Future of Work", description: "Remote work and automation trends" },
        { id: "global-economy", name: "Global Economy", description: "Economic trends and forecasts" },
        { id: "space-exploration", name: "Space Exploration", description: "Latest missions and discoveries" },
      ]

  return (
    <div className="space-y-3">
      {topicsToShow.map((topic) => (
        <Link
          key={topic.id}
          href={`/chat/new?topic=${encodeURIComponent(topic.name)}`}
          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
        >
          <div className="bg-primary/10 p-1.5 rounded-full mt-0.5 group-hover:bg-primary/20 transition-colors">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">{topic.name}</div>
            {topic.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{topic.description}</div>}
          </div>
        </Link>
      ))}
    </div>
  )
}

// Static Loading component
SuggestedTopicsComponent.Loading = function SuggestedTopicsLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
          <Skeleton className="h-7 w-7 rounded-full mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default SuggestedTopicsComponent
```

**6. Trending Topics Card Component**

*   **File:** `app/dashboard/components/trending-topics-card.tsx`
*   **Purpose:** Displays platform-wide trending topics.

```tsx
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

async function TrendingTopicsCardComponent() {
  const supabase = createClient()

  // Fetch trending topics from Supabase
  const { data: topics, error } = await supabase
    .from("topics")
    .select("id, name, engagement_count")
    .order("engagement_count", { ascending: false })
    .limit(5) // Show top 5 trending

  if (error) {
    console.error("Error fetching trending topics:", error)
    return <div className="text-sm text-destructive">Error loading trending topics.</div>
  }

  // If no topics are found, use fallback topics (or show empty state)
  const topicsToShow = topics?.length
    ? topics
    : [
        // Fallback data if needed, or handle empty state below
        { id: "climate-change", name: "Climate Change", engagement_count: 1250 },
        { id: "ai-regulation", name: "AI Regulation", engagement_count: 980 },
        { id: "future-of-work", name: "Future of Work", engagement_count: 875 },
        { id: "global-economy", name: "Global Economy", engagement_count: 720 },
        { id: "healthcare", name: "Healthcare", engagement_count: 650 },
      ]

  if (!topicsToShow.length) {
    return <p className="text-sm text-muted-foreground">No trending topics currently available.</p>
  }

  return (
    <div className="space-y-4">
      {topicsToShow.map((topic) => (
        <div key={topic.id} className="flex items-center justify-between hover:bg-muted/30 p-2 -m-2 rounded-md transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-sm">{topic.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{topic.engagement_count?.toLocaleString() ?? 0}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/explore?topic=${encodeURIComponent(topic.name)}`}>
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Explore {topic.name}</span>
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Static Loading component
TrendingTopicsCardComponent.Loading = function TrendingTopicsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrendingTopicsCardComponent;
```

**7. User Stats Card Component**

*   **File:** `app/dashboard/components/user-stats-card.tsx`
*   **Purpose:** Displays statistics about the user's contributions.

```tsx
import { createClient } from "@/lib/supabase/server"
import { MessageSquare, BarChart2, Award, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface UserStatsCardProps {
  userId: string
}

async function UserStatsCardComponent({ userId }: UserStatsCardProps) {
  const supabase = createClient()

  // Fetch counts in parallel
  const [chatCountResult, surveyCountResult] = await Promise.all([
    supabase
      .from("chats")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("survey_responses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ])

  const chatCount = chatCountResult.count ?? 0
  const surveyCount = surveyCountResult.count ?? 0

  if (chatCountResult.error) console.error("Error fetching chat count:", chatCountResult.error)
  if (surveyCountResult.error) console.error("Error fetching survey count:", surveyCountResult.error)

  const totalContributions = chatCount + surveyCount

  // Determine user level based on contributions
  let userLevel = "Newcomer"
  let levelColor = "text-gray-500"
  if (totalContributions > 100) {
    userLevel = "Pulse Expert"
    levelColor = "text-purple-500"
  } else if (totalContributions > 50) {
    userLevel = "Insight Contributor"
    levelColor = "text-indigo-500"
  } else if (totalContributions > 10) {
    userLevel = "Regular Voice"
    levelColor = "text-blue-500"
  }

  return (
    <div className="space-y-6">
      <StatItem icon={MessageSquare} label="Chat Conversations" value={chatCount} />
      <StatItem icon={BarChart2} label="Survey Responses" value={surveyCount} />
      <StatItem icon={Award} label="Contributor Level" value={userLevel} valueClassName={levelColor} />

      {/* Simulated marketplace earnings - P2/P3 feature */}
      {/*
      <StatItem icon={DollarSign} label="Simulated Earnings" value="$0.00" />
      */}
    </div>
  )
}

// Helper component for individual stats
const StatItem = ({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType, label: string, value: string | number, valueClassName?: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 p-2 rounded-full">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
    <span className={`font-bold text-sm ${valueClassName || ''}`}>{value}</span>
  </div>
)


// Static Loading component
UserStatsCardComponent.Loading = function UserStatsLoading() {
   return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  )
}


export default UserStatsCardComponent;
```

**To Implement:**

1.  Create the `app/dashboard/` directory.
2.  Create the `app/dashboard/components/` subdirectory.
3.  Place each file in its corresponding location.
4.  Ensure your Supabase schema has the `profiles` (with `first_name`, `last_name`) and `topics` tables as defined earlier.
5.  Adjust Supabase queries (`select` statements, table names) if your schema differs slightly.
6.  Test the authentication flow and data fetching.