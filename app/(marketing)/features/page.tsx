import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Cpu, Sparkles, Zap, Globe, MessageSquareText, Lock, ArrowRight } from "lucide-react"
// Dynamic imports for client components to enable code splitting
import dynamic from "next/dynamic"

// Import server component directly
import FeatureShowcase from "@/components/features/feature-showcase";
// ScrollToTop is already in the main layout

// Dynamic imports with loading fallbacks for client components
const AnimatedCTAButton = dynamic(() => import("@/components/marketing/animated-cta-button"), {
  loading: () => <Button size="lg" className="h-14 animate-pulse bg-primary/80">Loading...</Button>
});

// No need for dynamic import of ArrowRight as it's already imported above

// Define feature data outside component to prevent recreation on each render
// This data is static and doesn't need to be recreated on each render
const features = [
  {
    title: "Talk It Out: Go Deeper Than the Data with Pulse AI",
    description:
      "Forget static polls. Engage in unscripted, natural dialogue with Pulse, our meticulously neutral AI. Pulse doesn't just ask what you think; it helps uncover why. It listens, clarifies, and contextually introduces seamless ways (like sliders or quick choices appearing mid-chat) to capture specific nuances, untangling complexity and adding rich, qualitative depth to the global picture.",
    icon: <MessageSquareText className="h-8 w-8 text-teal-400" />,
    colorClass: "teal",
    image: "/placeholder.svg?height=300&width=400&text=AI+Chat+UI",
    benefits: [
      "Uncover the 'Why': Understand the reasoning, context, and emotion behind opinions, not just the numbers.",
      "Context is King: Pulse asks relevant follow-up questions, adapting intelligently to your unique perspective.",
      "Feels Like a Conversation, Not an Interrogation: Share your thoughts naturally and comfortably.",
      "Seamless Data Capture: Provide structured input effortlessly without ever leaving the chat flow."
    ],
    buttonText: "Start Chatting with Pulse"
  },
  {
    title: "Rapid Pulse Check: Your Opinion, Instantly Visualized",
    description:
      "Need speed? Dive into our streamlined Survey Feed. Answer focused questions one tap at a time, filtering by topics that ignite your interest. There's no waiting weeks for reports here. Experience the immediate gratification of seeing your individual input instantly merge into the live, evolving global consensus visualized on our Explore hub.",
    icon: <Zap className="h-8 w-8 text-blue-400" />,
    colorClass: "blue",
    image: "/placeholder.svg?height=300&width=400&text=Survey+Feed+UI",
    benefits: [
      "Effortless Input: Share your crucial perspective with a single tap or click.",
      "Focus Your Feed: Zero in on the specific topics that matter most to you, ignoring the rest.",
      "See the Impact Instantly: Watch global results shift the moment you contribute your voice.",
      "Comprehensive Coverage: Efficiently contribute to a broad range of quantitative data points."
    ],
    buttonText: "Take a Quick Survey"
  },
  {
    title: "Witness the World Thinking: Your Real-Time Insight Hub",
    description:
      "This is where the magic happens. Step into the Explore hub—a living dashboard of global consciousness. Browse topics, search for specific questions, and dive deep into dynamic charts that update second-by-second as opinions flow in from across the planet. It's not static data; it's the world's perspective unfolding live before your eyes.",
    icon: <Globe className="h-8 w-8 text-indigo-400" />,
    colorClass: "indigo",
    image: "/placeholder.svg?height=300&width=400&text=Explore+Hub+UI",
    benefits: [
      "Dynamic Data, Dynamic Charts: Don't just see snapshots; watch global sentiment shift and evolve live.",
      "Discover Trending Topics: Instantly identify what the world is talking about right now.",
      "Slice & Dice the Data: Filter insights by demographics, region, topic, and time to uncover hidden patterns.",
      "Intuitive Visualization: Understand complex data easily through clear, interactive charts and metrics."
    ],
    buttonText: "Explore Global Insights Now"
  },
  {
    title: "AI-Powered Clarity: From Raw Data to Actionable Insights",
    description:
      "Raw data is just the beginning. Global Pulse leverages advanced AI directly within the Explore hub to help you make sense of it all. Generate concise, human-readable summaries that highlight key findings and dominant opinions. Soon, unlock dynamic, AI-curated dashboards that reveal compelling comparisons and insights you might otherwise miss, transforming complexity into clarity.",
    icon: <Sparkles className="h-8 w-8 text-purple-400" />,
    colorClass: "purple",
    image: "/placeholder.svg?height=300&width=400&text=AI+Insights+UI",
    benefits: [
      "Beyond the Numbers: Get concise, AI-written narratives that explain the trends and stories within the data.",
      "Spot Emerging Shifts: Our AI helps identify subtle changes, correlations, and points of interest.",
      "Effortless Understanding: Make sense of vast amounts of global opinion data quickly and easily.",
      "Curated Views (Coming Soon): Access dynamically generated dashboards focused on key comparisons and insights."
    ],
    buttonText: "See AI Insights in Action"
  },
  {
    title: "Engineered for Instantaneity: Feel the Difference",
    description:
      "Global Pulse isn't just powerful; it's fast. Meticulously built using Next.js 15, React 19, optimized Supabase interactions, and leveraging Upstash Redis for caching and speed, the entire platform is architected for an \"instant feel.\" Experience seamless navigation, immediate feedback, and real-time updates without the lag.",
    icon: <Cpu className="h-8 w-8 text-rose-400" />,
    colorClass: "rose",
    image: "/placeholder.svg?height=300&width=400&text=Tech+Stack+Visual",
    benefits: [
      "Instant Loading & Interactions: No more waiting. Explore data and share opinions fluidly.",
      "Truly Real-Time: Experience live data updates without frustrating delays or constant refreshing.",
      "Responsive Everywhere: Enjoy a consistently fast experience, whether on desktop or mobile.",
      "Built for Global Scale: Our architecture handles millions of voices effortlessly, maintaining performance."
    ],
    buttonText: "Discover Our Tech Edge"
  },
  {
    title: "Participate with Confidence: Security & Privacy First",
    description:
      "Your voice is valuable, and your trust is paramount. Global Pulse is built on a foundation of security and privacy. We utilize industry-standard secure authentication (via Supabase Auth). All publicly displayed insights and future marketplace data are rigorously anonymized. You remain in control, with clear options (coming soon) to manage how your anonymized contributions are used.",
    icon: <Lock className="h-8 w-8 text-lime-400" />,
    colorClass: "lime",
    image: "/placeholder.svg?height=300&width=400&text=Privacy+Shield",
    benefits: [
      "Rock-Solid Security: Robust authentication and data handling practices protect your account and contributions.",
      "Aggregated, Not Individual: Public insights always reflect the collective, never exposing individual responses.",
      "Privacy by Design: Anonymization is baked into our aggregation processes.",
      "You're In Control: Clear consent management for future features like the Insights Marketplace."
    ],
    buttonText: "Read Our Privacy Commitment"
  },
]

