import Link from "next/link"
import {
  Shield,
  Heart,
  UserCheck,
  Scale,
  Eye,
  AlertTriangle,
  FileText,
  Github,
  MessageSquare,
  Brain,
  CheckCircle,
  XCircle,
  Zap,
  AlertOctagon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata = {
  title: "Ethics & Safety | Global Pulse",
  description: "Our unshakable commitment to safety, ethics, and your trust at Global Pulse",
}

function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-extrabold tracking-tight mb-10 flex items-center gap-4">
      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2.5">
        <Icon className="h-8 w-8 text-primary" />
      </span>
      <span>{children}</span>
    </h2>
  )
}

function PrincipleCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card className="w-full bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  )
}

export default function EthicsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/40 to-background text-foreground">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative w-full py-32 md:py-44 lg:py-60 bg-gradient-to-br from-primary/5 via-background to-muted/30"
      >
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-60" />
        </div>
        <div className="relative z-10 container px-4 md:px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Our Unshakable Commitment to Safety, Ethics & Your Trust
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-medium">
              Tech With Power Demands Radical Responsibility. Full Stop.
            </p>
            <div className="bg-card/80 backdrop-blur-sm border border-border p-8 md:p-10 rounded-2xl shadow-lg my-10 text-left space-y-6">
              <p className="text-muted-foreground">
                Let's cut through the usual corporate jargon. Building Global Pulse – an engine designed to understand
                the deepest layers of human identity and emotion – is exhilarating. It's also incredibly serious
                business. We know the potential for misuse in tech like this isn't just hypothetical; it's a constant
                shadow we need to actively fight with transparency, robust safeguards, and frankly, giving you the damn
                controls.
              </p>
              <p className="text-muted-foreground">
                This isn't just a "privacy policy" checkbox for us. Our ethical framework isn't an afterthought; it's
                woven into the very first lines of code, into the architecture of the EWEF and UIG, and into every
                decision we make. We believe that if we can't build this safely and ethically, we shouldn't build it at
                all.
              </p>
              <p className="text-muted-foreground">
                This page lays out exactly how we approach that responsibility. No hidden clauses, no opaque algorithms
                presented as magic. We want you to understand the safeguards because your trust isn't just desired, it's
                required for Global Pulse to achieve its potential for good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Ethical Principles Section */}
      <section id="core-principles" className="py-24 bg-gradient-to-b from-muted/60 via-background to-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-5xl mx-auto">
            <SectionTitle icon={Shield}>
              I. Our Core Ethical Principles: <span className="text-primary">The Non-Negotiables</span>
            </SectionTitle>
            <p className="text-muted-foreground mb-12 text-lg text-center max-w-3xl mx-auto">
              These aren't just ideals; they are the active directives guiding our design and operation:
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <PrincipleCard icon={Heart} title="Beneficence (Aim to Help)">
                <p className="text-muted-foreground">
                  Our primary goal is to empower you with self-insight and contribute positively to collective
                  understanding (via anonymized, consented data). Features are built for your benefit.
                </p>
              </PrincipleCard>
              <PrincipleCard icon={AlertOctagon} title="Non-Maleficence (Do No Harm - PRIORITIZED)">
                <p className="text-muted-foreground">
                  We actively design to prevent psychological harm, manipulation, privacy breaches, or bias
                  amplification. Your safety and well-being override other goals. If a feature risks harm, it doesn't
                  ship, or it gets guardrails with teeth.
                </p>
              </PrincipleCard>
              <PrincipleCard icon={UserCheck} title="Autonomy (You Are In Control)">
                <p className="text-muted-foreground">
                  You own your data and your experience. This means clear, granular, informed, opt-in consent for
                  everything non-essential. Full data access, correction (where feasible), and deletion rights are
                  baked in.
                </p>
              </PrincipleCard>
              <PrincipleCard icon={Scale} title="Justice (Striving for Fairness)">
                <p className="text-muted-foreground">
                  We actively work to identify and mitigate unfair algorithmic bias in our analysis and outputs. We
                  aim for equitable design and responsible use of insights.
                </p>
              </PrincipleCard>
              <div className="md:col-span-2">
                <PrincipleCard icon={Eye} title="Transparency & Openness">
                  <p className="text-muted-foreground">
                    We operate openly. The core EWEF/UIG code is open for inspection. We explain how the system works
                    (see How it Works page) and provide clear policies. No black boxes where your core experience is
                    concerned.
                  </p>
                  <div className="mt-5 flex justify-end">
                    <Button
                      asChild
                      variant="outline"
                      className="border-border hover:bg-muted transition-colors"
                    >
                      <Link href="https://github.com/LastMile-Innovations/Global_Pulse.git" target="_blank" rel="noopener">
                        <Github className="mr-2 h-4 w-4" />
                        View Our GitHub Repository
                      </Link>
                    </Button>
                  </div>
                </PrincipleCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consent & Control Section */}
      <section id="consent-control" className="py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-5xl mx-auto">
            <SectionTitle icon={UserCheck}>
              II. Your Data, Your Rules: <span className="text-primary">Consent & Control</span>
            </SectionTitle>
            <p className="text-muted-foreground mb-12 text-lg text-center max-w-3xl mx-auto">
              Your control isn't theoretical, it's implemented:
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="w-full bg-card shadow-sm hover:shadow-lg transition-shadow duration-300 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Explicit, Granular Consent</CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    You choose what Global Pulse can do. We ask for specific permission (opt-in only, no pre-checked
                    boxes) for:
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Connecting each external Data Hub source.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Allowing AI-driven emotional interpretations from Pulse.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Including your anonymized data in aggregate reports for internal research/improvement.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Including your anonymized data for model training.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        Including your anonymized data in saleable aggregate insight products (linked to future Revenue
                        Sharing).
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Processing any specifically identified sensitive data categories.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <PrincipleCard icon={FileText} title="Informed Decisions">
                <p className="text-muted-foreground">
                  Consent prompts clearly explain <strong>WHAT</strong> data is used, <strong>HOW</strong> it's used, <strong>WHY</strong> it's needed, and the potential <strong>RISKS/BENEFITS</strong>. Links to the full Privacy Policy are always provided.
                </p>
              </PrincipleCard>
              <PrincipleCard icon={Scale} title="Easy Management & Revocation">
                <p className="text-muted-foreground">
                  Your personal Consent Dashboard gives you a clear view of all permissions granted and allows you to
                  withdraw any consent at any time. Changes take effect promptly for future processing.
                </p>
              </PrincipleCard>
              <Card className="w-full bg-card shadow-sm hover:shadow-lg transition-shadow duration-300 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Full Data Rights</CardTitle>
                  <CardDescription className="text-muted-foreground text-base">You have the right to:</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Access:</strong> Request a copy of your key profile data.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Rectify:</strong> Suggest corrections to inferred data via feedback (influences the
                        Learning Layer).
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Erase:</strong> Request deletion of your account and personal data.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Portability:</strong> Request an export of your data in a usable format.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Guardrail Layer Section */}
      <section id="guardrails" className="py-24 bg-gradient-to-b from-muted/60 via-background to-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-5xl mx-auto">
            <SectionTitle icon={Shield}>
              III. The Ethical Guardrail Layer: <span className="text-primary">Active Safeguards in the Code</span>
            </SectionTitle>
            <p className="text-muted-foreground mb-12 text-lg text-center max-w-3xl mx-auto">
              We don't just rely on policy; we build safety nets directly into the Pulse Context Engine (PCE).
            </p>
            <div className="bg-card/90 border border-border p-8 md:p-10 rounded-2xl shadow-lg mb-12">
              <div className="flex flex-col items-center text-center">
                <p className="text-muted-foreground mb-6 font-medium text-lg">How it works:</p>
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                  <div className="bg-card px-6 py-3 rounded-lg font-semibold shadow-sm border border-border">User Input</div>
                  <Zap className="h-7 w-7 text-primary" />
                  <div className="bg-primary/20 border border-primary px-6 py-3 rounded-lg font-bold shadow-sm">
                    Ethical Guardrail Checkpoint
                  </div>
                  <Zap className="h-7 w-7 text-primary" />
                  <div className="bg-card px-6 py-3 rounded-lg font-semibold shadow-sm border border-border">Pulse Response / UIG Update</div>
                </div>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <PrincipleCard icon={UserCheck} title="Consent Enforcement Module">
                <ul className="space-y-3 text-muted-foreground list-disc ml-5">
                  <li>
                    Acts as a constant gatekeeper. Before any data is processed or used for a specific purpose
                    (analysis, aggregation, training, Data Hub sync), this module automatically verifies your explicit
                    consent for that exact action via your :ConsentProfile in the UIG.
                  </li>
                  <li>If consent is missing = Process Blocked.</li>
                </ul>
              </PrincipleCard>
              <PrincipleCard icon={Heart} title="Well-being Priority Module">
                <ul className="space-y-3 text-muted-foreground list-disc ml-5">
                  <li>
                    We try to anticipate the emotional impact of Pulse's own words. Before Pulse sends a response,
                    this module uses the EWEF engine to simulate its likely VAD impact on you in your current state
                    (S).
                  </li>
                  <li>
                    If the predicted impact crosses predefined safety thresholds (indicating potential for severe
                    distress, accounting for your current stress level), the risky response is BLOCKED. Pulse will
                    then either send a pre-approved safe/neutral fallback message or attempt (with re-checking) to
                    generate a gentler alternative. In critical predicted risk scenarios, it triggers our Distress
                    Protocol.
                  </li>
                </ul>
              </PrincipleCard>
              <PrincipleCard icon={AlertTriangle} title="Distress Protocol V1">
                <ul className="space-y-3 text-muted-foreground list-disc ml-5">
                  <li>
                    Activated only by the Well-being module detecting a critically high predicted negative emotional
                    impact from a candidate Pulse response.
                  </li>
                  <li>Immediately blocks the harmful response.</li>
                  <li>
                    Provides a carefully worded message acknowledging intensity and offering localized, verified
                    crisis support resources (using distress-resources.config.ts based on your general region, if
                    available, otherwise global defaults). Examples:
                    <ul className="ml-6 mt-3 space-y-2 list-disc">
                      <li>US Suicide & Crisis Lifeline: Call or Text 988</li>
                      <li>Samaritans UK: Call 116 123</li>
                    </ul>
                  </li>
                  <li>Logs a critical GuardrailAlert for internal review.</li>
                </ul>
                <Alert variant="destructive" className="mt-5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription className="text-destructive-foreground">
                    Global Pulse is NOT a crisis hotline or therapy replacement. This protocol is a last-resort safety
                    net designed to connect users with real, professional help when immediate risk is inadvertently
                    detected by our system analyzing its own potential response impact.
                  </AlertDescription>
                </Alert>
              </PrincipleCard>
              <PrincipleCard icon={AlertOctagon} title="Manipulation Detection Module (Evolving)">
                <p className="text-muted-foreground mb-4">
                  Monitors interaction patterns and directives sent to Pulse's LLM. Uses heuristics and pattern
                  matching (V1) to flag interactions potentially indicative of:
                </p>
                <ul className="space-y-3 text-muted-foreground ml-6 list-disc">
                  <li>Exploiting known user vulnerabilities (sensitive high-PL Attachments).</li>
                  <li>Inducing guilt/obligation unfairly.</li>
                  <li>Gaslighting patterns (invalidating user experience inconsistent with internal analysis).</li>
                  <li>Known dark conversational patterns.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Logs alerts (ManipulationDetected). Can intervene by blocking or modifying the directive sent to the
                  Pulse LLM, forcing a neutral conversational goal. Requires ongoing development and refinement.
                </p>
              </PrincipleCard>
            </div>
          </div>
        </div>
      </section>

      {/* Forbidden Uses Section */}
      <section id="forbidden-uses" className="py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-5xl mx-auto">
            <SectionTitle icon={XCircle}>
              V. Forbidden Uses: <span className="text-primary">Lines We Will Not Cross</span>
            </SectionTitle>
            <p className="text-muted-foreground mb-12 text-lg text-center max-w-3xl mx-auto">
              We explicitly forbid and build safeguards against using Global Pulse or its data for:
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { label: "Inflicting Harm", desc: "Intentionally causing severe distress or exploiting vulnerabilities." },
                { label: "Manipulation", desc: "Coercive influence for commercial, political, or other means." },
                { label: "Unauthorized Surveillance", desc: "No backdoors for indiscriminate monitoring." },
                { label: "Discrimination", desc: "Providing data or tools that enable unfair treatment." },
                { label: "Selling Identifiable Data", desc: "Individual data is never for sale. Period." },
                { label: "Hate Speech / Incitement", desc: "Facilitating harm against groups." },
              ].map((item, i) => (
                <div key={item.label} className="flex items-start gap-4 bg-card/80 border border-border rounded-lg p-5 shadow-sm">
                  <span className="inline-flex items-center justify-center rounded-full bg-destructive/10 p-2 mt-0.5">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </span>
                  <p className="text-muted-foreground">
                    <strong>{item.label}:</strong> {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section id="governance" className="py-24 bg-gradient-to-b from-muted/60 via-background to-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-5xl mx-auto">
            <SectionTitle icon={Scale}>
              VI. Governance, Accountability &amp; <span className="text-primary">The Future</span>
            </SectionTitle>
            <div className="grid gap-8 md:grid-cols-2">
              <PrincipleCard icon={Github} title="Open Source Core">
                <p className="text-muted-foreground">
                  Our commitment to transparency means our core analytical code is open for inspection.
                </p>
                <div className="mt-5 flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted transition-colors"
                  >
                    <Link href="https://github.com/LastMile-Innovations/Global_Pulse.git" target="_blank" rel="noopener">
                      <Github className="mr-2 h-4 w-4" />
                      View Our GitHub Repository
                    </Link>
                  </Button>
                </div>
              </PrincipleCard>
              <PrincipleCard icon={FileText} title="Audits">
                <p className="text-muted-foreground">
                  We commit to regular internal and periodic independent external audits of our security, privacy, and
                  ethical practices.
                </p>
              </PrincipleCard>
              <PrincipleCard icon={MessageSquare} title="User Feedback">
                <p className="text-muted-foreground">
                  Your reports and feedback on ethical concerns are taken seriously and routed through a defined
                  internal review process.
                </p>
                <div className="mt-5 flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted transition-colors"
                  >
                    <Link href="/contact">
                      Contact Us With Concerns
                    </Link>
                  </Button>
                </div>
              </PrincipleCard>
              <PrincipleCard icon={Brain} title="Ongoing Evolution">
                <p className="text-muted-foreground">
                  The ethical landscape for AI is constantly evolving. We are committed to ongoing learning, adapting
                  our practices, and engaging with experts (potentially via a future Ethics Advisory Board) to ensure
                  Global Pulse remains a force for good.
                </p>
              </PrincipleCard>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-24 bg-muted/60">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border p-10 md:p-12 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-primary">A Note From Our Founder</h3>
              <p className="text-muted-foreground italic text-lg leading-relaxed">
                Building Global Pulse feels like handling something incredibly powerful and personal. We have to get the
                safety and ethics right, or none of the potential benefits matter. We're putting our framework, our
                code, and our principles out there because we believe openness and rigorous safeguards are the only way
                forward. We invite your scrutiny, your questions, and your participation in building this responsibly.
              </p>
            </div>

            <div className="mt-20 text-center">
              <h3 className="text-2xl font-bold mb-10">Learn More &amp; Get Involved</h3>
              <div className="flex flex-wrap justify-center gap-6">
                <Button asChild className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto rounded-lg shadow-md transition-colors">
                  <Link href="/privacy">Review Our Privacy Policy</Link>
                </Button>
                <Button asChild variant="outline" className="border-border hover:bg-muted text-lg px-8 py-6 h-auto rounded-lg shadow-md transition-colors">
                  <Link href="https://github.com/LastMile-Innovations/Global_Pulse.git" target="_blank" rel="noopener">
                    <Github className="mr-2 h-5 w-5" />
                    Explore the Open Source Code
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-border hover:bg-muted text-lg px-8 py-6 h-auto rounded-lg shadow-md transition-colors">
                  <Link href="/contact">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Contact Us with Questions/Concerns
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
