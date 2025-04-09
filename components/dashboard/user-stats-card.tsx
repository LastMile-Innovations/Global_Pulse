import { createClient } from "@/lib/supabase/server"
import { MessageSquare, BarChart2, Award, DollarSign, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorDisplay } from "@/components/ui/error-display"
import type { PostgrestError } from "@supabase/supabase-js";

interface UserStatsCardProps {
  userId: string
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  valueClassName?: string;
}

async function UserStatsCardComponent({ userId }: UserStatsCardProps) {
  const supabase = createClient()
  let chatCount: number = 0;
  let surveyCount: number = 0;
  let fetchError: Error | null = null;

  try {
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
    ]);

    // Check for errors from each query
    if (chatCountResult.error) throw chatCountResult.error;
    if (surveyCountResult.error) throw surveyCountResult.error;

    chatCount = chatCountResult.count ?? 0
    surveyCount = surveyCountResult.count ?? 0

  } catch (err) {
    console.error("Error fetching user stats:", err);
    // Handle potential PostgrestError structure
    const errorDetails = (err as PostgrestError)?.message || String(err);
    fetchError = err instanceof Error ? err : new Error(errorDetails);
  }

  if (fetchError) {
    return <ErrorDisplay message="Could not load your contribution stats." details={fetchError.message} />
  }

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
const StatItem = ({ icon: Icon, label, value, valueClassName }: StatItemProps) => (
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
