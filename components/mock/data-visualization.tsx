"use client"

import { useState, useEffect } from "react"
import { BarChart, LineChart, PieChart, ArrowUp, ArrowDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DataVisualization() {
  const [activeTab, setActiveTab] = useState("pie")
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    climate: { support: 42, neutral: 28, oppose: 30 },
    economy: { positive: 35, neutral: 40, negative: 25 },
    tech: { optimistic: 65, concerned: 25, neutral: 10 },
  })

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setData({
        climate: {
          support: Math.floor(Math.random() * 20) + 35,
          neutral: Math.floor(Math.random() * 15) + 20,
          oppose: Math.floor(Math.random() * 15) + 25,
        },
        economy: {
          positive: Math.floor(Math.random() * 20) + 25,
          neutral: Math.floor(Math.random() * 15) + 35,
          negative: Math.floor(Math.random() * 15) + 20,
        },
        tech: {
          optimistic: Math.floor(Math.random() * 20) + 55,
          concerned: Math.floor(Math.random() * 15) + 20,
          neutral: Math.floor(Math.random() * 10) + 5,
        },
      })
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="border rounded-xl overflow-hidden bg-background shadow-md">
      <div className="bg-muted/30 p-3 border-b flex items-center justify-between">
        <div className="font-medium">Global Opinion Trends</div>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading} className="h-8">
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          <span className="text-xs">Refresh</span>
        </Button>
      </div>

      <div className="p-4">
        <Tabs defaultValue="pie" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pie" className="text-xs">
              <PieChart className="h-3 w-3 mr-1" />
              Climate Action
            </TabsTrigger>
            <TabsTrigger value="bar" className="text-xs">
              <BarChart className="h-3 w-3 mr-1" />
              Economy
            </TabsTrigger>
            <TabsTrigger value="line" className="text-xs">
              <LineChart className="h-3 w-3 mr-1" />
              Technology
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="mt-0">
            <div className="h-[250px] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <div
                    className="absolute inset-0 rounded-full border-[16px] border-primary/70 transition-all duration-700"
                    style={{
                      clipPath: `polygon(50% 50%, 0 0, ${data.climate.support * 3.6}deg 0)`,
                      transform: "rotate(0deg)",
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-[16px] border-blue-500/70 transition-all duration-700"
                    style={{
                      clipPath: `polygon(50% 50%, ${data.climate.support * 3.6}deg 0, ${
                        (data.climate.support + data.climate.neutral) * 3.6
                      }deg 0)`,
                      transform: "rotate(0deg)",
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-[16px] border-amber-500/70 transition-all duration-700"
                    style={{
                      clipPath: `polygon(50% 50%, ${(data.climate.support + data.climate.neutral) * 3.6}deg 0, 360deg 0)`,
                      transform: "rotate(0deg)",
                    }}
                  ></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background rounded-full h-20 w-20 flex items-center justify-center shadow-sm">
                      <div className="text-center">
                        <div className="text-xl font-bold">10.2M</div>
                        <div className="text-xs text-muted-foreground">responses</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 w-full grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-primary/70 rounded-full"></div>
                    <span>Support</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{data.climate.support}%</span>
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-blue-500/70 rounded-full"></div>
                    <span>Neutral</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{data.climate.neutral}%</span>
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-amber-500/70 rounded-full"></div>
                    <span>Oppose</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{data.climate.oppose}%</span>
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bar" className="mt-0">
            <div className="h-[250px] relative">
              <div className="absolute inset-x-0 bottom-10 h-[180px] flex items-end justify-around gap-8 px-4">
                {Object.entries(data.economy).map(([key, value], i) => (
                  <div key={key} className="flex flex-col items-center gap-2 w-full">
                    <div
                      className={`w-full ${
                        i === 0 ? "bg-green-500/70" : i === 1 ? "bg-blue-500/70" : "bg-red-500/70"
                      } rounded-t-md transition-all duration-700`}
                      style={{ height: `${value * 1.6}px` }}
                    ></div>
                    <div className="text-xs capitalize">{key}</div>
                  </div>
                ))}
              </div>

              <div className="absolute left-0 top-0 h-[180px] flex flex-col justify-between text-xs text-muted-foreground py-1">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <div className="absolute bottom-0 w-full text-center text-xs text-muted-foreground">
                Economic outlook sentiment (last 30 days)
              </div>
            </div>
          </TabsContent>

          <TabsContent value="line" className="mt-0">
            <div className="h-[250px] relative">
              <svg viewBox="0 0 300 180" className="w-full h-[180px]">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="300" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="45" x2="300" y2="45" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="90" x2="300" y2="90" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="135" x2="300" y2="135" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="180" x2="300" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                {/* Optimistic line */}
                <path
                  d={`M0,${180 - (data.tech.optimistic * 180) / 100} C50,${
                    180 - ((data.tech.optimistic - 5) * 180) / 100
                  } 100,${180 - ((data.tech.optimistic + 10) * 180) / 100} 150,${
                    180 - ((data.tech.optimistic - 8) * 180) / 100
                  } S250,${180 - (data.tech.optimistic * 180) / 100} 300,${
                    180 - ((data.tech.optimistic + 5) * 180) / 100
                  }`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
                {/* Concerned line */}
                <path
                  d={`M0,${180 - (data.tech.concerned * 180) / 100} C50,${
                    180 - ((data.tech.concerned + 5) * 180) / 100
                  } 100,${180 - ((data.tech.concerned - 3) * 180) / 100} 150,${
                    180 - ((data.tech.concerned + 2) * 180) / 100
                  } S250,${180 - ((data.tech.concerned - 5) * 180) / 100} 300,${
                    180 - (data.tech.concerned * 180) / 100
                  }`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                />
                {/* Neutral line */}
                <path
                  d={`M0,${180 - (data.tech.neutral * 180) / 100} C50,${
                    180 - ((data.tech.neutral - 2) * 180) / 100
                  } 100,${180 - ((data.tech.neutral + 1) * 180) / 100} 150,${
                    180 - ((data.tech.neutral - 1) * 180) / 100
                  } S250,${180 - ((data.tech.neutral + 3) * 180) / 100} 300,${180 - (data.tech.neutral * 180) / 100}`}
                  fill="none"
                  stroke="#a3a3a3"
                  strokeWidth="3"
                />
                {/* Data points */}
                <circle cx="0" cy={180 - (data.tech.optimistic * 180) / 100} r="4" fill="#3b82f6" />
                <circle cx="150" cy={180 - ((data.tech.optimistic - 8) * 180) / 100} r="4" fill="#3b82f6" />
                <circle cx="300" cy={180 - ((data.tech.optimistic + 5) * 180) / 100} r="4" fill="#3b82f6" />
                <circle cx="0" cy={180 - (data.tech.concerned * 180) / 100} r="4" fill="#ef4444" />
                <circle cx="150" cy={180 - ((data.tech.concerned + 2) * 180) / 100} r="4" fill="#ef4444" />
                <circle cx="300" cy={180 - (data.tech.concerned * 180) / 100} r="4" fill="#ef4444" />
                <circle cx="0" cy={180 - (data.tech.neutral * 180) / 100} r="4" fill="#a3a3a3" />
                <circle cx="150" cy={180 - ((data.tech.neutral - 1) * 180) / 100} r="4" fill="#a3a3a3" />
                <circle cx="300" cy={180 - ((data.tech.neutral + 3) * 180) / 100} r="4" fill="#a3a3a3" />
              </svg>

              <div className="absolute bottom-0 w-full grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Optimistic</span>
                  </div>
                  <span className="font-medium">{data.tech.optimistic}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Concerned</span>
                  </div>
                  <span className="font-medium">{data.tech.concerned}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Neutral</span>
                  </div>
                  <span className="font-medium">{data.tech.neutral}%</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
