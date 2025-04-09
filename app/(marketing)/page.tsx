import {
  AiConversationClient,
  AnimatedStatClient,
  DataVisualizationClient,
  GlobalMapClient,
  RegionalEngagementClient,
  SurveyFeedClient
} from "@/components/client-wrappers"
import AnimatedCTAButton from "@/components/marketing/animated-cta-button"
import TopicEngagementSkeleton from "@/components/marketing/topic-engagement-skeleton"
import TrustedByLogos from "@/components/marketing/trusted-by-logos"
import ScrollToTopButton from "@/components/scroll-to-top-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BarChartBig,
  Brain,
  CheckCircle2,
  ChevronRight,
  Globe,
  Lock,
  MessageSquareText,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Suspense } from "react"

// Dynamically import heavy components with proper loading states
const TopicEngagement = dynamic(() => import("@/components/marketing/topic-engagement"), {
  loading: () => <TopicEngagementSkeleton />,
  ssr: true,
})

// Client components with ssr: false are imported from client-wrappers.tsx
// which is marked with 'use client'

// Optimized feature card component
const FeatureCard = dynamic(() => import("@/components/marketing/feature-card"), {
  ssr: true,
})

export default function HomePage() {
  return (
    <>
      {/* Hero Section - Bold, Visionary, Conversion-Focused */}
      <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-40 w-48 h-48 bg-blue-300/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-teal-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Decorative dots pattern */}
        <div className="absolute right-0 top-1/4 w-1/3 h-1/2 opacity-20 pointer-events-none">
          <div className="absolute inset-0 grid grid-cols-8 gap-4">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            ))}
          </div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="flex flex-col gap-8 max-w-[640px]">
              {/* Attention-grabbing badge */}
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold border-transparent bg-primary/20 text-primary w-fit animate-fade-in shadow-sm">
                <Zap className="mr-2 h-4 w-4" /> Revolutionizing Global Opinion
              </div>

              {/* Clear, compelling headline */}
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl/none lg:text-8xl/none">
                <span className="bg-gradient-to-r from-blue-200 via-primary/60 to-blue-200/60 text-transparent bg-clip-text inline-block">
                  The World&apos;s Pulse.
                </span>
                <br />
                <span>In Real Time.</span>
              </h1>

              {/* Concise, benefit-focused subheading */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px] leading-relaxed">
                Share your voice, explore diverse perspectives, and witness opinions unfold live across the planet—all
                in one powerful platform.
              </p>

              {/* Strong, action-oriented CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-5 mt-4">
                <AnimatedCTAButton href="/signup">Get Started — Free</AnimatedCTAButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 h-12 border-2 hover:border-primary/50 transition-all"
                  asChild
                >
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>

              {/* Social proof elements */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6 pt-6 border-t border-border/40">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="inline-block h-12 w-12 rounded-full ring-4 ring-background overflow-hidden bg-muted flex items-center justify-center text-primary font-bold shadow-md"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">10,000+</span> voices already joined, with{" "}
                    <span className="font-medium text-foreground">4.9/5</span> average rating
                  </p>
                </div>
              </div>
            </div>

            {/* Visually engaging hero image with interactive elements */}
            <div className="relative lg:ml-auto">
              <div className="relative rounded-2xl border-2 border-primary/20 bg-background p-4 shadow-2xl transition-all hover:shadow-primary/5 hover:border-primary/30">
                <div className="absolute -top-5 -left-5 bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium shadow-lg">
                  Live Global Sentiment
                </div>
                <div className="rounded-xl overflow-hidden">
                  <GlobalMapClient />
                </div>
                <div className="absolute -bottom-5 -right-5 bg-blue-300 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg">
                  Updated in real-time
                </div>
              </div>

              {/* Floating stats cards for visual interest */}
              <div className="absolute -top-8 -right-8 bg-background rounded-xl border-2 border-primary/10 shadow-xl p-3 text-sm transform rotate-3 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>
                    <span className="font-bold">150+</span> countries
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-background rounded-xl border-2 border-primary/10 shadow-xl p-3 text-sm transform -rotate-3 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>
                    <span className="font-bold">10M+</span> opinions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the page content... */}
      {/* Trusted By Section */}
      <section className="w-full py-12 border-y border-border/40 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <h2 className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by leading organizations worldwide
            </h2>
            <TrustedByLogos />
          </div>
        </div>
      </section>

      {/* Value Proposition Section - Clear Benefits */}
      <section id="benefits" className="w-full py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold border-transparent bg-primary/20 text-primary w-fit">
              <Sparkles className="mr-2 h-4 w-4" /> Why Global Pulse
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              One platform, <span className="text-primary">endless insights</span>
            </h2>
            <p className="max-w-[700px] text-xl text-muted-foreground">
              Global Pulse transforms how you understand and interact with public opinion
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-10 w-10 text-primary" />,
                title: "Global Reach",
                description:
                  "Access opinions from 150+ countries in real-time, breaking through geographical and cultural barriers.",
              },
              {
                icon: <Zap className="h-10 w-10 text-primary" />,
                title: "Instant Insights",
                description:
                  "Watch opinions form and evolve in real-time, with powerful visualization tools that reveal patterns instantly.",
              },
              {
                icon: <Brain className="h-10 w-10 text-primary" />,
                title: "AI-Powered Analysis",
                description:
                  "Our advanced AI identifies trends, sentiment shifts, and emerging topics before they hit mainstream awareness.",
              },
              {
                icon: <MessageSquareText className="h-10 w-10 text-primary" />,
                title: "Meaningful Conversations",
                description:
                  "Engage in AI-facilitated discussions that capture nuanced opinions beyond simple yes/no responses.",
              },
              {
                icon: <BarChartBig className="h-10 w-10 text-primary" />,
                title: "Powerful Visualization",
                description:
                  "Transform complex data into intuitive, interactive visualizations that tell the story behind the numbers.",
              },
              {
                icon: <Lock className="h-10 w-10 text-primary" />,
                title: "Privacy-Focused",
                description:
                  "Share your opinions freely with our secure, privacy-first platform that puts you in control of your data.",
              },
            ].map((benefit, i) => (
              <FeatureCard key={i} icon={benefit.icon} title={benefit.title} description={benefit.description} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section - Clear, Visual Process */}
      <section id="how-it-works" className="w-full py-24 md:py-32 lg:py-40 bg-muted/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M400,0 L400,800 L0,800 C200,600 350,400 400,0 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 mb-20">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold border-transparent bg-secondary text-secondary-foreground w-fit shadow-sm">
              How It Works
            </div>
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Three ways to <span className="text-primary">engage</span> with the world
            </h2>
            <p className="max-w-[700px] text-xl text-muted-foreground">
              Global Pulse offers multiple ways to share your voice and explore global sentiment
            </p>
          </div>

          <div className="grid gap-24 lg:gap-32">
            {/* AI-Led Conversations */}
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex items-center justify-center order-last lg:order-first">
                <div className="relative w-full max-w-[550px] rounded-2xl border-2 border-primary/20 bg-background p-4 shadow-2xl transition-all hover:shadow-primary/5 hover:border-primary/40 group">
                  <AiConversationClient />
                  <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                    Feature 1
                  </div>

                  {/* Animated pulse effect */}
                  <div className="absolute -z-10 inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageSquareText className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold">AI-Led Conversations</h3>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Engage in meaningful dialogue with Pulse, our neutral AI. Share nuanced thoughts on complex topics and
                  answer context-aware questions embedded directly in the chat.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg">Natural conversation flow that captures the &apos;why&apos; behind opinions</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg">Contextual follow-up questions that adapt to your responses</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg">Sentiment analysis that helps understand emotional context</span>
                  </li>
                </ul>
                <div className="pt-6">
                  <Button size="lg" className="group" asChild>
                    <Link href="/signup">
                      Try AI Conversations
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Survey Feed */}
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[550px] rounded-2xl border-2 border-bluebg-blue-300/20 bg-background p-4 shadow-2xl transition-all hover:shadow-bluebg-blue-300/5 hover:border-bluebg-blue-300/40 group">
                  <SurveyFeedClient />
                  <div className="absolute -top-4 -right-4 bg-blue-300 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                    Feature 2
                  </div>

                  {/* Animated pulse effect */}
                  <div className="absolute -z-10 inset-0 rounded-2xl bg-blue-300/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-300/10 text-bluebg-blue-300">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold">Quick Survey Feed</h3>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Prefer speed? Tap through focused questions one-by-one in our dedicated survey feed. Filter by topic
                  and see results instantly as they come in from around the world.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-blue-300/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-bluebg-blue-300" />
                    </div>
                    <span className="text-lg">One-tap responses for quick participation</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-blue-300/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-bluebg-blue-300" />
                    </div>
                    <span className="text-lg">Topic-based filtering to focus on what matters to you</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-blue-300/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-bluebg-blue-300" />
                    </div>
                    <span className="text-lg">Instant result visualization as responses come in</span>
                  </li>
                </ul>
                <div className="pt-6">
                  <Button size="lg" className="bg-blue-300 hover:bg-blue-200 group" asChild>
                    <Link href="/signup">
                      Explore Quick Surveys
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Real-Time Exploration */}
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex items-center justify-center order-last lg:order-first">
                <div className="relative w-full max-w-[550px] rounded-2xl border-2 border-teal-500/20 bg-background p-4 shadow-2xl transition-all hover:shadow-teal-500/5 hover:border-teal-500/40 group">
                  <DataVisualizationClient />
                  <div className="absolute -top-4 -left-4 bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                    Feature 3
                  </div>

                  {/* Animated pulse effect */}
                  <div className="absolute -z-10 inset-0 rounded-2xl bg-teal-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                  <BarChartBig className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold">Real-Time Exploration</h3>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Watch global opinions shift live on our Explore page. Dive into dynamic charts, AI summaries, and
                  insight dashboards that update in real-time as new data flows in.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-teal-500/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    </div>
                    <span className="text-lg">Live-updating visualizations that show opinion shifts</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-teal-500/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    </div>
                    <span className="text-lg">AI-generated insight summaries that highlight key trends</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 bg-teal-500/10 p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    </div>
                    <span className="text-lg">Demographic and geographic filtering for targeted analysis</span>
                  </li>
                </ul>
                <div className="pt-6">
                  <Button size="lg" className="bg-teal-500 hover:bg-teal-600 group" asChild>
                    <Link href="/signup">
                      View Live Insights
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Data Visualization Section - Interactive Demo */}
      <section className="w-full py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold border-transparent bg-destructive/20 text-destructive w-fit">
              <Zap className="mr-2 h-4 w-4" /> Live Data
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Witness Global Opinion <span className="text-primary">in Real-Time</span>
            </h2>
            <p className="max-w-[700px] text-xl text-muted-foreground">
              See how perspectives shift and evolve across the globe as they happen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Trending Topics
                    </span>
                    <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div> Live Data
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Wrap in Suspense for streaming */}
                  <Suspense fallback={<TopicEngagementSkeleton />}>
                    <TopicEngagement />
                  </Suspense>
                </CardContent>
              </Card>

              <RegionalEngagementClient />
            </div>

            <div>
              <DataVisualizationClient />
            </div>
          </div>

          {/* CTA for data section */}
          <div className="mt-12 text-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/explore">
                Explore All Live Data
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced Social Proof */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-muted/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="absolute left-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 L0,800 L400,800 C200,600 50,400 0,0 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Decorative quotes */}
        <div className="absolute top-20 right-20 text-primary/10 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10,7 L8,11 L11,11 L11,17 L5,17 L5,11 L7,7 L10,7 Z M18,7 L16,11 L19,11 L19,17 L13,17 L13,11 L15,7 L18,7 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 mb-16">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold border-transparent bg-primary/20 text-primary w-fit shadow-sm">
              <Users className="mr-2 h-4 w-4" /> User Stories
            </div>
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Voices from our <span className="text-primary">global community</span>
            </h2>
            <p className="max-w-[700px] text-xl text-muted-foreground">
              Hear from people around the world who are using Global Pulse to connect and understand
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Global Pulse has completely changed how I understand public opinion. The real-time insights are invaluable for my research work.",
                name: "Dr. Rebecca Chen",
                role: "Social Researcher",
                location: "Singapore",
              },
              {
                quote:
                  "I love how easy it is to participate in surveys and see the results instantly. The AI chat feature is surprisingly engaging and thoughtful.",
                name: "Marcus Johnson",
                role: "Marketing Director",
                location: "United States",
              },
              {
                quote:
                  "As a journalist, Global Pulse gives me access to public sentiment in ways traditional polling never could. It's become an essential tool in my reporting.",
                name: "Sarah Patel",
                role: "Investigative Journalist",
                location: "United Kingdom",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-background border-2 border-primary/5 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-300 overflow-hidden group card-hover-effect"
              >
                <CardContent className="p-8 relative">
                  {/* Background quote icon */}
                  <div className="absolute top-4 right-4 text-primary/5 group-hover:text-primary/10 transition-colors">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10,7 L8,11 L11,11 L11,17 L5,17 L5,11 L7,7 L10,7 Z M18,7 L16,11 L19,11 L19,17 L13,17 L13,11 L15,7 L18,7 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg text-muted-foreground italic relative z-10">{testimonial.quote}</p>
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="h-14 w-14 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}, {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional social proof metrics */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStatClient
              value="10M+"
              label="Opinions Shared"
              icon={<MessageSquareText className="h-10 w-10 text-primary" />}
            />
            <AnimatedStatClient
              value="150+"
              label="Countries Represented"
              icon={<Globe className="h-10 w-10 text-primary" />}
            />
            <AnimatedStatClient value="4.9/5" label="User Satisfaction" icon={<Star className="h-10 w-10 text-primary" />} />
            <AnimatedStatClient value="92%" label="User Retention" icon={<Users className="h-10 w-10 text-primary" />} />
          </div>
        </div>
      </section>

      {/* CTA Section - Strong Conversion Focus */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-primary/10 via-background to-background border-t">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-bold tracking-tighter md:text-5xl/tight lg:text-6xl">
                  Join the global conversation. <span className="text-primary">Make your voice heard.</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Sign up free today, share your perspective, and start exploring real-time global insights. Join
                  thousands of users already making their voices heard.
                </p>

                {/* Feature list to reinforce value */}
                <ul className="space-y-4 mt-2">
                  <li className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                    <span className="text-lg">Free account with full access to global insights</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                    <span className="text-lg">No credit card required to get started</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                    <span className="text-lg">Privacy-first platform with secure data handling</span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-5 mt-6">
                  <AnimatedCTAButton href="/signup">Get Started — Free</AnimatedCTAButton>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 h-14 border-2 hover:border-primary/50 transition-all"
                    asChild
                  >
                    <Link href="/login">Log In</Link>
                  </Button>
                </div>

                {/* Trust indicators */}
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-4 bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                  Your data is secure and private. We never sell your personal information.
                </p>
              </div>

              <div className="relative lg:ml-auto order-first lg:order-last">
                <div className="relative rounded-2xl border-2 border-primary/20 bg-background p-4 shadow-2xl">
                  <GlobalMapClient showPulse={true} className="h-[400px]" />

                  {/* Floating elements for visual interest */}
                  <div className="absolute -top-8 -right-8 bg-primary text-white p-4 rounded-full shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
                    <Rocket className="h-8 w-8" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-background border-2 border-primary text-primary px-5 py-2 rounded-xl text-sm font-bold shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                    Your voice matters
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to top button */}
      <ScrollToTopButton />
    </>
  )
}
