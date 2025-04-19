import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Suspense } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  AlertCircle,
} from "lucide-react"
import AnimatedCTAButton from "@/components/marketing/animated-cta-button"

// Enhanced section padding for better rhythm
const sectionPadding = "py-20 md:py-28 lg:py-32";
const containerPadding = "px-4 sm:px-6 lg:px-8"; // Matches layout

export default function MissionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      {/* Removed outer flex container, handled by layout */}
      {/* Removed min-h-screen, layout handles height */}

      {/* Add Prototype Disclaimer - Integrated into layout's container padding */}
      <div className={`pt-12`}> 
          <Alert variant="default" className="mb-10 bg-primary/5 border-primary/20 shadow-sm">
            <AlertCircle className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold">Prototype Status</AlertTitle>
            <AlertDescription>
              This page describes the driving vision and principles behind Global Pulse, an early-stage prototype. Features reflect our design goals, not necessarily current functionality.
            </AlertDescription>
          </Alert>
        </div>

      {/* === Section 1: Hero (The Problem) === */}
      {/* Adjusted padding, increased heading size, refined text balance */}
      <section className={`relative ${sectionPadding} overflow-hidden bg-background`}>
        <div className={`relative z-10`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-6 bg-primary/10 text-primary shadow-sm">
                The Challenge
              </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight text-balance">
                The World is Speaking.
                <br />
                <span className="text-primary">Are We Listening Deeply?</span>
              </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto text-balance">
                We're drowning in data yet starved for understanding. Traditional methods fail to capture the nuance and speed of human perspective.
              </p>
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 text-left shadow-lg max-w-3xl mx-auto">
              <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                  Snapshots like polls miss the 'why'. Social media reflects algorithms more than authenticity. Decisions impacting billions are often made with outdated, incomplete maps of public sentiment. <span className="font-semibold text-primary">This lack of deep listening hinders progress and connection.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* === Section 2: Founder's Note (Ethos/Origin) === */}
      {/* Adjusted padding, refined prose styling if needed (layout handles most) */}
      <section className={`${sectionPadding} bg-muted border-t border-border`}>
        <div className={``}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">From Frustration to Focus: Our Origin</h2>
              <p className="text-lg md:text-xl text-muted-foreground text-balance">Why build another platform in a noisy world?</p>
              </div>
            {/* Layout's prose class handles typography */}
            <blockquote className="border-l-4 border-primary pl-6 italic text-foreground/80 mb-6">
              <p className="text-lg md:text-xl leading-relaxed">
                  "We're hyper-connected, yet constantly talking past each other... We're navigating our inner lives and the chaotic world with flimsy maps, reacting on instinct when we *could* be responding with awareness. Standard tools fail us. Sentiment analysis? Skin deep. Surveys? Stale snapshots. I saw this deficit of deep understanding and knew we needed something radically different."
                </p>
              </blockquote>
            <p className="text-base md:text-lg leading-relaxed mt-6 text-foreground/90">
                Global Pulse wasn't born in a boardroom; it began as a rapid-prototype hackathon project fueled by a conviction: technology could help us listen better – to the world, and perhaps even to ourselves. It started as an attempt to build a <strong className="font-semibold text-primary">dynamic mirror for human perspective</strong>, grounded in transparency and respect from day one.
              </p>
            </div>
          </div>
        </section>

      {/* === Section 3: Our Mandate & How We Listen (The Core Idea & Method) === */}
      {/* Adjusted padding, standardized card styling */}
      <section className={`${sectionPadding} bg-background border-t border-border`}>
        <div className={``}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-6 bg-primary/10 text-primary shadow-sm">
                   Our Approach
                </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
                  Mandate: <span className="text-primary">Amplify Authentic Voice. Illuminate Real-Time Understanding.</span>
                </h2>
              <p className="text-lg md:text-xl text-muted-foreground text-balance">
                    We're building the world's real-time barometer of human perspective by listening differently.
                </p>
              </div>

            {/* Standardized card appearance and spacing */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Card 1: Conversational Depth */}
              <div className="bg-card rounded-lg p-6 border border-border shadow-lg flex flex-col items-start transition-shadow hover:shadow-xl">
                <div className="flex items-center mb-4">
                   <div className="bg-primary/10 p-3 rounded-lg mr-4">
                     <MessageSquare className="h-6 w-6 text-primary" />
                     </div>
                   <h3 className="text-xl font-semibold">Conversational Depth</h3>
                  </div>
                <p className="text-muted-foreground flex-grow mb-4 text-base leading-relaxed">Instead of static questions, our AI engages in nuanced, respectful dialogue to capture the 'why' behind the 'what', revealing insights lost in traditional methods.</p>
                </div>

              {/* Card 2: Real-Time Feedback */}
              <div className="bg-card rounded-lg p-6 border border-border shadow-lg flex flex-col items-start transition-shadow hover:shadow-xl">
                 <div className="flex items-center mb-4">
                   <div className="bg-primary/10 p-3 rounded-lg mr-4">
                     <Clock className="h-6 w-6 text-primary" />
                     </div>
                   <h3 className="text-xl font-semibold">Real-Time Pulse</h3>
                  </div>
                <p className="text-muted-foreground flex-grow mb-4 text-base leading-relaxed">See individual perspectives contribute to the collective understanding instantly. No waiting weeks for reports – experience the dynamic global sentiment as it forms.</p>
                </div>

              {/* Card 3: Ethical Architecture */}
               <div className="bg-card rounded-lg p-6 border border-border shadow-lg flex flex-col items-start transition-shadow hover:shadow-xl">
                 <div className="flex items-center mb-4">
                   <div className="bg-primary/10 p-3 rounded-lg mr-4">
                     <Shield className="h-6 w-6 text-primary" />
                     </div>
                   <h3 className="text-xl font-semibold">Ethical Architecture</h3>
                  </div>
                <p className="text-muted-foreground flex-grow mb-4 text-base leading-relaxed">Privacy isn't an afterthought; it's coded in. Granular consent, rigorous anonymization, AI neutrality, and active safety guardrails are non-negotiable foundations.</p>
                 <Link href="/ethics" className="mt-auto text-sm text-primary hover:underline inline-flex items-center font-medium">
                    Our Full Ethics Commitment <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>

               {/* Card 4: Open & Collaborative */}
               <div className="bg-card rounded-lg p-6 border border-border shadow-lg flex flex-col items-start transition-shadow hover:shadow-xl">
                 <div className="flex items-center mb-4">
                   <div className="bg-primary/10 p-3 rounded-lg mr-4">
                     <Code2 className="h-6 w-6 text-primary" />
                     </div>
                   <h3 className="text-xl font-semibold">Open & Collaborative</h3>
                  </div>
                <p className="text-muted-foreground flex-grow mb-4 text-base leading-relaxed">Critical technology requires scrutiny. Our core engine logic is open source (AGPLv3). We invite the community to inspect, challenge, and help us build responsibly.</p>
                <Link href="https://github.com/LastMile-Innovations/Global_Pulse.git" target="_blank" rel="noopener noreferrer" className="mt-auto text-sm text-primary hover:underline inline-flex items-center font-medium">
                    View Repository <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* === Section 4: The Vision (Impact) === */}
      {/* Adjusted padding, refined card styling and content spacing */}
      <section className={`${sectionPadding} bg-muted border-t border-border`}>
        <div className={``}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-6 bg-primary/10 text-primary shadow-sm">
                   Our Vision
                </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">A World <span className="text-primary">Potentially</span> Connected by Deeper Understanding</h2>
               <p className="text-lg md:text-xl text-muted-foreground text-balance">
                    We envision tools for insight – personal and collective – moving beyond surface-level data.
                </p>
              </div>

            {/* Adjusted grid gap and card padding */}
            <div className="grid md:grid-cols-2 gap-10 items-start">
              {/* Vision for Individuals */}
              <div className="bg-card rounded-lg p-8 border border-border shadow-lg transition-shadow hover:shadow-xl">
                  <div className="flex items-center mb-5">
                    <Brain className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                    <h3 className="text-2xl font-semibold">For Individuals: The <span className="text-primary">Potential</span> Self-Awareness Engine</h3>
                  </div>
                <p className="text-base leading-relaxed text-muted-foreground mb-5">
                    Imagine a dashboard for your <strong>internal operating system</strong>. It *could* help visualize how your core <code className="bg-muted px-1 py-0.5 rounded text-sm">Values</code>, <code className="bg-muted px-1 py-0.5 rounded text-sm">Needs</code>, and hidden <code className="bg-muted px-1 py-0.5 rounded text-sm">Beliefs</code> interact with daily life. This isn't therapy; it's *potentially* a user manual to your mind, fostering conscious responses over autopilot reactions.
                  </p>
                 <ul className="space-y-2.5 text-muted-foreground text-sm">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>*Potential* to understand personal triggers</span></li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>*Potential* to align actions with core values</span></li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>*Potential* to navigate emotions with clarity</span></li>
                  </ul>
              </div>

               {/* Vision for the World */}
               <div className="bg-card rounded-lg p-8 border border-border shadow-lg transition-shadow hover:shadow-xl">
                  <div className="flex items-center mb-5">
                     <Globe className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                    <h3 className="text-2xl font-semibold">For the World: A <span className="text-primary">Potential</span> Collective Barometer</h3>
                  </div>
                <p className="text-base leading-relaxed text-muted-foreground mb-5">
                    Imagine leaders *potentially* accessing real-time public concern, researchers *potentially* understanding societal trends with rich context, and businesses *potentially* aligning with genuine human needs. The goal is to *potentially* provide the shared heartbeat – anonymously and ethically.
                  </p>
                <ul className="space-y-2.5 text-muted-foreground text-sm">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>*Could* inform better public policy</span></li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>*Could* foster empathy across divides</span></li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" /><span>*Could* enable responsible innovation</span></li>
                  </ul>
              </div>
              </div>
            <p className="text-center italic text-muted-foreground mt-12 text-base md:text-lg">That's the potential we are exploring with Global Pulse.</p>
            </div>
          </div>
        </section>

      {/* === Section 5: Join Us (Call to Action) === */}
      {/* Adjusted padding, refined CTA button spacing and card styling */}
      <section className={`${sectionPadding} bg-background border-t border-border`}>
        <div className={``}>
          <div className="max-w-3xl mx-auto text-center">
             <div className="inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm font-semibold mb-6 bg-primary/10 text-primary shadow-sm">
                Get Involved
              </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Shape the Future of Understanding.</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
                The journey to deeper understanding requires collective effort. Join us in building a more informed, empathetic world.
              </p>
            {/* Ensured consistent button sizing and spacing */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {/* Assuming AnimatedCTAButton takes size prop or style */}
              <AnimatedCTAButton href="/waitlist" className="h-14 rounded-full text-lg px-8">Join the Waitlist</AnimatedCTAButton>
              <Button size="lg" variant="outline" className="h-14 rounded-full text-lg px-8 border-2" asChild>
                  <Link href="/explore">
                    Explore Live Insights (Demo)
                  </Link>
                </Button>
              </div>

            {/* Standardized card layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
              {/* Contribute Card */}
              <div className="bg-card rounded-lg p-6 border border-border shadow-lg text-left flex flex-col transition-shadow hover:shadow-xl">
                <div className="flex items-center mb-3">
                  <Github className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
                  <h4 className="font-semibold text-lg">Contribute & Collaborate</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    Explore our open-source core engine, report issues, or discuss research partnerships.
                  </p>
                <Button variant="outline" size="sm" className="w-full mt-auto font-medium" asChild>
                  <Link href="https://github.com/LastMile-Innovations/Global_Pulse.git" target="_blank" rel="noopener noreferrer">
                      View on GitHub <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

              {/* Learn More Card */}
              <div className="bg-card rounded-lg p-6 border border-border shadow-lg text-left flex flex-col transition-shadow hover:shadow-xl">
                <div className="flex items-center mb-3">
                  <HeartHandshake className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
                  <h4 className="font-semibold text-lg">Our Principles</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    Understand the ethical framework and safety measures guiding our development.
                  </p>
                <Button variant="outline" size="sm" className="w-full mt-auto font-medium" asChild>
                  <Link href="/ethics">
                      Read Ethical Framework <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

      {/* Removed closing div for outer container, layout handles it */}
    </Suspense>
  );
}

