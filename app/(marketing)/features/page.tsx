"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  Globe,
  HeartHandshake,
  Shield,
  Sparkles,
  Zap,
  ShieldCheck,
  MessageSquareText,
  BarChartBig,
  Info,
  Lightbulb,
  Lock,
  Layers,
  Clock,
  Github,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeaturesPage() {
  const [activeSection, setActiveSection] = useState("introduction")
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  const [activeTab, setActiveTab] = useState("conversational")

  // Update active section based on scroll position
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
            {[
              { id: "introduction", label: "Overview" },
              { id: "conversation", label: "Conversation" },
              { id: "genui", label: "Structured Invitations" },
              { id: "dashboard", label: "Insights" },
              { id: "collective", label: "Collective" },
              { id: "ethical", label: "Ethics" },
            ].map((section) => (
              <li key={section.id}>
                <Link
                  href={`#${section.id}`}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  onClick={e => {
                    e.preventDefault()
                    document.querySelector(`#${section.id}`)?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Prototype Status Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border p-2 flex items-center justify-center">
        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
          <AlertCircle className="h-3 w-3 mr-2 text-primary" />
          <span>
            Prototype Status: Features described represent our design goals and may not be fully interactive in the
            current demo.
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, scale, y }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/0"></div>
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container relative z-10 px-4 md:px-6 text-center"
        >
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
            Features
          </Badge>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
            Features
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl font-medium text-primary mb-6">
            An AI Companion for Deeper Understanding
          </p>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Explore how Global Pulse empowers reflection and connects you to broader perspectives, always prioritizing
            your agency and privacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white" asChild>
              <Link href="#introduction">
                <span>Explore Features</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="rounded-full group" asChild>
              <Link href="/waitlist">
                <span>Join Waitlist</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="h-8 w-8 text-primary/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: Introduction */}
      <section id="introduction" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-l from-primary/5 to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Introduction
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Beyond Conversation, <br />
              <span className="text-primary">Towards Understanding</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              <strong>
                Global Pulse is an AI-powered, privacy-respecting reflection space for individuals seeking deeper
                understanding of their emotional patterns, values, and identity.
              </strong>{" "}
              It moves beyond simple chat interfaces by integrating deep contextual analysis, user-controlled
              interaction modes, and ethical data handling at its core.
            </p>

            <div className="bg-card border border-border rounded-xl p-6 shadow-lg mb-12">
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Prototype Status</h3>
                  <p className="text-muted-foreground">
                    Global Pulse is under active development. Features described represent our design goals and may not
                    be fully interactive in the current demo.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<MessageSquareText className="h-6 w-6 text-primary" />}
                title="Reflective Conversation"
                description="Engage in natural language conversations with Pulse, a private, non-judgmental space for your exploration."
                link="#conversation"
              />

              <FeatureCard
                icon={<BarChartBig className="h-6 w-6 text-primary" />}
                title="Personal Insights"
                description="Visualize your inner landscape with dynamic maps of your values, goals, needs, and emotional patterns."
                link="#dashboard"
              />

              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                title="Ethical Foundation"
                description="Built on trust with granular consent, data ownership, and a commitment to transparency."
                link="#ethical"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Pulse Conversation */}
      <section id="conversation" className="py-20 md:py-28 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
            >
              <MessageSquareText className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Chatting with Pulse <br />
              <span className="text-primary">A Space for Reflection</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Engage in meaningful conversations designed to help you explore your thoughts and feelings in a safe,
              private environment.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-10 w-full max-w-2xl mx-auto">
                {[
                  { value: "conversational", label: "Conversational" },
                  { value: "contextual", label: "Contextual" },
                  { value: "transparent", label: "Transparent" },
                  { value: "ethical", label: "Ethical" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <AnimatePresence mode="wait">
                  <TabsContent value="conversational" className="p-0 m-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="grid md:grid-cols-5 min-h-[400px]"
                    >
                      <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            <MessageSquareText className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold">Empathetic & Reflective Agent</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                          <strong>
                            Pulse doesn't insert its own beliefs, it reflects yours back with clarity and care,
                          </strong>{" "}
                          aiming to listen attentively and ask thoughtful questions based on our framework.
                        </p>

                        <div className="mt-auto">
                          <h4 className="font-medium mb-2">Key Benefits:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Non-judgmental reflection space</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Thoughtful, open-ended questions</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Personalized to your communication style</span>
                            </li>
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
                              <p className="text-sm">What matters most to you about this topic?</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg bg-primary/10 p-4 shadow-sm border border-primary/20 mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-foreground font-medium text-sm">U</span>
                            </div>
                            <div>
                              <p className="text-sm">I'm concerned about how it might affect future generations.</p>
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
                                That's a meaningful concern. What specific aspects of the future are you most hoping to
                                protect or improve?
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="contextual" className="p-0 m-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="grid md:grid-cols-5 min-h-[400px]"
                    >
                      <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            <Layers className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold">Context-Aware Interaction</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                          Pulse leverages advanced engines to understand emotional context and relevant aspects of your
                          identity, moving beyond surface-level keyword matching to provide meaningful responses.
                        </p>

                        <div className="mt-auto">
                          <h4 className="font-medium mb-2">Key Benefits:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Remembers previous conversations</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Understands emotional nuance</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Adapts to your communication style</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="md:col-span-2 bg-muted/50 p-6 border-t md:border-t-0 md:border-l border-border">
                        <div className="h-full flex flex-col justify-center space-y-4">
                          <div className="bg-background rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-sm mb-2">Contextual Memory</h4>
                            <p className="text-xs text-muted-foreground">
                              Pulse remembers important details from your conversations, allowing for more meaningful
                              follow-ups without repetition.
                            </p>
                          </div>

                          <div className="bg-background rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-sm mb-2">Emotional Intelligence</h4>
                            <p className="text-xs text-muted-foreground">
                              The system can detect emotional tones and respond appropriately, whether you need
                              encouragement, reflection, or just a listening ear.
                            </p>
                          </div>

                          <div className="bg-background rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-sm mb-2">Value Alignment</h4>
                            <p className="text-xs text-muted-foreground">
                              As you interact more, Pulse builds an understanding of your values and priorities to
                              provide more relevant responses.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="transparent" className="p-0 m-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="grid md:grid-cols-5 min-h-[400px]"
                    >
                      <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            <Lightbulb className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold">Transparent Reasoning</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                          Understand Pulse's process. A "Why?" toggle reveals concise explanations for its responses,
                          building trust through transparency and helping you understand the reasoning behind
                          suggestions.
                        </p>

                        <div className="mt-auto">
                          <h4 className="font-medium mb-2">Key Benefits:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>See the "why" behind responses</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Build trust through transparency</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Learn about your own patterns</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="md:col-span-2 bg-muted/50 p-6 border-t md:border-t-0 md:border-l border-border">
                        <div className="bg-background rounded-lg p-4 border border-border mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-medium text-sm">GP</span>
                            </div>
                            <div>
                              <p className="text-sm">
                                It sounds like security and stability are important values for you in this situation.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 border border-border mb-4">
                          <h4 className="text-xs font-medium mb-2 flex items-center">
                            <Info className="h-3 w-3 mr-1 text-primary" />
                            Why did Pulse say this?
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            In your previous messages, you mentioned concerns about "stability" and "knowing what to
                            expect" several times. These phrases often correlate with security as a core value. I'm
                            reflecting this pattern back to check if it resonates with you.
                          </p>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            This resonates
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            Not quite right
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="ethical" className="p-0 m-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="grid md:grid-cols-5 min-h-[400px]"
                    >
                      <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold">Ethical Guardrails</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                          Active safety systems monitor interactions, aiming to prevent harmful content, detect
                          potential distress (offering resources, <strong>not therapy</strong>), and ensure respectful
                          dialogue.
                        </p>

                        <div className="mt-auto">
                          <h4 className="font-medium mb-2">Key Principles:</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Content safety monitoring</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Distress detection with resource offering</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Clear boundaries (not therapy)</span>
                            </li>
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
                          <div className="bg-background rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Shield className="h-4 w-4 mr-2 text-green-500" />
                              Privacy Protection
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              All personal identifiers are removed before analysis. Your data is never sold or shared
                              with third parties.
                            </p>
                          </div>

                          <div className="bg-background rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Shield className="h-4 w-4 mr-2 text-green-500" />
                              Consent Controls
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Granular permissions let you decide exactly what data you share and how it's used.
                            </p>
                          </div>

                          <div className="bg-background rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Shield className="h-4 w-4 mr-2 text-green-500" />
                              AI Neutrality
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Our systems are designed to avoid leading questions or imposing viewpoints during
                              conversations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Section 3: Contextual Understanding Through GenUI */}
      <section id="genui" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-r from-primary/5 to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Beyond Text: <br />
              <span className="text-primary">Nuance Through Structured Invitations</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Capture the nuance of your thoughts and feelings through optional interactive elements that enhance the
              conversation experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  Optional & Contextual
                </h3>
                <p className="text-muted-foreground mb-4">
                  Pulse may gently invite you (requiring your explicit <strong>Trust Gate</strong> opt-in and in-context
                  permission) to share specific insights via simple, interactive UI elements (sliders, choices) embedded
                  within the chat.
                </p>
                <p className="text-sm text-primary font-medium">This is always an invitation, never a demand.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  Intelligent Sourcing
                </h3>
                <p className="text-muted-foreground">
                  To ensure relevance, Pulse is designed to check for existing, suitable questions you haven't answered
                  before potentially generating a new one tailored to the conversation.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold mb-6">Nuance Capture</h3>

                  <p className="text-muted-foreground mb-6">
                    This allows for capturing specific feelings or ratings precisely when relevant, adding depth without
                    disrupting flow.
                  </p>

                  <div className="bg-muted/30 rounded-xl p-5 mb-6">
                    <p className="text-sm mb-4">How strongly do you feel about this topic?</p>
                    <div className="w-full h-2 bg-muted rounded-full mb-2">
                      <div className="h-full w-3/4 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Not at all</span>
                      <span>Somewhat</span>
                      <span>Very strongly</span>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-5">
                    <p className="text-sm mb-4">Which of these values resonates most with you in this situation?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center text-sm">
                        Security
                      </div>
                      <div className="bg-muted border border-border rounded-lg p-2 text-center text-sm text-muted-foreground">
                        Achievement
                      </div>
                      <div className="bg-muted border border-border rounded-lg p-2 text-center text-sm text-muted-foreground">
                        Connection
                      </div>
                      <div className="bg-muted border border-border rounded-lg p-2 text-center text-sm text-muted-foreground">
                        Autonomy
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-muted-foreground">
                    <strong>Note:</strong> Your answers, if shared, become part of your private reflection data, never
                    public without your explicit re-consent for aggregation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Personal Insights Dashboard */}
      <section id="dashboard" className="py-24 md:py-32 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <BarChartBig className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Visualizing Your <br />
              <span className="text-primary">Inner Landscape</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Your personal insights dashboard serves as a reflective mirror, helping you visualize patterns, trends,
              and aspects of your identity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  Dynamic {"{Self}"} Map
                </h3>
                <p className="text-muted-foreground">
                  See visual reflections of your inferred core Values, Goals, Needs, etc., from your private UIG,
                  including their perceived importance (Power Level) and resonance (Valence).
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  Mood & Stress Trends
                </h3>
                <p className="text-muted-foreground">
                  Observe potential patterns in your core affect over time, facilitating reflection on connections to
                  events or topics.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  Pattern Reflection
                </h3>
                <p className="text-muted-foreground">
                  Discover potential recurring emotional response patterns or cognitive appraisal habits identified by
                  the PCE.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  User Validation & Unlearning
                </h3>
                <p className="text-muted-foreground">
                  Actively confirm ("This feels true") or disagree ("This doesn't land") with presented insights. Your
                  feedback directly influences the Learning Layer, allowing you to guide the AI's understanding and help
                  it <strong>"unlearn" patterns that don't resonate.</strong>
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  Optional Daily Check-in
                </h3>
                <p className="text-muted-foreground">
                  A configurable invitation for brief daily reflection on state, goals, or values, contributing to
                  insights if you choose to engage.
                </p>
              </div>

              <div className="bg-muted/30 rounded-xl p-5">
                <p className="text-sm italic text-muted-foreground text-center">
                  All insights are suggestions for reflection, not diagnoses or definitive labels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Collective Insights Hub */}
      <section id="collective" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-l from-primary/5 to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Explore Hub: <br />
              <span className="text-primary">Understanding Collective Perspectives</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Ethically and conditionally explore shared patterns and perspectives while maintaining strong privacy
              protections.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Future Vision</h3>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Anonymized Aggregates</h4>
                          <p className="text-sm text-muted-foreground">
                            Envisioned for future phases, this hub aims to allow exploration of emergent trends from the
                            anonymized, aggregated structured responses of consenting users.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                          <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Privacy-Preserving by Design</h4>
                          <p className="text-sm text-muted-foreground">
                            This feature is <strong>contingent</strong> on the successful implementation and validation
                            of strong privacy-preserving techniques like <strong>Differential Privacy</strong> to
                            prevent individual re-identification.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">User Transparency & Control</h4>
                          <p className="text-sm text-muted-foreground">
                            Users will have clear visibility (via settings) into which types of their anonymized data
                            are eligible for aggregation pools, based only on their explicit, granular consent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-6">Ethical Approach</h3>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Careful Framing</h4>
                          <p className="text-sm text-muted-foreground">
                            Data exploration will focus on understanding distributions and patterns, avoiding
                            oversimplification. Any AI summaries will include strong caveats about interpretation.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Respecting Rhythm</h4>
                          <p className="text-sm text-muted-foreground">
                            Updates will likely be periodic (e.g., daily/weekly) rather than constant real-time streams,
                            encouraging thoughtful engagement over reactive monitoring.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                          <HeartHandshake className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Ethical Justification</h4>
                          <p className="text-sm text-muted-foreground">
                            This feature will only be implemented if a clear benefit to users and the public
                            (proportional to any residual privacy risk) can be demonstrated and ethically justified.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    The Collective Insights Hub represents our vision for the future, and will only be developed with
                    the highest ethical standards and privacy protections in place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Ethical Foundation */}
      <section id="ethical" className="py-20 md:py-28 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
            >
              <ShieldCheck className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built on Trust <br />
              <span className="text-primary">Your Sovereignty is Foundational</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Our ethical foundation ensures that your privacy, agency, and well-being are always prioritized.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Granular Consent</h3>
                  </div>
                  <p className="text-muted-foreground">
                    You control permissions for all non-essential features.{" "}
                    <strong>Defaults are always private/off.</strong> Manage consents easily.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Data Ownership</h3>
                  </div>
                  <p className="text-muted-foreground">
                    You own your inputs and the insights in your personal profile. Your data is never sold to third
                    parties.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Active Guardrails</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Continuous monitoring for safety, bias, and distress. We prioritize your well-being in every
                    interaction.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <Github className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Open Source</h3>
                  </div>
                  <p className="text-muted-foreground">
                    The core framework code is available for public scrutiny and collaboration (AGPL-3.0).{" "}
                    <strong>We believe visibility invites accountability.</strong>
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="sm:col-span-2 lg:col-span-2"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <HeartHandshake className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Ethical Commitment</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    We are committed to building technology that respects human dignity, promotes well-being, and
                    protects privacy. Our ethical framework guides every aspect of our development.
                  </p>
                  <Button variant="outline" className="mt-auto w-fit" asChild>
                    <Link href="/ethics">
                      Read Our Full Ethics Commitment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 7: Exploring Ethical Value Exchange */}
      <section id="value" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <HeartHandshake className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Exploring <span className="text-primary">Fair Value</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              We are exploring models where users who explicitly consent to contribute anonymized, differentially
              private structured data could be <strong>meaningfully included in the value conversation</strong> arising
              from potential commercial insights.
            </p>

            <div className="bg-card border border-border rounded-xl p-8 shadow-lg mb-12">
              <h3 className="text-xl font-semibold mb-6">Ethical Preconditions</h3>

              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Established transparent governance (potentially co-designed)
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Defined fair value-sharing mechanisms (prioritizing user/community benefit)
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Further specific, informed user re-consent detailing any model
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Validated Differential Privacy and anonymization guarantees</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-muted-foreground">
                  <strong>User Control:</strong> Participation will remain strictly opt-in and reversible. Users will
                  have visibility into how their contributions might matter.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white" asChild>
                <Link href="/waitlist">
                  <span>Join the Waitlist</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="rounded-full group" asChild>
                <Link href="/about">
                  <span>Learn About Our Team</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section id="join" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="text-primary">Experience Global Pulse?</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join our waitlist to be among the first to try Global Pulse and help shape the future of AI-assisted
              reflection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white" asChild>
                <Link href="/waitlist">
                  <span>Join the Waitlist</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="rounded-full group" asChild>
                <Link href="/about">
                  <span>Learn About Our Team</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-md max-w-2xl mx-auto">
              <p className="text-muted-foreground">
                Global Pulse is currently in early development. By joining our waitlist, you'll receive updates on our
                progress and be invited to participate in our beta testing program.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  link,
}: { icon: React.ReactNode; title: string; description: string; link: string }) {
  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="group">
      <Card className="bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300 h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full mr-3 group-hover:bg-primary/20 transition-colors duration-300">
              {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-auto text-primary w-full justify-start group-hover:bg-primary/5 transition-colors duration-300"
            asChild
          >
            <Link href={link}>
              Learn more
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
