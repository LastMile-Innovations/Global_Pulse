'use client'

import dynamic from 'next/dynamic'
import { Globe } from 'lucide-react'

// Client-side only components with dynamic imports
export const GlobalMapClient = dynamic(() => import("@/components/mock/global-map"), {
  loading: () => (
    <div className="w-full h-[400px] bg-muted/30 rounded-xl animate-pulse flex items-center justify-center">
      <Globe className="h-10 w-10 text-muted" />
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
