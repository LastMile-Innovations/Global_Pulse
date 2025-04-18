import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bolt,
  Code,
  Flame,
  Globe,
  Rocket,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  Users,
  Heart,
  Lightbulb,
  Cpu,
  LineChart,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-background overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-8 bg-primary/10 text-primary">
              <Flame className="mr-2 h-4 w-4" /> Vercel Hackathon Contender
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight">
              We&apos;re not just building an app.
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text">
                We&apos;re starting a movement.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
              Global Pulse is more than a platform—it&apos;s a revolution in how the world shares opinions. Built in just 10 days for the Vercel Hackathon, we&apos;re here to make waves.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="lg" className="gap-2 h-12 text-base group relative overflow-hidden bg-primary hover:bg-primary/90" asChild>
                <Link href="/signup">
                  <span className="relative z-10 flex items-center">
                    Join the revolution{" "}
                    <Rocket className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </Button>
              <div className="relative pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-10 before:w-px before:bg-border">
                <p className="text-muted-foreground font-medium">
                  <span className="inline-block bg-primary/10 text-primary font-bold px-2 py-1 rounded">10 days.</span>{" "}
                  That&apos;s all it took to build the future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-primary/10 border-y border-primary/20">
        <div className="container px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "10", label: "Days to Build", icon: <Clock className="h-5 w-5 text-primary" /> },
              { value: "1", label: "Developer", icon: <Code className="h-5 w-5 text-primary" /> },
              { value: "1", label: "Continent", icon: <Globe className="h-5 w-5 text-primary" /> },
              { value: "∞", label: "Potential", icon: <Sparkles className="h-5 w-5 text-primary" /> },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-2">{stat.icon}</div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Hackathon Story */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 bg-primary text-primary-foreground">
                <Bolt className="mr-2 h-4 w-4" /> The 10-Day Sprint
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 leading-tight">
                From zero to <span className="text-primary">game-changer</span> in less than two weeks
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  Global Pulse was conceived and built in just 10 days for the Vercel Hackathon. The goal: create a revolutionary platform that changes how the world shares opinions.
                </p>
                <p>
                  The mission? Build a platform that would change how the world shares opinions—and do it in just 10 days.
                </p>
                <p>
                  Every aspect of the technical architecture, wireframes, and implementation was completed in this short window, with base colors and logo contributed by others.
                </p>
                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/30 rounded-full"></div>
                    <blockquote className="pl-6 italic text-muted-foreground">
                      &quot;We&apos;re not just participating in a hackathon. We&apos;re showing the world what&apos;s possible when you combine vision, talent, and modern tech.&quot;
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl flex items-center justify-center min-h-[300px] bg-card">
                <div className="flex flex-col items-center justify-center w-full h-full p-8">
                  <Rocket className="h-16 w-16 text-primary mb-4" />
                  <div className="text-lg font-bold text-foreground">10 days. 1 developer. 1 vision.</div>
                </div>
              </div>
              <div className="absolute -right-4 top-1/4 bg-background border-2 border-primary text-primary font-bold px-3 py-1 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:-rotate-3">
                Day 1: Concept
              </div>
              <div className="absolute -left-4 top-2/4 bg-background border-2 border-primary text-primary font-bold px-3 py-1 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:rotate-3">
                Day 5: MVP
              </div>
              <div className="absolute -right-4 bottom-1/4 bg-background border-2 border-primary text-primary font-bold px-3 py-1 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:-rotate-3">
                Day 10: Launch
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Timeline */}
      <section className="py-16 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-secondary/20 px-3 py-1 text-sm font-semibold mb-6 bg-secondary text-secondary-foreground">
              <Clock className="mr-2 h-4 w-4" /> The Timeline
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-10">
              How Global Pulse was built in 10 days
            </h2>
            <div className="relative border-l-2 border-primary/30 pl-8 pb-8 space-y-10">
              {[
                {
                  day: "Day 1-2",
                  title: "Concept & Architecture",
                  description:
                    "The vision was outlined, technical architecture created with Next.js, Supabase, and Upstash Redis, and initial app wireframes built. Base colors and logo were contributed by others.",
                  icon: <Lightbulb className="h-6 w-6 text-primary" />,
                },
                {
                  day: "Day 3-4",
                  title: "Core Infrastructure",
                  description:
                    "Backend systems were built, authentication set up, and the AI logic and user experience began to take shape.",
                  icon: <Cpu className="h-6 w-6 text-secondary" />,
                },
                {
                  day: "Day 5-6",
                  title: "Feature Development",
                  description:
                    "The multi-agent multi-tool engine was implemented using Vercel AI SDK, along with real-time opinion tracking, global visualization, and user authentication systems.",
                  icon: <Code className="h-6 w-6 text-accent" />,
                },
                {
                  day: "Day 7-8",
                  title: "Integration & Testing",
                  description:
                    "All systems were connected and tested. Bugs were fixed and performance optimized across devices.",
                  icon: <LineChart className="h-6 w-6 text-secondary" />,
                },
                {
                  day: "Day 9-10",
                  title: "Polish & Launch",
                  description:
                    "Final UI refinements, performance optimizations, and content creation. The platform was prepared for submission to the Vercel Hackathon.",
                  icon: <Rocket className="h-6 w-6 text-primary" />,
                },
              ].map((phase, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    {phase.icon}
                  </div>
                  <div className="bg-background rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="inline-block bg-primary/10 text-primary text-sm font-bold px-2 py-1 rounded mb-2">
                      {phase.day}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
                    <p className="text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-4 w-4" /> The Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Small team. <span className="text-primary">Big ambition.</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Global Pulse was built in just 10 days, with all technical architecture, features, and user experience designed and implemented by a single developer. Base colors and logo were contributed by others.
            </p>
          </div>
        </div>
      </section>

      {/* Global Collaboration Section */}
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 bg-primary/10 text-primary">
              <Globe className="mr-2 h-4 w-4" /> Global Collaboration
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              One continent. <span className="text-primary">One vision.</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Global Pulse was built in the US, with base colors and logo contributed by others. A solo effort with a global mindset.
            </p>
          </div>
          <div className="relative">
            <div className="bg-background rounded-2xl border shadow-lg p-8">
              <div className="grid md:grid-cols-1 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">The power of focused execution</h3>
                  <div className="space-y-4">
                    <p>
                      With a single developer, decisions were made quickly and the vision was executed without compromise. The result: a cohesive, high-quality platform built in record time.
                    </p>
                    <p>
                      While the base colors and logo were contributed by others, every aspect of the technical architecture, user experience, and feature set was designed and implemented in-house.
                    </p>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { label: "Time Zones", value: "1", icon: <Clock className="h-5 w-5 text-primary" /> },
                      { label: "Languages", value: "1", icon: <Globe className="h-5 w-5 text-primary" /> },
                      { label: "Cultures", value: "1", icon: <Users className="h-5 w-5 text-primary" /> },
                    ].map((stat, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="flex justify-center mb-2">{stat.icon}</div>
                        <div className="font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-md"></div>
                  <div className="relative rounded-xl overflow-hidden border flex items-center justify-center min-h-[200px]">
                    <Globe className="h-20 w-20 text-primary" />
                  </div>
                  <div className="absolute top-1/4 -left-4 w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xs font-bold">
                    US
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We'll Win Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 bg-primary/10 text-primary">
              <Trophy className="mr-2 h-4 w-4" /> Why We&apos;ll Win
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-10">
              What makes Global Pulse <span className="text-primary">hackathon-worthy</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              {[
                {
                  title: "Lightning-Fast Performance",
                  description:
                    "Built with Next.js 15 and React 19, we've optimized every aspect of the stack for instant loading and seamless interactions.",
                  icon: <Bolt className="h-10 w-10 text-primary" />,
                  color: "from-primary/20 to-primary/5",
                },
                {
                  title: "Real-Time Global Insights",
                  description:
                    "Our platform delivers instant opinion visualization from around the world, powered by Supabase and Upstash Redis for blazing speed.",
                  icon: <Globe className="h-10 w-10 text-blue-500" />,
                  color: "from-blue-500/20 to-blue-500/5",
                },
                {
                  title: "Revolutionary UX",
                  description:
                    "We've reimagined how users interact with surveys and opinion data, creating an experience that feels magical yet intuitive.",
                  icon: <Sparkles className="h-10 w-10 text-teal-500" />,
                  color: "from-teal-500/20 to-teal-500/5",
                },
                {
                  title: "Built for Scale",
                  description:
                    "From day one, we architected Global Pulse to handle millions of users and opinions with consistent performance and reliability.",
                  icon: <Rocket className="h-10 w-10 text-primary" />,
                  color: "from-primary/20 to-primary/5",
                },
              ].map((feature, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} group-hover:opacity-100 opacity-80 transition-opacity duration-300`}
                  ></div>
                  <div className="relative p-8 rounded-2xl border hover:border-primary/50 transition-colors duration-300">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 p-8 rounded-2xl bg-muted/30 border">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="md:w-1/4 flex justify-center">
                  <div className="relative w-32 h-32">
                    <div
                      className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50"
                      style={{ animationDuration: "3s" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Rocket className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="md:w-3/4">
                  <h3 className="text-2xl font-bold mb-3">Ready to judge? We&apos;re ready to impress.</h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    Global Pulse isn't just a hackathon project—it's a glimpse into the future of global opinion sharing. We've pushed the boundaries of what's possible in 10 days, and we're just getting started.
                  </p>
                  <Button size="lg" className="gap-2 group" asChild>
                    <Link href="/explore">
                      Experience Global Pulse{" "}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Excellence Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-secondary/20 px-3 py-1 text-sm font-semibold mb-6 bg-secondary text-secondary-foreground">
              <Code className="mr-2 h-4 w-4" /> Technical Excellence
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-10">
              Built with the <span className="text-primary">best tools</span> for the job
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-background rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4">Core Framework & Rendering</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Next.js 15:</span> App Router, Server Components, Client Components, Route Handlers, Server Actions, Middleware
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">React 19:</span> Server Component Architecture, Hooks (useState, useEffect, useContext, useOptimistic, useTransition)
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-background rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4">Frontend UI & Styling</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Shadcn UI:</span> Accessible, customizable component library
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Tailwind CSS:</span> Utility-first CSS framework
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Lucide React:</span> Icon library
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-background rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4">Backend & Data</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Supabase:</span> Postgres Database, Auth, Realtime, Row Level Security
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Upstash Redis:</span> High-speed caching, session management, rate limiting
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">TypeScript:</span> Static typing throughout the stack
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-background rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4">AI & Language Models</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Vercel AI SDK:</span> Core library for LLM interactions and streaming UI updates
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Multi-Agent System:</span> Custom-built multi-agent, multi-tool engine
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">LLM Providers:</span> Google Gemini, OpenAI, Anthropic Claude
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Embedding Model:</span> Voyage for semantic search and similarity
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-background rounded-xl p-6 border">
              <h3 className="text-xl font-bold mb-4">What makes our architecture special</h3>
              <p className="mb-4">
                Global Pulse is powered by a sophisticated multi-agent, multi-tool engine built using the Vercel AI SDK. This system enables:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Intelligent, context-aware conversations that capture nuanced opinions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Real-time data processing and visualization of global sentiment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Seamless integration between AI-generated content and user interactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Blazing-fast performance through optimized caching and streaming responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Scalable infrastructure designed to handle millions of users and opinions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Feedback Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 bg-primary/10 text-primary">
              <Heart className="mr-2 h-4 w-4" /> Early Feedback
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              What our <span className="text-primary">early testers</span> are saying
            </h2>
            <p className="text-xl text-muted-foreground">
              We&apos;ve shared Global Pulse with a select group of users during development. Here&apos;s what they think.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                quote:
                  "I've never seen opinion data visualized this beautifully. The real-time updates are mesmerizing to watch.",
                name: "Sarah K.",
                role: "Data Scientist",
              },
              {
                quote: "The speed is what impressed me most. Everything feels instant, even on my older phone.",
                name: "Michael T.",
                role: "UX Researcher",
              },
              {
                quote:
                  "As someone who works with global teams, I can see this becoming an essential tool for understanding diverse perspectives.",
                name: "Priya M.",
                role: "Project Manager",
              },
              {
                quote:
                  "Hard to believe this was built in just 10 days. It feels more polished than products I've used that took years to develop.",
                name: "David L.",
                role: "Software Engineer",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-background rounded-xl p-6 border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div>
                    <p className="italic text-muted-foreground mb-4">{testimonial.quote}</p>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-background border-t">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Join us on this journey</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Global Pulse is more than a hackathon project—it's the beginning of a movement to transform how the world shares opinions. Be part of it from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 h-12 text-base group relative overflow-hidden bg-primary hover:bg-primary/90" asChild>
                <Link href="/signup">
                  <span className="relative z-10 flex items-center">
                    Sign Up Now <Rocket className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 h-12 text-base" asChild>
                <Link href="@https://github.com/LastMile-Innovations/Global_Pulse.git">
                  Star on GitHub{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-github ml-1"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
