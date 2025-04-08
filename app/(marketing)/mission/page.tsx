import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Globe,
  MessageSquare,
  Shield,
  Clock,
  Users,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Rocket,
} from "lucide-react"
import AnimatedCTAButton from "@/components/animated-cta-button"

export default function MissionPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-primary/30 via-background to-background">
        {/* Dynamic background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        {/* Animated wave patterns suggesting sound waves / global pulse */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-primary/30 animate-pulse"></div>
          <div
            className="absolute top-1/3 left-0 right-0 h-px bg-primary/30 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-1/2 left-0 right-0 h-px bg-primary/30 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-2/3 left-0 right-0 h-px bg-primary/30 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-3/4 left-0 right-0 h-px bg-primary/30 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Circular pulse animation */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[800px] h-[800px] opacity-10">
            <div
              className="absolute inset-0 rounded-full border-4 border-primary animate-ping"
              style={{ animationDuration: "3s" }}
            ></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-primary animate-ping"
              style={{ animationDuration: "3s", animationDelay: "1s" }}
            ></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-primary animate-ping"
              style={{ animationDuration: "3s", animationDelay: "2s" }}
            ></div>
          </div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold mb-8 border-transparent bg-primary/20 text-primary shadow-sm">
              Our Mission
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 leading-tight">
              The World is Speaking.
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-teal-400 text-transparent bg-clip-text">
                Are We Listening?
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              In an age of noise, echo chambers, and manufactured narratives, the genuine pulse of humanity gets lost.
              We're here to find it. Instantly. Unfiltered.
            </p>

            <div className="bg-muted/30 border border-primary/10 rounded-xl p-6 md:p-8 text-left shadow-lg">
              <p className="text-lg md:text-xl leading-relaxed">
                Traditional polls are slow snapshots of curated questions. Social media is an algorithmic battleground.
                Headlines capture moments, not movements. We're drowning in data but starved for understanding. We
                operate with outdated maps of public sentiment while the ground shifts beneath our feet every second.
                Decisions impacting billions are made in the dark. This isn't just inefficient;{" "}
                <span className="font-bold text-primary">it's dangerous</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Global Pulse Mandate */}
      <section className="py-20 md:py-28 lg:py-32 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M400,0 L400,800 L0,800 C200,600 350,400 400,0 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mandate: <span className="text-primary">Amplify Authentic Voice. Illuminate Real-Time Truth.</span>
              </h2>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 md:p-8 mb-12 relative">
                <div className="absolute -top-3 -left-3 bg-primary text-white p-2 rounded-lg shadow-lg text-sm font-medium">
                  Core Mission
                </div>
                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                  Global Pulse exists to build the world's definitive real-time barometer of human perspective. We
                  connect individual voices directly to collective understanding, bypassing filters and delays to reveal
                  the authentic, dynamic pulse of global sentiment on any topic, as it happens.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  belief: "genuine understanding starts with listening, not just asking pre-approved questions.",
                  icon: <MessageSquare className="h-8 w-8 text-primary" />,
                },
                {
                  belief: "technology should amplify diverse voices, not algorithmically silence them.",
                  icon: <Users className="h-8 w-8 text-primary" />,
                },
                {
                  belief: "real-time data isn't a luxury; it's essential for navigating complexity.",
                  icon: <Clock className="h-8 w-8 text-primary" />,
                },
                {
                  belief: "conversation, guided by neutral AI, can unlock deeper insights than any static form.",
                  icon: <MessageSquare className="h-8 w-8 text-primary" />,
                },
                {
                  belief: "every perspective contributes value, and that value should be recognized.",
                  icon: <CheckCircle className="h-8 w-8 text-primary" />,
                },
                {
                  belief:
                    "a transparent view of global sentiment fosters empathy, informs better decisions, and can bridge divides. We are building that view.",
                  icon: <Globe className="h-8 w-8 text-primary" />,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-background rounded-xl p-6 border-2 border-primary/10 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 flex items-center">
                        <span className="text-primary mr-2">We Believe</span>
                        <span className="h-px w-12 bg-primary/30"></span>
                      </h3>
                      <p className="text-lg">{item.belief}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters Now */}
      <section className="py-20 md:py-28 lg:py-32 bg-muted/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="absolute left-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 L0,800 L400,800 C200,600 50,400 0,0 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold mb-6 border-transparent bg-destructive/20 text-destructive shadow-sm">
                <Zap className="mr-2 h-4 w-4" /> Critical Timing
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The Urgency of Now.</h2>
            </div>

            <div className="space-y-12">
              <div className="bg-background rounded-xl p-8 border-2 border-destructive/20 shadow-lg relative">
                <div className="absolute -top-3 -right-3 bg-destructive text-white p-2 rounded-lg shadow-lg text-sm font-medium">
                  The Problem
                </div>
                <p className="text-xl leading-relaxed mb-4">
                  Look around. Polarization deepens. Misinformation spreads like wildfire. Critical decisions on
                  climate, AI, global health, and social justice demand a clear understanding of where people actually
                  stand, not where pundits think they stand. We need to move beyond echo chambers and engage with the
                  raw, complex reality of diverse human thought.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: "Echo Chambers", value: "Growing" },
                    { label: "Misinformation", value: "Rampant" },
                    { label: "Decision Quality", value: "Declining" },
                    { label: "Understanding Gap", value: "Widening" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-destructive font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-background rounded-xl p-8 border-2 border-primary/20 shadow-lg relative">
                <div className="absolute -top-3 -left-3 bg-primary text-white p-2 rounded-lg shadow-lg text-sm font-medium">
                  The Opportunity
                </div>
                <p className="text-xl leading-relaxed">
                  The technology is finally here. Advanced AI allows for nuanced, respectful conversation at scale.
                  Real-time databases and edge infrastructure enable instant aggregation and visualization. We stand at
                  a unique intersection where we can build this global nervous system for understanding.{" "}
                  <span className="font-bold text-primary">Not acting now is a choice to remain blind.</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: "AI Capability", value: "Breakthrough" },
                    { label: "Real-time Tech", value: "Mature" },
                    { label: "Global Reach", value: "Unprecedented" },
                    { label: "Timing", value: "Critical" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-primary/10 rounded-lg p-3 text-center">
                      <div className="text-primary font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 md:py-28 lg:py-32 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold mb-6 border-transparent bg-blue-500/20 text-blue-500 shadow-sm">
                <Sparkles className="mr-2 h-4 w-4" /> Our Method
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How We're Doing It (Differently).</h2>
            </div>

            <div className="space-y-12">
              {[
                {
                  title: "Conversational Depth",
                  description:
                    "We're not just collecting clicks. Our AI \"Pulse\" engages users in real conversations, respectfully probing the 'why' behind the 'what'. This captures nuance lost in traditional methods.",
                  icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
                  color: "blue",
                },
                {
                  title: "Instantaneous Feedback Loop",
                  description:
                    "See your input reflected in live, aggregated insights immediately. No waiting weeks for reports. Experience the collective pulse forming second by second.",
                  icon: <Clock className="h-10 w-10 text-teal-500" />,
                  color: "teal",
                },
                {
                  title: "Voice & Value",
                  description:
                    "We're challenging the status quo where user data is passively extracted. With your explicit control, your anonymized perspective fuels a unique insights marketplace, creating a model where participation isn't just contribution—it's value creation.",
                  icon: <Users className="h-10 w-10 text-purple-500" />,
                  color: "purple",
                },
                {
                  title: "Uncompromising Neutrality & Privacy",
                  description:
                    "Our AI is meticulously designed for neutrality. Your data, when shared, is rigorously anonymized. Trust and transparency are non-negotiable foundations.",
                  icon: <Shield className="h-10 w-10 text-green-500" />,
                  color: "green",
                },
              ].map((approach, i) => (
                <div
                  key={i}
                  className={`bg-background rounded-xl p-8 border-2 border-${approach.color}-500/20 shadow-lg hover:shadow-xl hover:border-${approach.color}-500/40 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start`}
                >
                  <div className={`bg-${approach.color}-500/10 p-4 rounded-xl flex-shrink-0 md:self-center`}>
                    {approach.icon}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-3 text-${approach.color}-500`}>{approach.title}</h3>
                    <p className="text-lg leading-relaxed">{approach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

        {/* Circular pulse animation */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[800px] h-[800px] opacity-5">
            <div
              className="absolute inset-0 rounded-full border-4 border-primary animate-ping"
              style={{ animationDuration: "4s" }}
            ></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-primary animate-ping"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            ></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-primary animate-ping"
              style={{ animationDuration: "4s", animationDelay: "2s" }}
            ></div>
          </div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold mb-6 border-transparent bg-primary/20 text-primary shadow-sm">
                <Rocket className="mr-2 h-4 w-4" /> The Future
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Imagine a World Tuned In.</h2>
            </div>

            <div className="bg-background rounded-xl p-8 border-2 border-primary/20 shadow-xl mb-12">
              <p className="text-xl leading-relaxed">
                Imagine leaders making decisions with a real-time understanding of public concern. Imagine researchers
                accessing immediate, global sentiment on emerging issues. Imagine journalists grounding stories in
                authentic, current perspectives. Imagine individuals connecting with the diverse tapestry of human
                thought beyond their immediate bubble.{" "}
                <span className="font-bold text-primary">That's the world Global Pulse is building.</span>
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl p-8 border border-primary/10 shadow-lg">
              <p className="text-xl leading-relaxed text-center">
                This isn't just an app; it's a movement towards clarity, understanding, and empowered participation.
                We're building the instrumentation for a more connected and informed global society.{" "}
                <span className="font-bold">Your voice is the signal. Be part of the pulse.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 lg:py-32 bg-muted/30 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Shape the Future of Understanding.</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join us in building the world's first real-time global opinion platform. Your voice matters. Your
              perspective counts. Be part of something bigger.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <AnimatedCTAButton href="/signup">Join Global Pulse Now</AnimatedCTAButton>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 h-14 border-2 hover:border-primary/50 transition-all group"
                asChild
              >
                <Link href="/explore">
                  Explore Live Insights
                  <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Countries Connected", value: "150+" },
                { label: "Voices Amplified", value: "10M+" },
                { label: "Real-time Updates", value: "24/7" },
                { label: "Global Impact", value: "Immeasurable" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-background rounded-xl p-6 border-2 border-primary/10 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
