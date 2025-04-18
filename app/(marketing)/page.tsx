"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Code2,
  ExternalLink,
  Github,
  Globe,
  HeartHandshake,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
  Send,
  RefreshCw,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import PulseButton from "@/components/marketing/pulse-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import WaitlistChatSignup from "@/components/waitlist/WaitlistChatSignup"

export default function Page() {
  const [activeSection, setActiveSection] = useState("challenge")
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  // Track active section for floating nav
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]")

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop
        const sectionHeight = section.clientHeight
        const sectionId = section.getAttribute("id") || ""
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative bg-background text-foreground overflow-hidden">
      {/* Floating Navigation */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <nav className="bg-background/90 backdrop-blur-lg rounded-full border border-primary/20 px-2 py-1 shadow-2xl ring-1 ring-primary/10">
          <ul className="flex items-center space-x-1">
            {["challenge", "approach", "vision", "demo", "join"].map((section) => (
              <li key={section}>
                <Link
                  href={`#${section}`}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    activeSection === section
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  onClick={e => {
                    e.preventDefault()
                    document.querySelector(`#${section}`)?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Prototype Status Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border p-2 flex items-center justify-center">
        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
          <AlertCircle className="h-3 w-3 mr-2 text-primary" />
          <span>
            Prototype Status: This page describes the vision behind Global Pulse, an early-stage prototype.
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        aria-label="Global Pulse Hero"
      >
        {/* Animated Background */}
        <motion.div style={{ opacity, scale, y }} className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background/0" />
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl" />
          {/* Subtle animated pulse rings */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 1, opacity: 0.25 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.15, 0.25] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <div className="w-[420px] h-[420px] rounded-full border-4 border-primary/20" />
          </motion.div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="container relative z-10 px-4 md:px-6 text-center flex flex-col items-center"
        >
          <Badge
            variant="outline"
            className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-base md:text-lg tracking-wide"
            aria-label="Global Pulse"
          >
            Global Pulse
          </Badge>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-primary to-foreground/80 drop-shadow-lg"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            The World is Speaking.
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-6 md:mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Are We Listening Deeply?
          </motion.p>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <span className="inline-block">
              We're building the world's real-time barometer of human perspective.<br className="hidden md:inline" />
              <span className="text-primary font-medium"> By listening differently.</span>
            </span>
          </motion.p>

          {/* Quick Value Props */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85 }}
            aria-hidden="true"
          >
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Sparkles className="h-4 w-4" /> Real Conversations
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Shield className="h-4 w-4" /> Privacy-First
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Code2 className="h-4 w-4" /> Open Source
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Zap className="h-4 w-4" /> Real-Time Insights
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.05 }}
          >
            <PulseButton href="#challenge" className="text-lg px-8 py-3">
              Explore Our Mission
            </PulseButton>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full group text-lg px-8 py-3 border-primary/30 hover:bg-primary/10 hover:text-primary transition"
              asChild
            >
              <Link href="#approach">
                <span>Our Approach</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Animated Down Arrow */}
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            aria-hidden="true"
          >
            <ChevronDown className="h-10 w-10 text-primary/60 drop-shadow" />
          </motion.div>
        </motion.div>
      </section>

      {/* The Challenge Section */}
      <section id="challenge" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-l from-primary/5 to-transparent"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                The Challenge
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Drowning in Data, <br />
                <span className="text-primary">Starved for Understanding</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Traditional methods fail to capture the nuance and speed of human perspective. We're navigating our
                inner lives and the chaotic world with flimsy maps.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Polls miss the 'why' behind opinions",
                  "Social media reflects algorithms more than authenticity",
                  "Decisions impacting billions are made with outdated data",
                  "Lack of deep listening hinders progress and connection",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="flex items-center">
                <div className="h-px flex-grow bg-border"></div>
                <span className="px-4 text-sm text-muted-foreground">Our Origin</span>
                <div className="h-px flex-grow bg-border"></div>
              </div>
              <blockquote className="mt-6 border-l-2 border-primary pl-6 italic">
                <p className="text-lg">
                  "Global Pulse wasn't born in a boardroom; it began as a rapid-prototype hackathon project fueled by a
                  conviction: technology could help us listen better – to the world, and perhaps even to ourselves."
                </p>
              </blockquote>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">The Insight Gap</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Traditional Polls", width: "w-1/4" },
                      { label: "Social Media Analysis", width: "w-2/5" },
                      { label: "Focus Groups", width: "w-1/2" },
                      { label: "Global Pulse Approach", width: "w-11/12" },
                    ].map(({ label, width }, i) => (
                      <div className="flex items-center justify-between" key={label}>
                        <span>{label}</span>
                        <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                          <div className={`${width} h-full bg-primary`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Standard tools fail us. Sentiment analysis? Skin deep. Surveys? Stale snapshots. We saw this
                      deficit of deep understanding and knew we needed something radically different.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section id="approach" className="py-24 md:py-32 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10 mt-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Our Approach
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Amplify Authentic Voice. <br />
              <span className="text-primary">Illuminate Real-Time Understanding.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We're building a dynamic mirror for human perspective, grounded in transparency and respect.
            </p>
          </div>
          <Tabs defaultValue="conversational" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 mb-10">
              <TabsTrigger value="conversational">Conversational</TabsTrigger>
              <TabsTrigger value="realtime">Real-Time</TabsTrigger>
              <TabsTrigger value="ethical">Ethical</TabsTrigger>
              <TabsTrigger value="open">Open Source</TabsTrigger>
            </TabsList>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                {/* Conversational Tab */}
                <TabsContent value="conversational" className="p-0 m-0">
                  <div className="grid md:grid-cols-5 min-h-[400px]">
                    <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Conversational Depth</h3>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        Instead of static questions, our AI engages in nuanced, respectful dialogue to capture the 'why'
                        behind the 'what', revealing insights lost in traditional methods.
                      </p>
                      <div className="mt-auto">
                        <h4 className="font-medium mb-2">Key Benefits:</h4>
                        <ul className="space-y-2">
                          {[
                            "Captures nuance and context",
                            "Adapts to individual communication styles",
                            "Reveals underlying values and needs",
                          ].map((benefit, i) => (
                            <li className="flex items-center" key={benefit}>
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="md:col-span-2 bg-muted/50 p-6 border-t md:border-t-0 md:border-l border-border">
                      <div className="rounded-lg bg-background p-4 shadow-sm border border-border mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-medium text-sm">GP</span>
                          </div>
                          <div>
                            <p className="text-sm">What matters most to you about climate change?</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-4 shadow-sm border border-primary/20 mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-foreground font-medium text-sm">U</span>
                          </div>
                          <div>
                            <p className="text-sm">I worry about what kind of world my kids will inherit.</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-background p-4 shadow-sm border border-border">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-medium text-sm">GP</span>
                          </div>
                          <div>
                            <p className="text-sm">
                              That's a powerful concern. What specific aspects of their future environment worry you most?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {/* Real-Time Tab */}
                <TabsContent value="realtime" className="p-0 m-0">
                  <div className="grid md:grid-cols-5 min-h-[400px]">
                    <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Real-Time Pulse</h3>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        See individual perspectives contribute to the collective understanding instantly. No waiting
                        weeks for reports – experience the dynamic global sentiment as it forms.
                      </p>
                      <div className="mt-auto">
                        <h4 className="font-medium mb-2">Key Benefits:</h4>
                        <ul className="space-y-2">
                          {[
                            "Instant feedback on emerging issues",
                            "Track sentiment changes in real-time",
                            "Identify trends before they become mainstream",
                          ].map((benefit, i) => (
                            <li className="flex items-center" key={benefit}>
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="md:col-span-2 bg-muted/50 p-6 border-t md:border-t-0 md:border-l border-border">
                      <div className="h-full flex flex-col justify-center">
                        <div className="relative h-40 mb-4">
                          <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                            {[35, 45, 60, 50, 75, 65, 80, 70, 85, 75, 90].map((height, i) => (
                              <div
                                key={i}
                                className="w-full bg-primary/80 rounded-t-sm mx-0.5"
                                style={{ height: `${height}%` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-6">
                          <span>1 hour ago</span>
                          <span>Now</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Concern</span>
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              Rising
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Hope</span>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                              Stable
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Action Intent</span>
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                              Fluctuating
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {/* Ethical Tab */}
                <TabsContent value="ethical" className="p-0 m-0">
                  <div className="grid md:grid-cols-5 min-h-[400px]">
                    <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Ethical Architecture</h3>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        Privacy isn't an afterthought; it's coded in. Granular consent, rigorous anonymization, AI
                        neutrality, and active safety guardrails are non-negotiable foundations.
                      </p>
                      <div className="mt-auto">
                        <h4 className="font-medium mb-2">Key Principles:</h4>
                        <ul className="space-y-2">
                          {[
                            "User control over personal data",
                            "Transparent data usage policies",
                            "Bias mitigation in AI systems",
                          ].map((principle, i) => (
                            <li className="flex items-center" key={principle}>
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>{principle}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <Link
                            href="/ethics"
                            className="text-sm text-primary hover:underline inline-flex items-center"
                          >
                            Read our full ethics commitment
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 bg-muted/50 p-6 border-t md:border-t-0 md:border-l border-border">
                      <div className="space-y-4">
                        {[
                          {
                            title: "Privacy Protection",
                            desc: "All personal identifiers are removed before analysis. Your data is never sold or shared with third parties.",
                          },
                          {
                            title: "Consent Controls",
                            desc: "Granular permissions let you decide exactly what data you share and how it's used.",
                          },
                          {
                            title: "AI Neutrality",
                            desc: "Our systems are designed to avoid leading questions or imposing viewpoints during conversations.",
                          },
                        ].map(({ title, desc }) => (
                          <div className="bg-background rounded-lg p-4 border border-border" key={title}>
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Shield className="h-4 w-4 mr-2 text-green-500" />
                              {title}
                            </h4>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {/* Open Source Tab */}
                <TabsContent value="open" className="p-0 m-0">
                  <div className="grid md:grid-cols-5 min-h-[400px]">
                    <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Code2 className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Open & Collaborative</h3>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        Critical technology requires scrutiny. Our core engine logic is open source (AGPLv3). We invite
                        the community to inspect, challenge, and help us build responsibly.
                      </p>
                      <div className="mt-auto">
                        <h4 className="font-medium mb-2">Key Benefits:</h4>
                        <ul className="space-y-2">
                          {[
                            "Transparent development process",
                            "Community-driven improvements",
                            "Accountable design decisions",
                          ].map((benefit, i) => (
                            <li className="flex items-center" key={benefit}>
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <Link
                            href="https://github.com/LastMile-Innovations/Global_Pulse.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center"
                          >
                            View our GitHub repository
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 bg-muted/50 p-6 border-t md:border-t-0 md:border-l border-border">
                      <div className="bg-background rounded-lg p-4 border border-border font-mono text-xs overflow-hidden">
                        <div className="flex items-center justify-between mb-2 text-muted-foreground">
                          <span>core/dialogue_engine.ts</span>
                          <span className="text-xs">AGPLv3</span>
                        </div>
                        <ScrollArea className="h-[300px] w-full rounded">
                          <pre className="text-xs text-muted-foreground">
{`/**
 * Global Pulse Dialogue Engine
 * Core conversation processing module
 */
export class DialogueEngine {
  private context: ConversationContext;
  private valueDetector: ValueDetectionModule;
  private sentimentAnalyzer: SentimentAnalyzer;
  
  constructor(config: EngineConfig) {
    this.context = new ConversationContext();
    this.valueDetector = new ValueDetectionModule();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    
    // Initialize with ethical guardrails
    this.applyEthicalGuardrails(config.safetySettings);
  }
  
  public async processUserInput(input: string): Promise<DialogueResponse> {
    // Anonymize input before processing
    const sanitizedInput = this.anonymizePersonalData(input);
    
    // Update conversation context
    this.context.addUserMessage(sanitizedInput);
    
    // Analyze for underlying values and sentiment
    const values = await this.valueDetector.detect(sanitizedInput);
    const sentiment = this.sentimentAnalyzer.analyze(sanitizedInput);
    
    // Generate appropriate response
    return this.generateResponse(values, sentiment);
  }
  
  private anonymizePersonalData(text: string): string {
    // Implementation of privacy-preserving logic
    return text.replace(PII_PATTERNS, ANONYMIZED_PLACEHOLDERS);
  }
}`}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-r from-primary/5 to-transparent"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Our Vision
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              A World <span className="text-primary">Potentially</span> Connected <br />
              by Deeper Understanding
            </h2>
            <p className="text-lg text-muted-foreground">
              We envision tools for insight – personal and collective – moving beyond surface-level data.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-stretch max-w-5xl mx-auto">
            {/* Individual Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl h-full">
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">
                      For Individuals: The <span className="text-primary">Potential</span> Self-Awareness Engine
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    Imagine a dashboard for your <strong>internal operating system</strong>. It <em>could</em> help
                    visualize how your core{" "}
                    <code className="bg-muted/70 px-1.5 py-0.5 rounded text-primary">Values</code>,{" "}
                    <code className="bg-muted/70 px-1.5 py-0.5 rounded text-primary">Needs</code>, and{" "}
                    <code className="bg-muted/70 px-1.5 py-0.5 rounded text-primary">Beliefs</code> interact with daily life.
                  </p>
                  <div className="bg-muted/30 rounded-xl p-4 mb-6">
                    <p className="text-sm italic">
                      "This isn't therapy; it's <em>potentially</em> a user manual to your mind, fostering conscious
                      responses over autopilot reactions."
                    </p>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    {[
                      "Potential to understand personal triggers and reactions",
                      "Potential to align actions with core values",
                      "Potential to navigate emotions with clarity",
                    ].map((item, i) => (
                      <li className="flex items-start" key={item}>
                        <CheckCircle2 className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <span className="text-foreground font-medium">
                            {item.split(" ")[0]}
                          </span>{" "}
                          {item.slice(item.indexOf(" ") + 1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
            {/* Collective Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl h-full">
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">
                      For the World: A <span className="text-primary">Potential</span> Collective Barometer
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    Imagine leaders <em>potentially</em> accessing real-time public concern, researchers{" "}
                    <em>potentially</em> understanding societal trends with rich context, and businesses{" "}
                    <em>potentially</em> aligning with genuine human needs.
                  </p>
                  <div className="bg-muted/30 rounded-xl p-4 mb-6">
                    <p className="text-sm italic">
                      "The goal is to <em>potentially</em> provide the shared heartbeat – anonymously and ethically."
                    </p>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    {[
                      "Could inform better public policy decisions",
                      "Could foster empathy across cultural divides",
                      "Could enable responsible innovation",
                    ].map((item, i) => (
                      <li className="flex items-start" key={item}>
                        <CheckCircle2 className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <span className="text-foreground font-medium">
                            {item.split(" ")[0]}
                          </span>{" "}
                          {item.slice(item.indexOf(" ") + 1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="mt-16 text-center">
            <p className="text-center italic text-muted-foreground text-lg bg-card/50 backdrop-blur-sm inline-block px-6 py-3 rounded-full shadow-sm border border-border">
              That's the potential we are exploring with Global Pulse.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Interactive Demo
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Experience <span className="text-primary">Global Pulse</span> in Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Try our interactive demo to see how Global Pulse captures perspectives and generates insights.
            </p>
          </div>
          <InteractiveDemo />
        </div>
      </section>

      {/* Join Us Section */}
      <section id="join" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Get Involved
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Shape the Future of <span className="text-primary">Understanding</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              The journey to deeper understanding requires collective effort. Join us in building a more informed,
              empathetic world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <PulseButton href="/waitlist">
                <Sparkles className="mr-2 h-5 w-5" />
                Join the Waitlist
              </PulseButton>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary group"
                asChild
              >
                <Link href="/explore">
                  Explore Live Insights
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
              <div className="group bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-md hover:shadow-lg hover:border-primary/20 transition-all duration-300 text-left flex flex-col">
                <div className="flex items-center mb-3">
                  <Github className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <h4 className="font-bold text-lg">Contribute & Collaborate</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  Explore our open-source core engine, report issues, or discuss research partnerships.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
                  asChild
                >
                  <Link
                    href="https://github.com/LastMile-Innovations/Global_Pulse.git"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub{" "}
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="group bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-md hover:shadow-lg hover:border-primary/20 transition-all duration-300 text-left flex flex-col">
                <div className="flex items-center mb-3">
                  <HeartHandshake className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <h4 className="font-bold text-lg">Our Principles</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  Understand the ethical framework and safety measures guiding our development.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
                  asChild
                >
                  <Link href="/ethics">
                    Read Ethical Framework{" "}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-16 flex justify-center">
              <WaitlistChatSignup />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Interactive Demo Component
function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState("conversation")
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "Welcome to Global Pulse. I'd like to understand your perspective on climate change.",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [insights, setInsights] = useState({
    values: {
      security: 35,
      harmony: 65,
      achievement: 45,
      autonomy: 55,
      growth: 70,
    },
    sentiment: {
      concern: 68,
      hope: 42,
      urgency: 75,
    },
    topics: [
      { name: "Future Generations", value: 85 },
      { name: "Sustainable Energy", value: 65 },
      { name: "Policy Reform", value: 55 },
      { name: "Individual Action", value: 40 },
    ],
  })
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Predefined responses based on user input
  const getResponse = (input: string) => {
    const inputLower = input.toLowerCase()
    if (inputLower.includes("worry") || inputLower.includes("concern")) {
      return "That's a valid concern. What specific aspects worry you the most about climate change?"
    } else if (inputLower.includes("future") || inputLower.includes("children") || inputLower.includes("kids")) {
      return "Thinking about future generations is a powerful perspective. How do you envision an ideal world for them regarding climate?"
    } else if (inputLower.includes("government") || inputLower.includes("policy") || inputLower.includes("politics")) {
      return "Policy approaches are certainly important. What kind of climate policies do you think would be most effective?"
    } else if (inputLower.includes("action") || inputLower.includes("do") || inputLower.includes("help")) {
      return "Your desire to take action is encouraging. What kinds of climate actions feel most meaningful to you personally?"
    } else {
      return "Thank you for sharing that perspective. Could you tell me more about why this aspect of climate change matters to you?"
    }
  }

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMessages = [...messages, { role: "user", content: inputValue }]
    setMessages(newMessages)
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(inputValue)
      setMessages([...newMessages, { role: "system", content: response }])
      setIsTyping(false)

      // Update insights after 2 user messages
      if (newMessages.length >= 3 && !isGeneratingInsights) {
        setIsGeneratingInsights(true)
        setTimeout(() => {
          setInsights(prev => ({
            ...prev,
            values: {
              ...prev.values,
              harmony: Math.min(95, prev.values.harmony + 10),
              security: Math.min(95, prev.values.security + 15),
            },
            sentiment: {
              ...prev.sentiment,
              concern: Math.min(95, prev.sentiment.concern + 7),
              hope: Math.max(5, prev.sentiment.hope - 5),
            },
          }))
          setIsGeneratingInsights(false)
        }, 2000)
      }
    }, 1500)
  }

  // Reset the conversation
  const handleReset = () => {
    setMessages([
      {
        role: "system",
        content: "Welcome to Global Pulse. I'd like to understand your perspective on climate change.",
      },
    ])
    setInsights({
      values: {
        security: 35,
        harmony: 65,
        achievement: 45,
        autonomy: 55,
        growth: 70,
      },
      sentiment: {
        concern: 68,
        hope: 42,
        urgency: 75,
      },
      topics: [
        { name: "Future Generations", value: 85 },
        { name: "Sustainable Energy", value: 65 },
        { name: "Policy Reform", value: 55 },
        { name: "Individual Action", value: 40 },
      ],
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-xl opacity-30"></div>
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] min-h-[600px]">
            {/* Left Panel: Conversation */}
            <div className="flex flex-col border-b md:border-b-0 md:border-r border-border bg-background/80 backdrop-blur-sm min-h-[400px] relative">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-muted/40">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/grand-prix-finish.png" alt="Global Pulse" />
                    <AvatarFallback className="bg-primary/20 text-primary">GP</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-sm">Global Pulse</h3>
                    <p className="text-xs text-muted-foreground">Climate Perspective Dialogue</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset} title="Reset conversation">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border border-border"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted border border-border">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"></div>
                        <div
                          className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border flex gap-2 bg-background sticky bottom-0 z-10"
              >
                <Input
                  placeholder="Share your perspective on climate change..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="flex-grow"
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" disabled={isTyping || !inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
            {/* Right Panel: Insights */}
            <div className="flex flex-col min-w-[260px] bg-background/90 backdrop-blur-sm">
              <div className="sticky top-0 z-10 p-4 border-b border-border bg-muted/40 flex items-center justify-between">
                <h3 className="font-medium text-sm">Real-Time Insights</h3>
                <div className="flex items-center">
                  {isGeneratingInsights && (
                    <div className="text-xs text-muted-foreground mr-2 flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse mr-1"></div>
                      Updating
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow p-4 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 h-8 mb-6 bg-muted/30 rounded-lg">
                    <TabsTrigger value="conversation" className="text-xs px-2 transition-colors hover:bg-primary/10">
                      Values
                    </TabsTrigger>
                    <TabsTrigger value="sentiment" className="text-xs px-2 transition-colors hover:bg-primary/10">
                      Sentiment
                    </TabsTrigger>
                    <TabsTrigger value="topics" className="text-xs px-2 transition-colors hover:bg-primary/10">
                      Topics
                    </TabsTrigger>
                  </TabsList>
                  {/* Values Tab */}
                  <TabsContent value="conversation" className="mt-0 space-y-4">
                    <div className="text-center mb-2">
                      <h4 className="text-sm font-medium">Core Values Detected</h4>
                      <p className="text-xs text-muted-foreground">Based on conversation analysis</p>
                    </div>
                    {Object.entries(insights.values).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{key}</span>
                          <span className="text-xs text-muted-foreground">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                    <div className="bg-muted/30 rounded-lg p-3 mt-6">
                      <p className="text-xs text-muted-foreground">
                        Values reflect underlying motivations and priorities detected in your conversation. They help
                        understand the 'why' behind perspectives.
                      </p>
                    </div>
                  </TabsContent>
                  {/* Sentiment Tab */}
                  <TabsContent value="sentiment" className="mt-0 space-y-4">
                    <div className="text-center mb-2">
                      <h4 className="text-sm font-medium">Emotional Sentiment</h4>
                      <p className="text-xs text-muted-foreground">Emotional tone analysis</p>
                    </div>
                    {Object.entries(insights.sentiment).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{key}</span>
                          <span className="text-xs text-muted-foreground">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                    <div className="bg-muted/30 rounded-lg p-3 mt-6">
                      <p className="text-xs text-muted-foreground">
                        Sentiment analysis reveals emotional dimensions of perspectives, helping understand not just
                        what people think, but how they feel about issues.
                      </p>
                    </div>
                  </TabsContent>
                  {/* Topics Tab */}
                  <TabsContent value="topics" className="mt-0 space-y-4">
                    <div className="text-center mb-2">
                      <h4 className="text-sm font-medium">Key Topics</h4>
                      <p className="text-xs text-muted-foreground">Prominent themes in conversation</p>
                    </div>
                    {insights.topics.map((topic, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{topic.name}</span>
                          <span className="text-xs text-muted-foreground">{topic.value}%</span>
                        </div>
                        <Progress value={topic.value} className="h-2" />
                      </div>
                    ))}
                    <div className="bg-muted/30 rounded-lg p-3 mt-6">
                      <p className="text-xs text-muted-foreground">
                        Topic analysis identifies key themes and their relative importance, revealing what aspects of an
                        issue matter most to people.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-green-500" />
                    Privacy Protected
                  </span>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <Link href="/explore">
                    <Play className="h-3 w-3 mr-1" />
                    Full Demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          This interactive demo simulates how Global Pulse engages in meaningful conversation to understand perspectives
          while generating real-time insights. Try sharing your thoughts on climate change to see how the system
          responds.
        </p>
      </div>
    </div>
  )
}
