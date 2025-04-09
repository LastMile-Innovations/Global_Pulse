import SurveyFeedSkeleton from "@/components/survey/survey-feed-skeleton"

export default function Loading() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <div className="h-9 w-48 bg-muted rounded-md animate-pulse mb-2"></div>
          <div className="h-5 w-full max-w-2xl bg-muted rounded-md animate-pulse"></div>
        </div>

        <SurveyFeedSkeleton />
      </div>
    </div>
  )
}
