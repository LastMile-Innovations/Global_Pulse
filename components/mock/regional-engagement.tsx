"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Globe, RefreshCw } from "lucide-react"

interface RegionData {
  name: string
  code: string
  percentage: number
  color: string
}

export default function RegionalEngagement() {
  const [isLoading, setIsLoading] = useState(false)
  const [regions, setRegions] = useState<RegionData[]>([
    { name: "North America", code: "NA", percentage: 42, color: "primary" },
    { name: "Europe", code: "EU", percentage: 38, color: "blue-500" },
    { name: "Asia", code: "AS", percentage: 51, color: "teal-500" },
    { name: "Africa", code: "AF", percentage: 27, color: "amber-500" },
    { name: "South America", code: "SA", percentage: 35, color: "purple-500" },
    { name: "Oceania", code: "OC", percentage: 31, color: "red-500" },
  ])

  const refreshData = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setRegions(
        regions.map((region) => ({
          ...region,
          percentage: Math.floor(Math.random() * 30) + 25,
        })),
      )
      setIsLoading(false)
    }, 1000)
  }, [regions])

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 10000)
    return () => clearInterval(interval)
  }, [refreshData])

  return (
    <div className="bg-muted/30 rounded-xl p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Regional Engagement Insights
        </h3>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>
      <p className="text-muted-foreground mb-6">
        See how different regions are engaging with global topics in real-time
      </p>
      <div className="grid grid-cols-2 gap-4">
        {regions.map((region) => (
          <div key={region.code} className="bg-background rounded-lg p-4 border">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium flex items-center gap-1">
                <Globe className={`h-3 w-3 text-${region.color}`} />
                {region.name}
              </span>
              <span className={`text-xs text-${region.color} font-medium`}>{region.percentage}% active</span>
            </div>
            <div className={`h-2 bg-${region.color}/10 rounded-full overflow-hidden`}>
              <div
                className={`h-full bg-${region.color} rounded-full transition-all duration-700`}
                style={{ width: `${region.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
