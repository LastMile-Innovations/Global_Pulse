import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Bolt,
  Brain,
  Code,
  Flame,
  Globe,
  Rocket,
  Sparkles,
  Zap,
  Trophy,
  Clock,
  CheckCircle2,
  Users,
  Heart,
  Lightbulb,
  Cpu,
  LineChart,
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section with Bold Gradient Background */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/20 via-background to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

        {/* Animated particles/sparkles effect */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-40 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-teal-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-8 border-transparent bg-primary/20 text-primary">
              <Flame className="mr-2 h-4 w-4" /> Vercel Hackathon Contender
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight">
              We're not just building an app.
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-teal-400 text-transparent bg-clip-text">
                We're starting a movement.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
              Global Pulse is more than a platform—it's a revolution in how the world shares opinions. Built by three
              passionate developers in just 10 days, we're here to make waves.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="lg" className="gap-2 h-12 text-base group relative overflow-hidden" asChild>
                <Link href="/signup">
                  <span className="relative z-10 flex items-center">
                    Join the revolution{" "}
                    <Rocket className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </Button>
              <div className="relative pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-10 before:w-px before:bg-border">
                <p className="text-muted-foreground font-medium">
                  <span className="inline-block bg-primary/10 text-primary font-bold px-2 py-1 rounded">10 days.</span>{" "}
                  That's all it took to build the future.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative code snippet */}
        <div className="hidden lg:block absolute bottom-10 right-10 max-w-xs bg-black/80 backdrop-blur-sm rounded-lg border border-primary/20 shadow-xl p-4 font-mono text-xs text-green-400 transform rotate-2">
          <div className="flex items-center gap-2 mb-2 text-xs text-white/70">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>global-pulse.tsx</span>
          </div>
          <div>
            <span className="text-blue-400">const</span> <span className="text-yellow-400">GlobalPulse</span> = () =&gt;{" "}
            {"{"}
            <br />
            &nbsp;&nbsp;<span className="text-purple-400">return</span> (
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-blue-400">Revolution</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">team</span>={"{"}
            <span className="text-orange-400">["Greyson", "Niklas", "Omar"]</span>
            {"}"}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">timeframe</span>={"{"}
            <span className="text-orange-400">10</span>
            {"}"}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">goal</span>={"{"}
            <span className="text-green-400">"Change the world"</span>
            {"}"}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;/&gt;
            <br />
            &nbsp;&nbsp;);
            <br />
            {"}"};
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-primary/10 border-y border-primary/20">
        <div className="container px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "10", label: "Days to Build", icon: <Clock className="h-5 w-5 text-primary" /> },
              { value: "3", label: "Developers", icon: <Code className="h-5 w-5 text-primary" /> },
              { value: "3", label: "Continents", icon: <Globe className="h-5 w-5 text-primary" /> },
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

      {/* The Hackathon Story - Bold, Narrative Style */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 border-transparent bg-primary text-primary-foreground">
                <Bolt className="mr-2 h-4 w-4" /> The 10-Day Sprint
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 leading-tight">
                From zero to <span className="text-primary">game-changer</span> in less than two weeks
              </h2>
              <div className="space-y-6 text-lg">
                <p>
                  When Greyson Paynter, founder of LastMile, had the vision for Global Pulse, he didn't wait around. He
                  assembled an elite team through his network on X in{" "}
                  <span className="font-bold">just a few hours</span>.
                </p>
                <p>
                  The mission? Build a revolutionary platform for the Vercel Hackathon that would change how the world
                  shares opinions—and do it in just 10 days.
                </p>
                <p>
                  Greyson created the technical architecture and wireframed the initial app on day one, while Niklas and
                  Omar built the backend, AI logic, and refined the wireframes. Throughout the project, everyone
                  collaborated on all aspects, creating a truly integrated team.
                </p>
                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/30 rounded-full"></div>
                    <blockquote className="pl-6 italic text-muted-foreground">
                      "We're not just participating in a hackathon. We're showing the world what's possible when you
                      combine vision, talent, and modern tech."
                      <footer className="mt-2 text-primary font-bold not-italic">— Greyson Paynter, Team Lead</footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-primary/30 to-blue-500/20 rounded-3xl transform rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=The+Sprint"
                  alt="The 10-Day Sprint"
                  width={800}
                  height={600}
                  className="object-cover w-full"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-sm font-medium">Live development</span>
                    </div>
                    <p className="text-lg font-bold">10 days. 3 developers. 1 vision.</p>
                  </div>
                </div>
              </div>

              {/* Timeline markers */}
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
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 border-transparent bg-secondary text-secondary-foreground">
              <Clock className="mr-2 h-4 w-4" /> The Timeline
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-10">
              How we built Global Pulse in 10 days
            </h2>

            <div className="relative border-l-2 border-primary/30 pl-8 pb-8 space-y-10">
              {[
                {
                  day: "Day 1-2",
                  title: "Concept & Architecture",
                  description:
                    "Greyson assembled the team, outlined the vision, and created the technical architecture with Next.js, Supabase, and Upstash Redis. He wireframed the initial app while Niklas and Omar began planning the AI implementation.",
                  icon: <Lightbulb className="h-6 w-6 text-primary" />,
                },
                {
                  day: "Day 3-4",
                  title: "Core Infrastructure",
                  description:
                    "The team collaborated on building the foundation. Niklas and Omar focused on backend systems and AI logic while continuing to refine the wireframes and user experience.",
                  icon: <Cpu className="h-6 w-6 text-blue-500" />,
                },
                {
                  day: "Day 5-6",
                  title: "Feature Development",
                  description:
                    "The team implemented the multi-agent multi-tool engine using Vercel AI SDK, along with real-time opinion tracking, global visualization, and user authentication systems.",
                  icon: <Code className="h-6 w-6 text-teal-500" />,
                },
                {
                  day: "Day 7-8",
                  title: "Integration & Testing",
                  description:
                    "All systems were connected and tested. The team fixed bugs and optimized performance across devices, with everyone contributing to all aspects of the platform.",
                  icon: <LineChart className="h-6 w-6 text-blue-500" />,
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
                  <div className="bg-background rounded-lg border p-5 shadow-sm hover:shadow-md transition-shadow">
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

      {/* Meet the Dream Team - Bold, Personal */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 border-transparent bg-primary/20 text-primary">
              <Sparkles className="mr-2 h-4 w-4" /> The Dream Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Three developers. <span className="text-primary">Infinite potential.</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              We crossed continents and time zones to build something extraordinary. Meet the minds behind Global Pulse.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Greyson Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-background rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="absolute -top-6 -right-6 bg-primary text-white p-3 rounded-full shadow-lg">
                  <Brain className="h-6 w-6" />
                </div>

                <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src="/placeholder.svg?height=400&width=400&text=Greyson"
                    alt="Greyson Paynter"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 text-white">
                      <p className="text-sm font-medium">"Vision without execution is just hallucination."</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-1">Greyson Paynter</h3>
                <p className="text-primary font-semibold mb-2">Visionary & Technical Architect</p>
                <p className="text-muted-foreground mb-4 flex-grow">
                  Founder and CEO of LastMile, Greyson assembled this dream team in hours and led the vision from
                  concept to execution. He created the technical architecture and initial wireframes, setting the
                  foundation for the entire project.
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div className="inline-flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-1 text-primary" /> United States
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="https://twitter.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Twitter profile"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-twitter"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </Link>
                    <Link
                      href="https://github.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="GitHub profile"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-github"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Niklas Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-background rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="absolute -top-6 -right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                  <Code className="h-6 w-6" />
                </div>

                <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src="/placeholder.svg?height=400&width=400&text=Niklas"
                    alt="Niklas Bognar"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 text-white">
                      <p className="text-sm font-medium">"Code is poetry written for machines and humans alike."</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-1">Niklas Bognar</h3>
                <p className="text-blue-500 font-semibold mb-2">Backend & AI Engineer</p>
                <p className="text-muted-foreground mb-4 flex-grow">
                  A highly skilled developer from the UK with expertise in building scalable web applications. Niklas
                  focused on backend systems and AI logic, bringing deep knowledge of C++, TypeScript, and modern
                  frontend technologies to create our intelligent multi-agent system.
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div className="inline-flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-1 text-blue-500" /> Cornwall, UK
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="https://bognar.co.uk"
                      className="text-muted-foreground hover:text-blue-500 transition-colors"
                      aria-label="Personal website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-globe"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                      </svg>
                    </Link>
                    <Link
                      href="https://github.com/bognar-dev"
                      className="text-muted-foreground hover:text-blue-500 transition-colors"
                      aria-label="GitHub profile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-github"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    </Link>
                    <Link
                      href="https://linkedin.com/in/niklas-bognar"
                      className="text-muted-foreground hover:text-blue-500 transition-colors"
                      aria-label="LinkedIn profile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Omar Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-primary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-background rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="absolute -top-6 -right-6 bg-teal-500 text-white p-3 rounded-full shadow-lg">
                  <Zap className="h-6 w-6" />
                </div>

                <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src="/placeholder.svg?height=400&width=400&text=Omar"
                    alt="Omar El hassani Alaoui"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 text-white">
                      <p className="text-sm font-medium">
                        "Design is not just what it looks like. Design is how it works."
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-1">Omar El hassani Alaoui</h3>
                <p className="text-teal-500 font-semibold mb-2">AI Logic & Full-Stack Developer</p>
                <p className="text-muted-foreground mb-4 flex-grow">
                  A passionate solopreneur developer from Morocco with expertise in Flutter and Next.js. Omar worked on
                  backend systems and AI logic while refining the user interface, bringing his full-stack development
                  skills to create a seamless, intelligent experience.
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div className="inline-flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-1 text-teal-500" /> Morocco
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="https://twitter.com/omarelhassani_"
                      className="text-muted-foreground hover:text-teal-500 transition-colors"
                      aria-label="Twitter profile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-twitter"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </Link>
                    <Link
                      href="https://github.com/OmarElhassaniAlaoui"
                      className="text-muted-foreground hover:text-teal-500 transition-colors"
                      aria-label="GitHub profile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-github"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    </Link>
                    <Link
                      href="https://linkedin.com/in/omar-el-hassani-alaoui-1662531a1"
                      className="text-muted-foreground hover:text-teal-500 transition-colors"
                      aria-label="LinkedIn profile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </Link>
                    <Link
                      href="https://omarelhassanialaoui.xyz"
                      className="text-muted-foreground hover:text-teal-500 transition-colors"
                      aria-label="Personal website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-globe"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Collaboration Section */}
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        {/* World map background - stylized */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M200,100 Q400,150 600,100 T1000,100" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M200,200 Q500,250 800,200 T1000,200" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M200,300 Q400,350 600,300 T1000,300" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M200,400 Q500,450 800,400 T1000,400" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M200,500 Q400,550 600,500 T1000,500" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M200,600 Q500,650 800,600 T1000,600" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 border-transparent bg-primary/20 text-primary">
              <Globe className="mr-2 h-4 w-4" /> Global Collaboration
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Three continents. <span className="text-primary">One vision.</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Our team spans the globe, bringing diverse perspectives and round-the-clock development to create
              something truly extraordinary.
            </p>
          </div>

          <div className="relative">
            <div className="bg-background rounded-2xl border shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">The power of global collaboration</h3>
                  <div className="space-y-4">
                    <p>
                      When your team spans three continents, you gain a unique advantage: the sun never sets on your
                      development cycle. As one developer ended their day, another was just beginning, creating a
                      continuous flow of progress.
                    </p>
                    <p>
                      But the benefits went beyond the practical. Our diverse backgrounds and perspectives brought
                      richness to every decision, from technical architecture to user experience design.
                    </p>
                    <p>
                      Greyson's architectural vision from the US, Niklas's AI and backend expertise from the UK, and
                      Omar's full-stack versatility from Morocco combined to create something none of us could have
                      built alone. Everyone contributed to all aspects of the project, creating a truly integrated team.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { label: "Time Zones", value: "8 hours", icon: <Clock className="h-5 w-5 text-primary" /> },
                      { label: "Languages", value: "4", icon: <Globe className="h-5 w-5 text-primary" /> },
                      { label: "Cultures", value: "3", icon: <Users className="h-5 w-5 text-primary" /> },
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
                  <div className="relative rounded-xl overflow-hidden border">
                    <Image
                      src="/placeholder.svg?height=500&width=600&text=Global+Team"
                      alt="Global Team Collaboration"
                      width={600}
                      height={500}
                      className="object-cover w-full"
                    />
                  </div>

                  {/* Connection lines */}
                  <div className="absolute top-1/4 -left-4 w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xs font-bold">
                    US
                  </div>
                  <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-xs font-bold">
                    UK
                  </div>
                  <div className="absolute bottom-1/4 left-1/2 w-8 h-8 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center text-xs font-bold">
                    MA
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
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 border-transparent bg-primary/20 text-primary">
              <Trophy className="mr-2 h-4 w-4" /> Why We'll Win
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
                  <h3 className="text-2xl font-bold mb-3">Ready to judge? We're ready to impress.</h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    Global Pulse isn't just a hackathon project—it's a glimpse into the future of global opinion
                    sharing. We've pushed the boundaries of what's possible in 10 days, and we're just getting started.
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
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 border-transparent bg-secondary text-secondary-foreground">
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
                      <span className="font-medium">Next.js 15:</span> App Router, Server Components, Client Components,
                      Route Handlers, Server Actions, Middleware
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">React 19:</span> Server Component Architecture, Hooks (useState,
                      useEffect, useContext, useOptimistic, useTransition)
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
                      <span className="font-medium">Supabase:</span> Postgres Database, Auth, Realtime, Row Level
                      Security
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Upstash Redis:</span> High-speed caching, session management, rate
                      limiting
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
                      <span className="font-medium">Vercel AI SDK:</span> Core library for LLM interactions and
                      streaming UI updates
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Multi-Agent System:</span> Custom-built multi-agent, multi-tool
                      engine
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
                Global Pulse is powered by a sophisticated multi-agent, multi-tool engine built using the Vercel AI SDK.
                This system enables:
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
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 border-transparent bg-primary/20 text-primary">
              <Heart className="mr-2 h-4 w-4" /> Early Feedback
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              What our <span className="text-primary">early testers</span> are saying
            </h2>
            <p className="text-xl text-muted-foreground">
              We've shared Global Pulse with a select group of users during development. Here's what they think.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                quote:
                  "I've never seen opinion data visualized this beautifully. The real-time updates are mesmerizing to watch.",
                name: "Sarah K.",
                role: "Data Scientist",
                image: "/placeholder.svg?height=100&width=100&text=SK",
              },
              {
                quote: "The speed is what impressed me most. Everything feels instant, even on my older phone.",
                name: "Michael T.",
                role: "UX Researcher",
                image: "/placeholder.svg?height=100&width=100&text=MT",
              },
              {
                quote:
                  "As someone who works with global teams, I can see this becoming an essential tool for understanding diverse perspectives.",
                name: "Priya M.",
                role: "Project Manager",
                image: "/placeholder.svg?height=100&width=100&text=PM",
              },
              {
                quote:
                  "Hard to believe this was built in just 10 days. It feels more polished than products I've used that took years to develop.",
                name: "David L.",
                role: "Software Engineer",
                image: "/placeholder.svg?height=100&width=100&text=DL",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-background rounded-xl p-6 border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
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
              Global Pulse is more than a hackathon project—it's the beginning of a movement to transform how the world
              shares opinions. Be part of it from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 h-12 text-base group relative overflow-hidden" asChild>
                <Link href="/signup">
                  <span className="relative z-10 flex items-center">
                    Sign Up Now <Rocket className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 h-12 text-base" asChild>
                <Link href="https://github.com">
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
  )
}
