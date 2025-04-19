"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Lightbulb,
  MessageSquare,
  BarChart,
  Zap,
  Heart,
  Compass,
  Target,
  Database,
  RefreshCw,
  Shield,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  Info,
  Github,
  Eye,
  Sparkles,
} from "lucide-react"

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)
  const [isScrolling, setIsScrolling] = useState(false)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Intersection observer for step highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrolling) return

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = Number.parseInt(entry.target.getAttribute("data-step") || "1")
            setActiveStep(stepIndex)
          }
        })
      },
      { threshold: 0.6, rootMargin: "-100px 0px -100px 0px" },
    )

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      stepRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [isScrolling])

  const scrollToStep = (step: number) => {
    setIsScrolling(true)
    setActiveStep(step)

    stepRefs.current[step - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })

    // Reset scrolling state after animation completes
    setTimeout(() => setIsScrolling(false), 1000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Prototype Status Banner */}
      <div className="container px-4 md:px-6 pt-8">
        <Alert variant="default" className="mb-8 bg-primary/5 border-primary/20 shadow-md">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="font-medium">Prototype Status</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            This page explains the designed EWEF/UIG process for Global Pulse, an early-stage prototype. The current
            implementation represents a foundational stage of this concept.
          </AlertDescription>
        </Alert>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center mb-12"
            >
              <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                Under The Hood
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                So, How Does Global Pulse <br />
                <span className="text-primary">Actually Understand Your Vibe?</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
                <span className="italic">(Spoiler: It's Not Magic, It's Science... Sort Of.)</span>
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 text-left shadow-lg max-w-3xl mx-auto"
              >
                <p className="text-muted-foreground text-lg mb-4">
                  Alright, let's pull back the curtain. You saw the hype, maybe you're intrigued, maybe you're skeptical
                  (healthy!). You're wondering how we plan to go beyond basic sentiment analysis and actually map
                  something as messy as human emotion and identity. Fair question.
                </p>
                <p className="text-muted-foreground text-lg">
                  It's complex, yeah. We're combining ideas from cutting-edge psychology (like the Theory of Constructed
                  Emotion), Sean Webb's practical MHH framework, and advanced AI, running it all on a dynamic graph
                  database. But the core idea? Surprisingly simple. It boils down to context and comparison. Forget
                  crystal balls; this is about understanding the mechanics of your own meaning-making engine.
                </p>
              </motion.div>

              <p className="text-xl font-semibold text-primary mt-8">
                Here's the breakdown, step-by-step, no excessive jargon promised:
              </p>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                className="mt-8"
              >
                <ChevronDown className="h-8 w-8 text-primary/60" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-muted/30 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>

        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sticky Navigation */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 space-y-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-md mb-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Zap className="h-5 w-5 text-primary mr-2" />
                    The Process
                  </h3>

                  <div className="space-y-2">
                    {[
                      { step: 1, title: "Context Kicks In" },
                      { step: 2, title: "Expectation vs. Perception" },
                      { step: 3, title: "Appraisal" },
                      { step: 4, title: "Core Affect (VAD)" },
                      { step: 5, title: "Categorization" },
                      { step: 6, title: "Closing the Loop" },
                    ].map((item) => (
                      <button
                        key={item.step}
                        onClick={() => scrollToStep(item.step)}
                        className={`flex items-center w-full p-3 rounded-lg transition-all duration-300 ${
                          activeStep === item.step
                            ? "bg-primary/20 border border-primary/50 shadow-md"
                            : "hover:bg-card border border-transparent"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors duration-300 ${
                            activeStep === item.step
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.step}
                        </div>
                        <span
                          className={`text-sm font-medium transition-colors duration-300 ${
                            activeStep === item.step ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-md hidden lg:block">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">QUICK LINKS</h3>
                  <div className="space-y-2">
                    <Link
                      href="#architecture"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      System Architecture
                    </Link>
                    <Link href="/features" className="flex items-center text-sm hover:text-primary transition-colors">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Feature Concepts
                    </Link>
                    <Link href="/ethics" className="flex items-center text-sm hover:text-primary transition-colors">
                      <Shield className="h-4 w-4 mr-2" />
                      Ethics & Privacy
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-16">
              {/* Step 1 */}
              <div ref={(el) => { stepRefs.current[0] = el }} data-step="1" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/60"></div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-md">
                        1
                      </div>
                      You Interact & The Context Kicks In
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2" />
                            What Happens:
                          </h3>
                          <p className="text-muted-foreground">
                            You chat with Pulse. Maybe you're venting about work, celebrating a win, discussing the
                            news, or pondering the meaning of it all. Whatever you share (text, eventually maybe voice)
                            is the initial Input.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                            <Zap className="h-5 w-5 mr-2" />
                            PCE Takes Over:
                          </h3>
                          <p className="text-muted-foreground">
                            Our backend engine, the Pulse Context Engine (PCE), receives this input.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                          <Compass className="h-5 w-5 mr-2" />
                          Context is King:
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Before analyzing the words, the PCE's Context Analyzer{" "}
                          <span className="text-foreground font-medium">is designed to</span> instantly look up your
                          unique situation. It <span className="text-foreground font-medium">queries</span> your private
                          Unified Identity Graph (UIG) to see:
                        </p>
                        <div className="bg-muted/40 p-4 rounded-lg border border-border">
                          <p className="text-xs italic text-muted-foreground mb-2">
                            (UIG structure defined, dynamic population is future work)
                          </p>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span>
                                <strong>Your State (S):</strong> How's your baseline mood/stress right now (based on
                                recent analysis)?
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span>
                                <strong>Your Profiles (C, T, D):</strong> What cultural norms, personality traits, or
                                life stage factors might be relevant?
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span>
                                <strong>Your Activated {"{Attachments}"}:</strong> Which core parts of your identity –
                                your Values, Needs, Goals, Beliefs – are most relevant in this exact moment?
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-xl mb-8 border border-border/50">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                          <p className="text-muted-foreground">
                            This step ensures the analysis isn't generic. It's tuned to you, right now.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden shadow-md">
                      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                        <h4 className="font-medium flex items-center">
                          <Database className="h-4 w-4 mr-2 text-primary" />
                          Conceptual UIG Activation Flow
                        </h4>
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          Diagram
                        </Badge>
                      </div>
                      <div className="p-6 bg-card flex justify-center">
                        <Image
                          src="/uig-activation-flow.png"
                          alt="Conceptual UIG Activation Diagram"
                          width={600}
                          height={300}
                          className="rounded-lg shadow-sm border border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step 2 */}
              <div ref={(el) => { stepRefs.current[1] = el }} data-step="2" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/60"></div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-md">
                        2
                      </div>
                      Expectation vs. Perception (The Core EWEF Loop)
                    </h2>

                    <div className="space-y-6 mb-8">
                      <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                        <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                          <Target className="h-5 w-5 mr-2" />
                          The Setup:
                        </h3>
                        <p className="text-muted-foreground">
                          Remember how your {"{Attachments}"} (the stuff you care about, your Values, Goals, etc.) have
                          an inherent Preference? You want things aligned with high-PL positive Values to happen; you
                          want threats to high-PL Needs avoided. This forms your Expectation/Preference (EP) for the
                          current context.
                        </p>
                      </div>

                      <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                        <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                          <Eye className="h-5 w-5 mr-2" />
                          The Input as Perception (P):
                        </h3>
                        <p className="text-muted-foreground">
                          Your latest message or interaction describes a Perception (P) of what's happening – an event,
                          a thought, an outcome.
                        </p>
                      </div>

                      <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                        <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                          <RefreshCw className="h-5 w-5 mr-2" />
                          The Comparison (∆):
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          The heart of our Enhanced Webb Emotional Framework (EWEF)! The engine{" "}
                          <span className="text-foreground font-medium">is intended to compare</span> the appraised
                          reality (P) against your relevant identity-based standard (EP).
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-card p-4 rounded-lg border border-border flex items-start">
                            <div className="bg-green-500/10 p-1.5 rounded-full mr-2 mt-0.5">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <strong className="text-foreground">Match?</strong>
                              <p className="text-sm text-muted-foreground">
                                (P aligns with EP's desired state) → Positive Signal
                              </p>
                            </div>
                          </div>

                          <div className="bg-card p-4 rounded-lg border border-border flex items-start">
                            <div className="bg-destructive/10 p-1.5 rounded-full mr-2 mt-0.5">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            </div>
                            <div>
                              <strong className="text-foreground">Mismatch?</strong>
                              <p className="text-sm text-muted-foreground">
                                (P conflicts with EP's desired state) → Negative Signal
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-xl mb-8 border border-border/50">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                          <p className="text-muted-foreground">
                            This comparison is the fundamental trigger for an emotional response according to many
                            modern theories.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden shadow-md">
                      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                        <h4 className="font-medium flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                          Conceptual EWEF Loop
                        </h4>
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          Diagram
                        </Badge>
                      </div>
                      <div className="p-6 bg-card flex justify-center">
                        <Image
                          src="/EWEF-Loop-Diagram.png"
                          alt="Conceptual EWEF Loop Diagram"
                          width={600}
                          height={300}
                          className="rounded-lg shadow-sm border border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step 3 */}
              <div ref={(el) => { stepRefs.current[2] = el }} data-step="3" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/60"></div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-md">
                        3
                      </div>
                      Appraisal - Decoding the 'Flavor' of the Comparison
                    </h2>

                    <div className="space-y-6 mb-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                          <Brain className="h-5 w-5 mr-2" />
                          More Than Just Positive/Negative:
                        </h3>

                        <p className="text-muted-foreground mb-6">
                          A simple mismatch isn't enough. How did it mismatch? This is where the P Appraiser comes in,
                          <span className="text-foreground font-medium"> aiming to infer</span> MHH Variables:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-muted/20 border-border/50">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Badge className="mr-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                  Source
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Did you cause this (Internal) or did someone/something else (External)? (Confidence
                                Score Calculated)
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/20 border-border/50">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Badge className="mr-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                  Perspective
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Are you evaluating this based on your internal standards (Internal) or how you think
                                others see it (External)? (Confidence Score Calculated)
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/20 border-border/50">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Badge className="mr-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                  Timeframe
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Is this about the Past, Present, or Future? (Confidence Score Calculated)
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/20 border-border/50">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Badge className="mr-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                  AcceptanceState
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Are you mentally fighting this reality (Resisted) or acknowledging it (Accepted)?
                                (Confidence Score Calculated)
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                          <BarChart className="h-5 w-5 mr-2" />
                          Quantified Impact:
                        </h3>

                        <p className="text-muted-foreground mb-4">
                          The Appraiser also <span className="text-foreground font-medium">aims to estimate</span>:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-muted/20 border-border/50">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2 text-sm">pValuationShiftEstimate</h4>
                              <p className="text-xs text-muted-foreground">
                                How strongly positive/negative is this P for your EP? (-1 to +1)
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/20 border-border/50">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2 text-sm">pPowerLevel</h4>
                              <p className="text-xs text-muted-foreground">
                                How significant or impactful is this Perception overall? (0-1)
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/20 border-border/50">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2 text-sm">pAppraisalConfidence</h4>
                              <p className="text-xs text-muted-foreground">
                                How certain is the system about this entire appraisal? (0-1)
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-xl mb-8 border border-border/50">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                          <p className="text-muted-foreground">
                            These details are crucial differentiators. An External source + Resisted state points
                            towards Anger, while an Internal source + Accepted state might point towards Sadness or
                            Guilt, even if the initial negative 'mismatch' signal was similar. We track confidence
                            because sometimes the situation is ambiguous!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden shadow-md">
                      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                        <h4 className="font-medium flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-primary" />
                          Conceptual MHH Variable Appraisal
                        </h4>
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          Diagram
                        </Badge>
                      </div>
                      <div className="p-6 bg-card flex justify-center">
                        <Image
                          src="/MHH_Variables_Diagram.png"
                          alt="Conceptual MHH Variables Diagram"
                          width={600}
                          height={300}
                          className="rounded-lg shadow-sm border border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step 4 */}
              <div ref={(el) => { stepRefs.current[3] = el }} data-step="4" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/60"></div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-md">
                        4
                      </div>
                      Core Affect - Calculating the Emotional 'Vibe' (VAD)
                    </h2>

                    <div className="space-y-6 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-muted/20 border-border/50 md:col-span-3">
                          <CardContent className="p-5">
                            <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                              <Zap className="h-5 w-5 mr-2" />
                              From Appraisal to Feeling:
                            </h3>
                            <p className="text-muted-foreground">
                              The quantified appraisal scores AND the MHH variables (weighted by their confidence!) feed
                              into the Core VAD Engine.
                              <span className="text-xs italic block mt-1">(Core VAD logic is implemented)</span>
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-muted/20 border-border/50">
                          <CardContent className="p-5">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Badge className="mr-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                Valence
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Pleasant ↔ Unpleasant
                              <span className="block mt-2 text-xs italic">How positive or negative the feeling is</span>
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-muted/20 border-border/50">
                          <CardContent className="p-5">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Badge className="mr-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                Arousal
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Calm ↔ Activated
                              <span className="block mt-2 text-xs italic">How energized or intense the feeling is</span>
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-muted/20 border-border/50">
                          <CardContent className="p-5">
                            <h4 className="font-medium mb-3 flex items-center">
                              <Badge className="mr-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                Dominance
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Controlled ↔ In Control
                              <span className="block mt-2 text-xs italic">How much agency or power you feel</span>
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="bg-card p-5 rounded-xl border border-border">
                        <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                          <Compass className="h-5 w-5 mr-2" />
                          Context Matters:
                        </h3>
                        <p className="text-muted-foreground">
                          Your current State (S - mood, stress), Personality (T), and Culture (C) all subtly influence
                          this VAD calculation. The system{" "}
                          <span className="text-foreground font-medium">is designed to generate</span> your predicted
                          Valence, Arousal, and Dominance scores - think of it as the unique, three-dimensional
                          fingerprint of your core affective state in that moment.
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-xl mb-8 border border-border/50">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                          <p className="text-muted-foreground">
                            VAD captures the feeling tone and intensity beyond simple labels. High Arousal + Negative
                            Valence feels very different from Low Arousal + Negative Valence, even if both are "bad".
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden shadow-md">
                      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                        <h4 className="font-medium flex items-center">
                          <BarChart className="h-4 w-4 mr-2 text-primary" />
                          Conceptual VAD Calculation Flow
                        </h4>
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          Diagram
                        </Badge>
                      </div>
                      <div className="p-6 bg-card flex justify-center">
                        <Image
                          src="/vad-calculation-diagram.png"
                          alt="Conceptual VAD Calculation Diagram"
                          width={600}
                          height={300}
                          className="rounded-lg shadow-sm border border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step 5 */}
              <div ref={(el) => { stepRefs.current[4] = el }} data-step="5" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/60"></div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-md">
                        5
                      </div>
                      Categorization - Putting a Name to the Feeling
                    </h2>

                    <div className="space-y-6 mb-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-primary flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2" />
                          The Challenge:
                        </h3>
                        <p className="text-muted-foreground">
                          How does that VAD fingerprint + the appraisal 'flavor' (MHH) translate into an emotion word
                          like "Frustrated," "Hopeful," or "Confused"?
                        </p>
                      </div>

                      <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                        <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                          <Brain className="h-5 w-5 mr-2" />
                          The Process:
                        </h3>

                        <p className="text-muted-foreground mb-4">Our Emotion Categorization Engine:</p>

                        <div className="space-y-4">
                          <div className="bg-card p-4 rounded-lg border border-border flex items-start">
                            <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5 flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm">
                              <span className="text-foreground font-medium">Is designed to use</span> the MHH variables
                              to apply Webb's EWEF rules, identifying the most likely emotionGroup (e.g., "Anger Group",
                              "Fear Group") and calculating a webbConfidence.
                            </p>
                          </div>

                          <div className="bg-card p-4 rounded-lg border border-border flex items-start">
                            <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5 flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm">
                              <span className="text-foreground font-medium">Is designed to calculate</span> the
                              severityLabel within that group (e.g., "Annoyed" vs "Rage") based on the power levels
                              (your PL vs the perception's pPowerLevel).
                            </p>
                          </div>

                          <div className="bg-card p-4 rounded-lg border border-border flex items-start">
                            <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5 flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm">
                              <span className="text-foreground font-medium">Is designed to check</span> Consistency:
                              Does the predicted VAD fingerprint match the typical VAD fingerprint for that
                              severityLabel? A mismatch means something is complex or uncertain.
                            </p>
                          </div>

                          <div className="bg-card p-4 rounded-lg border border-border flex items-start">
                            <div className="bg-primary/10 p-1.5 rounded-full mr-3 mt-0.5 flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm">
                              <span className="text-foreground font-medium">Is designed to generate</span>{" "}
                              Probabilities: Based on the Webb result, the VAD consistency, and overall confidence, it
                              outputs a probability distribution across likely emotion labels.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-xl mb-8 border border-border/50">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                          <p className="text-muted-foreground">
                            This provides an interpretable label while acknowledging that emotions are often mixed or
                            uncertain. It integrates the rule-based logic of MHH with the dimensional reality of VAD.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden shadow-md">
                      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                        <h4 className="font-medium flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-primary" />
                          Conceptual Emotion Categorization Flow
                        </h4>
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          Diagram
                        </Badge>
                      </div>
                      <div className="p-6 bg-card flex justify-center">
                        <Image
                          src="/emotion-categorization-flow.png"
                          alt="Conceptual Emotion Categorization Diagram"
                          width={600}
                          height={300}
                          className="rounded-lg shadow-sm border border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step 6 */}
              <div ref={(el) => { stepRefs.current[5] = el }} data-step="6" className="scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/60"></div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4 shadow-md">
                        6
                      </div>
                      Closing the Loop - Informing Pulse & You
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <div className="space-y-5">
                          <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                            <div className="flex items-start">
                              <Database className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold mb-2">Persistence</h4>
                                <p className="text-muted-foreground text-sm">
                                  The key outputs (Appraisal details, VAD, Probabilities){" "}
                                  <span className="text-foreground font-medium">are designed to be stored</span> as
                                  linked instances in your secure UIG for historical context and insight generation.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                            <div className="flex items-start">
                              <Compass className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold mb-2">State Update</h4>
                                <p className="text-muted-foreground text-sm">
                                  The new VAD <span className="text-foreground font-medium">is designed to update</span>{" "}
                                  your overall baseline State (S - mood, stress) in the UIG, influencing future context
                                  analyses.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                            <div className="flex items-start">
                              <MessageSquare className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold mb-2">Insight Generation</h4>
                                <p className="text-muted-foreground text-sm">
                                  Over time, patterns in these stored instances{" "}
                                  <span className="text-foreground font-medium">are intended to fuel</span> the insights
                                  shown on your private Pulse dashboard (e.g., recurring triggers, dominant emotions).
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="space-y-5">
                          <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                            <div className="flex items-start">
                              <Shield className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold mb-2">AI Companion Response</h4>
                                <p className="text-muted-foreground text-sm">
                                  Pulse (the chatbot){" "}
                                  <span className="text-foreground font-medium">is designed to receive</span> the
                                  categorized emotion (and its confidence) to inform its next response—aiming for
                                  empathy and helpful reflection, guided by ethical guardrails.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                            <div className="flex items-start">
                              <RefreshCw className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold mb-2">Conceptual Feedback Loop</h4>
                                <p className="text-muted-foreground text-sm">
                                  The feedback loop <span className="text-foreground font-medium">is designed to</span>{" "}
                                  capture your explicit feedback and implicit reactions to refine your UIG and the
                                  models over time.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                            <div className="flex items-start">
                              <BarChart className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold mb-2">Your Dashboard</h4>
                                <p className="text-muted-foreground text-sm">
                                  (Coming Soon!) This data powers visualizations showing your patterns, triggers, and
                                  core attachments.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Section */}
      <section id="architecture" className="py-20 md:py-28 bg-background relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl opacity-30"></div>
          <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl opacity-30"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge
              variant="outline"
              className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 inline-flex"
            >
              The Big Picture
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">High-Level System Architecture</h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Putting it all together - a simplified view of how the components interact.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="border border-border rounded-xl overflow-hidden shadow-xl">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                <h4 className="font-medium flex items-center">
                  <Database className="h-4 w-4 mr-2 text-primary" />
                  System Architecture Overview
                </h4>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  Diagram
                </Badge>
              </div>
              <div className="p-6 bg-card flex justify-center">
                <Image
                  src="/high-level-system-architecture.png"
                  alt="High-Level System Architecture Diagram"
                  width={1200}
                  height={600}
                  className="rounded-lg shadow-sm border border-border/50"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 md:py-28 bg-muted/30 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to See It <span className="text-primary">(Conceptually)</span> in Action?
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              While the full engine is under construction, you can explore related concepts and join our journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                <Link href="/features">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Explore Feature Concepts
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/waitlist">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Join the Waitlist
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                href="https://github.com/LastMile-Innovations/Global_Pulse.git"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
