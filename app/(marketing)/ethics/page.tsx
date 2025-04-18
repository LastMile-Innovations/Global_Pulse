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

export default function EthicsPage() {
  return (
    <div className="min-h-screen bg-darkBlue text-white">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-purple-900/20 to-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Our Unshakable Commitment to Safety, Ethics & Your Trust
            </h1>
            <p className="text-xl text-gray-300 mb-8">Tech With Power Demands Radical Responsibility. Full Stop.</p>
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg my-8 text-left">
              <p className="text-gray-300">
                Let's cut through the usual corporate jargon. Building Global Pulse – an engine designed to understand
                the deepest layers of human identity and emotion – is exhilarating. It's also incredibly serious
                business. We know the potential for misuse in tech like this isn't just hypothetical; it's a constant
                shadow we need to actively fight with transparency, robust safeguards, and frankly, giving you the damn
                controls.
              </p>
              <p className="text-gray-300 mt-4">
                This isn't just a "privacy policy" checkbox for us. Our ethical framework isn't an afterthought; it's
                woven into the very first lines of code, into the architecture of the EWEF and UIG, and into every
                decision we make. We believe that if we can't build this safely and ethically, we shouldn't build it at
                all.
              </p>
              <p className="text-gray-300 mt-4">
                This page lays out exactly how we approach that responsibility. No hidden clauses, no opaque algorithms
                presented as magic. We want you to understand the safeguards because your trust isn't just desired, it's
                required for Global Pulse to achieve its potential for good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Ethical Principles Section */}
      <section id="core-principles" className="py-16 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-primary" />
              I. Our Core Ethical Principles: The Non-Negotiables
            </h2>
            <p className="text-gray-300 mb-8">
              These aren't just ideals; they are the active directives guiding our design and operation:
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-primary" />
                    Beneficence (Aim to Help)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Our primary goal is to empower you with self-insight and contribute positively to collective
                    understanding (via anonymized, consented data). Features are built for your benefit.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <AlertOctagon className="mr-2 h-5 w-5 text-primary" />
                    Non-Maleficence (Do No Harm - PRIORITIZED)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We actively design to prevent psychological harm, manipulation, privacy breaches, or bias
                    amplification. Your safety and well-being override other goals. If a feature risks harm, it doesn't
                    ship, or it gets guardrails with teeth.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5 text-primary" />
                    Autonomy (You Are In Control)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    You own your data and your experience. This means clear, granular, informed, opt-in consent for
                    everything non-essential. Full data access, correction (where feasible), and deletion rights are
                    baked in.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Scale className="mr-2 h-5 w-5 text-primary" />
                    Justice (Striving for Fairness)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We actively work to identify and mitigate unfair algorithmic bias in our analysis and outputs. We
                    aim for equitable design and responsible use of insights.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-primary" />
                    Transparency & Openness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We operate openly. The core EWEF/UIG code is open for inspection. We explain how the system works
                    (see How it Works page) and provide clear policies. No black boxes where your core experience is
                    concerned.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                      <Github className="mr-2 h-4 w-4" />
                      View Our GitHub Repository
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Consent & Control Section */}
      <section id="consent-control" className="py-16 bg-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <UserCheck className="mr-3 h-8 w-8 text-primary" />
              II. Your Data, Your Rules: Consent & Control
            </h2>
            <p className="text-gray-300 mb-8">Your control isn't theoretical, it's implemented:</p>

            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle>Explicit, Granular Consent</CardTitle>
                <CardDescription className="text-gray-400">
                  You choose what Global Pulse can do. We ask for specific permission (opt-in only, no pre-checked
                  boxes) for:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Connecting each external Data Hub source.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Allowing AI-driven emotional interpretations from Pulse.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Including your anonymized data in aggregate reports for internal research/improvement.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Including your anonymized data for model training.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      Including your anonymized data in saleable aggregate insight products (linked to future Revenue
                      Sharing).
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Processing any specifically identified sensitive data categories.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Informed Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Consent prompts clearly explain WHAT data is used, HOW it's used, WHY it's needed, and the potential
                    RISKS/BENEFITS. Links to the full Privacy Policy are always provided.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Easy Management & Revocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Your personal Consent Dashboard gives you a clear view of all permissions granted and allows you to
                    withdraw any consent at any time. Changes take effect promptly for future processing.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800 mt-6">
              <CardHeader>
                <CardTitle>Full Data Rights</CardTitle>
                <CardDescription className="text-gray-400">You have the right to:</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Access:</strong> Request a copy of your key profile data.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Rectify:</strong> Suggest corrections to inferred data via feedback (influences the
                      Learning Layer).
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Erase:</strong> Request deletion of your account and personal data.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Portability:</strong> Request an export of your data in a usable format.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ethical Guardrail Layer Section */}
      <section id="guardrails" className="py-16 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-primary" />
              III. The Ethical Guardrail Layer: Active Safeguards in the Code
            </h2>
            <p className="text-gray-300 mb-8">
              We don't just rely on policy; we build safety nets directly into the Pulse Context Engine (PCE).
            </p>

            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-8">
              <div className="flex flex-col items-center text-center">
                <p className="text-gray-300 mb-4">Simple flow:</p>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
                  <div className="bg-gray-900 px-4 py-2 rounded-md">User Input</div>
                  <Zap className="h-5 w-5 text-gray-400" />
                  <div className="bg-gray-900 px-4 py-2 rounded-md">PCE Analysis</div>
                  <Zap className="h-5 w-5 text-gray-400" />
                  <div className="bg-primary/20 border border-primary px-4 py-2 rounded-md font-bold">
                    Ethical Guardrail Checkpoint
                  </div>
                  <Zap className="h-5 w-5 text-gray-400" />
                  <div className="bg-gray-900 px-4 py-2 rounded-md">Pulse Response / UIG Update</div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5 text-primary" />
                    Consent Enforcement Module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      Acts as a constant gatekeeper. Before any data is processed or used for a specific purpose
                      (analysis, aggregation, training, Data Hub sync), this module automatically verifies your explicit
                      consent for that exact action via your :ConsentProfile in the UIG.
                    </li>
                    <li>If consent is missing = Process Blocked.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-primary" />
                    Well-being Priority Module
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
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
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                    Distress Protocol V1
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      Activated only by the Well-being module detecting a critically high predicted negative emotional
                      impact from a candidate Pulse response.
                    </li>
                    <li>Immediately blocks the harmful response.</li>
                    <li>
                      Provides a carefully worded message acknowledging intensity and offering localized, verified
                      crisis support resources (using distress-resources.config.ts based on your general region, if
                      available, otherwise global defaults). Examples:
                      <ul className="ml-6 mt-2 space-y-1">
                        <li>US Suicide & Crisis Lifeline: Call or Text 988</li>
                        <li>Samaritans UK: Call 116 123</li>
                      </ul>
                    </li>
                    <li>Logs a critical GuardrailAlert for internal review.</li>
                  </ul>
                  <Alert className="mt-4 bg-gray-800 border-gray-700">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Important Note</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      Global Pulse is NOT a crisis hotline or therapy replacement. This protocol is a last-resort safety
                      net designed to connect users with real, professional help when immediate risk is inadvertently
                      detected by our system analyzing its own potential response impact.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertOctagon className="mr-2 h-5 w-5 text-primary" />
                    Manipulation Detection Module (Evolving)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Monitors interaction patterns and directives sent to Pulse's LLM. Uses heuristics and pattern
                    matching (V1) to flag interactions potentially indicative of:
                  </p>
                  <ul className="space-y-2 text-gray-300 ml-6 list-disc">
                    <li>Exploiting known user vulnerabilities (sensitive high-PL Attachments).</li>
                    <li>Inducing guilt/obligation unfairly.</li>
                    <li>Gaslighting patterns (invalidating user experience inconsistent with internal analysis).</li>
                    <li>Known dark conversational patterns.</li>
                  </ul>
                  <p className="text-gray-300 mt-4">
                    Logs alerts (ManipulationDetected). Can intervene by blocking or modifying the directive sent to the
                    Pulse LLM, forcing a neutral conversational goal. Requires ongoing development and refinement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Forbidden Uses Section */}
      <section id="forbidden-uses" className="py-16 bg-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <XCircle className="mr-3 h-8 w-8 text-primary" />
              V. Forbidden Uses: Lines We Will Not Cross
            </h2>
            <p className="text-gray-300 mb-8">
              We explicitly forbid and build safeguards against using Global Pulse or its data for:
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start">
                <XCircle className="mr-3 h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong>Inflicting Harm:</strong> Intentionally causing severe distress or exploiting vulnerabilities.
                </p>
              </div>
              <div className="flex items-start">
                <XCircle className="mr-3 h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong>Manipulation:</strong> Coercive influence for commercial, political, or other means.
                </p>
              </div>
              <div className="flex items-start">
                <XCircle className="mr-3 h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong>Unauthorized Surveillance:</strong> No backdoors for indiscriminate monitoring.
                </p>
              </div>
              <div className="flex items-start">
                <XCircle className="mr-3 h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong>Discrimination:</strong> Providing data or tools that enable unfair treatment.
                </p>
              </div>
              <div className="flex items-start">
                <XCircle className="mr-3 h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong>Selling Identifiable Data:</strong> Individual data is never for sale. Period.
                </p>
              </div>
              <div className="flex items-start">
                <XCircle className="mr-3 h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <strong>Hate Speech / Incitement:</strong> Facilitating harm against groups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section id="governance" className="py-16 bg-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Scale className="mr-3 h-8 w-8 text-primary" />
              VI. Governance, Accountability & The Future
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Github className="mr-2 h-5 w-5 text-primary" />
                    Open Source Core
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Our commitment to transparency means our core analytical code is open for inspection.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                      <Github className="mr-2 h-4 w-4" />
                      View Our GitHub Repository
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Audits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We commit to regular internal and periodic independent external audits of our security, privacy, and
                    ethical practices.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    User Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Your reports and feedback on ethical concerns are taken seriously and routed through a defined
                    internal review process.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                      Contact Us With Concerns
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-primary" />
                    Ongoing Evolution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    The ethical landscape for AI is constantly evolving. We are committed to ongoing learning, adapting
                    our practices, and engaging with experts (potentially via a future Ethics Advisory Board) to ensure
                    Global Pulse remains a force for good.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-16 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">A Note From Our Founder</h3>
              <p className="text-gray-300 italic">
                Building Global Pulse feels like handling something incredibly powerful and personal. We have to get the
                safety and ethics right, or none of the potential benefits matter. We're putting our framework, our
                code, and our principles out there because we believe openness and rigorous safeguards are the only way
                forward. We invite your scrutiny, your questions, and your participation in building this responsibly.
              </p>
            </div>

            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold mb-6">Learn More & Get Involved</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/privacy">Review Our Privacy Policy</Link>
                </Button>
                <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                  <Link href="@https://github.com/LastMile-Innovations/Global_Pulse.git">
                    <Github className="mr-2 h-4 w-4" />
                    Explore the Open Source Code
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                  <Link href="/contact">
                    <MessageSquare className="mr-2 h-4 w-4" />
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
