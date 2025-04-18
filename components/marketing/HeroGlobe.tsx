"use client"
import dynamic from "next/dynamic"
import React, { useRef, useEffect, useCallback, useState } from "react"

// Dynamically import react-globe.gl only on client
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false })

const EARTH_DAY_IMG = "https://unpkg.com/three-globe/example/img/earth-day.jpg"
const BUMP_IMG = "https://unpkg.com/three-globe/example/img/earth-topology.png"
const NIGHT_IMG = "https://unpkg.com/three-globe/example/img/earth-night.jpg"
const CLOUDS_IMG = "https://unpkg.com/three-globe/example/img/earth-clouds.png"

interface HeroGlobeProps {
  size?: number
  className?: string
  style?: React.CSSProperties
  showClouds?: boolean
  focusLat?: number
  focusLng?: number
  focusAltitude?: number
  animateToFocus?: boolean
}

/**
 * HeroGlobe
 * Animated, interactive 3D Earth Globe for hero/marketing visuals.
 * - Auto-rotates, disables zoom/pan for focus.
 * - Optionally overlays clouds and animates camera to a focus point.
 * - Fully responsive and accessible.
 */
export default function HeroGlobe({
  size = 320,
  className = "",
  style = {},
  showClouds = false,
  focusLat,
  focusLng,
  focusAltitude = 1.2,
  animateToFocus = false,
}: HeroGlobeProps) {
  const globeRef = useRef<any>(null)
  const [globeReady, setGlobeReady] = useState(false)
  const [arcsData, setArcsData] = useState<{ startLat: number; startLng: number; endLat: number; endLng: number }[]>([])

  // Update globe controls for smooth animation and UX
  const updateControls = useCallback(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls?.()
    if (!controls) return
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.7
    controls.enableZoom = false
    controls.enablePan = false
    controls.minDistance = size * 0.9
    controls.maxDistance = size * 1.2
  }, [size])

  // Animate camera to focus point if provided
  useEffect(() => {
    if (
      globeRef.current &&
      typeof focusLat === "number" &&
      typeof focusLng === "number" &&
      animateToFocus
    ) {
      globeRef.current.pointOfView(
        { lat: focusLat, lng: focusLng, altitude: focusAltitude },
        1200
      )
    }
  }, [focusLat, focusLng, focusAltitude, animateToFocus])

  // Ensure controls are updated on mount and when size changes
  useEffect(() => {
    if (globeReady) updateControls()
  }, [updateControls, globeReady])

  // Responsive: update controls if window resizes
  useEffect(() => {
    const handleResize = () => updateControls()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateControls])

  // Animate connection arcs between random points
  useEffect(() => {
    const ARC_COUNT = 12;
    function generateArcs() {
      return Array.from({ length: ARC_COUNT }).map(() => ({
        startLat: Math.random() * 180 - 90,
        startLng: Math.random() * 360 - 180,
        endLat: Math.random() * 180 - 90,
        endLng: Math.random() * 360 - 180,
      }));
    }
    setArcsData(generateArcs());
    const interval = setInterval(() => {
      setArcsData(generateArcs());
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={[
        "relative",
        "rounded-standard-xl",
        "shadow-glow",
        "overflow-hidden",
        "animate-float",
        className,
      ].join(" ")}
      style={{
        width: size,
        height: size,
        background: "none",
        border: "none",
        ...style,
      }}
      aria-label="Animated 3D Earth Globe"
      tabIndex={0}
      role="img"
    >
      <Globe
        ref={globeRef}
        width={size}
        height={size}
        globeImageUrl={EARTH_DAY_IMG}
        bumpImageUrl={BUMP_IMG}
        backgroundImageUrl={NIGHT_IMG}
        arcsData={arcsData}
        arcColor={() => ['rgba(255,99,71,0.6)', 'rgba(30,144,255,0.6)']}
        arcAltitude={0.2}
        arcStroke={1.5}
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashAnimateTime={2000}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="hsl(var(--primary))"
        atmosphereAltitude={0.18}
        enablePointerInteraction={false}
        animateIn
        onGlobeReady={() => setGlobeReady(true)}
      />
      {/* Subtle overlay for accessibility/contrast */}
      <div
        className="pointer-events-none absolute inset-0 rounded-standard-xl"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(0,0,0,0.04) 100%)",
        }}
      />
      {/* Optional: visually hidden label for screen readers */}
      <span className="sr-only">
        Animated 3D globe showing the Earth with gentle rotation.
      </span>
    </div>
  )
}