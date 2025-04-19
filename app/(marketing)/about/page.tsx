"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Code2,
  ExternalLink,
  Github,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  Rocket,
  Clock,
  FileCode,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("question")
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

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
              { id: "question", label: "Origin" },
              { id: "hackathon", label: "Process" },
              { id: "approach", label: "Approach" },
              { id: "prototype", label: "Status" },
              { id: "invitation", label: "Join Us" },
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
                  onClick={(e) => {
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
          <span>Prototype Status: This page describes the vision behind Global Pulse, an early-stage prototype.</span>
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
            About Us
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
            Our Story
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-primary mb-8">
            The Global Pulse Origin, Approach & Invitation
          </p>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover the journey, principles, and people behind Global Pulse.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white" asChild>
              <Link href="#question">
                <span>Our Journey</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="rounded-full group" asChild>
              <Link href="#invitation">
                <span>Join Us</span>
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

      {/* Section 1: The Question That Started It All */}
      <section id="question" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-l from-primary/5 to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                The Question That Started It All
              </Badge>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Beyond the Noise <br />
                <span className="text-primary">We Seek Deeper Understanding</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-6">
                We live in an age awash with information, yet genuine self-understanding often feels elusive. We react,
                we feel, we strive but the underlying mechanics of our own inner world, the why behind our responses,
                often remain obscure.
              </p>

              <p className="text-lg text-muted-foreground mb-6">
                Existing tools frequently fall short: sentiment analysis captures only the surface, surveys offer static
                snapshots, and many AI interactions lack true contextual depth or prioritize engagement over genuine
                reflection.
              </p>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
                <p className="text-xl font-medium text-foreground">
                  Can we leverage technology, particularly AI, to create a space for deeper self-awareness – ethically,
                  safely, and with full user control?
                </p>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                Global Pulse began with this fundamental question, driven by founder and architect{" "}
                <strong>Greyson Paynter</strong>. The aim is to build a tool that acts as a clear, ethical mirror,
                helping individuals understand their own unique emotional landscape and identity structure, grounded in
                science.
              </p>

              <p className="text-lg text-muted-foreground">
                This isn't about changing who you are. <strong>It's about seeing more clearly.</strong> Global Pulse is
                explicitly not a mental health treatment or therapy replacement. It's designed as a novel tool for{" "}
                <strong>personal exploration</strong>.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">The Insight Gap</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Surface-Level Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          Traditional sentiment analysis only captures the surface emotions, missing the deeper context
                          and personal meaning.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Static Snapshots</h4>
                        <p className="text-sm text-muted-foreground">
                          Surveys and polls provide only static snapshots without capturing the dynamic nature of human
                          perspective.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Engagement Over Reflection</h4>
                        <p className="text-sm text-muted-foreground">
                          Many AI interactions prioritize engagement metrics over meaningful self-reflection and genuine
                          understanding.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-primary/20 text-primary">GP</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Greyson Paynter</h4>
                        <p className="text-sm text-muted-foreground">Founder & Architect</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Hackathon Spark & A Unique Build Process */}
      <section id="hackathon" className="py-24 md:py-32 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              The Hackathon Spark & A Unique Build Process
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Forged in a Sprint, <br />
              <span className="text-primary">Guided by Principle</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              The foundational engine of Global Pulse was brought to life during an intense 10-day Vercel AI Hackathon,
              proving both the technology and a unique development methodology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
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
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Strategy & Backlog</h3>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    Human Product Manager, <strong>Debra Lundquist</strong>, collaborated closely with strategic AI
                    partners to translate the core vision into detailed, ethically-grounded requirements.
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 mb-6">
                    <p className="text-sm">
                      <strong>AI Partners:</strong> OpenAI's ChatGPT-4o series and Google's Gemini 2.5 Pro via AI Studio
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-primary/20 text-primary">DL</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Debra Lundquist</h4>
                        <p className="text-sm text-muted-foreground">Product Manager</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

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
                      <Code2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Architecture & Implementation</h3>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    <strong>Greyson Paynter</strong> architected the system and guided his AI agents as his development
                    team to implement these specifications, building out the core platform stack.
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 mb-6">
                    <p className="text-sm">
                      <strong>AI Tooling:</strong> Gemini, GPT, Claude, Vercel v0, Copilot, Cursor
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-primary/20 text-primary">GP</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Greyson Paynter</h4>
                        <p className="text-sm text-muted-foreground">Founder & Architect</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="bg-card border border-border rounded-xl p-6 shadow-md">
              <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
              <p className="text-lg">
                <strong>
                  Features were designed not just for function, but for safety, consent, and user control from the
                  outset.
                </strong>{" "}
                What emerged is an early functional prototype, the core engine ready for careful refinement and growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Approach: EWEF, UIG & Ethical Foundations */}
      <section id="approach" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-r from-primary/5 to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Our Approach
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">The Core Concepts</h2>

            <p className="text-lg text-muted-foreground">
              Global Pulse is built on a synthesis of psychological theory and computational modeling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-3">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Enhanced Webb Emotion Framework</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Inspired by Sean Webb's work and integrated with concepts from Dr. Lisa Feldman Barrett's Theory of
                  Constructed Emotion, our EWEF engine <strong>is designed to interpret interactions</strong> not just
                  for sentiment, but for the underlying cognitive appraisal and core affective state.
                </p>
                <div className="space-y-2 mt-6">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Source, Perspective, Timeframe, Acceptance</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Valence, Arousal, Dominance (VAD)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-3">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Unified Identity Graph</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  A private, dynamic graph database (Neo4j) designed to represent the user's evolving {"{self}"} map –
                  their core Values, Goals, Needs, Beliefs, and their interconnections.
                </p>
                <div className="space-y-2 mt-6">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Power Level (centrality/importance)</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Valence (positive/negative feeling)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Ethical Architecture</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Our guiding principles are implemented through technical safeguards like granular consent checks,
                  active guardrails, transparent reasoning (XAI), and user feedback loops.
                </p>
                <div className="mt-6">
                  <Link href="/ethics" className="text-primary hover:underline inline-flex items-center">
                    Read our full ethics commitment
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <p className="text-lg text-muted-foreground">
              We believe this combination allows for a more nuanced, contextual, and user-respecting approach to
              AI-assisted reflection.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Where We Are Now (Prototype Stage) */}
      <section id="prototype" className="py-24 md:py-32 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Where We Are Now
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Early Days, <span className="text-primary">Open Process</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              What you can explore today is the direct result of that 10-day sprint: a functional prototype.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">What's Ready</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Core Engine Concepts</h4>
                    <p className="text-sm text-muted-foreground">The foundational architecture and processing logic</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ethical Framework</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive principles and safeguards</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Personal Dashboard</h4>
                    <p className="text-sm text-muted-foreground">Initial visualization of personal insights</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">XAI Snippet</h4>
                    <p className="text-sm text-muted-foreground">
                      Transparent explanations of AI reasoning and insights
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">In Development</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-muted p-1.5 rounded-full mr-3 mt-0.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Full Interactivity</h4>
                    <p className="text-sm text-muted-foreground">Enhanced user engagement and dialogue capabilities</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-muted p-1.5 rounded-full mr-3 mt-0.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Complete UIG Implementation</h4>
                    <p className="text-sm text-muted-foreground">Full realization of the identity graph potential</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-muted p-1.5 rounded-full mr-3 mt-0.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Robust Feedback Learning</h4>
                    <p className="text-sm text-muted-foreground">
                      Advanced systems for learning from user interactions
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-muted p-1.5 rounded-full mr-3 mt-0.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ethical Aggregation</h4>
                    <p className="text-sm text-muted-foreground">Privacy-preserving collective insights</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <FileCode className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-xl font-semibold">Open Source Commitment</h3>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              We are committed to building this platform transparently. The core analytical code is open source, and we
              invite scrutiny and collaboration.
            </p>
            <Button className="rounded-full" variant="outline" asChild>
              <Link
                href="https://github.com/LastMile-Innovations/Global_Pulse.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 5: Our Invitation to Help Shape This Reflection Space */}
      <section id="invitation" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
              Get Involved
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Co-Creating the Future of <span className="text-primary">Reflective AI</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Global Pulse is an experiment born from a belief that technology can serve deeper human needs ethically.
              It requires ongoing learning, refinement, and dialogue.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Explore the Prototype</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">
                    See the concepts in action and experience the early version of Global Pulse (understanding it's a
                    prototype).
                  </p>
                  <Button className="w-full mt-auto" asChild>
                    <Link href="/waitlist">
                      Join the Waitlist
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <Github className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Review the Code</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">
                    Understand our technical approach and ethical implementations by examining our open-source codebase
                    on GitHub.
                  </p>
                  <Button variant="outline" className="w-full mt-auto" asChild>
                    <Link
                      href="https://github.com/LastMile-Innovations/Global_Pulse.git"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on GitHub
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Share Your Perspective</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">
                    Help us shape this reflection space. Your insights are crucial as we navigate the complexities of
                    building truly user-centric AI.
                  </p>
                  <Button variant="outline" className="w-full mt-auto" asChild>
                    <Link
                      href="https://github.com/LastMile-Innovations/Global_Pulse/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Provide Feedback
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <HeartHandshake className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Join the Conversation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">
                    Engage with us as we explore the challenges and possibilities of ethical AI for self-discovery and
                    deeper understanding.
                  </p>
                  <Button variant="outline" className="w-full mt-auto" asChild>
                    <Link
                      href="https://github.com/LastMile-Innovations/Global_Pulse/discussions"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Discussions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-md max-w-2xl mx-auto">
              <p className="text-lg mb-6">
                This journey requires careful steps, constant reflection (on our part too!), and a commitment to the
                principles we've laid out. We hope you'll join us.
              </p>
              <div className="text-left">
                <h3 className="font-bold text-xl mb-4">The Global Pulse Team</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-primary/20 text-primary">GP</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Greyson Paynter</h4>
                      <p className="text-sm text-muted-foreground">Founder, Architect</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-primary/20 text-primary">DL</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Debra Lundquist</h4>
                      <p className="text-sm text-muted-foreground">Product Manager</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      In collaboration with AI Development & Strategy Partners (OpenAI GPT Series, Google Gemini Pro,
                      Anthropic Claude Series, Vercel v0, Cursor, GitHub Copilot)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
