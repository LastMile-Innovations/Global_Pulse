import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { CheckCircle2, Circle, MessageSquare, BarChart2, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface UserFlags {
  completed_first_chat: boolean;
  completed_first_survey: boolean;
  viewed_explore: boolean;
}

interface GettingStartedChecklistProps {
  userId: string;
}

async function GettingStartedChecklistComponent({ userId }: GettingStartedChecklistProps) {
  const supabase = await createClient()
  let userFlags: UserFlags | null = null
  let fetchError: Error | null = null
  let showChecklist = false

  try {
    // Fetch user flags from profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("completed_first_chat, completed_first_survey, viewed_explore")
      .eq("id", userId)
      .maybeSingle()

    if (error) throw error
    
    // If data exists, use it; otherwise default all flags to false
    userFlags = data || {
      completed_first_chat: false,
      completed_first_survey: false,
      viewed_explore: false
    }
    
    // Only show checklist if at least one flag is false
    showChecklist = !userFlags.completed_first_chat || 
                    !userFlags.completed_first_survey || 
                    !userFlags.viewed_explore
  } catch (err) {
    console.error("Error fetching user flags:", err)
    fetchError = err instanceof Error ? err : new Error(String(err))
  }

  if (fetchError) {
    return null // Silently fail - this is a non-critical component
  }

  // If all tasks are completed or there's an error, don't show the checklist
  if (!showChecklist || !userFlags) {
    return null
  }

  // Calculate progress percentage
  const completedTasks = [
    userFlags.completed_first_chat,
    userFlags.completed_first_survey,
    userFlags.viewed_explore
  ].filter(Boolean).length
  
  const totalTasks = 3
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-lg p-5">
      <h3 className="font-semibold text-lg mb-3">Getting Started with Global Pulse</h3>
      
      <div className="mb-3">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>
      
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          {userFlags?.completed_first_chat ? (
            <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-medium ${userFlags?.completed_first_chat ? 'line-through text-muted-foreground' : ''}`}>
              Start your first chat with Pulse
            </p>
            {!userFlags?.completed_first_chat && (
              <Button variant="link" className="p-0 h-auto text-xs text-primary" asChild>
                <Link href="/chat/new">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Start now
                </Link>
              </Button>
            )}
          </div>
        </li>
        
        <li className="flex items-start gap-3">
          {userFlags?.completed_first_survey ? (
            <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-medium ${userFlags?.completed_first_survey ? 'line-through text-muted-foreground' : ''}`}>
              Complete your first survey
            </p>
            {!userFlags?.completed_first_survey && (
              <Button variant="link" className="p-0 h-auto text-xs text-primary" asChild>
                <Link href="/survey">
                  <BarChart2 className="h-3 w-3 mr-1" />
                  Take a survey
                </Link>
              </Button>
            )}
          </div>
        </li>
        
        <li className="flex items-start gap-3">
          {userFlags?.viewed_explore ? (
            <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-medium ${userFlags?.viewed_explore ? 'line-through text-muted-foreground' : ''}`}>
              Explore global insights
            </p>
            {!userFlags?.viewed_explore && (
              <Button variant="link" className="p-0 h-auto text-xs text-primary" asChild>
                <Link href="/explore">
                  <Compass className="h-3 w-3 mr-1" />
                  Explore now
                </Link>
              </Button>
            )}
          </div>
        </li>
      </ul>
    </div>
  )
}

GettingStartedChecklistComponent.Loading = function GettingStartedChecklistLoading() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-5">
      <Skeleton className="h-6 w-48 mb-3" />
      
      <Skeleton className="h-2 w-full rounded-full mb-1" />
      <Skeleton className="h-3 w-16 mb-4" />
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GettingStartedChecklistComponent
