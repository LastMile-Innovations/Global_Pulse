import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Cpu, Sparkles, Zap, Globe, MessageSquareText, Lock, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"

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
            <Sparkles className="mr-2 h-4 w-4 text-primary" /> Global Pulse: Insight, Safety, and Trust
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight text-foreground font-heading">
            Know Yourself. Understand the World.
            <div className="mt-3">
              <span className="text-primary bg-primary/5 px-4 py-2 rounded-md inline-block">Trust the Process.</span>
            </div>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-normal">
            The world's first platform for deep personal insight and collective understanding—powered by empathetic AI, grounded in science, and built on radical privacy and ethical transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <AnimatedCTAButton href="/signup" className="shadow-md">Join Free—Privacy First</AnimatedCTAButton>
            <Button variant="outline" size="lg" className="h-14 border-border text-foreground hover:bg-primary/10 hover:text-primary rounded-full font-semibold" asChild>
              <Link href="/explore">See Live, Anonymous Insights</Link>
            </Button>
          </div>
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
    title: "Conversational AI, Built for You",
    description: "Pulse is your private, empathetic AI companion. Explore your thoughts, feelings, and values in a safe, judgment-free space. Every conversation is powered by science and protected by design.",
    icon: <MessageSquareText className="h-8 w-8 text-primary" />, 
    color: "primary",
    benefits: [
      "Feel safe: Your responses are private and always anonymized.",
      "Real understanding: Pulse helps you connect emotions to your core values.",
      "Natural flow: No awkward forms—just a real conversation.",
      "You're in control: Share as much or as little as you want."
    ],
    buttonText: "Chat with Pulse"
  },
  {
    title: "Instant Surveys, Instant Impact",
    description: "Answer quick, focused questions on topics you care about. See your input instantly reflected in live results. No waiting, no hidden agenda—just your honest opinion making a real difference.",
    icon: <Zap className="h-8 w-8 text-secondary" />, 
    color: "secondary",
    benefits: [
      "One-tap answers: Share your view in seconds, anytime.",
      "See results live: Watch the world's opinions update as you participate.",
      "Choose your topics: Only answer what matters to you.",
      "No pressure: Skip or stop anytime—your data, your choice."
    ],
    buttonText: "Take a Quick Survey"
  },
  {
    title: "Real-Time Global Insights, Always Anonymous",
    description: "Explore a living dashboard of global opinions. Filter by topic, region, or time. Every insight is aggregated and anonymized, so you can discover trends without ever exposing individual voices.",
    icon: <Globe className="h-8 w-8 text-accent" />, 
    color: "accent",
    benefits: [
      "Live, evolving data: Watch global sentiment shift in real time.",
      "Total anonymity: No individual responses are ever shown.",
      "Powerful filters: Find insights that matter to you.",
      "Clear visuals: Complex data made simple and accessible."
    ],
    buttonText: "Explore Insights"
  },
  {
    title: "AI Insights You Can Trust",
    description: "Let our AI turn raw data into clear, actionable insights. Get concise summaries and spot trends, all while knowing your privacy is protected at every step.",
    icon: <Sparkles className="h-8 w-8 text-primary" />, 
    color: "primary",
    benefits: [
      "Human-readable summaries: Understand the big picture instantly.",
      "Spot trends early: AI highlights what's changing, so you're always informed.",
      "No compromise on privacy: Insights are always based on anonymized data.",
      "Curated dashboards: See what matters most, with zero risk to your identity."
    ],
    buttonText: "See AI Insights"
  },
  {
    title: "Engineered for Trust—Fast, Secure, and Always in Your Control",
    description: "Global Pulse is built for speed and security. Enjoy instant feedback and seamless navigation, knowing your data is protected by industry-leading technology and strict privacy standards.",
    icon: <Cpu className="h-8 w-8 text-secondary" />, 
    color: "secondary",
    benefits: [
      "Lightning fast: No waiting, no lag—just instant results.",
      "Secure by design: Your account and data are always protected.",
      "Global scale: Trusted by users worldwide, built to handle millions safely.",
      "You're in charge: Control your experience and your data, always."
    ],
    buttonText: "Discover Our Tech"
  },
  {
    title: "Your Privacy, Our Promise—Participate with Total Confidence",
    description: "Your trust is our top priority. We use secure authentication, rigorous anonymization, and give you clear control over your data. No personal information is ever sold or shared. You decide how your voice is used—always.",
    icon: <Lock className="h-8 w-8 text-primary" />, 
    color: "primary",
    benefits: [
      "Industry-leading security: Your account and responses are protected at every step.",
      "Anonymized insights: Only collective trends are shown, never individual data.",
      "Privacy by default: No tracking, no selling, no surprises.",
      "Full control: Change your privacy settings or opt out anytime."
    ],
    buttonText: "Read Our Privacy Commitment"
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
                    <Link href="/signup" className="group">
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
      <HeroSection />
      <FeatureList />
      <TrustSection />
      <TechStackSection />
      <FinalCTASection />
    </>
  )
}
