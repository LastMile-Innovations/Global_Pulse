"use client"

import { useEffect, useState, useRef, memo, useMemo } from "react"
import { Globe, Activity, TrendingUp, Users, BarChart3, Info } from "lucide-react"

interface GlobalMapProps {
  className?: string
  showPulse?: boolean
  showRegions?: boolean
  showStats?: boolean
  interactiveHotspots?: boolean
}

// Predefined regions with data for visualization
const REGIONS = [
  { id: "na", name: "North America", code: "NA", x: 30, y: 20, size: 16, themeColor: "primary", sentiment: 85 },
  { id: "eu", name: "Europe", code: "EU", x: 55, y: 25, size: 14, themeColor: "secondary", sentiment: 72 },
  { id: "as", name: "Asia", code: "AS", x: 70, y: 35, size: 16, themeColor: "accent", sentiment: 68 },
  { id: "af", name: "Africa", code: "AF", x: 50, y: 45, size: 12, themeColor: "accent-orange", sentiment: 63 },
  { id: "sa", name: "South America", code: "SA", x: 35, y: 60, size: 14, themeColor: "primary", sentiment: 77 },
  { id: "oc", name: "Oceania", code: "OC", x: 80, y: 60, size: 12, themeColor: "destructive", sentiment: 81 },
]