// Preconnect to image domain to improve loading performance
export const metadata = {
  title: 'Global Pulse Features | Experience Real-Time Global Understanding',
  description: 'Explore the unique features of Global Pulse. See how our AI chat, instant survey feed, real-time visualizations, and cutting-edge tech deliver unparalleled global insights.',
  // Add link rel="preconnect" for any external domains used for images
  links: [
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
  ],
}

export default function FeaturesPage() {
  return (
    <>
      {/* Unique Hero Section */}
      <section className="relative py-28 md:py-40 lg:py-48 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-[0.03] pointer-events-none"></div>
        {/* Glowing effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[600px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full animate-pulse"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> The Global Pulse Engine
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight bg-gradient-to-r from-white via-gray-300 to-gray-500 text-transparent bg-clip-text">
              Beyond the Buzz: Experience the Real Global Pulse.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Stop navigating the noise. Discover how Global Pulse&apos;s unique fusion of intelligent AI conversation, lightning-fast data collection, and dynamic visualization transforms raw global opinions into living, breathing insights you can explore and understand—instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <AnimatedCTAButton href="/signup">Get Started Free</AnimatedCTAButton>
              <Button variant="outline" size="lg" className="h-14 border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/explore">See Live Insights Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="space-y-24 md:space-y-32">
            {/* Use a more efficient way to render the features */}
            {features.map((feature, index) => (
              <FeatureShowcase 
                key={feature.title} 
                feature={feature} 
                index={index} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Highlight Section */}
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
            {
              [
                "Next.js 15",
                "React 19",
                "Vercel AI SDK",
                "Supabase",
                "Upstash Redis",
                "Tailwind CSS",
                "TypeScript",
              ].map((tech) => (
                <div key={tech} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary/70" />
                  <span className="font-medium">{tech}</span>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-t from-primary/5 via-background to-background border-t">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Stop Guessing. Start Knowing. Feel the Global Pulse.
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              The world is constantly speaking. Are you ready to listen? Global Pulse offers the most immediate, nuanced, and accessible window into collective human perspective ever created. Sign up free today, lend your voice to the global conversation, and start exploring insights that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedCTAButton href="/signup">Sign Up - It&apos;s Free</AnimatedCTAButton>
              <Button size="lg" variant="outline" className="gap-2 h-14 text-base" asChild>
                <Link href="/explore">
                  Explore the Platform <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ScrollToTop is already in the main layout */}
    </>
  )
}
