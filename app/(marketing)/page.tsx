import { type Metadata as NextMetadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AnimatedCTAButton from "@/components/marketing/animated-cta-button";
import MarketingChatDemo from "@/components/marketing/MarketingChatDemo";
import HeroGlobe from "@/components/marketing/HeroGlobe";
import WaitlistChatSignup from "@/components/waitlist/WaitlistChatSignup";

import {
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
} from "lucide-react";

const FeatureCard = dynamic(() => import("@/components/marketing/feature-card"), { ssr: true });

export const experimental_ppr = true;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Add Prototype Disclaimer */}
        <div className="container px-4 md:px-6 pt-12">
          <Alert variant="default" className="mb-8 bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Prototype Status</AlertTitle>
            <AlertDescription>
              Global Pulse is currently an early-stage prototype born from a 10-day hackathon. Some features described represent our design goals and may not be fully interactive in the current demo. We are building transparently and prioritize safety and user control.
            </AlertDescription>
          </Alert>
        </div>

        {/* Hero Section */}
        <section className="relative py-20 md:pt-24 md:pb-32 overflow-hidden bg-background text-foreground">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-24 items-center min-h-[450px]">
              {/* Left: Text & CTAs */}
              <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-8">
                <div className="inline-flex items-center rounded-full border border-primary/40 px-5 py-2 text-base font-semibold text-primary bg-primary/10 mb-2 backdrop-blur">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  From Hackathon Idea to Ethical AI Exploration
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
                  Navigating Our Inner World. <br className="hidden md:inline" /> Can AI Help, Ethically?
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal">
                  Global Pulse is an exploration—born in a 10-day hackathon—into creating an AI companion for self-discovery. We're building openly, prioritizing your privacy, control, and dignity above all else.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  <AnimatedCTAButton
                    href="/waitlist"
                    prefetch
                    className="text-lg px-10 py-5 rounded-full font-semibold"
                  >
                    Join the Waitlist & Our Journey
                  </AnimatedCTAButton>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 border-border text-foreground hover:bg-primary/10 hover:text-primary rounded-full font-semibold"
                  >
                    <Link href="/ethics">Our Ethical Framework</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                    <Lock className="h-4 w-4" /> Privacy by Design
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-semibold">
                    <Shield className="h-4 w-4" /> Ethical AI
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-3 py-1 rounded-full font-semibold">
                    Open Source Core
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-semibold">
                    User Control
                  </span>
                </div>
              </div>
              {/* Right: Globe */}
              <div className="mx-auto lg:mx-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-6 blur-2xl bg-gradient-to-tr from-primary/20 via-secondary/10 to-accent/10 rounded-full z-0 animate-pulse-slow" />
                  <HeroGlobe size={480} className="animate-float animate-pulse-subtle relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-8 text-center">
                The Noise Within and Without. <br className="hidden md:block" /> Can We Find Clarity?
              </h2>
              <div className="space-y-6 text-muted-foreground text-center">
                <p className="text-lg">
                  We often react without fully understanding why. Surface-level sentiment analysis misses the depth, while traditional surveys offer lagging snapshots.
                </p>
                <p className="text-lg">
                  We navigate complex inner lives and a noisy external world with incomplete maps. Global Pulse is an attempt to build a better compass, grounded in psychological principles and a commitment to ethical exploration, starting with the individual.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <Card className="bg-card border border-border shadow-lg rounded-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-5">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Shallow Signals</h3>
                  <p className="text-muted-foreground text-base">
                    Simple 'Positive'/'Negative' labels don't capture the complexity of human feeling or thought.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border shadow-lg rounded-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-5">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Missing Context</h3>
                  <p className="text-muted-foreground text-base">
                    Generic analysis ignores the unique personal context (values, needs, state) that shapes our perspective.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border shadow-lg rounded-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-5">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Lack of Control</h3>
                  <p className="text-muted-foreground text-base">
                    Often, our data is used in ways we don't understand or consent to. Transparency and control are essential.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Chat Demo Section */}
        <section className="py-24 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                A Glimpse into <span className="text-primary">Reflective Dialogue</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground">
                See a <em>simulated</em> interaction demonstrating the intended thoughtful and context-aware style of the Pulse agent. <strong>(Note: Live chat is not yet functional).</strong>
              </p>
            </div>
            <p className="text-center text-muted-foreground mb-4 italic">
              This is a simulated glimpse of Pulse — a companion designed for reflection, not prediction. Every insight is yours to accept, reject, or reshape.
            </p>
            <MarketingChatDemo />
            <p className="text-center text-muted-foreground mt-6 text-lg">
              💬 This is not a chatbot trying to keep you talking. Pulse listens, reflects, and steps back. What you do next is up to you.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-8 text-center">
                Building the Engine: <span className="text-primary">Our Approach</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground text-center mb-14">
                Global Pulse is centered around the <strong>Pulse Context Engine (PCE)</strong> – a conceptual framework we are actively building, integrating psychological principles with AI.
              </p>
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-10 items-center bg-card rounded-lg p-8 border border-border shadow-md">
                  <div className="md:w-1/3 flex justify-center">
                    <div className="bg-primary/10 p-6 rounded-full">
                      <Brain className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3 text-primary">Unified Identity Graph (UIG Concept)</h3>
                    <p className="text-muted-foreground text-lg">
                      We're <strong>designing</strong> a way to represent what matters to <em>you</em> – your core Values, Goals, Beliefs, Needs – privately and dynamically. This isn't a static profile; it's <strong>designed</strong> as an evolving map of your inner landscape, open for scrutiny and refinement.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row-reverse gap-10 items-center bg-card rounded-lg p-8 border border-border shadow-md">
                  <div className="md:w-1/3 flex justify-center">
                    <div className="bg-primary/10 p-6 rounded-full">
                      <Lightbulb className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3 text-primary">Emotion Framework (EWEF Concept)</h3>
                    <p className="text-muted-foreground text-lg">
                      Our aim is to analyze interactions not just for surface sentiment, but based on psychological principles – comparing perceptions against your unique UIG map to understand the potential <em>reasons</em> behind emotional responses. This framework is open-source and built for collaboration.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-16 border border-border rounded-lg p-8 bg-card overflow-hidden shadow-lg">
                <Image
                  src="/system-connectivity-diagram.png"
                  alt="Pulse Engine Diagram Concept"
                  width={1000}
                  height={400}
                  className="object-contain transition-transform duration-500 hover:scale-105 mx-auto"
                  priority
                />
                <p className="text-center text-sm text-muted-foreground mt-4">Conceptual System Diagram</p>
              </div>
              <p className="text-xl md:text-2xl font-semibold text-primary mt-8 text-center">
                Our focus is on illuminating the mechanics of subjective experience, not predicting behavior.
              </p>
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="py-24 bg-muted">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-2 text-base font-semibold bg-primary/10 text-primary w-fit mb-5 mx-auto">
                  <HeartHandshake className="mr-2 h-5 w-5" /> Our Core Commitments
                </div>
                <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                  Our Foundational <span className="text-primary">Commitments</span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground">
                  These aren't just features; they are the core principles guiding Global Pulse's development.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Lock className="h-10 w-10 text-primary" />}
                  title="Radical Privacy & Security"
                  description="Your data is yours. We employ encryption, secure infrastructure, and will never sell your personal information. Anonymization is key for any collective patterns."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Users className="h-10 w-10 text-primary" />}
                  title="User Sovereignty & Control"
                  description="Explicit, granular, opt-in consent for all non-essential data use. Defaults prioritize privacy. You have the right to access, manage, and delete your data."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<MessageCircle className="h-10 w-10 text-primary" />}
                  title="Space for Reflection"
                  description="Designed to be a companion for self-discovery, not just data extraction. Pulse aims to facilitate understanding, not provide answers or therapy."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Shield className="h-10 w-10 text-primary" />}
                  title="Safety via Guardrails"
                  description="We are building safety checks directly into the AI's logic (V1 implemented) to prevent harmful, manipulative, or biased outputs, complementing our ethical guidelines."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Eye className="h-10 w-10 text-primary" />}
                  title="Transparency & Openness"
                  description="Commitment to open-sourcing core analytical logic (EWEF/UIG). Clear policies and accessible explanations (XAI - future goal) are key."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Github className="h-10 w-10 text-primary" />}
                  title="Building in Public"
                  description="This started as a hackathon project. We're sharing our journey, challenges, and progress openly, inviting feedback and collaboration."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Ethics Section */}
        <section id="ethics" className="py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-8 text-center">
                Powerful Tech Demands <span className="text-secondary">Radical Responsibility.</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground text-center mb-14">
                Modeling identity and emotion is serious business. Ethics aren't an afterthought; they're architected in.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-card border border-green-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-green-500/50 hover:-translate-y-1 rounded-lg">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <ShieldCheck className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Your Data, Your Rules</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Granular, opt-in consent. You control access, analysis depth, data use. <strong>Individual data is NEVER sold.</strong>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-green-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-green-500/50 hover:-translate-y-1 rounded-lg">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <Lock className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Privacy & Security Baked In</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Encryption. Strict access controls. Secure infrastructure. Pseudonymization for future aggregate analysis.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-green-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-green-500/50 hover:-translate-y-1 rounded-lg">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <Shield className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Ethical Guardrails in Code</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Active modules aim to prevent manipulation and block responses predicted to cause significant distress.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-green-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-green-500/50 hover:-translate-y-1 rounded-lg">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <AlertCircle className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Not a Medical Service</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      A tool for self-awareness, <em>not</em> a replacement for professional mental health diagnosis or treatment.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-green-500 text-green-400 hover:bg-green-500/10 rounded-full font-semibold px-8 py-4 shadow-md"
                  asChild
                >
                  <Link href="/ethics">
                    Read Our Full Ethical Framework <ExternalLink className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section */}
        <section id="waitlist" className="py-24 md:py-32 bg-muted">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                  Join Our Exploration
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  Global Pulse is in its early stages. Join the waitlist to follow our progress, provide feedback, and be among the first to experience the platform as it evolves.
                </p>
                <WaitlistChatSignup />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}