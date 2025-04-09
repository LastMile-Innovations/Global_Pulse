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
          <Skeleton className="h-[60px] w-full" /> {/* Match py-6 height */}
          <Skeleton className="h-[60px] w-full" />
        </div>

        {/* Main dashboard content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Chats Skeleton - match actual RecentChats component structure */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-20" /> {/* View All button */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" /> {/* Title */}
                    <Skeleton className="h-4 w-full" /> {/* Message preview */}
                    <Skeleton className="h-3 w-1/4" /> {/* Time ago */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Topics Skeleton - match actual SuggestedTopics component structure */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" /> {/* Plus icon button */}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-7 w-7 rounded-full mt-0.5" /> {/* Icon */}
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" /> {/* Topic name */}
                      <Skeleton className="h-3 w-full" /> {/* Description */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary dashboard content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trending Topics Skeleton - match actual TrendingTopicsCard component structure */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-20" /> {/* Explore button */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-7 rounded-full" /> {/* Icon */}
                      <Skeleton className="h-5 w-32" /> {/* Topic name */}
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-16" /> {/* Engagement count */}
                      <Skeleton className="h-8 w-8" /> {/* Arrow button */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Stats Skeleton - match actual UserStatsCard component structure */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" /> {/* Icon background */}
                      <Skeleton className="h-5 w-28" /> {/* Label */}
                    </div>
                    <Skeleton className="h-5 w-12" /> {/* Value */}
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
