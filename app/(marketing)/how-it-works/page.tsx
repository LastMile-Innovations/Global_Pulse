"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, Suspense } from "react"
import "./styles.css"

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <Suspense fallback={<div>Loading content...</div>}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <Link href="/" className="text-xl font-bold">
                Global Pulse
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How it Works
              </Link>
              <Link href="/#benefits" className="text-sm font-medium hover:text-primary transition-colors">
                Your Pulse
              </Link>
              <Link href="/#ethics" className="text-sm font-medium hover:text-primary transition-colors">
                Ethics & Openness
              </Link>
              <Link href="/#code" className="text-sm font-medium hover:text-primary transition-colors">
                Code
              </Link>
            </nav>
            <div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/#waitlist">Request Early Access</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section className="py-20 md:py-28 relative particles-bg">
            <div className="container px-4 md:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-6">
                  So, How Does Global Pulse Actually Understand Your Vibe?
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  <span className="italic">(Spoiler: It's Not Magic, It's Science... Sort Of.)</span>
                </p>
                <div className="bg-card/50 border border-border p-6 rounded-lg my-8 text-left">
                  <p className="text-muted-foreground text-lg">
                    Alright, let's pull back the curtain. You saw the hype, maybe you're intrigued, maybe you're skeptical
                    (healthy!). You're wondering how we plan to go beyond basic sentiment analysis and actually map
                    something as messy as human emotion and identity. Fair question.
                  </p>
                  <p className="text-muted-foreground text-lg mt-4">
                    It's complex, yeah. We're combining ideas from cutting-edge psychology (like the Theory of Constructed
                    Emotion), Sean Webb's practical MHH framework, and advanced AI, running it all on a dynamic graph
                    database. But the core idea? Surprisingly simple. It boils down to context and comparison. Forget
                    crystal balls; this is about understanding the mechanics of your own meaning-making engine.
                  </p>
                </div>
                <p className="text-xl font-semibold text-primary">
                  Here's the breakdown, step-by-step, no excessive jargon promised:
                </p>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted">
            <div className="container px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3">
                  <div className="sticky top-24 space-y-2">
                    <h3 className="text-xl font-bold mb-4">The Process</h3>
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <button
                        key={step}
                        onClick={() => setActiveStep(step)}
                        className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                          activeStep === step ? "bg-primary/20 border border-primary/50" : "hover:bg-card"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            activeStep === step ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                          }`}
                        >
                          {step}
                        </div>
                        <span className="text-sm font-medium">
                          {step === 1 && "Context Kicks In"}
                          {step === 2 && "Expectation vs. Perception"}
                          {step === 3 && "Appraisal"}
                          {step === 4 && "Core Affect (VAD)"}
                          {step === 5 && "Categorization"}
                          {step === 6 && "Closing the Loop"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-9">
                  <div className={activeStep === 1 ? "block" : "hidden"}>
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                          1
                        </div>
                        You Interact & The Context Kicks In
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">What Happens:</h3>
                          <p className="text-muted-foreground mb-4">
                            You chat with Pulse. Maybe you're venting about work, celebrating a win, discussing the news,
                            or pondering the meaning of it all. Whatever you share (text, eventually maybe voice) is the
                            initial Input.
                          </p>

                          <h3 className="text-xl font-semibold mb-3 text-primary">PCE Takes Over:</h3>
                          <p className="text-muted-foreground mb-4">
                            Our backend engine, the Pulse Context Engine (PCE), receives this input.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">Context is King:</h3>
                          <p className="text-muted-foreground mb-4">
                            Before analyzing the words, the PCE's Context Analyzer instantly looks up your unique
                            situation. It queries your private Unified Identity Graph (UIG) to see:
                          </p>

                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>
                              <strong>Your State (S):</strong> How's your baseline mood/stress right now (based on recent
                              analysis)?
                            </li>
                            <li>
                              <strong>Your Profiles (C, T, D):</strong> What cultural norms, personality traits, or life
                              stage factors might be relevant?
                            </li>
                            <li>
                              <strong>Your Activated {"{Attachments}"}:</strong> Which core parts of your identity – your
                              Values, Needs, Goals, Beliefs – are most relevant in this exact moment?
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-6 rounded-lg mb-6">
                        <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                        <p className="text-muted-foreground">
                          This step ensures the analysis isn't generic. It's tuned to you, right now.
                        </p>
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b border-border">
                          <h4 className="font-medium">UIG Activation</h4>
                        </div>
                        <div className="p-6 bg-card">
                          <Image
                            src="/uig-activation-flow.png"
                            alt="UIG Activation Diagram"
                            width={600}
                            height={300}
                            className="mx-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={activeStep === 2 ? "block" : "hidden"}>
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                          2
                        </div>
                        Expectation vs. Perception (The Core EWEF Loop)
                      </h2>

                      <div className="space-y-6 mb-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">The Setup:</h3>
                          <p className="text-muted-foreground">
                            Remember how your {"{Attachments}"} (the stuff you care about, your Values, Goals, etc.) have
                            an inherent Preference? You want things aligned with high-PL positive Values to happen; you
                            want threats to high-PL Needs avoided. This forms your Expectation/Preference (EP) for the
                            current context.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">The Input as Perception (P):</h3>
                          <p className="text-muted-foreground">
                            Your latest message or interaction describes a Perception (P) of what's happening – an event,
                            a thought, an outcome.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">The Comparison (∆):</h3>
                          <p className="text-muted-foreground mb-4">
                            The heart of our Enhanced Webb Emotional Framework (EWEF)! The engine compares the appraised
                            reality (P) against your relevant identity-based standard (EP).
                          </p>

                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>
                              <strong>Match?</strong> (P aligns with EP's desired state) → Positive Signal
                            </li>
                            <li>
                              <strong>Mismatch?</strong> (P conflicts with EP's desired state) → Negative Signal
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-6 rounded-lg mb-6">
                        <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                        <p className="text-muted-foreground">
                          This comparison is the fundamental trigger for an emotional response according to many modern theories.
                        </p>
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b border-border">
                          <h4 className="font-medium">EWEF Loop</h4>
                        </div>
                        <div className="p-6 bg-card">
                          <Image
                            src="/EWEF-Loop-Diagram.png"
                            alt="EWEF Loop Diagram"
                            width={600}
                            height={300}
                            className="mx-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={activeStep === 3 ? "block" : "hidden"}>
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                          3
                        </div>
                        Appraisal - Decoding the 'Flavor' of the Comparison
                      </h2>

                      <div className="space-y-6 mb-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">More Than +/-:</h3>
                          <p className="text-muted-foreground mb-4">
                            A simple mismatch isn't enough. How did it mismatch? This is where the P Appraiser comes in,
                            inferring MHH Variables:
                          </p>

                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>
                              <strong>Source:</strong> Did you cause this (Internal) or did someone/something else
                              (External)? (Confidence Score Calculated)
                            </li>
                            <li>
                              <strong>Perspective:</strong> Are you evaluating this based on your internal standards
                              (Internal) or how you think others see it (External)? (Confidence Score Calculated)
                            </li>
                            <li>
                              <strong>Timeframe:</strong> Is this about the Past, Present, or Future? (Confidence Score
                              Calculated)
                            </li>
                            <li>
                              <strong>AcceptanceState:</strong> Are you mentally fighting this reality (Resisted) or
                              acknowledging it (Accepted)? (Confidence Score Calculated)
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">Quantified Impact:</h3>
                          <p className="text-muted-foreground mb-4">The Appraiser also estimates:</p>

                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>
                              <strong>pValuationShiftEstimate:</strong> How strongly positive/negative is this P for your
                              EP? (-1 to +1)
                            </li>
                            <li>
                              <strong>pPowerLevel:</strong> How significant or impactful is this Perception overall? (0-1)
                            </li>
                            <li>
                              <strong>pAppraisalConfidence:</strong> How certain is the system about this entire
                              appraisal? (0-1)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-6 rounded-lg mb-6">
                        <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                        <p className="text-muted-foreground">
                          These details are crucial differentiators. An External source + Resisted state points towards
                          Anger, while an Internal source + Accepted state might point towards Sadness or Guilt, even if
                          the initial negative 'mismatch' signal was similar. We track confidence because sometimes the
                          situation is ambiguous!
                        </p>
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b border-border">
                          <h4 className="font-medium">MHH Variables</h4>
                        </div>
                        <div className="p-6 bg-card">
                          <Image
                            src="/MHH_Variables_Diagram.png"
                            alt="MHH Variables Diagram"
                            width={600}
                            height={300}
                            className="mx-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={activeStep === 4 ? "block" : "hidden"}>
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                          4
                        </div>
                        Core Affect - Calculating the Emotional 'Vibe' (VAD)
                      </h2>

                      <div className="space-y-6 mb-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">From Appraisal to Feeling:</h3>
                          <p className="text-muted-foreground">
                            The quantified appraisal scores AND the MHH variables (weighted by their confidence!) feed
                            into the Core VAD Engine.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">The Output: VAD:</h3>
                          <p className="text-muted-foreground">
                            This generates your predicted Valence (Pleasant ↔ Unpleasant), Arousal (Calm ↔ Activated), and
                            Dominance (Controlled ↔ In Control) scores. Think of it as the unique, three-dimensional
                            fingerprint of your core affective state in that moment.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">Context Matters:</h3>
                          <p className="text-muted-foreground">
                            Your current State (S - mood, stress), Personality (T), and Culture (C) all subtly influence
                            this VAD calculation.
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-6 rounded-lg mb-6">
                        <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                        <p className="text-muted-foreground">
                          VAD captures the feeling tone and intensity beyond simple labels. High Arousal + Negative
                          Valence feels very different from Low Arousal + Negative Valence, even if both are "bad".
                        </p>
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b border-border">
                          <h4 className="font-medium">VAD Calculation</h4>
                        </div>
                        <div className="p-6 bg-card">
                          <Image
                            src="/vad-calculation-diagram.png"
                            alt="VAD Calculation Diagram"
                            width={600}
                            height={300}
                            className="mx-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={activeStep === 5 ? "block" : "hidden"}>
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                          5
                        </div>
                        Categorization - Putting a Name to the Feeling
                      </h2>

                      <div className="space-y-6 mb-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">The Challenge:</h3>
                          <p className="text-muted-foreground">
                            How does that VAD fingerprint + the appraisal 'flavor' (MHH) translate into an emotion word
                            like "Frustrated," "Hopeful," or "Confused"?
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-primary">The Process:</h3>
                          <p className="text-muted-foreground mb-4">Our Emotion Categorization Engine:</p>

                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>
                              Uses the MHH variables to apply Webb's EWEF rules, identifying the most likely emotionGroup
                              (e.g., "Anger Group", "Fear Group") and calculating a webbConfidence.
                            </li>
                            <li>
                              Calculates the severityLabel within that group (e.g., "Annoyed" vs "Rage") based on the
                              power levels (your PL vs the perception's pPowerLevel).
                            </li>
                            <li>
                              Checks Consistency: Does the predicted VAD fingerprint match the typical VAD fingerprint for
                              that severityLabel? A mismatch means something is complex or uncertain.
                            </li>
                            <li>
                              Generates Probabilities: Based on the Webb result, the VAD consistency, and overall
                              confidence, it outputs a probability distribution across likely emotion labels.
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-6 rounded-lg mb-6">
                        <h4 className="text-lg font-semibold mb-2">Why It Matters:</h4>
                        <p className="text-muted-foreground">
                          This provides an interpretable label while acknowledging that emotions are often mixed or
                          uncertain. It integrates the rule-based logic of MHH with the dimensional reality of VAD.
                        </p>
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b border-border">
                          <h4 className="font-medium">Emotion Categorization</h4>
                        </div>
                        <div className="p-6 bg-card">
                          <Image
                            src="/emotion-categorization-flow.png"
                            alt="Emotion Categorization Diagram"
                            width={600}
                            height={300}
                            className="mx-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={activeStep === 6 ? "block" : "hidden"}>
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                          6
                        </div>
                        Closing the Loop - Informing Pulse & You
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <ul className="space-y-4">
                            <li className="flex">
                              <Database className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold">Persistence</h4>
                                <p className="text-muted-foreground text-sm">
                                  The key outputs (Appraisal details, VAD, Probabilities) are stored as linked instances
                                  in your secure UIG for historical context and insight generation.
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <Compass className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold">Pulse Guidance</h4>
                                <p className="text-muted-foreground text-sm">
                                  The system generates Interaction Guidance based on the entire analysis. Is confidence
                                  low? Pulse might ask clarifying questions.
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <MessageSquare className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold">LLM Prompting</h4>
                                <p className="text-muted-foreground text-sm">
                                  This detailed context + guidance forms a rich prompt for the generative LLM that powers
                                  Pulse's conversational response.
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <ul className="space-y-4">
                            <li className="flex">
                              <Shield className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold">Ethical Check</h4>
                                <p className="text-muted-foreground text-sm">
                                  The planned response is checked against guardrails before being sent to you.
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <RefreshCw className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold">Learning</h4>
                                <p className="text-muted-foreground text-sm">
                                  Your explicit feedback and implicit reactions feed back into the system to refine your
                                  UIG and the models over time.
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <BarChart className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-semibold">Your Dashboard</h4>
                                <p className="text-muted-foreground text-sm">
                                  (Coming Soon!) This data powers visualizations showing your patterns, triggers, and core
                                  attachments.
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="container px-4 md:px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-8 text-center">
                  The Big Picture: Replacing Surveys, Enabling Insight
                </h2>

                <p className="text-muted-foreground text-lg mb-8">
                  By running this detailed analysis loop for every interaction, Global Pulse aims to build an
                  understanding far deeper than any survey.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/20 p-2 rounded-full mr-3">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold">Politics?</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Don't just ask who people support; understand the core Values and Needs driving that support, and
                        how different policies trigger different emotional Appraisals (Source, Acceptance).
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/20 p-2 rounded-full mr-3">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold">Brands?</h3>
                      </div>
                      <p className="text-muted-foreground">
                        See if your messaging truly resonates with consumer Values or if it triggers an unexpected
                        negative Valence based on conflicting Beliefs.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/20 p-2 rounded-full mr-3">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold">Products?</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Understand if user frustration stems from a perceived impact on their Need:Competence or a
                        conflict with their Goal:Efficiency.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/20 p-2 rounded-full mr-3">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold">Your Life?</h3>
                      </div>
                      <p className="text-muted-foreground">
                        See your own patterns clearly. Understand why certain situations trigger specific reactions, and
                        gain insight into your core values and needs.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-card/50 border border-border p-6 rounded-lg mb-8">
                  <p className="text-muted-foreground text-lg">
                    It's ambitious. It requires trust. That's why your control, data safety, and our ethical commitment
                    are built-in from line one. And why we're open-sourcing the core engine – so you can see how it works.
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-6">Ready to ditch the guesswork?</h3>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/#waitlist">Experience Your Pulse | Join Early Access</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-muted">
          <div className="container px-4 py-8 md:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold">Global Pulse</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your AI companion for deep self-discovery and collective insight.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Resources</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary">
                        Ethical Charter
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Connect</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary">
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-primary">
                        GitHub
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Stay Updated</h3>
                <p className="mt-2 text-sm text-muted-foreground">Subscribe to our newsletter for updates on Global Pulse.</p>
                <form className="mt-4 flex items-center space-x-2">
                  <input
                    placeholder="Email address"
                    type="email"
                    className="flex-1 bg-muted border-border text-foreground rounded-md px-3 py-2 text-sm"
                  />
                  <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>
                Global Pulse by LastMile Innovations | Built in Public | © {new Date().getFullYear()} All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Suspense>
  )
}
