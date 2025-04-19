import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  BookOpen,
  Code,
  Database,
  ExternalLink,
  Github,
  HardHat,
  Lock,
  MessageSquare,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import FaqSection from "@/components/ui/faq-section";

export const metadata: Metadata = {
  title: "FAQ - Global Pulse (MVP Edition)",
  description:
    "Frequently asked questions about Global Pulse, our open-source emotional intelligence framework and MVP.",
};

export default function FAQPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-10 md:py-16">
      <Alert variant="default" className="mb-12 bg-primary/5 border-primary/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Prototype Status</AlertTitle>
        <AlertDescription>
          Global Pulse is currently an early-stage prototype born from a 10-day hackathon. Some features described represent our design goals and may not be fully interactive in the current demo. We are building transparently and prioritize safety and user control.
        </AlertDescription>
      </Alert>

      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Global Pulse: FAQ <span className="inline-block animate-bounce">?</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Built in 10 days during the Vercel AI Hackathon. It's early, it's real, and we're just getting started.
          Here's where we are and where we're going.
        </p>
      </header>

      <main>
        <div className="grid gap-8">
          <FaqSection
            title="What's Global Pulse?"
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "So, what is Global Pulse, really?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      Right now? A working prototype. Built in 10 days during a hackathon. A foundation, not a product. 
                      It shows our intent: an AI companion built to reflect, not extract. It's early. But real.
                    </p>
                    <p>
                      What we built in our 10-day sprint:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>A Demo:</strong> Showcasing how the EWEF and UIG frameworks analyze emotional experiences.
                      </li>
                      <li>
                        <strong>Core Code:</strong> Open-source implementation of our Enhanced Webb Emotional Framework (EWEF) and Unified Identity Graph (UIG).
                      </li>
                      <li>
                        <strong>The Vision:</strong> Documentation of where we're headed with this technology.
                      </li>
                    </ul>
                  </div>
                ),
              },
              {
                question: "What does the demo actually do?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      You can sign up, explore a basic dashboard (sample data), and set data consent preferences. The chat is simulated—meant to show how Pulse might feel, not what it can do yet.
                    </p>
                    <p>
                      It showcases:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>The Core Concept:</strong> How the EWEF analyzes interactions to understand the "why" behind emotions.
                      </li>
                      <li>
                        <strong>UIG Visualization:</strong> How your identity graph maps what matters to you.
                      </li>
                      <li>
                        <strong>Analysis Flow:</strong> The process of comparing perceptions to expectations and generating emotional responses.
                      </li>
                    </ul>
                    <div className="mt-3">
                      <Link href="/how-it-works" legacyBehavior>
                        <Button variant="outline" className="group transition hover:scale-105">
                          <ExternalLink className="mr-2 h-4 w-4 group-hover:text-secondary" />
                          Explore the Demo
                        </Button>
                      </Link>
                    </div>
                  </div>
                ),
              },
              {
                question: "Where can I try the real AI?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      You can't. Not yet. The live chat isn't functional. We're working on it, carefully. You can watch a demo conversation on our site to get a sense of the interaction we're building toward.
                    </p>
                    <p>
                      Our roadmap includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Fixing the XAI "Why?" explanation backend</li>
                      <li>Building out real-time chat, safely</li>
                      <li>Improving the dashboard with user-validated insights</li>
                      <li>Gradually expanding access to ensure quality</li>
                    </ul>
                    <p>
                      <Link href="/#waitlist" className="underline text-primary">
                        Join our waitlist
                      </Link>{" "}
                      to be notified when interactive features become available.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <FaqSection
            title="What's Under the Hood?"
            icon={<HardHat className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "What's this EWEF and UIG stuff?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      <strong>UIG (Unified Identity Graph):</strong> Your private, secure map—your values, goals, and needs in relationship. The things you care about (Attachments), their importance (PL), your feelings towards them (V), and how they connect.
                    </p>
                    <p>
                      <strong>EWEF (Enhanced Webb Emotional Framework):</strong> The analysis engine. It compares what's happening (Perception P) to what matters to you (Expectation EP from your UIG). It calculates your likely core feeling (VAD: Valence-Arousal-Dominance) and probable emotion based on psychological principles.
                    </p>
                    <p>
                      These are still becoming real in the code—but the structure is there.
                    </p>
                  </div>
                ),
              },
              {
                question: "What tech are you using?",
                answer: (
                  <div className="space-y-2">
                    <p>Our tech stack includes:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Next.js, React, TypeScript for the frontend</li>
                      <li>Supabase for authentication and data storage</li>
                      <li>Neo4j for the graph database (UIG)</li>
                      <li>Redis for caching and real-time features</li>
                      <li>Vercel AI SDK for model integration</li>
                    </ul>
                    <p>And a lot of careful thinking between the code.</p>
                  </div>
                ),
              },
              {
                question: "How is this different from standard sentiment analysis?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      Sentiment analysis typically gives a simple positive/negative score. Global Pulse goes deeper:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>VAD:</strong> We calculate Valence (pleasant/unpleasant), Arousal (energy level), and Dominance (feeling in control).
                      </li>
                      <li>
                        <strong>Categorization:</strong> We predict probabilities across multiple specific emotions (Anger, Joy, Fear, etc.).
                      </li>
                      <li>
                        <strong>The "Why":</strong> We link emotions to the drivers behind them—the interaction between what you value and what you perceive.
                      </li>
                    </ul>
                  </div>
                ),
              },
            ]}
          />

          <FaqSection
            title="What About My Data?"
            icon={<Shield className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "Do you collect my data?",
                answer: (
                  <div className="space-y-2">
                    <p>Only with your consent. And only what's needed to reflect something useful back to you. No selling. No ads. No hidden use. Your privacy settings give you control.</p>
                    <p>Currently, data collection is minimal:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Email address (if you join the waitlist)</li>
                      <li>Basic anonymous analytics</li>
                      <li>Any feedback you provide explicitly</li>
                    </ul>
                    <p>
                      <strong>We are NOT currently:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Collecting chat data (since there's no live chat yet)</li>
                      <li>Building your UIG (this happens when interactive features launch)</li>
                      <li>Connecting to external data sources</li>
                    </ul>
                  </div>
                ),
              },
              {
                question: "How is it protected?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      Our privacy foundations were baked in from line one. Protection includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Secure Infrastructure:</strong> Supabase and Redis with permission checks
                      </li>
                      <li>
                        <strong>Encryption:</strong> For sensitive data both in transit and at rest
                      </li>
                      <li>
                        <strong>Consent Flags:</strong> Baked into every feature
                      </li>
                      <li>
                        <strong>Privacy-First Design:</strong> From the start
                      </li>
                    </ul>
                    <Link href="/privacy" legacyBehavior>
                      <Button variant="outline" size="sm" className="group transition hover:scale-105 mt-2">
                        <Lock className="mr-2 h-4 w-4 group-hover:text-primary" />
                        Privacy Policy
                      </Button>
                    </Link>
                  </div>
                ),
              },
              {
                question: "What are these 'guardrails' I keep hearing about?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      They're safety systems built into the backend. Even though we don't have live chat yet, we've implemented the foundation of the Ethical Guardrail Layer:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Consent Enforcement:</strong> Code that checks user permissions before processing
                      </li>
                      <li>
                        <strong>Well-being Priority:</strong> VAD impact simulation to catch potentially harmful responses
                      </li>
                      <li>
                        <strong>Distress Protocol:</strong> Trigger detection and resource linking
                      </li>
                      <li>
                        <strong>Bias Checking:</strong> Basic keyword checks (to be expanded)
                      </li>
                    </ul>
                    <Link href="/ethics" legacyBehavior>
                      <Button variant="outline" size="sm" className="group transition hover:scale-105 mt-2">
                        <Shield className="mr-2 h-4 w-4 group-hover:text-primary" />
                        Safety & Ethics
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
          />

          <FaqSection
            title="Where Is This Going?"
            icon={<ExternalLink className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "What's next for Global Pulse?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      Our immediate roadmap:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Fixing the XAI "Why?" explanation backend</li>
                      <li>Building out real-time chat, safely</li>
                      <li>Improving the dashboard with user-validated insights</li>
                      <li>Rolling out opt-in structured prompts (with user permission only)</li>
                      <li>Preparing for anonymized, privacy-safe public insights—only when ready and ethically sound</li>
                    </ul>
                    <p>
                      We're avoiding specific timelines because quality and safety come first.
                    </p>
                  </div>
                ),
              },
              {
                question: "What about the Marketplace thing?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      It's an idea. Not a launch. And it comes with strict conditions:
                    </p>
                    <ol className="list-decimal pl-6 space-y-1">
                      <li>Community governance first</li>
                      <li>Shared value (primarily for users)</li>
                      <li>Explicit re-consent needed</li>
                      <li>Validated privacy tech (like Differential Privacy) proven first</li>
                    </ol>
                    <p>
                      If it doesn't meet those? We don't build it.
                    </p>
                  </div>
                ),
              },
              {
                question: "When will interactive features be available?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      Honestly? We just finished a 10-day code whirlwind! The hackathon marks the start, not the finish line.
                    </p>
                    <p>We need to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Stabilize the core EWEF and UIG implementations</li>
                      <li>Build the conversational interface</li>
                      <li>Implement robust security and privacy controls</li>
                      <li>Test extensively for quality and safety</li>
                    </ul>
                    <p>
                      This is a marathon, not just a sprint (though the start felt like one!).
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <FaqSection
            title="Can I Help?"
            icon={<Users className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "I'm a developer/researcher/designer—can I get involved?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      Yes. Open-source is the start. We welcome contributions, critiques, refinements. You can:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Review the code and provide feedback</li>
                      <li>Open issues for bugs or suggestions</li>
                      <li>Submit pull requests with improvements</li>
                      <li>Help with documentation</li>
                      <li>Spread the word about the project</li>
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="@https://github.com/LastMile-Innovations/Global_Pulse.git"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="mr-2 group transition hover:scale-105">
                          <Github className="mr-2 h-4 w-4 group-hover:text-secondary" />
                          GitHub Repository
                        </Button>
                      </a>
                      <a
                        href="@https://github.com/LastMile-Innovations/Global_Pulse.git#readme"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="group transition hover:scale-105">
                          <Code className="mr-2 h-4 w-4 group-hover:text-secondary" />
                          Documentation
                        </Button>
                      </a>
                    </div>
                  </div>
                ),
              },
              {
                question: "What about using Global Pulse data in research?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      There's no user data to share yet. But we're designing toward safe, consented, ethically usable aggregate datasets—eventually.
                    </p>
                    <p>
                      If you want to talk, visit our researchers page or contact us directly.
                    </p>
                    <Link href="/for-researchers" legacyBehavior>
                      <Button variant="outline" size="sm" className="group transition hover:scale-105 mt-2">
                        <Database className="mr-2 h-4 w-4 group-hover:text-primary" />
                        For Researchers
                      </Button>
                    </Link>
                  </div>
                ),
              },
              {
                question: "Who's building this?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      A small human team. Greyson Paynter is leading architecture/dev. Debra Lundquist is holding the ethical pulse and product vision. We collaborated with AI partners (GPT-4o, Gemini 2.5, Claude, etc.) during the build.
                    </p>
                    <Link href="/about" legacyBehavior>
                      <Button variant="outline" size="sm" className="group transition hover:scale-105 mt-2">
                        <UserCircle className="mr-2 h-4 w-4 group-hover:text-primary" />
                        About Us
                      </Button>
                    </Link>
                  </div>
                ),
              },
              {
                question: "Is this therapy?",
                answer: (
                  <div className="space-y-2">
                    <p className="font-bold text-destructive">No. Not even close.</p>
                    <p>
                      Pulse is a space for reflection, not diagnosis or treatment. We're strict about that boundary.
                    </p>
                    <p>
                      If you are experiencing significant distress or mental health concerns, please consult a qualified healthcare professional. We provide crisis resources in emergencies, but that is the extent of our mental health intervention.
                    </p>
                    <Link href="/demo/crisis-resources" legacyBehavior>
                      <Button variant="outline" className="mt-2 group transition hover:scale-105">
                        <AlertCircle className="mr-2 h-4 w-4 group-hover:text-destructive" />
                        Crisis Resources
                      </Button>
                    </Link>
                  </div>
                ),
              },
            ]}
          />

          <FaqSection
            title="Final Words"
            icon={<MessageSquare className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "What does joining the waitlist get me?",
                answer: (
                  <div className="space-y-2">
                    <p>Joining our waitlist provides:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Early Notification:</strong> First to know when we launch interactive features
                      </li>
                      <li>
                        <strong>Development Updates:</strong> Progress reports on our build
                      </li>
                      <li>
                        <strong>Input Opportunities:</strong> Chances to provide feedback
                      </li>
                      <li>
                        <strong>Priority Access:</strong> When we begin rolling out features
                      </li>
                    </ul>
                    <Link href="/#waitlist" legacyBehavior>
                      <Button variant="outline" className="group transition hover:scale-105 mt-2">
                        <ExternalLink className="mr-2 h-4 w-4 group-hover:text-secondary" />
                        Join the Waitlist
                      </Button>
                    </Link>
                  </div>
                ),
              },
              {
                question: "Is there a cost to using Global Pulse?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      Joining the waitlist is free. Our current plan is for the initial versions of Global Pulse (including core chat and basic insights) to be free to use when they launch.
                    </p>
                    <p>
                      We're exploring sustainable models for the long term, potentially involving premium features or ethical aggregate insight products (with revenue sharing for consenting users).
                    </p>
                    <p>
                      But first—we need to build something worth paying for. Our focus now is on creating value, not extracting it.
                    </p>
                  </div>
                ),
              },
              {
                question: "Why should I care about this project?",
                answer: (
                  <div className="space-y-2">
                    <p>
                      We're not here to dazzle. We're here to build something trustworthy. Something slow, intentional, and clear. If that matters to you, welcome.
                    </p>
                    <p>
                      Global Pulse aims to be:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>An AI that reflects rather than extracts</li>
                      <li>Open-source and community-accountable</li>
                      <li>Designed for user dignity and agency</li>
                      <li>A viable model for ethical AI development</li>
                    </ul>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>

      <footer className="mt-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Still have questions?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/contact" legacyBehavior>
            <Button className="transition hover:scale-105">Contact Us</Button>
          </Link>
          <a
            href="@https://github.com/LastMile-Innovations/Global_Pulse.git"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="transition hover:scale-105">
              <Github className="mr-2 h-4 w-4" />
              Explore the Code
            </Button>
          </a>
          <Link href="/#waitlist" legacyBehavior>
            <Button variant="outline" className="transition hover:scale-105">
              <ExternalLink className="mr-2 h-4 w-4" />
              Join the Waitlist
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}

