export default function TopicEngagementSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
        </div>
        <div className="h-2 bg-muted rounded-full animate-pulse"></div>
      </div>

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
          </div>
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-muted animate-pulse rounded-full"
              style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
