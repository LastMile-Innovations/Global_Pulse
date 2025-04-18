import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Suspense } from 'react'
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
  Brain,
  Code2,
  ArrowRight,
  Github,
  Lightbulb,
  HeartHandshake,
} from "lucide-react"
import AnimatedCTAButton from "@/components/marketing/animated-cta-button"

export default function MissionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">

        {/* === Section 1: Hero (The Problem) === */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-background">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-8 bg-primary/10 text-primary">
                The Challenge
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 leading-tight text-balance">
                The World is Speaking.
                <br />
                <span className="text-primary">Are We Listening Deeply?</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto text-balance">
                We're drowning in data yet starved for understanding. Traditional methods fail to capture the nuance and speed of human perspective.
              </p>
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 text-left shadow-md max-w-3xl mx-auto">
                <p className="text-lg md:text-xl leading-relaxed">
                  Snapshots like polls miss the 'why'. Social media reflects algorithms more than authenticity. Decisions impacting billions are often made with outdated, incomplete maps of public sentiment. <span className="font-bold text-primary">This lack of deep listening hinders progress and connection.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === Section 2: Founder's Note (Ethos/Origin) === */}
        <section className="py-20 md:py-28 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">From Frustration to Focus: Our Origin</h2>
                <p className="text-lg text-muted-foreground text-balance">Why build another platform in a noisy world?</p>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground">
                <blockquote>
                  <p className="text-xl leading-relaxed">
                    "We're hyper-connected, yet constantly talking past each other... We're navigating our inner lives and the chaotic world with flimsy maps, reacting on instinct when we *could* be responding with awareness. Standard tools fail us. Sentiment analysis? Skin deep. Surveys? Stale snapshots. I saw this deficit of deep understanding and knew we needed something radically different."
                  </p>
                </blockquote>
                <p className="text-lg leading-relaxed mt-6">
                  Global Pulse wasn't born in a boardroom; it began as a rapid-prototype hackathon project fueled by a conviction: technology could help us listen better – to the world, and perhaps even to ourselves. It started as an attempt to build a <strong className="text-primary">dynamic mirror for human perspective</strong>, grounded in transparency and respect from day one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === Section 3: Our Mandate & How We Listen (The Core Idea & Method) === */}
        <section className="py-20 md:py-28 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                 <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-6 bg-primary/10 text-primary">
                   Our Approach
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
                  Mandate: <span className="text-primary">Amplify Authentic Voice. Illuminate Real-Time Understanding.</span>
                </h2>
                <p className="text-xl text-muted-foreground text-balance">
                    We're building the world's real-time barometer of human perspective by listening differently.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Card 1: Conversational Depth */}
                <div className="bg-card rounded-lg p-6 border border-border shadow-md flex flex-col items-start">
                  <div className="flex items-center mb-3">
                     <div className="bg-primary/10 p-3 rounded-lg mr-3">
                       <MessageSquare className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-xl font-bold">Conversational Depth</h3>
                  </div>
                  <p className="text-muted-foreground flex-grow">Instead of static questions, our AI engages in nuanced, respectful dialogue to capture the 'why' behind the 'what', revealing insights lost in traditional methods.</p>
                </div>

                {/* Card 2: Real-Time Feedback */}
                <div className="bg-card rounded-lg p-6 border border-border shadow-md flex flex-col items-start">
                   <div className="flex items-center mb-3">
                     <div className="bg-primary/10 p-3 rounded-lg mr-3">
                       <Clock className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-xl font-bold">Real-Time Pulse</h3>
                  </div>
                  <p className="text-muted-foreground flex-grow">See individual perspectives contribute to the collective understanding instantly. No waiting weeks for reports – experience the dynamic global sentiment as it forms.</p>
                </div>

                {/* Card 3: Ethical Architecture */}
                 <div className="bg-card rounded-lg p-6 border border-border shadow-md flex flex-col items-start">
                   <div className="flex items-center mb-3">
                     <div className="bg-primary/10 p-3 rounded-lg mr-3">
                       <Shield className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-xl font-bold">Ethical Architecture</h3>
                  </div>
                  <p className="text-muted-foreground flex-grow">Privacy isn't an afterthought; it's coded in. Granular consent, rigorous anonymization, AI neutrality, and active safety guardrails are non-negotiable foundations.</p>
                   <Link href="/ethics" className="mt-4 text-sm text-primary hover:underline inline-flex items-center">
                    Our Full Ethics Commitment <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>

                 {/* Card 4: Open & Collaborative */}
                 <div className="bg-card rounded-lg p-6 border border-border shadow-md flex flex-col items-start">
                   <div className="flex items-center mb-3">
                     <div className="bg-primary/10 p-3 rounded-lg mr-3">
                       <Code2 className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-xl font-bold">Open & Collaborative</h3>
                  </div>
                  <p className="text-muted-foreground flex-grow">Critical technology requires scrutiny. Our core engine logic is open source (AGPLv3). We invite the community to inspect, challenge, and help us build responsibly.</p>
                  <Link href="https://github.com/LastMile-Innovations/Global_Pulse.git" target="_blank" rel="noopener noreferrer" className="mt-4 text-sm text-primary hover:underline inline-flex items-center">
                    View Repository <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === Section 4: The Vision (Impact) === */}
        <section className="py-20 md:py-28 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                 <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-6 bg-primary/10 text-primary">
                   Our Vision
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">A World Connected by Deeper Understanding</h2>
                 <p className="text-xl text-muted-foreground text-balance">
                    We're building tools for insight – personal and collective – moving beyond surface-level data.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Vision for Individuals */}
                <div className="bg-card rounded-lg p-8 border border-border shadow-lg">
                    <div className="flex items-center mb-4">
                      <Brain className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                      <h3 className="text-2xl font-bold">For Individuals: The Self-Awareness Engine</h3>
                    </div>
                    <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                      Imagine a dashboard for your <strong>internal operating system</strong>. See how your core <code>Values</code>, <code>Needs</code>, and hidden <code>Beliefs</code> interact with daily life. This isn't therapy; it's the user manual to your mind, fostering conscious responses over autopilot reactions.
                    </p>
                     <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>Understand personal triggers</span></li>
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>Align actions with core values</span></li>
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>Navigate emotions with clarity</span></li>
                    </ul>
                </div>

                 {/* Vision for the World */}
                 <div className="bg-card rounded-lg p-8 border border-border shadow-lg">
                    <div className="flex items-center mb-4">
                       <Globe className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                      <h3 className="text-2xl font-bold">For the World: The Collective Barometer</h3>
                    </div>
                    <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                      Imagine leaders accessing real-time public concern, researchers understanding societal trends with rich context, and businesses aligning with genuine human needs. We provide the <strong>shared heartbeat</strong> – anonymously and ethically.
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>Inform better public policy</span></li>
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>Foster empathy across divides</span></li>
                      <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>Enable responsible innovation</span></li>
                    </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === Section 5: Join Us (Call to Action) === */}
        <section className="py-20 md:py-28 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
               <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-6 bg-primary/10 text-primary">
                  Get Involved
                </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Shape the Future of Understanding.</h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
                The journey to deeper understanding requires collective effort. Join us in building a more informed, empathetic world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <AnimatedCTAButton href="/waitlist">Join the Waitlist</AnimatedCTAButton>
                <Button size="lg" variant="outline" className="h-14 rounded-full" asChild>
                  <Link href="/explore">
                    Explore Live Insights (Demo)
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                {/* Contribute Card */}
                <div className="bg-card rounded-lg p-6 border border-border shadow-md text-left flex flex-col">
                  <div className="flex items-center mb-3">
                    <Github className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
                    <h4 className="font-bold text-lg">Contribute & Collaborate</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    Explore our open-source core engine, report issues, or discuss research partnerships.
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
                    <Link href="https://github.com/LastMile-Innovations/Global_Pulse.git" target="_blank" rel="noopener noreferrer">
                      View on GitHub <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Learn More Card */}
                <div className="bg-card rounded-lg p-6 border border-border shadow-md text-left flex flex-col">
                  <div className="flex items-center mb-3">
                    <HeartHandshake className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
                    <h4 className="font-bold text-lg">Our Principles</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    Understand the ethical framework and safety measures guiding our development.
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
                    <Link href="/ethics">
                      Read Ethical Framework <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </Suspense>
  );
}

