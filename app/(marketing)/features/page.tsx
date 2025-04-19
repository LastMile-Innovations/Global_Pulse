import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Cpu, Sparkles, Zap, Globe, MessageSquareText, Lock, ArrowRight, AlertCircle } from "lucide-react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Dynamic import for CTA button
const AnimatedCTAButton = dynamic(() => import("@/components/marketing/animated-cta-button"), {
  loading: () => <Button size="lg" className="h-14 animate-pulse bg-primary/80">Loading...</Button>
})

// --- HERO SECTION ---
function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-background text-foreground">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-[0.04] pointer-events-none z-0"></div>
      {/* Glowing effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-30" />
      </div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Exploring the Global Pulse Concept
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight text-foreground font-heading">
            Exploring the Global Pulse Concept
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-normal">
            Discover the designed features and underlying ideas guiding the development of our ethical AI companion prototype.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold"><Lock className="h-4 w-4" /> Privacy by Design</span>
            <span className="inline-flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-semibold"><Cpu className="h-4 w-4" /> Ethical AI</span>
            <span className="inline-flex items-center gap-1 text-xs bg-muted px-3 py-1 rounded-full font-semibold">Open Source</span>
            <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-semibold">User-Owned Data</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- FEATURES SECTION ---
const features = [
  {
    title: "Reflective Conversations with Pulse (Conceptual)",
    description: "Engage in conversations designed for self-exploration. Pulse, our AI companion concept, aims to listen attentively and ask thoughtful questions based on our EWEF framework, helping you connect with your own thoughts and feelings in a private, non-judgmental space.",
    icon: <MessageSquareText className="h-8 w-8 text-primary" />,
    color: "primary",
    benefits: [
      "Focus on safety and privacy in dialogue.",
      "Encourage reflection over simple answers.",
      "Designed with user control (modes) in mind."
    ],
    buttonText: "Learn About the Conversation Design",
    buttonLink: "/how-it-works"
  },
  {
    title: "Contextual Structured Check-ins (Future Feature - Design)",
    description: "We are designing ways for Pulse to occasionally invite you (with your explicit opt-in and permission) to share specific insights via simple tools like sliders or choices, right within the chat. This aims to capture nuanced feelings contextually, always respecting your flow.",
    icon: <Zap className="h-8 w-8 text-secondary" />, 
    color: "secondary",
    benefits: [
      "Potential for deeper insight, if user chooses.",
      "Maintain conversational feel, avoid form fatigue.",
      "Strictly opt-in and permission-based."
    ],
    buttonText: "Explore Our User Interaction Principles",
    buttonLink: "/ethics#user-interaction"
  },
  {
    title: "Personal Insight Dashboard (V1 Implemented)",
    description: "Your private dashboard offers initial reflections based only on your interactions. See evolving patterns in your mood/stress (Mood Chart) and key inferred Values/Goals ({Self} Map Widget). This is your data, visualized for your insight. (Note: Data shown in current demo is placeholder).",
    icon: <Globe className="h-8 w-8 text-accent" />, 
    color: "accent",
    benefits: [
      "Private space for personal reflection.",
      "Visualize inferred self-map concepts (Values/Goals).",
      "Reinforces data ownership and privacy."
    ],
    buttonText: "See Your (Demo) Dashboard",
    buttonLink: "/login"
  },
  {
    title: "Transparent AI Reasoning (XAI Snippet - Needs Fix)",
    description: "Understand why Pulse responds the way it does. A 'Why?' button (UI exists, backend needs fix) aims to reveal a simplified explanation based on the underlying EWEF analysis, fostering trust through transparency.",
    icon: <Sparkles className="h-8 w-8 text-primary" />, 
    color: "primary",
    benefits: [
      "Builds trust by showing the 'reasoning'.",
      "Demystifies AI decision-making.",
      "Empowers user understanding and feedback."
    ],
    buttonText: "Understand Our Approach to XAI",
    buttonLink: "/how-it-works#xai"
  },
  {
    title: "Ethically Engineered Foundation",
    description: "Built on a modern stack (Next.js, Supabase, Neo4j, Redis) with security and privacy integrated from the start. Includes active Ethical Guardrails (V1) and a robust, user-controlled Consent system.",
    icon: <Cpu className="h-8 w-8 text-secondary" />, 
    color: "secondary",
    benefits: [
      "Demonstrates technical competence.",
      "Highlights privacy-by-design approach.",
      "Foundation built for trust and safety."
    ],
    buttonText: "Learn About Our Technology & Ethics",
    buttonLink: "/ethics"
  },
  {
    title: "Your Privacy, Our Foundational Promise",
    description: "Your trust is paramount. You control your data via granular consent (defaulting private). We employ strong security and anonymization principles. Your personal data is never sold. You always decide how your perspective is used.",
    icon: <Lock className="h-8 w-8 text-primary" />, 
    color: "primary",
    benefits: [
      "Clear commitment to data control.",
      "Explicit statement against selling personal data.",
      "Reinforces core ethical stance."
    ],
    buttonText: "Read Our Privacy Policy",
    buttonLink: "/privacy"
  },
]

function FeatureList() {
  return (
    <section className="py-24 md:py-32 bg-muted relative">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="space-y-24">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="bg-card border border-border shadow-md hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden p-6 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">
                {/* Text Content */}
                <div className={`space-y-6 ${index % 2 === 0 ? "md:order-1" : "md:order-2"}`}>
                  <div className={
                    feature.color === "primary" 
                      ? "inline-flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10"
                      : feature.color === "secondary"
                        ? "inline-flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/10"
                        : "inline-flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10"
                  }>
                    {feature.icon}
                  </div>
                  <h3 className={
                    feature.color === "primary"
                      ? "text-2xl md:text-3xl font-bold tracking-tight text-primary"
                      : feature.color === "secondary"
                        ? "text-2xl md:text-3xl font-bold tracking-tight text-secondary"
                        : "text-2xl md:text-3xl font-bold tracking-tight text-accent"
                  }>{feature.title}</h3>
                  {feature.title.includes("(Conceptual)") && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Conceptual</span>}
                  {feature.title.includes("(Future Feature - Design)") && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">Design</span>}
                  {feature.title.includes("(V1 Implemented)") && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">V1 Implemented</span>}
                  {feature.title.includes("(Needs Fix)") && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">Needs Fix</span>}
                  <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className={
                          feature.color === "primary"
                            ? "h-5 w-5 text-primary mt-1 flex-shrink-0"
                            : feature.color === "secondary"
                              ? "h-5 w-5 text-secondary mt-1 flex-shrink-0"
                              : "h-5 w-5 text-accent mt-1 flex-shrink-0"
                        } />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className={
                      feature.color === "primary" 
                        ? "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary" 
                        : feature.color === "secondary" 
                          ? "border-secondary/30 text-secondary hover:bg-secondary/10 hover:text-secondary" 
                          : "border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
                    }
                    asChild
                  >
                    <Link href={feature.buttonLink || "/"} className="group">
                      {feature.buttonText} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                {/* Visual Representation */}
                <div className={`relative rounded-lg overflow-hidden border border-border shadow-md transition-all duration-300 ${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}>
                  <div className={
                    feature.color === "primary" 
                      ? "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                      : feature.color === "secondary" 
                        ? "absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                        : "absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  } />
                  {/* Placeholder image or illustration */}
                  <div className="flex items-center justify-center h-[300px] bg-muted/20 text-muted-foreground text-xl font-semibold">
                    Feature Visual
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- TRUST SECTION ---
function TrustSection() {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Why Trust Global Pulse?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border border-border rounded-lg">
              <div className="flex flex-col gap-3 items-center text-center">
                <Lock className="h-8 w-8 text-primary mb-2" />
                <h4 className="text-lg font-semibold">Privacy by Design</h4>
                <p className="text-muted-foreground">You control your data. Nothing is sold or shared without your explicit, granular consent.</p>
              </div>
            </Card>
            <Card className="p-6 bg-card border border-border rounded-lg">
              <div className="flex flex-col gap-3 items-center text-center">
                <Cpu className="h-8 w-8 text-secondary mb-2" />
                <h4 className="text-lg font-semibold">Ethical AI</h4>
                <p className="text-muted-foreground">Every insight and interaction is governed by strict ethical guardrails and transparent algorithms.</p>
              </div>
            </Card>
            <Card className="p-6 bg-card border border-border rounded-lg">
              <div className="flex flex-col gap-3 items-center text-center">
                <Sparkles className="h-8 w-8 text-accent mb-2" />
                <h4 className="text-lg font-semibold">Open Source</h4>
                <p className="text-muted-foreground">Our core technology is open for public scrutiny and collaboration.</p>
              </div>
            </Card>
            <Card className="p-6 bg-card border border-border rounded-lg">
              <div className="flex flex-col gap-3 items-center text-center">
                <Globe className="h-8 w-8 text-primary mb-2" />
                <h4 className="text-lg font-semibold">Collective Good</h4>
                <p className="text-muted-foreground">Aggregate insights are only ever shared in anonymized, consented form—never for targeting or manipulation.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- TECH STACK SECTION ---
function TechStackSection() {
  const techs = [
    { name: "Next.js 15", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
    { name: "React 19", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
    { name: "Vercel AI SDK", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
    { name: "Supabase", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
    { name: "Upstash Redis", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
    { name: "Tailwind CSS", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
    { name: "TypeScript", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
  ]
  return (
    <section className="py-20 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold border-primary/30 bg-primary/10 text-primary mb-4">
            <Cpu className="mr-2 h-4 w-4" /> Powered By Innovation
          </div>
          <h2 className="text-3xl font-bold tracking-tighter mb-4">Built for Speed and Scale</h2>
          <p className="text-lg text-muted-foreground">
            Our modern tech stack ensures a blazing-fast, reliable, and scalable platform.
          </p>
        </div>
        <Card className="border border-border bg-card rounded-lg p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            {techs.map((tech) => (
              <div key={tech.name} className="flex items-center gap-2 text-foreground">
                {tech.icon}
                <span className="font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

// --- FINAL CTA SECTION ---
function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-border">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-6 text-foreground font-heading">
            Stop Guessing. Start Knowing.
            <div className="mt-4 md:mt-6">
              <span className="text-primary bg-primary/5 px-4 py-2 rounded-md inline-block">Feel the Global Pulse—Safely.</span>
            </div>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The world is constantly speaking. Are you ready to listen? Join free today, lend your voice to the global conversation, and explore insights with total confidence.
          </p>
          <Card className="bg-card/50 border border-border rounded-lg p-6 mb-8">
            <p className="text-primary font-semibold">No personal data sold. No individual responses shown. You're always in control.</p>
          </Card>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedCTAButton href="/signup">Sign Up Free—Privacy Guaranteed</AnimatedCTAButton>
            <Button size="lg" variant="outline" className="rounded-full border-border h-14 text-base hover:bg-primary/10 hover:text-primary" asChild>
              <Link href="/explore" className="flex items-center">
                Explore Safely <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- PAGE EXPORT ---
export default function FeaturesPage() {
  return (
    <>
      <div className="container px-4 md:px-6 pt-12"> 
        <Alert variant="default" className="mb-8 bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Prototype Status</AlertTitle>
          <AlertDescription>
            Global Pulse is currently an early-stage prototype born from a 10-day hackathon. Some features described represent our design goals and may not be fully interactive in the current demo. We are building transparently and prioritize safety and user control.
          </AlertDescription>
        </Alert>
      </div>

      <HeroSection />
      <FeatureList />
      <TrustSection />
      <TechStackSection />
      <FinalCTASection />
    </>
  )
}
