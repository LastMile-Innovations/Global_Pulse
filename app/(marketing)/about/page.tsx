import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  AlertCircle,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div className="container px-4 md:px-6 pt-12">
        <Alert variant="default" className="mb-8 bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Prototype Status</AlertTitle>
          <AlertDescription>
            Global Pulse is currently an early-stage prototype born from a 10-day hackathon. Some features described represent our design goals and may not be fully interactive in the current demo. We are building transparently and prioritize safety and user control.
          </AlertDescription>
        </Alert>
      </div>

      <section className="relative py-20 md:py-24 bg-background overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-8 bg-primary/10 text-primary">
              Hackathon Origin & Open Exploration
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight">
              Exploring a Different Approach <br className="hidden md:inline"/> to AI and Self-Understanding.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
              Global Pulse began as a concept explored during an intense 10-day hackathon sprint. We're building the foundation for an ethical AI companion, openly and with a focus on user dignity.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="lg" className="gap-2 h-12 text-base group relative overflow-hidden bg-primary hover:bg-primary/90" asChild>
                <Link href="/waitlist">
                  <span className="relative z-10 flex items-center">
                    Join the Journey{" "}
                    <Rocket className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-12 text-base">
                <Link href="https://github.com/GreysonMain/pulse" target="_blank" rel="noopener noreferrer">
                  Explore the Code <Code className="ml-2 h-4 w-4"/>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 bg-primary text-primary-foreground">
                <Bolt className="mr-2 h-4 w-4" /> The 10-Day Sprint
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 leading-tight">
                From Concept to <span className="text-primary">Core Engine</span>
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  Global Pulse was conceived and its foundational code built during the Vercel AI Hackathon (Summer 2024). The challenge: Could we lay the groundwork for an ethical AI companion focused on self-discovery within 10 days?
                </p>
                <p>
                  Driven by a vision for technology that serves human understanding (stemming from personal reflections on the need for clearer self-awareness), Greyson Paynter architected and implemented the core technical framework (EWEF/UIG concepts, stack setup). Debra Lundquist provided crucial product management guidance, and Niklas Bognarnot contributed foundational design elements (colors, logo).
                </p>
                <p>
                  This intense collaborative effort resulted in the initial prototype – the essential structure upon which Global Pulse is being built. It's a starting point, not a finished product, representing our commitment to exploring what's possible when ethics lead development.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl flex items-center justify-center min-h-[300px] bg-card">
                <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
                  <Rocket className="h-16 w-16 text-primary mb-4" />
                  <div className="text-lg font-bold text-foreground">10 Days. 1 Core Engine. <br/> The Foundation is Laid.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-center">
              Guided by Principles, Not Hype.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-center">
              What makes the Global Pulse exploration different is our commitment to a set of core principles from day one.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Ethical Foundation First</h3>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Grounded in Psychology</h3>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Focus on Reflection</h3>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Building Openly</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-4 w-4" /> The Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Small team. <span className="text-primary">Focused Vision.</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              The initial Global Pulse prototype was primarily architected and built by Greyson Paynter during the hackathon, with vital product management from Debra Lundquist and design contributions from Niklas Bognarnot. We are building this openly and invite collaboration.
            </p>
          </div>
        </div>
      </section>

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
