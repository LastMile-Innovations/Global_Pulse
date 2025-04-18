import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Cpu, Sparkles, Zap, Globe, MessageSquareText, Lock, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import for CTA button
const AnimatedCTAButton = dynamic(() => import("@/components/marketing/animated-cta-button"), {
  loading: () => <Button size="lg" className="h-14 animate-pulse bg-primary/80">Loading...</Button>
})

// --- HERO SECTION ---
function HeroSection() {
  return (
    <section className="relative py-32 md:py-44 lg:py-56 overflow-hidden bg-gradient-to-b from-background via-background to-muted text-foreground">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-tr from-primary/10 via-background/60 to-secondary/10 animate-gradient-x" />
      </div>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-[0.04] pointer-events-none z-0"></div>
      {/* Glowing effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <div className="w-[600px] h-[600px] bg-gradient-radial from-primary/20 via-transparent to-transparent rounded-standard-full animate-pulse-slow shadow-glow" />
      </div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center rounded-standard-full border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 shadow-glow-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary animate-bounce" /> Global Pulse: Insight, Safety, and Trust
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight bg-gradient-to-r from-primary via-foreground to-muted text-transparent bg-clip-text drop-shadow-lg text-balance">
            Know Yourself. Understand the World. Trust the Process.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium text-balance">
            The world's first platform for deep personal insight and collective understanding—powered by empathetic AI, grounded in science, and built on radical privacy and ethical transparency. Your data, your control. Always.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <AnimatedCTAButton href="/signup" className="shadow-glow animate-float">Join Free—Privacy First</AnimatedCTAButton>
            <Button variant="outline" size="lg" className="h-14 border-primary/30 text-foreground hover:bg-primary/10 shadow-glow animate-float" asChild>
              <Link href="/explore">See Live, Anonymous Insights</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-standard-full font-semibold"><Lock className="h-4 w-4" /> Privacy by Design</span>
            <span className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-standard-full font-semibold"><Cpu className="h-4 w-4" /> Ethical AI</span>
            <span className="inline-flex items-center gap-1 text-xs bg-muted text-foreground px-3 py-1 rounded-standard-full font-semibold">Open Source</span>
            <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-3 py-1 rounded-standard-full font-semibold">User-Owned Data</span>
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
    colorClass: "primary",
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
    colorClass: "secondary",
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
    colorClass: "accent",
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
    colorClass: "primary",
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
    colorClass: "secondary",
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
    colorClass: "primary",
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
    <section className="py-24 md:py-32 bg-muted dark:bg-background relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-24 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 blur-2xl opacity-40 pointer-events-none" />
      <div className="container px-4 md:px-6 relative z-10">
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`transition-transform duration-300 hover:scale-[1.025] hover:shadow-2xl rounded-standard-xl bg-card p-2 md:p-0 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16 group animate-fade-in-up">
                {/* Text Content */}
                <div className={`space-y-6 ${index % 2 === 0 ? "md:order-1" : "md:order-2"}`}>
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-${feature.colorClass}/10`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-3xl font-bold tracking-tight text-${feature.colorClass}`}>{feature.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className={`h-5 w-5 text-${feature.colorClass}/80 mt-1 flex-shrink-0`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className={`border-${feature.colorClass}/30 text-${feature.colorClass} hover:bg-${feature.colorClass}/10 hover:text-${feature.colorClass} group`} asChild>
                    <Link href="/signup">
                      {feature.buttonText} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                {/* Visual Representation Placeholder */}
                <div className={`relative rounded-xl overflow-hidden border-2 border-muted/20 shadow-xl transition-all duration-500 group-hover:border-${feature.colorClass}/40 group-hover:shadow-${feature.colorClass}/10 group-hover:scale-[1.02] ${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-${feature.colorClass}/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  {/* Placeholder image or illustration */}
                  <div className="flex items-center justify-center h-[300px] bg-muted/40 text-muted-foreground text-xl font-semibold">
                    Feature Visual
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- TRUST SECTION ---
function TrustSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-muted border-t">
      <div className="container px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-foreground">Why Trust Global Pulse?</h3>
          <div className="flex flex-col gap-4 text-base text-muted-foreground">
            <div className="flex items-center gap-2 justify-center"><Lock className="h-5 w-5 text-primary" /> <span>Privacy by Design: You control your data. Nothing is sold or shared without your explicit, granular consent.</span></div>
            <div className="flex items-center gap-2 justify-center"><Cpu className="h-5 w-5 text-secondary" /> <span>Ethical AI: Every insight and interaction is governed by strict ethical guardrails and transparent algorithms.</span></div>
            <div className="flex items-center gap-2 justify-center"><Sparkles className="h-5 w-5 text-accent" /> <span>Open Source: Our core technology is open for public scrutiny and collaboration.</span></div>
            <div className="flex items-center gap-2 justify-center"><Globe className="h-5 w-5 text-muted-foreground" /> <span>Collective Good: Aggregate insights are only ever shared in anonymized, consented form to advance societal understanding—never for targeting or manipulation.</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- TECH STACK SECTION ---
function TechStackSection() {
  const techs = [
    { name: "Next.js 15", icon: <CheckCircle2 className="h-5 w-5 text-primary/70" /> },
    { name: "React 19", icon: <CheckCircle2 className="h-5 w-5 text-primary/70" /> },
    { name: "Vercel AI SDK", icon: <CheckCircle2 className="h-5 w-5 text-primary/70" /> },
    { name: "Supabase", icon: <CheckCircle2 className="h-5 w-5 text-primary/70" /> },
    { name: "Upstash Redis", icon: <CheckCircle2 className="h-5 w-5 text-primary/70" /> },
    { name: "Tailwind CSS", icon: <CheckCircle2 className="h-5 w-5 text-primary/70" /> },
    { name: "TypeScript", icon: <CheckCircle2 className="h-5 w-5 text-primary/70" /> },
  ]
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold border-transparent bg-secondary text-secondary-foreground mb-4">
            <Cpu className="mr-2 h-4 w-4" /> Powered By Innovation
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Built for Speed and Scale</h2>
          <p className="text-lg text-muted-foreground">
            Our modern tech stack ensures a blazing-fast, reliable, and scalable platform.
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 max-w-4xl mx-auto">
          {techs.map((tech) => (
            <div key={tech.name} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              {tech.icon}
              <span className="font-medium">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- FINAL CTA SECTION ---
function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-t from-primary/5 via-background to-muted border-t">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-foreground">
            Stop Guessing. Start Knowing. Feel the Global Pulse—Safely.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The world is constantly speaking. Are you ready to listen? Global Pulse offers the most immediate, nuanced, and secure window into collective human perspective ever created. Sign up free today, lend your voice to the global conversation, and explore insights with total confidence.
          </p>
          <div className="text-base text-primary font-semibold mb-6">No personal data sold. No individual responses shown. You're always in control.</div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedCTAButton href="/signup">Sign Up Free—Privacy Guaranteed</AnimatedCTAButton>
            <Button size="lg" variant="outline" className="gap-2 h-14 text-base" asChild>
              <Link href="/explore">
                Explore Safely <ArrowRight className="h-4 w-4 ml-1" />
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
