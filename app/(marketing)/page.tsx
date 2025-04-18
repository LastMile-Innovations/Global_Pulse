import "@/app/globals.css";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export const metadata: Metadata = {
  title: "Global Pulse – Professional, Ethical AI for Self-Discovery",
  description:
    "Global Pulse is a pioneering AI companion, built on psychological science, privacy, and user empowerment. Join us as we set a new standard for ethical, human-centered AI.",
};

export const experimental_ppr = true;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-32 md:py-48 overflow-hidden bg-background text-foreground">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-24 items-center min-h-[500px]">
              {/* Left: Text & CTAs */}
              <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-8">
                <div className="inline-flex items-center rounded-full border border-primary/40 px-5 py-2 text-base font-semibold text-primary bg-primary/10 mb-2 backdrop-blur">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  From Hackathon to Professional-Grade Ethical AI
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
                  Discover Your Inner World.<br />
                  <span className="text-primary">AI, Reimagined for You.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal">
                  Global Pulse is a next-generation AI companion, designed for self-discovery and personal growth. Built transparently, with privacy, agency, and dignity at its core.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  <AnimatedCTAButton
                    href="/waitlist"
                    prefetch
                    className="text-lg px-10 py-5 rounded-full font-semibold"
                  >
                    Join the Waitlist
                  </AnimatedCTAButton>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 border-border text-foreground hover:bg-primary/10 hover:text-primary rounded-full font-semibold"
                  >
                    <Link href="/ethics">Ethical Framework</Link>
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
                Navigating Complexity.<br className="hidden md:block" /> Seeking Clarity in a Noisy World.
              </h2>
              <div className="space-y-6 text-muted-foreground text-center">
                <p className="text-lg">
                  Human experience is nuanced. Traditional sentiment analysis is shallow, and surveys are outdated. We live with intricate emotions and shifting contexts—yet our digital tools rarely reflect this depth.
                </p>
                <p className="text-lg font-medium text-primary">
                  Global Pulse is committed to building a more insightful, ethical compass—grounded in psychology and respect for the individual.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <Card className="bg-card border border-border shadow-lg rounded-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-5">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Superficial Signals</h3>
                  <p className="text-muted-foreground text-base">
                    Binary sentiment misses the richness of human thought and feeling. We need more than just "positive" or "negative".
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
                    Generic analysis ignores your unique values, needs, and state. True understanding requires context.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border shadow-lg rounded-lg">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-5">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Lack of Agency</h3>
                  <p className="text-muted-foreground text-base">
                    Data is often used without clear consent or transparency. Professional standards demand user control and trust.
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
                Experience <span className="text-primary">Reflective Dialogue</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Explore a simulated conversation that demonstrates the thoughtful, context-aware approach of the Pulse agent.
              </p>
            </div>
            <MarketingChatDemo />
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl mb-8 text-center">
                The Pulse Engine: <span className="text-primary">A Professional Approach</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground text-center mb-14">
                At the heart of Global Pulse is the <strong>Pulse Context Engine (PCE)</strong>: a robust, evolving framework that fuses psychological science with advanced AI.
              </p>
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-10 items-center bg-card rounded-lg p-8 border border-border shadow-md">
                  <div className="md:w-1/3 flex justify-center">
                    <div className="bg-primary/10 p-6 rounded-full">
                      <Brain className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3 text-primary">Unified Identity Graph (UIG)</h3>
                    <p className="text-muted-foreground text-lg">
                      We're developing a dynamic, private model of your core values, goals, beliefs, and needs—an evolving map of your inner landscape, not a static profile.
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
                    <h3 className="text-2xl font-bold mb-3 text-primary">Emotion Framework (EWEF)</h3>
                    <p className="text-muted-foreground text-lg">
                      Our system interprets interactions through psychological principles, mapping perceptions against your unique UIG to illuminate the <em>why</em> behind emotional responses.
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
              </div>
              <p className="text-xl md:text-2xl font-semibold text-primary mt-8 text-center">
                Our mission: illuminate the mechanics of subjective experience—never to predict or manipulate behavior.
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
                  Professional Ethics, <span className="text-primary">Built In.</span>
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground">
                  These principles are the foundation of Global Pulse—defining every decision, every feature.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Lock className="h-10 w-10 text-primary" />}
                  title="Radical Privacy & Security"
                  description="Your data remains yours. We implement end-to-end encryption, secure infrastructure, and never sell personal information. Anonymization is standard for any aggregate insights."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Users className="h-10 w-10 text-primary" />}
                  title="User Sovereignty & Control"
                  description="You decide how your data is used. Consent is explicit, granular, and opt-in. Privacy is the default. Access, manage, or delete your data at any time."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<MessageCircle className="h-10 w-10 text-primary" />}
                  title="Space for Reflection"
                  description="Pulse is a tool for self-discovery, not a data-mining engine. Our focus is on facilitating understanding, not providing answers or therapy."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Shield className="h-10 w-10 text-primary" />}
                  title="Safety by Design"
                  description="Robust guardrails are built into the AI to prevent harmful, manipulative, or biased outputs—reinforced by our ethical guidelines."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Eye className="h-10 w-10 text-primary" />}
                  title="Transparency & Openness"
                  description="We are committed to open-sourcing our analytical logic (EWEF/UIG) and providing clear, accessible explanations (XAI) for all users."
                  className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-primary/30 hover:-translate-y-1"
                />
                <FeatureCard
                  icon={<Github className="h-10 w-10 text-primary" />}
                  title="Building in Public"
                  description="From hackathon roots to professional product, our journey is open. We welcome feedback, collaboration, and community insight."
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
                Advanced Technology Requires <span className="text-secondary">Uncompromising Ethics</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground text-center mb-14">
                Modeling identity and emotion is a profound responsibility. Ethics are not an afterthought—they are architected into every layer of Global Pulse.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-card border border-green-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-green-500/50 hover:-translate-y-1 rounded-lg">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <ShieldCheck className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Your Data, Your Rules</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Consent is granular and opt-in for all non-essential uses. You control access, analysis depth, and data use. Revoke consent at any time. <strong>Your data is never sold.</strong>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border border-green-500/30 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-green-500/50 hover:-translate-y-1 rounded-lg">
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-5 items-center">
                      <Lock className="h-10 w-10 text-green-500 flex-shrink-0" />
                      <h3 className="text-xl font-bold text-green-400">Privacy & Security by Default</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Encryption at rest and in transit. Strict access controls. Secure infrastructure. Pseudonymization for any aggregate analysis.
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
                      Active modules monitor for manipulation and block responses likely to cause distress. These are not just policies—they are enforced in code.
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
                      Global Pulse is a tool for self-awareness and insight. It is <em>not</em> a substitute for professional mental health care.
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
                  Join the Global Pulse Community
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  Be part of our journey from the start. Join the waitlist to receive updates, share your feedback, and help shape the future of ethical, professional AI.
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