"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Loader2 } from "lucide-react"

// Use theme colors
const COLORS = [
  "hsl(200, 90%, 45%)", // chart-1
  "hsl(162, 80%, 38%)", // chart-2
  "hsl(291, 75%, 58%)", // chart-3
  "hsl(43, 95%, 50%)",  // chart-4
  "hsl(24, 95%, 55%)",   // chart-5
  "hsl(173, 70%, 40%)", // secondary as fallback
]

export function ResonanceAnalyticsDashboard() {
  const [periodType, setPeriodType] = useState("daily")
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [periodType])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/resonance-flags?periodType=${periodType}&limit=30`)

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }

      const result = await response.json()
      setAnalyticsData(result.data || [])
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalytics = async (type: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/analytics/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        throw new Error("Failed to process analytics")
      }

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} analytics processing completed`,
      })

      // Refresh data
      fetchAnalytics()
    } catch (error) {
      console.error("Error processing analytics:", error)
      toast({
        title: "Error",
        description: "Failed to process analytics",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Prepare data for time series chart
  const timeSeriesData = analyticsData
    .map((item) => ({
      period: item.period,
      totalFlags: item.totalFlags,
    }))
    .reverse()

  // Prepare aggregated tag distribution data
  const getAggregatedTagDistribution = () => {
    const tagCounts: Record<string, number> = {}

    analyticsData.forEach((item) => {
      const distribution = item.tagDistribution
      Object.entries(distribution).forEach(([tag, count]) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + (count as number)
      })
    })

    return Object.entries(tagCounts).map(([name, value]) => ({ name, value }))
  }

  // Prepare aggregated mode distribution data
  const getAggregatedModeDistribution = () => {
    const modeCounts: Record<string, number> = {}

    analyticsData.forEach((item) => {
      const distribution = item.modeDistribution
      Object.entries(distribution).forEach(([mode, count]) => {
        modeCounts[mode] = (modeCounts[mode] || 0) + (count as number)
      })
    })

    return Object.entries(modeCounts).map(([name, value]) => ({ name, value }))
  }

  // Prepare aggregated response type distribution data
  const getAggregatedResponseTypeDistribution = () => {
    const typeCounts: Record<string, number> = {}

    analyticsData.forEach((item) => {
      const distribution = item.responseTypeDistribution
      Object.entries(distribution).forEach(([type, count]) => {
        typeCounts[type] = (typeCounts[type] || 0) + (count as number)
      })
    })

    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resonance Flag Analytics</h1>

        <div className="flex items-center gap-4">
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => fetchAnalytics()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh
          </Button>

          <Button onClick={() => processAnalytics(periodType)} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Process {periodType.charAt(0).toUpperCase() + periodType.slice(1)}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tags">Tag Distribution</TabsTrigger>
            <TabsTrigger value="modes">Mode Distribution</TabsTrigger>
            <TabsTrigger value="responseTypes">Response Types</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flags Over Time</CardTitle>
                  <CardDescription>Number of resonance flags per {periodType} period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalFlags" fill="hsl(291, 75%, 58%)" name="Total Flags" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tag Distribution</CardTitle>
                  <CardDescription>Distribution of tags across all flags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getAggregatedTagDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill={COLORS[0]}
                          dataKey="value"
                        >
                          {getAggregatedTagDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Tag Distribution</CardTitle>
                <CardDescription>Breakdown of tags selected by users when flagging responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAggregatedTagDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill={COLORS[0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mode Distribution</CardTitle>
                  <CardDescription>Distribution of flags by engagement mode</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getAggregatedModeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill={COLORS[1]}
                          dataKey="value"
                        >
                          {getAggregatedModeDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Type Distribution</CardTitle>
                  <CardDescription>Distribution of flags by response type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getAggregatedResponseTypeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill={COLORS[2]}
                          dataKey="value"
                        >
                          {getAggregatedResponseTypeDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="responseTypes">
            <Card>
              <CardHeader>
                <CardTitle>Response Type Analysis</CardTitle>
                <CardDescription>Detailed breakdown of flags by response type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAggregatedResponseTypeDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill={COLORS[3]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
