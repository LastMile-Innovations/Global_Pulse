"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: "blur" | "empty" | "data:image/..."
  blurDataURL?: string
  onLoad?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    // Only set up intersection observer if not priority
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }, // Start loading when within 200px of viewport
    )

    const currentElement = document.getElementById(`image-${alt.replace(/\s+/g, "-")}`)
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      observer.disconnect()
    }
  }, [alt, priority])

  const handleImageLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  return (
    <div
      id={`image-${alt.replace(/\s+/g, "-")}`}
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {(isInView || priority) && (
        <Image
          src={src || ""}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          sizes={sizes}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleImageLoad}
          className={cn("transition-opacity duration-500", isLoaded ? "opacity-100" : "opacity-0")}
          {...props}
        />
      )}

      {(!isLoaded || !isInView) && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse" style={{ aspectRatio: `${width}/${height}` }} />
      )}
    </div>
  )
}
