"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface TrustedByLogosProps {
  className?: string
}

export default function TrustedByLogos({ className }: TrustedByLogosProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simple animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const companies = [
    { name: "Forbes", width: 100 },
    { name: "TechCrunch", width: 120 },
    { name: "Wired", width: 90 },
    { name: "MIT", width: 70 },
    { name: "Stanford", width: 110 },
    { name: "UN", width: 60 },
  ]

  return (
    <div className={`flex flex-wrap justify-center items-center gap-x-16 gap-y-8 py-4 ${className}`}>
      {companies.map((company, index) => (
        <div
          key={company.name}
          className={`h-10 text-muted-foreground/70 hover:text-muted-foreground transition-all duration-500 hover:scale-110 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <Image
            src={`/placeholder.svg?height=40&width=${company.width}&text=${company.name}`}
            alt={`${company.name} logo`}
            width={company.width}
            height={40}
            className="h-full w-auto grayscale hover:grayscale-0 transition-all"
          />
        </div>
      ))}
    </div>
  )
}
