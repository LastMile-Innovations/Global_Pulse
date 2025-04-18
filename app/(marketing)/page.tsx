import { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Suspense } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimatedCTAButton from "@/components/marketing/animated-cta-button"
import MarketingChatDemo from "@/components/marketing/MarketingChatDemo"
import ScrollToTopButton from "@/components/scroll-to-top-button"
import HeroGlobe from "@/components/marketing/HeroGlobe"
import WaitlistChatSignup from "@/components/waitlist/WaitlistChatSignup"

import {
  ArrowRight,
  BrainCircuit,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  Brain,
  Shield,
  Lightbulb,
  HeartHandshake,
  Github,
  Eye,
  MessageCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"

// FeatureCard is dynamically imported for performance
const FeatureCard = dynamic(() => import("@/components/marketing/feature-card"), { ssr: true })

// Homepage metadata reflecting current state
export const metadata: Metadata = {
  title: "Global Pulse - An Ethical AI Journey in Self-Discovery",
  description:
    "Explore Global Pulse: A concept born from a hackathon, building an AI companion grounded in psychology, privacy, and user control. Join our journey.",
}

// Enable Partial Prerendering for this page
export const experimental_ppr = true

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background/80 to-muted text-foreground">
      <main className="flex-1">
        {/* Hero Section - Revised Tone & Content */}
        <section className="relative py-28 md:py-40 overflow-hidden bg-gradient-to-br from-background via-background/80 to-muted text-foreground">
          {/* ... existing background elements (keep for visual appeal) ... */}
           <div className="absolute inset-0 pointer-events-none z-0">
            <div className="w-full h-full bg-gradient-to-tr from-primary/10 via-background/60 to-secondary/10 animate-gradient-x" />
          </div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none z-0"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 z-0">
            <div className="w-[700px] h-[700px] bg-gradient-radial from-primary/30 via-transparent to-transparent rounded-full animate-pulse-slow shadow-glow" />
          </div>
          <div className="absolute -top-96 -right-96 w-[900px] h-[900px] bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-96 -left-96 w-[900px] h-[900px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-24 items-center min-h-[540px]">
              {/* Left: Text & CTAs - Revised */}
              <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-8">
                 <div className="inline-flex items-center rounded-full border border-primary/40 px-5 py-2 text-base font-semibold text-primary bg-primary/10 shadow-glow-sm mb-2 animate-float backdrop-blur">
                   <Sparkles className="mr-2 h-5 w-5 text-primary animate-bounce" /> From Hackathon Idea to Ethical AI Exploration
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight drop-shadow-lg">
                  Navigating Our Inner World.<br />
                  <span className="text-primary">Can AI Help, Ethically?</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
                  Global Pulse is an exploration—born in a 10-day hackathon—into creating an AI companion for self-discovery. We're building openly, prioritizing your privacy, control, and dignity above all else.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  {/* Adjusted CTA Button Text */}
                  <AnimatedCTAButton href="/waitlist" prefetch className="shadow-glow text-lg px-10 py-5 rounded-full font-semibold">
                    Join the Waitlist & Our Journey
                  </AnimatedCTAButton>
                  <Button asChild variant="outline" size="lg" className="h-14 border-primary/30 text-foreground hover:bg-primary/10 shadow-glow animate-float rounded-full font-semibold" >
                    <Link href="/ethics">Our Ethical Framework</Link>
                  </Button>
                </div>
                {/* Trust badges remain relevant */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold shadow-sm"><Lock className="h-4 w-4" /> Privacy by Design</span>
                  <span className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-semibold shadow-sm"><Shield className="h-4 w-4" /> Ethical AI</span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted text-foreground px-3 py-1 rounded-full font-semibold shadow-sm">Open Source Core</span>
                  <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold shadow-sm">User Control</span>
                </div>
              </div>
              {/* Right: Globe */}
              <div className="mx-auto lg:mx-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-6 blur-2xl bg-gradient-to-tr from-primary/30 via-blue-400/20 to-teal-400/20 rounded-full z-0 animate-pulse-slow" />
                  {/* Globe visualization is fine */}
                  <HeroGlobe size={480} className="animate-float animate-pulse-subtle relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section - Tone Adjusted */}
        <section className="py-20 bg-muted/80">
           <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto mb-14">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-8 text-center">
                The Noise Within and Without.<br className="hidden md:block" /> Can We Find Clarity?
              </h2>
              <div className="space-y-6 text-muted-foreground text-center">
                <p className="text-xl">
                  We often react without fully understanding why. Surface-level sentiment analysis misses the depth, while traditional surveys offer lagging snapshots. We navigate complex inner lives and a noisy external world with incomplete maps.
                </p>
                <p className="text-xl font-medium text-primary">
                  Global Pulse is an attempt to build a better compass, grounded in psychological principles and a commitment to ethical exploration, starting with the individual.
                </p>
              </div>
            </div>
              {/* Simplified Problem Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
              <Card className="bg-card/90 border border-primary/10 shadow-xl rounded-2xl">
                <CardContent className="pt-8 flex flex-col items-center text-center">
                  <div className="bg-primary/20 p-4 rounded-full mb-5 shadow-md">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Shallow Signals</h3>
                  <p className="text-muted-foreground">
                    Simple 'Positive'/'Negative' labels don't capture the complexity of human feeling or thought.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/90 border border-primary/10 shadow-xl rounded-2xl">
                <CardContent className="pt-8 flex flex-col items-center text-center">
                  <div className="bg-primary/20 p-4 rounded-full mb-5 shadow-md">
                     <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Missing Context</h3>
                  <p className="text-muted-foreground">
                    Generic analysis ignores the unique personal context (values, needs, state) that shapes our perspective.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/90 border border-primary/10 shadow-xl rounded-2xl">
                <CardContent className="pt-8 flex flex-col items-center text-center">
                  <div className="bg-primary/20 p-4 rounded-full mb-5 shadow-md">
                     <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Lack of Control</h3>
                  <p className="text-muted-foreground">
                    Often, our data is used in ways we don't understand or consent to. Transparency and control are essential.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Chat Demo Section - Kept */}
        <section className="py-24 bg-gradient-to-b from-background to-muted/50">
            <div className="container px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                        A Glimpse into <span className="text-primary">Reflective Dialogue</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-muted-foreground">
                       See a simulated interaction demonstrating the intended thoughtful and context-aware style of the Pulse agent.
                    </p>
                </div>
                <MarketingChatDemo /> {/* Assumes this component is updated per previous instruction */}
            </div>
        </section>

        {/* How It Works Section - Kept */}
        <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-8 text-center">
                Building the Engine: <span className="text-primary">Our Approach</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground text-center mb-14">
                Global Pulse is centered around the **Pulse Context Engine (PCE)** – a conceptual framework we are actively building, integrating psychological principles with AI.
              </p>

              {/* Existing Engine components explanation */}
               <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-10 items-center bg-card/70 rounded-2xl p-8 border border-border shadow-lg">
                  <div className="md:w-1/3 flex justify-center">
                    <div className="bg-primary/20 p-8 rounded-full animate-pulse-subtle shadow-lg">
                      <Brain className="h-20 w-20 text-primary" />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3 text-primary">Unified Identity Graph (UIG Concept)</h3>
                    <p className="text-muted-foreground text-lg">
                     We're designing a way to represent what matters to *you* – your core Values, Goals, Beliefs, Needs – privately and dynamically. This isn't a static profile; it's conceived as an evolving map of your inner landscape.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row-reverse gap-10 items-center bg-card/70 rounded-2xl p-8 border border-border shadow-lg">
                  <div className="md:w-1/3 flex justify-center">
                    <div className="bg-primary/20 p-8 rounded-full animate-pulse-subtle shadow-lg">
                      <Lightbulb className="h-20 w-20 text-primary" />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3 text-primary">Emotion Framework (EWEF Concept)</h3>
                    <p className="text-muted-foreground text-lg">
                      Our aim is to analyze interactions not just for surface sentiment, but based on psychological principles – comparing perceptions against your unique UIG map to understand the potential *reasons* behind emotional responses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 border border-border rounded-2xl p-8 bg-muted/60 overflow-hidden shadow-xl">
                {/* Keep the diagram */}
                <Image
                  src="/system-connectivity-diagram.png"
                  alt="Pulse Engine Diagram Concept"
                  width={1000}
                  height={400}
                  className="object-contain transition-transform duration-500 hover:scale-105 mx-auto"
                  priority
                />
              </div>
              <p className="text-xl md:text-2xl font-semibold text-primary mt-8 text-center">
                Our focus is on illuminating the mechanics of subjective experience, not predicting behavior.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section - Reframed as Principles/Approach */}
        <section className="py-24 bg-gradient-to-b from-muted/80 to-background relative overflow-hidden">
           {/* ... existing background elements ... */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                 <div className="inline-flex items-center rounded-full border px-4 py-2 text-base font-semibold border-transparent bg-primary/10 text-primary w-fit mb-5 mx-auto shadow-glow-sm">
                   <HeartHandshake className="mr-2 h-5 w-5" /> Our Foundational Commitments
                </div>
                <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                  Building Ethically, <span className="text-primary">Step by Step.</span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground">
                  These aren't just features; they are the core principles guiding Global Pulse's development.
                </p>
              </div>

              {/* --- Use FeatureCard to display principles --- */}
              <div className="grid md:grid-cols-3 gap-10">
                <FeatureCard
                  icon={<Lock className="h-10 w-10 text-primary" />}
                  title="Radical Privacy & Security"
                  description="Your data is yours. We employ encryption, secure infrastructure, and will never sell your personal information. Anonymization is key for any collective patterns."
                  className="bg-card/90 border border-primary/10 rounded-2xl shadow-lg hover:shadow-glow transition-all duration-300 hover:border-primary/30 hover:-translate-y-2"
                />
                 <FeatureCard
                  icon={<Users className="h-10 w-10 text-primary" />}
                  title="User Sovereignty & Control"
                  description="Explicit, granular, opt-in consent for all non-essential data use. Defaults prioritize privacy. You have the right to access, manage, and delete your data."
                  className="bg-card/90 border border-primary/10 rounded-2xl shadow-lg hover:shadow-glow transition-all duration-300 hover:border-primary/30 hover:-translate-y-2"
                />
                 <FeatureCard
                  icon={<MessageCircle className="h-10 w-10 text-primary" />}
                  title="Space for Reflection"
                  description="Designed to be a companion for self-discovery, not just data extraction. Pulse aims to facilitate understanding, not provide answers or therapy."
                  className="bg-card/90 border border-primary/10 rounded-2xl shadow-lg hover:shadow-glow transition-all duration-300 hover:border-primary/30 hover:-translate-y-2"
                />
                 <FeatureCard
                  icon={<Shield className="h-10 w-10 text-primary" />}
                  title="Safety via Guardrails"
                  description="We are building safety checks directly into the AI's logic to prevent harmful, manipulative, or biased outputs, complementing our ethical guidelines."
                  className="bg-card/90 border border-primary/10 rounded-2xl shadow-lg hover:shadow-glow transition-all duration-300 hover:border-primary/30 hover:-translate-y-2"
                />
                 <FeatureCard
                  icon={<Eye className="h-10 w-10 text-primary" />}
                  title="Transparency & Openness"
                  description="Commitment to open-sourcing core analytical logic (EWEF/UIG). Clear policies and accessible explanations (XAI) are key goals."
                  className="bg-card/90 border border-primary/10 rounded-2xl shadow-lg hover:shadow-glow transition-all duration-300 hover:border-primary/30 hover:-translate-y-2"
                />
                 <FeatureCard
                  icon={<Github className="h-10 w-10 text-primary" />}
                  title="Building in Public"
                  description="This started as a hackathon project. We're sharing our journey, challenges, and progress openly, inviting feedback and collaboration."
                  className="bg-card/90 border border-primary/10 rounded-2xl shadow-lg hover:shadow-glow transition-all duration-300 hover:border-primary/30 hover:-translate-y-2"
                />
              </div>
              {/* --- End FeatureCard principles --- */}
            </div>
          </div>
        </section>

        {/* Ethics Section - Kept */}
        <section id="ethics" className="py-24 bg-background">
           {/* ... existing ethics section content ... */}
            <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-8 text-center">
                Powerful Tech Demands <span className="text-green-400">Radical Responsibility.</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground text-center mb-14">
                Let&apos;s cut the corporate privacy theater. Modeling identity and emotion is serious business.
                If we screw this up, the potential for harm is real. That&apos;s why ethics aren&apos;t an afterthought;
                they&apos;re architected in.
              </p>

              <div className="grid md:grid-cols-2 gap-10">
                 {/* Reuse existing cards, they align well */}
                <Card className="bg-card/90 border border-green-500/10 shadow-xl hover:shadow-glow transition-all duration-300 hover:border-green-500/30 hover:-translate-y-2 rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <ShieldCheck className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Your Data, Your Rules</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Granular, opt-in consent for <em>everything</em> non-essential. You control access, analysis depth,
                      and data use. Easily view and revoke consent anytime. <strong>Your individual data is NEVER sold.</strong>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 border border-green-500/10 shadow-xl hover:shadow-glow transition-all duration-300 hover:border-green-500/30 hover:-translate-y-2 rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <Lock className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Privacy & Security Baked In</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Encryption at rest and in transit. Strict access controls. Secure infrastructure.
                      Pseudonymization for any potential future aggregate analysis.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 border border-green-500/10 shadow-xl hover:shadow-glow transition-all duration-300 hover:border-green-500/30 hover:-translate-y-2 rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <Shield className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Ethical Guardrails in Code</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Active modules monitor interactions aiming to prevent manipulation and block responses predicted
                      to cause significant distress. This isn&apos;t just policy; it&apos;s running code.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 border border-green-500/10 shadow-xl hover:shadow-glow transition-all duration-300 hover:border-green-500/30 hover:-translate-y-2 rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <AlertCircle className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Not a Medical Service</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      This is a tool for self-awareness and potentially societal insight. It is <em>not</em> a
                      replacement for professional mental health diagnosis or treatment.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center mt-12">
                <Button variant="outline" size="lg" className="border-green-500 text-green-400 rounded-full font-semibold px-8 py-4 shadow-glow" asChild>
                  <Link href="/ethics">
                    Read Our Full Ethical Framework <ExternalLink className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section - Revised Tone */}
        <section id="waitlist" className="py-24 md:py-32 bg-gradient-to-b from-muted/80 to-background relative overflow-hidden">
           {/* ... existing background elements ... */}
           <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                  Join Our Exploration
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  Global Pulse is in its early stages. Join the waitlist to follow our progress, provide feedback, and be among the first to experience the platform as it evolves.
                </p>
                {/* Use the WaitlistChatSignup component */}
                 <WaitlistChatSignup />
              </div>
            </div>
          </div>
        </section>

        <ScrollToTopButton />
      </main>
    </div>
  )
}