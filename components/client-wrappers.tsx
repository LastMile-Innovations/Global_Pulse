'use client'

import dynamic from 'next/dynamic'
import { Globe } from 'lucide-react'

// Client-side only components with dynamic imports
export const GlobalMapClient = dynamic(() => import("@/components/mock/global-map"), {
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl animate-pulse flex flex-col items-center justify-center gap-2">
      <Globe className="h-12 w-12 text-primary/40" />
      <div className="text-sm text-muted-foreground font-medium">Loading global data...</div>
      <div className="w-24 h-1 bg-muted rounded-full overflow-hidden mt-1">
        <div className="h-full bg-primary/40 animate-progress-indeterminate"></div>
      </div>
    </div>
  ),
  ssr: false, // Client-side only for interactive map
})

export const AiConversationClient = dynamic(() => import("@/components/mock/ai-conversation"), {
  ssr: false,
})

export const SurveyFeedClient = dynamic(() => import("@/components/mock/survey-feed"), {
  ssr: false,
})

export const DataVisualizationClient = dynamic(() => import("@/components/mock/data-visualization"), {
  ssr: false,
})

export const RegionalEngagementClient = dynamic(() => import("@/components/mock/regional-engagement"), {
  ssr: false,
})

export const AnimatedStatClient = dynamic(() => import("@/components/marketing/animated-stats"), {
  ssr: false,
})
