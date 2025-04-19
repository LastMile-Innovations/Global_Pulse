"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface MoodDataPoint {
  period: string
  avgMood: number | null
  avgStress: number | null
}

interface MoodChartProps {
  data: MoodDataPoint[] | undefined
  timeRange: string
}

export function MoodChart({ data, timeRange }: MoodChartProps) {
  if (!data || data.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>No mood data available for the selected time range.</AlertDescription>
      </Alert>
    )
  }

  // Format the period label based on timeRange
  const formatPeriod = (period: string) => {
    if (period.includes("-W")) {
      // Weekly format (e.g., "2023-W12")
      const [year, week] = period.split("-W")
      return `W${week}`
    }

    // Daily format (e.g., "2023-04-15")
    const date = new Date(period)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 12 }} />
          <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} tickFormatter={(value) => value.toFixed(1)} />
          <Tooltip formatter={(value: number) => [value.toFixed(2), ""]} labelFormatter={formatPeriod} />
          <Legend />
          <Line type="monotone" dataKey="avgMood" name="Mood" stroke="hsl(var(--chart-2))" activeDot={{ r: 8 }} strokeWidth={2} />
          <Line type="monotone" dataKey="avgStress" name="Stress" stroke="hsl(var(--destructive))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
