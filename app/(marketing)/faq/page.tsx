import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BookOpen,
  Code,
  ExternalLink,
  Github,
  Lock,
  MessageSquare,
  Shield,
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
      <header className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Your Questions Answered <span className="inline-block animate-bounce">?</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome! We just wrapped an intense 10-day build sprint for the Vercel AI Hackathon, turning an idea into the
          first functioning core of Global Pulse. It's raw, it's early, and honestly, we're running on fumes and
          excitement. We know you have questions about what we've built so far and where this journey is headed.
        </p>
      </header>

      <main>
        <div className="grid gap-10">
          <FaqSection
            title="About Global Pulse & How It Works"
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "What IS Global Pulse right now? Can I chat with Pulse?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      <strong>Let's be clear:</strong> Global Pulse is currently a <em>demo</em> and an{" "}
                      <em>open-source codebase</em>, not a live, interactive chat experience. You can't directly "talk" to
                      Pulse yet.
                    </p>
                    <p>
                      What we built in our 10-day hackathon sprint is the foundation. We've created:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>A Demo:</strong> Showcasing how the EWEF and UIG are designed to work together to analyze
                        emotional experiences.
                      </li>
                      <li>
                        <strong>The Core Code:</strong> The open-source implementation of our Enhanced Webb Emotional
                        Framework (EWEF) and Unified Identity Graph (UIG) systems.
                      </li>
                      <li>
                        <strong>The Vision:</strong> Documentation explaining where we're headed with this technology.
                      </li>
                    </ul>
                    <p>
                      Think of it as the blueprints and foundation of a house – you can see the plans and the basement, but you can't move in yet!
                    </p>
                  </div>
                ),
              },
              {
                question: "What's the EWEF and UIG? Sounds complicated.",
                answer: (
                  <div className="space-y-3">
                    <p>We try to simplify!</p>
                    <p>
                      <strong>UIG (Unified Identity Graph):</strong> Think of it as a private, secure, dynamic map of your
                      unique identity – the things you care about (Attachments), their importance (PL), your
                      positive/negative feelings towards them (V), and how they connect. It evolves as you interact.
                    </p>
                    <p>
                      <strong>EWEF (Enhanced Webb Emotional Framework):</strong> This is the analysis engine. It takes
                      what's happening (Perception P) and compares it to what matters to you (Expectation EP, derived from
                      your active UIG attachments). It then figures out the likely core feeling (VAD:
                      Valence-Arousal-Dominance) and the most probable emotion category (like Anger, Joy, Confusion) based
                      on established psychological principles (like Webb's MHH variables: Source, Perspective, Time,
                      Acceptance) and your overall context (State, Culture, Personality).
                    </p>
                  </div>
                ),
              },
              {
                question: "What does the demo actually show?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Our demo is a static representation of how the Global Pulse system is designed to work. It
                      showcases:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>The Core Concept:</strong> How the EWEF analyzes interactions to understand the "why"
                        behind emotions.
                      </li>
                      <li>
                        <strong>UIG Visualization:</strong> How your identity graph would map your{" "}
                        <code>{"{Attachments}"}</code> (Values, Goals, Beliefs, etc.).
                      </li>
                      <li>
                        <strong>Analysis Flow:</strong> The process of taking perceptions (P), comparing them to
                        expectations (EP), and generating emotional responses (ER).
                      </li>
                      <li>
                        <strong>Key Components:</strong> The various modules that make up the system architecture.
                      </li>
                    </ul>
                    <p>
                      Think of it as an interactive museum exhibit about the technology, rather than the technology itself
                      in action.
                    </p>
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
                question: "How can I engage with the code?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      The core of Global Pulse – the EWEF pipeline logic, UIG utilities, and related components – is
                      available as open-source code. Here's how you can engage:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Explore:</strong> Browse the repository to understand how we've implemented the
                        psychological frameworks.
                      </li>
                      <li>
                        <strong>Report Issues:</strong> Found a bug or have a suggestion? Open an issue on GitHub.
                      </li>
                      <li>
                        <strong>Contribute:</strong> Submit pull requests with improvements or extensions.
                      </li>
                      <li>
                        <strong>Discuss:</strong> Join conversations about the architecture and implementation.
                      </li>
                      <li>
                        <strong>Fork:</strong> Create your own version or experiment with the code.
                      </li>
                    </ul>
                    <p>
                      Even if you're not a developer, exploring the code can give you insights into how we're approaching
                      emotional intelligence modeling.
                    </p>
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
                question: "When will I be able to actually chat with Pulse?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      We're working on it! Building a fully functional, responsible AI companion with the depth we're
                      aiming for isn't a weekend project (though we did cram an impressive amount into our 10-day
                      hackathon sprint!).
                    </p>
                    <p>Our roadmap includes:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Stabilizing the Core:</strong> Refining the EWEF and UIG implementations based on feedback.
                      </li>
                      <li>
                        <strong>Building the Chat Interface:</strong> Creating the conversational layer that will become
                        Pulse.
                      </li>
                      <li>
                        <strong>Integrating Safeguards:</strong> Ensuring the system operates ethically and responsibly.
                      </li>
                      <li>
                        <strong>Testing & Iteration:</strong> Gradually expanding access to ensure quality.
                      </li>
                    </ul>
                    <p>
                      We're avoiding specific timelines because we want to get this right, not rush it.{" "}
                      <Link href="/#waitlist" className="underline text-primary">
                        Join our waitlist
                      </Link>{" "}
                      to be notified when interactive features become available.
                    </p>
                  </div>
                ),
              },
              {
                question: "Is this therapy? Can Pulse diagnose me?",
                answer: (
                  <div className="space-y-3">
                    <p className="font-bold text-destructive">Absolutely NOT.</p>
                    <p>
                      Global Pulse is a tool for self-awareness and exploration, not a replacement for professional
                      therapy or medical advice. Pulse cannot and will not provide diagnoses or treatment plans.
                    </p>
                    <p>
                      If you are experiencing significant distress or mental health concerns, please consult a qualified
                      healthcare professional. We provide crisis resources in emergencies, but that is the extent of our
                      direct mental health intervention.
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
              {
                question: "How is this different from standard sentiment analysis?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Sentiment analysis typically gives a simple positive/negative/neutral score. Global Pulse aims much
                      deeper:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>VAD:</strong> We calculate Valence (pleasant/unpleasant), Arousal (energy level), and
                        Dominance (feeling in control).
                      </li>
                      <li>
                        <strong>Categorization:</strong> We predict probabilities across multiple specific emotion labels
                        (Anger, Joy, Fear, Guilt, Confusion, etc.).
                      </li>
                      <li>
                        <strong>The "Why":</strong> We link the predicted emotion back to the interaction between your UIG
                        Attachments (EP) and your cognitive Appraisal (P, including MHH variables), providing insight into
                        the drivers of the feeling.
                      </li>
                    </ul>
                  </div>
                ),
              },
            ]}
          />

          <FaqSection
            title="Privacy, Security & Data"
            icon={<Shield className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "What data do you collect in the current demo?",
                answer: (
                  <div className="space-y-3">
                    <p>Since we're not yet offering a live chat experience, our current data collection is minimal:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Your email address if you join the waitlist</li>
                      <li>Basic anonymous analytics about site usage</li>
                      <li>Any feedback you explicitly provide through our contact forms</li>
                    </ul>
                    <p>
                      <strong>We are NOT currently:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Collecting chat data (since there's no live chat yet)</li>
                      <li>Building your UIG (this will happen when the interactive features launch)</li>
                      <li>Connecting to external data sources</li>
                    </ul>
                    <p>
                      Our privacy foundations are already in place, so when we do launch interactive features,
                      your data will be protected from day one.
                    </p>
                  </div>
                ),
              },
              {
                question: "How will my data be protected when the chat launches?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Our commitment to privacy was baked in from line one, even during the hackathon sprint. When we
                      launch interactive features, we'll employ multiple layers of security:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Encryption:</strong> Data will be encrypted both in transit (TLS/SSL) and at rest (in our
                        databases and storage).
                      </li>
                      <li>
                        <strong>Access Controls:</strong> Strict technical and organizational controls will limit access
                        to your specific identifiable data.
                      </li>
                      <li>
                        <strong>No Sale of Individual Data:</strong> We will never sell or share your identifiable
                        interaction data or UIG profile.
                      </li>
                      <li>
                        <strong>Consent-First:</strong> You'll have clear controls over what data is collected and how
                        it's used.
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
                question: "What about future 'aggregate data' and 'revenue sharing'?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      In the future, once we have a significant user base and interactive features, we plan to offer:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Aggregate Insights:</strong> Anonymous, collective trends about emotional responses to
                        public events or topics.
                      </li>
                      <li>
                        <strong>Revenue Sharing:</strong> A model where users who consent to having their anonymized data
                        contribute to commercial aggregate insights will share in the revenue generated.
                      </li>
                    </ul>
                    <p>
                      But let's be real – we're nowhere near that stage yet! We need to build the actual product first.
                      These are future plans that will require explicit consent when the time comes.
                    </p>
                  </div>
                ),
              },
              {
                question: "Are the Ethical Guardrails implemented in the code?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Yes! Even though we don't have a live chat experience yet, we've implemented the foundations of the
                      Ethical Guardrail Layer in our code:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Consent Enforcement:</strong> Code that actively checks user permissions before processing.
                      </li>
                      <li>
                        <strong>Well-being Priority:</strong> VAD impact simulation designed to catch potentially harmful
                        responses.
                      </li>
                      <li>
                        <strong>Distress Protocol:</strong> Trigger detection and resource linking functionality.
                      </li>
                      <li>
                        <strong>Bias Checking:</strong> Basic keyword checks (to be expanded).
                      </li>
                    </ul>
                    <p>
                      You can review these implementations in our open-source code. They'll continue to be refined as we
                      develop the platform.
                    </p>
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
            title="Waitlist & Future Access"
            icon={<MessageSquare className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "What does joining the waitlist get me?",
                answer: (
                  <div className="space-y-3">
                    <p>Joining the waitlist gets you:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Early Notification:</strong> You'll be among the first to know when we launch interactive
                        features.
                      </li>
                      <li>
                        <strong>Development Updates:</strong> Occasional emails about our progress building the platform.
                      </li>
                      <li>
                        <strong>Opportunity for Input:</strong> Chances to provide feedback that shapes the direction of
                        Global Pulse.
                      </li>
                      <li>
                        <strong>Priority Access:</strong> When we do start rolling out interactive features, waitlist
                        members will get priority.
                      </li>
                    </ul>
                    <p>
                      Think of it as reserving your spot in line for when we open the doors, plus getting the inside scoop
                      on development.
                    </p>
                  </div>
                ),
              },
              {
                question: "When will interactive features be available?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Honestly? We just finished a 10-day code whirlwind! The hackathon marks the start, not the finish
                      line.
                    </p>
                    <p>We need to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Stabilize and refine the core EWEF and UIG implementations</li>
                      <li>Build the conversational interface</li>
                      <li>Implement robust security and privacy controls</li>
                      <li>Test extensively to ensure quality and safety</li>
                    </ul>
                    <p>
                      We're avoiding specific timelines because quality and safety come first. This is a marathon, not
                      just a sprint (though the start felt like one!).
                    </p>
                  </div>
                ),
              },
              {
                question: "Is there a cost to join the waitlist or use the future platform?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Joining the waitlist is free. Our current plan is for the initial versions of Global Pulse
                      (including core chat and basic insights) to be free to use when they launch.
                    </p>
                    <p>
                      We are exploring sustainable models for the long term, potentially involving premium features or the
                      ethical aggregate insight products (with revenue sharing for consenting users).
                    </p>
                    <p>
                      But first things first – we need to build something worth paying for! Our focus now is on creating
                      value, not extracting it.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <FaqSection
            title="Open Source"
            icon={<Github className="h-6 w-6 text-primary" />}
            questions={[
              {
                question: "You open-sourced the code already? Isn't it incomplete?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Yes! And yes! We launched the core framework code as it stands at the end of the hackathon. It's
                      definitely not complete or fully polished. That's the point!
                    </p>
                    <p>
                      We believe in building openly. You can see exactly what we built in 10 days, find bugs, critique the
                      V1 EWEF logic, suggest improvements, or even contribute code as we flesh it out. This transparency
                      is part of the deal.
                    </p>
                    <p>
                      The code represents our current implementation of the EWEF and UIG concepts, along with the
                      supporting infrastructure. It's a foundation to build upon, not a finished product.
                    </p>
                    <a
                      href="@https://github.com/LastMile-Innovations/Global_Pulse.git"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="mt-2 group transition hover:scale-105">
                        <Github className="mr-2 h-4 w-4 group-hover:text-secondary" />
                        View GitHub Repository
                      </Button>
                    </a>
                  </div>
                ),
              },
              {
                question: "Why open source so early? How can I contribute?",
                answer: (
                  <div className="space-y-3">
                    <p>We open-sourced early for several reasons:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Transparency:</strong> When dealing with emotional data, we believe users deserve to see
                        exactly how their information is processed.
                      </li>
                      <li>
                        <strong>Trust:</strong> Open code means accountability – we can't hide problematic practices.
                      </li>
                      <li>
                        <strong>Collaboration:</strong> We genuinely believe community input will make this better.
                      </li>
                      <li>
                        <strong>Learning:</strong> Others can learn from our approach (and we can learn from feedback).
                      </li>
                    </ul>
                    <p>You can contribute by:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Reviewing the code and providing feedback</li>
                      <li>Opening issues for bugs or suggestions</li>
                      <li>Submitting pull requests with improvements</li>
                      <li>Helping with documentation</li>
                      <li>Spreading the word about the project</li>
                    </ul>
                    <p>
                      Even if you're not a developer, your perspective on the approach and concepts is valuable. Check out
                      our <code>CONTRIBUTING.md</code> (coming soon!) for more details.
                    </p>
                    <a
                      href="@https://github.com/LastMile-Innovations/Global_Pulse.git"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="mt-2 group transition hover:scale-105">
                        <Github className="mr-2 h-4 w-4 group-hover:text-secondary" />
                        View GitHub Repository
                      </Button>
                    </a>
                  </div>
                ),
              },
              {
                question: "If the code is open source, how will Global Pulse make money?",
                answer: (
                  <div className="space-y-3">
                    <p>
                      Our primary focus now is building great tech ethically. Future potential business models include:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Hosted Service:</strong> Offering a reliable, scalable hosted version of the platform.
                      </li>
                      <li>
                        <strong>Premium Features:</strong> Advanced capabilities for individual users or teams.
                      </li>
                      <li>
                        <strong>Aggregate Insights:</strong> Selling strictly anonymized, aggregate insight products
                        derived from users who have explicitly consented (with revenue sharing).
                      </li>
                      <li>
                        <strong>Enterprise Solutions:</strong> Customized implementations for specific use cases.
                      </li>
                    </ul>
                    <p>
                      Think of it like Linux or other open-source projects – the core is free and open, but there are
                      sustainable business models built around it.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>

      <footer className="mt-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Still got questions after wading through our post-hackathon reality check?
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