// Memoize the component to prevent unnecessary re-renders
const GlobalMap = memo(function GlobalMap({ 
  className, 
  showPulse = true,
  showRegions = true,
  showStats = true,
  interactiveHotspots = true 
}: GlobalMapProps) {
  const [activePoints, setActivePoints] = useState<
    { x: number; y: number; size: number; delay: number; duration: number; opacity: number }[]
  >([])
  const [isHovered, setIsHovered] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const isVisible = useRef(false)
  const animationTimer = useRef<NodeJS.Timeout | null>(null)

  // Generate random points with improved distribution
  const generatePoints = useMemo(() => {
    return (count: number) => {
      // Create a grid-based distribution for more realistic global coverage
      const gridSize = Math.ceil(Math.sqrt(count))
      const cellWidth = 100 / gridSize
      const cellHeight = 100 / gridSize
      
      return Array.from({ length: count }, (_, i) => {
        const gridX = i % gridSize
        const gridY = Math.floor(i / gridSize)
        
        // Add some randomness within each grid cell
        const x = (gridX * cellWidth) + (Math.random() * cellWidth * 0.8)
        const y = (gridY * cellHeight) + (Math.random() * cellHeight * 0.8)
        
        return {
          x,
          y,
          size: Math.random() * 12 + 6,
          delay: Math.random() * 5,
          duration: Math.random() * 3 + 2, // Random duration between 2-5s
          opacity: Math.random() * 0.5 + 0.3, // Varied opacity for depth
        }
      })
    }
  }, [])

  useEffect(() => {
    // Only generate points when component is visible (optimization)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible.current) {
          isVisible.current = true
          setActivePoints(generatePoints(16))
          
          // Trigger a periodic refresh of points for a more dynamic feel
          const refreshInterval = setInterval(() => {
            if (isVisible.current) {
              setActivePoints(prev => {
                // Only replace some points to avoid jarring changes
                const newPoints = [...prev]
                const numToReplace = Math.floor(newPoints.length / 4)
                const replacementPoints = generatePoints(numToReplace)
                
                for (let i = 0; i < numToReplace; i++) {
                  const randomIndex = Math.floor(Math.random() * newPoints.length)
                  newPoints[randomIndex] = replacementPoints[i]
                }
                
                return newPoints
              })
            }
          }, 8000) // Refresh some points every 8 seconds
          
          return () => clearInterval(refreshInterval)
        }
      },
      { threshold: 0.1 },
    )

    if (mapRef.current) {
      observer.observe(mapRef.current)
    }

    return () => {
      observer.disconnect()
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }
    }
  }, [])

  // Handle region hover/click
  const handleRegionInteraction = (regionId: string) => {
    if (interactiveHotspots) {
      setActiveRegion(regionId === activeRegion ? null : regionId)
      
      // Add a subtle animation effect when region is selected
      setIsAnimating(true)
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }
      
      animationTimer.current = setTimeout(() => {
        setIsAnimating(false)
      }, 1000)
    }
  }
  
  return (
    <div
      ref={mapRef}
      className={`relative w-full h-full min-h-[400px] bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden ${className} ${isAnimating ? 'animate-subtle-pulse' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced background with subtle gradient */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* World map outline - enhanced SVG with more detailed continents */}
      <svg
        viewBox="0 0 1000 500"
        className={`absolute inset-0 w-full h-full transition-all duration-500 ${isHovered ? "opacity-60" : "opacity-40"} ${activeRegion ? 'scale-105' : 'scale-100'} text-primary/50`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {/* More detailed continent outlines */}
        <path d="M250,120 C300,100 350,90 400,100 C450,110 500,130 550,120 C600,110 650,90 700,100 C750,110 800,140 850,130" />
        <path d="M200,150 C250,140 300,150 350,160 C400,170 450,160 500,150 C550,140 600,150 650,160 C700,170 750,160 800,150" />
        <path d="M150,200 C200,180 250,190 300,200 C350,210 400,200 450,190 C500,180 550,190 600,200 C650,210 700,200 750,190 C800,180 850,190 900,200" />
        <path d="M200,250 C250,230 300,240 350,250 C400,260 450,250 500,240 C550,230 600,240 650,250 C700,260 750,250 800,240" />
        <path d="M250,300 C300,280 350,290 400,300 C450,310 500,300 550,290 C600,280 650,290 700,300 C750,310 800,300 850,290" />
        <path d="M300,350 C350,330 400,340 450,350 C500,360 550,350 600,340 C650,330 700,340 750,350" />

        {/* North America detail */}
        <path d="M220,140 C240,130 260,125 280,130" className="text-primary/30" />
        <path d="M200,160 C220,150 240,145 260,150" className="text-primary/30" />
        <path d="M180,180 C200,170 220,165 240,170" className="text-primary/30" />
        
        {/* Europe detail */}
        <path d="M520,140 C540,130 560,125 580,130" className="text-secondary/30" />
        <path d="M500,160 C520,150 540,145 560,150" className="text-secondary/30" />
        
        {/* Asia detail */}
        <path d="M620,160 C640,150 660,145 680,150" className="text-accent/30" />
        <path d="M640,180 C660,170 680,165 700,170" className="text-accent/30" />
        <path d="M660,200 C680,190 700,185 720,190" className="text-accent/30" />

        {/* Ocean currents with animation */}
        <path d="M100,150 Q150,180 100,220" className="opacity-30 animate-flow-slow" />
        <path d="M850,150 Q800,180 850,220" className="opacity-30 animate-flow-slow" style={{animationDelay: '1s'}} />
        <path d="M400,50 Q500,80 600,50" className="opacity-30 animate-flow-slow" style={{animationDelay: '2s'}} />
        <path d="M400,400 Q500,370 600,400" className="opacity-30 animate-flow-slow" style={{animationDelay: '3s'}} />
      </svg>

      {/* Enhanced grid lines with animation */}
      <div
        className={`absolute inset-0 grid grid-cols-8 grid-rows-4 transition-all duration-500 ${isHovered ? "opacity-30" : "opacity-15"}`}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="border border-primary/10"></div>
        ))}
      </div>

      {/* Improved pulse points with better animation and varied colors */}
      {showPulse &&
        activePoints.map((point, i) => {
          // Determine color based on position (rough continent mapping)
          let bgColor = "bg-primary"
          if (point.x < 40 && point.y < 40) bgColor = "bg-primary"        // North America
          else if (point.x > 40 && point.x < 60 && point.y < 40) bgColor = "bg-secondary"     // Europe
          else if (point.x > 60 && point.y < 50) bgColor = "bg-accent"       // Asia
          else if (point.x > 30 && point.x < 60 && point.y > 30 && point.y < 60) bgColor = "bg-accent-orange" // Africa
          else if (point.x < 40 && point.y > 40) bgColor = "bg-primary/80"   // South America (reuse primary)
          else if (point.x > 70 && point.y > 50) bgColor = "bg-destructive"    // Oceania
          
          return (
            <div
              key={i}
              className={`absolute rounded-full ${bgColor} animate-pulse will-change-transform`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: `${point.size}px`,
                height: `${point.size}px`,
                animationDelay: `${point.delay}s`,
                animationDuration: `${point.duration}s`,
                opacity: point.opacity * (isHovered ? 1.2 : 1),
                transform: isHovered ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.5s ease, opacity 0.5s ease",
                zIndex: 5
              }}
            ></div>
          )
        })}

      {/* Enhanced interactive regions */}
      {showRegions && REGIONS.map((region) => {
        const isActive = activeRegion === region.id
        const scale = isActive ? 'scale-125' : 'scale-100'
        const opacity = isActive ? '1' : '0.8'
        const bgOpacity = isActive ? 'bg-opacity-40' : 'bg-opacity-20' // Use Tailwind opacity classes
        
        return (
          <div 
            key={region.id}
            className={`absolute rounded-full bg-${region.themeColor} ${bgOpacity} flex items-center justify-center 
                      text-${region.themeColor} font-medium border border-${region.themeColor}/30 shadow-lg 
                      hover:bg-${region.themeColor}/30 ${scale} transition-all cursor-pointer z-10`}
            style={{
              top: `${region.y}%`,
              left: `${region.x}%`,
              width: `${region.size * 4}px`,
              height: `${region.size * 4}px`,
              opacity,
              transition: 'all 0.3s ease-out'
            }}
            onClick={() => handleRegionInteraction(region.id)}
            onMouseEnter={() => interactiveHotspots && setActiveRegion(region.id)}
            onMouseLeave={() => interactiveHotspots && setActiveRegion(null)}
          >
            <div className="flex flex-col items-center justify-center">
              <span>{region.code}</span>
              {isActive && (
                <div className="absolute -bottom-8 bg-background/90 backdrop-blur-sm text-xs px-2 py-1 rounded-md shadow-md whitespace-nowrap">
                  <div className="font-semibold">{region.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{region.sentiment}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Enhanced stats overlay */}
      {showStats && (
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs border border-border/50 shadow-sm transition-opacity duration-300 opacity-80 hover:opacity-100">
          <div className="flex flex-col gap-2">
            <div className="font-medium text-sm border-b pb-1 mb-1 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>Global Metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="text-muted-foreground">Active regions:</span>
              <span className="font-medium ml-auto">6</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">Avg. sentiment:</span>
              <span className="font-medium ml-auto">74%</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-amber-500" />
              <span className="text-muted-foreground">Trend:</span>
              <span className="font-medium ml-auto text-green-500">+2.4%</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced legend with interactive tooltip */}
      <div 
        className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg p-2.5 text-xs border border-border/50 shadow-sm hover:bg-background transition-all group cursor-help"
        onMouseEnter={() => setIsHovered(true)}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">Global Opinion Map</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <Info className="h-3 w-3 text-muted-foreground ml-1" />
        </div>
        
        {/* Tooltip that appears on hover */}
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-background rounded-lg p-3 border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs">
          <p className="font-medium mb-1">Real-time global sentiment</p>
          <p className="text-muted-foreground mb-2">Hover over regions to see detailed metrics and engagement statistics.</p>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Updated: Just now</span>
            <span className="text-primary">Live data</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default GlobalMap
