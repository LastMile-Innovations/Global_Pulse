import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SurveyFeedSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter skeleton */}
      <div className="bg-muted/30 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Question card skeleton */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-7 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}
