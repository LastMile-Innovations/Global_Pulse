"use client"

import { useEffect, useState, useRef, memo } from "react"
import { Globe } from "lucide-react"

interface GlobalMapProps {
  className?: string
  showPulse?: boolean
}

// Memoize the component to prevent unnecessary re-renders
const GlobalMap = memo(function GlobalMap({ className, showPulse = true }: GlobalMapProps) {
  const [activePoints, setActivePoints] = useState<
    { x: number; y: number; size: number; delay: number; duration: number }[]
  >([])
  const [isHovered, setIsHovered] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const isVisible = useRef(false)

  useEffect(() => {
    // Only generate points when component is visible (optimization)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible.current) {
          isVisible.current = true

          // Generate random points for the pulse effect
          const points = Array.from({ length: 12 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 12 + 6,
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 2, // Random duration between 2-5s
          }))
          setActivePoints(points)
        }
      },
      { threshold: 0.1 },
    )

    if (mapRef.current) {
      observer.observe(mapRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={mapRef}
      className={`relative w-full h-full min-h-[300px] bg-muted/20 rounded-xl overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* World map outline - enhanced SVG */}
      <svg
        viewBox="0 0 1000 500"
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isHovered ? "opacity-50" : "opacity-30"} text-primary/50`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* Simplified continent outlines with smoother paths */}
        <path d="M250,120 C300,100 350,90 400,100 C450,110 500,130 550,120 C600,110 650,90 700,100 C750,110 800,140 850,130" />
        <path d="M200,150 C250,140 300,150 350,160 C400,170 450,160 500,150 C550,140 600,150 650,160 C700,170 750,160 800,150" />
        <path d="M150,200 C200,180 250,190 300,200 C350,210 400,200 450,190 C500,180 550,190 600,200 C650,210 700,200 750,190 C800,180 850,190 900,200" />
        <path d="M200,250 C250,230 300,240 350,250 C400,260 450,250 500,240 C550,230 600,240 650,250 C700,260 750,250 800,240" />
        <path d="M250,300 C300,280 350,290 400,300 C450,310 500,300 550,290 C600,280 650,290 700,300 C750,310 800,300 850,290" />
        <path d="M300,350 C350,330 400,340 450,350 C500,360 550,350 600,340 C650,330 700,340 750,350" />

        {/* Add some curved lines for oceans */}
        <path d="M100,150 Q150,180 100,220" className="opacity-30" />
        <path d="M850,150 Q800,180 850,220" className="opacity-30" />
        <path d="M400,50 Q500,80 600,50" className="opacity-30" />
        <path d="M400,400 Q500,370 600,400" className="opacity-30" />
      </svg>

      {/* Grid lines with animation */}
      <div
        className={`absolute inset-0 grid grid-cols-6 grid-rows-3 transition-opacity duration-500 ${isHovered ? "opacity-30" : "opacity-15"}`}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="border border-primary/10"></div>
        ))}
      </div>

      {/* Pulse points with improved animation */}
      {showPulse &&
        activePoints.map((point, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary animate-pulse will-change-transform"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${point.size}px`,
              height: `${point.size}px`,
              animationDelay: `${point.delay}s`,
              animationDuration: `${point.duration}s`,
              opacity: isHovered ? 0.8 : 0.6,
              transform: isHovered ? "scale(1.2)" : "scale(1)",
              transition: "transform 0.5s ease, opacity 0.5s ease",
            }}
          ></div>
        ))}

      {/* Regions with hover effects */}
      <div className="absolute top-[20%] left-[30%] bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center text-primary font-medium text-sm border border-primary/30 shadow-lg hover:bg-primary/30 hover:scale-110 transition-all cursor-pointer">
        NA
      </div>
      <div className="absolute top-[25%] left-[55%] bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center text-blue-500 font-medium text-sm border border-blue-500/30 shadow-lg hover:bg-blue-500/30 hover:scale-110 transition-all cursor-pointer">
        EU
      </div>
      <div className="absolute top-[40%] left-[65%] bg-teal-500/20 rounded-full w-14 h-14 flex items-center justify-center text-teal-500 font-medium text-sm border border-teal-500/30 shadow-lg hover:bg-teal-500/30 hover:scale-110 transition-all cursor-pointer">
        AS
      </div>
      <div className="absolute top-[45%] left-[45%] bg-amber-500/20 rounded-full w-10 h-10 flex items-center justify-center text-amber-500 font-medium text-sm border border-amber-500/30 shadow-lg hover:bg-amber-500/30 hover:scale-110 transition-all cursor-pointer">
        AF
      </div>
      <div className="absolute top-[60%] left-[35%] bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center text-purple-500 font-medium text-sm border border-purple-500/30 shadow-lg hover:bg-purple-500/30 hover:scale-110 transition-all cursor-pointer">
        SA
      </div>
      <div className="absolute top-[55%] left-[80%] bg-red-500/20 rounded-full w-10 h-10 flex items-center justify-center text-red-500 font-medium text-sm border border-red-500/30 shadow-lg hover:bg-red-500/30 hover:scale-110 transition-all cursor-pointer">
        OC
      </div>

      {/* Legend with improved styling */}
      <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs border shadow-sm hover:bg-background transition-colors">
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3 text-primary" />
          <span className="font-medium">Global Opinion Map</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </div>
      </div>
    </div>
  )
})

export default GlobalMap
