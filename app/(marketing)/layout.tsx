import type React from "react"
import { Metadata } from "next"

// Define marketing-specific metadata
export const metadata: Metadata = {
  title: "Global Pulse - Real-time global opinion insights",
  description: "Instantly see what the world thinks. Participate in AI-led conversations and surveys, explore live global sentiment.",
  keywords: ["global opinion", "surveys", "AI conversations", "sentiment analysis", "public opinion", "real-time insights"],
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
