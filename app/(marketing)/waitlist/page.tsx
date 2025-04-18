import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimatedCTAButton from "@/components/marketing/animated-cta-button"
import WaitlistSignupForm from "@/components/waitlist/WaitlistSignupForm"
import ScrollToTopButton from "@/components/scroll-to-top-button"

import {
  ArrowRight,
  BarChart,
  BrainCircuit,
  Clock,
  ExternalLink,
  Gift,
  Globe,
  HeartHandshake,
  Lock,
  MessageSquare,
  Network,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
  Brain,
  AlertCircle,
  Lightbulb,
  Heart,
  Github,
  CheckCircle,
} from "lucide-react"

// Define waitlist-specific metadata for SEO
export const metadata: Metadata = {
  title: "Global Pulse Waitlist - Your Feelings Aren't Random. We're Building the Engine to Prove It.",
  description:
    "Global Pulse is architecting a dynamic map of your unique identity and an AI engine grounded in real psychology to decode the mechanics behind your emotions. Join the waitlist.",
}

export default function WaitlistPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Abstract Neural Net/Pulse Animation Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80"></div>
          <div className="absolute -top-96 -right-96 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-96 -left-96 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Your Feelings Aren't Random.
                  <br />
                  <span className="text-primary">We're Building the Engine to Prove It.</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-[800px]">
                  Stop guessing why you react. Global Pulse is architecting a dynamic map of your unique identity 
                  ({"{self}"} Map / UIG) and an AI engine (PCE/EWEF) grounded in real psychology to decode the 
                  <em> mechanics</em> behind your emotions, in context. No bullshit, no wellness woo-woo – just computational 
                  insight into your internal operating system.
                </p>
                <div className="bg-gray-800/60 border border-gray-700 p-4 rounded-lg my-4">
                  <p className="text-gray-300 text-sm">
                    <em>This is early days. Born from a 10-day hackathon sprint. We're building this openly, ethically, 
                    and inviting you to watch (and eventually participate) as we debug the human condition.</em>
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                  <AnimatedCTAButton href="#waitlist" className="bg-primary hover:bg-primary/90">
                    Unlock Your Emotional Code - Join the Waitlist
                  </AnimatedCTAButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-16 bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">
                Sentiment Analysis is Shallow. Surveys are Stale. Your Brain is More Complex.
              </h2>
              <div className="space-y-6 text-gray-300">
                <p className="text-xl">
                  Let's be real. "Positive" or "Negative" tells you almost nothing. Polls ask <em>what</em> you think, 
                  not <em>why</em> you feel a certain way about it. Most "AI companions" are glorified pattern-matchers 
                  reflecting generic data, not <em>you</em>.
                </p>
                <p className="text-xl">
                  We're drowning in surface-level data while starving for actual understanding. We react on autopilot, 
                  navigate relationships with guesswork, and make decisions based on feelings we can't even properly name, 
                  let alone trace back to the core Values, Needs, or Beliefs driving them.
                </p>
                <p className="text-xl font-medium text-primary">
                  It's like trying to navigate a city with a map showing only highways, ignoring every side street, 
                  landmark, and traffic jam. It's inefficient. It's frustrating. It's time for a better map.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introducing Global Pulse - The Engine */}
        <section className="py-16 bg-black">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">
                We're Not Just Building an App. We're Building the Engine.
              </h2>
              <div className="space-y-6 text-gray-300">
                <p className="text-xl">
                  Global Pulse isn't another mood tracker. At its core is the <strong>Pulse Context Engine (PCE)</strong> – 
                  a framework designed from the ground up to integrate cutting-edge psychology (like the Theory of 
                  Constructed Emotion & MHH) with AI.
                </p>
                <h3 className="text-2xl font-bold mt-8 mb-4">Here's the core idea, stripped down:</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Your Unique Identity Map (UIG / {"{self}"} Map):</h4>
                      <p>
                        Forget static profiles. We dynamically map what <em>actually</em> matters to <em>you</em> – your 
                        core Values, Goals, Beliefs, Needs, Roles, Interests, even how you see your relationships. We track 
                        their importance (Power Level - PL) and your feeling towards them (Valence - V). This is <em>your</em> 
                        private, evolving identity graph.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <Lightbulb className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">The Emotion Engine (EWEF):</h4>
                      <p>
                        When you interact (eventually via our <code>Pulse</code> agent), the engine analyzes the situation 
                        (Perception - P) against what matters on <em>your</em> map (Expectation/Preference - EP). It 
                        calculates the core feeling signature (VAD - Valence, Arousal, Dominance) and uses established 
                        cognitive appraisal patterns (like MHH variables: Source, Perspective, Timeframe, Acceptance) to 
                        understand <em>why</em> that feeling arose and categorize it meaningfully.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 border border-gray-800 rounded-xl p-6 bg-gray-900/50">
                  <Image
                    src="/system-connectivity-diagram.png"
                    alt="Pulse Engine Diagram - UIG → Context → Interaction → EWEF Analysis → VAD/Category Output"
                    width={1000}
                    height={400}
                    className="object-contain"
                  />
                </div>
                <p className="text-xl font-medium text-primary mt-6">
                  This isn't about predicting your next click. It's about illuminating the fundamental mechanics of your 
                  subjective experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8 text-center">
                Know Thyself. (Like, Actually.)
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                {/* Self-Insight Column */}
                <Card className="bg-gray-800 border-gray-700 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4 text-primary">Self-Insight</h3>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">Decode Your Reactions:</p>
                          <p className="text-gray-300">
                            Finally see the connection: "When <em>[Situation X]</em> happened, it conflicted with my 
                            <em> [Value Y (High PL)]</em>, leading to that feeling of <em>[Predicted VAD/Category: 
                            e.g., 'Frustration']</em>."
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">Identify Your Triggers:</p>
                          <p className="text-gray-300">
                            Spot recurring patterns – what consistently activates certain parts of your identity map and 
                            leads to specific emotional states?
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">Map Your Core Drivers:</p>
                          <p className="text-gray-300">
                            Understand which Values, Needs, and Goals have the highest Power Level (PL) for you 
                            <em> right now</em>. Are you living in alignment with them?
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">See Your Blind Spots:</p>
                          <p className="text-gray-300">
                            Recognize common appraisal habits (MHH patterns) or potential cognitive biases influencing 
                            your interpretations.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Future Potential Column */}
                <Card className="bg-gray-800 border-gray-700 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4 text-primary">Future Potential</h3>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">Contextual AI That <em>Gets</em> It:</p>
                          <p className="text-gray-300">
                            Imagine an AI companion (<code>Pulse</code>) that truly understands the context of your feelings, 
                            offering validation and genuinely relevant reflection.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">Personalized Growth Tools:</p>
                          <p className="text-gray-300">
                            Tools built on <em>your</em> UIG data to support goals, navigate value conflicts, or build 
                            emotional literacy (non-clinical).
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">Anonymized Collective Insight:</p>
                          <p className="text-gray-300">
                            (With Explicit Consent ONLY) Contribute your <em>anonymized</em> patterns to help build a 
                            real-time, nuanced understanding of global sentiment, moving beyond shallow polls.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold">Get Rewarded for Your Perspective:</p>
                          <p className="text-gray-300">
                            (Future - Requires Consent) Our vision includes sharing value back. If anonymized insights 
                            derived from your consented data are used commercially, you get a share. Your perspective has 
                            economic value.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Ethics & Trust Section */}
        <section id="ethics" className="py-16 bg-black">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">
                Powerful Tech Demands Radical Responsibility. Full Stop.
              </h2>
              <div className="space-y-6 text-gray-300">
                <p className="text-xl">
                  Let's cut the corporate privacy theater. Modeling identity and emotion is serious business. If we screw 
                  this up, the potential for harm is real. That's why ethics aren't an afterthought; they're architected in.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <ShieldCheck className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-green-400">Your Data, Your Rules:</p>
                        <p className="text-gray-300">
                          Granular, opt-in consent for <em>everything</em> non-essential. You control access (Data Hub), 
                          analysis depth (Detailed Logging), and data use (Aggregation, Training, Future Sale Pool). 
                          Easily view and revoke consent anytime. <strong>Your individual data is NEVER sold.</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Lock className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-green-400">Privacy & Security Baked In:</p>
                        <p className="text-gray-300">
                          Encryption at rest and in transit. Strict access controls. Secure infrastructure. 
                          Pseudonymization for any potential future aggregate analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Shield className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-green-400">Ethical Guardrails in Code:</p>
                        <p className="text-gray-300">
                          Active modules monitor interactions aiming to prevent manipulation and block responses predicted 
                          to cause significant distress. This isn't just policy; it's running code.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Github className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-green-400">Open Source Core:</p>
                        <p className="text-gray-300">
                          We're committed to open-sourcing the core analytical framework (PCE/EWEF logic, UIG utils). 
                          No black boxes for the fundamental engine. Transparency builds trust. Scrutinize our work. 
                          Help us make it better and safer.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <AlertCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-green-400">We Are NOT Therapists:</p>
                        <p className="text-gray-300">
                          This is a tool for self-awareness and potentially societal insight. It is <em>not</em> a 
                          replacement for professional mental health diagnosis or treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-8">
                  <Button variant="outline" size="lg" className="border-green-500 text-green-400" asChild>
                    <Link href="/ethics">
                      Read Our Full Ethical Framework (No Legalese) <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hackathon Reality Check Section */}
        <section className="py-16 bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">
                Built in 10 Days. Ready for... Feedback.
              </h2>
              <div className="space-y-6 text-gray-300">
                <p className="text-xl">
                  What you're signing up for isn't a polished product launch. It's early access to an ambitious 
                  <em> experiment</em>. The core engine concepts (UIG, EWEF) and the initial framework were hammered 
                  out in a frantic 10-day Vercel AI Hackathon sprint (props to the team: Greyson, Niklas, Omar!).
                </p>
                <p className="text-xl">
                  It's raw. There will be bugs. The AI (<code>Pulse</code>) isn't fully interactive yet. The dashboard 
                  is basic. But the <em>foundational engine</em> is there, and the <em>vision</em> is clear.
                </p>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-8">
                  <h3 className="text-2xl font-bold mb-4">Joining the waitlist means you're signing up to be part of the journey:</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <p>Early access when interactive features roll out.</p>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <p>Behind-the-scenes updates on development progress (and challenges).</p>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <p>Opportunities to provide crucial feedback that shapes the platform.</p>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <p>The chance to be part of building something fundamentally different.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Signup Section */}
        <section id="waitlist" className="py-20 bg-black">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                  Unlock Deeper Understanding. Join the Global Pulse Waitlist.
                </h2>
                <p className="text-xl text-gray-300 max-w-[600px] mx-auto">
                  Get priority access to the platform as features launch. Help us build the future of contextual AI and 
                  emotional insight. Spots are limited for early feedback rounds.
                </p>
              </div>
              <div className="mt-8">
                <WaitlistSignupForm />
                <p className="text-sm text-gray-400 text-center mt-4">
                  We respect your inbox. Updates will be infrequent and meaningful. You can unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ScrollToTopButton />
      </main>
    </div>
  )
} 