import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  BookOpen,
  Code,
  FileText,
  Users,
  Database,
  Shield,
  GitBranch,
  Microscope,
  GraduationCap,
  BarChart,
  Lock,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: "For Researchers | Global Pulse",
  description:
    "Collaborate with Global Pulse to advance human understanding through our computational framework for emotional meaning and identity.",
}

export default function ForResearchersPage() {
  return (
    <Suspense fallback={<div>Loading researcher info...</div>}>
      <div className="flex flex-col min-h-screen bg-darkBlue text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-darkBlue/95 backdrop-blur supports-[backdrop-filter]:bg-darkBlue/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <Link href="/" className="text-xl font-bold">
                Global Pulse
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How it Works
              </Link>
              <Link href="/#benefits" className="text-sm font-medium hover:text-primary transition-colors">
                Your Pulse
              </Link>
              <Link href="/#ethics" className="text-sm font-medium hover:text-primary transition-colors">
                Ethics & Openness
              </Link>
              <Link href="#" className="text-sm font-medium text-primary transition-colors">
                For Researchers
              </Link>
            </nav>
            <div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/#waitlist">Request Early Access</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-20 relative">
            <div className="container px-4 md:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-6">
                  Beyond the Lab, Beyond Surveys:
                  <span className="text-primary block mt-2">A New Lens on Human Experience</span>
                </h1>
                <div className="prose prose-invert max-w-3xl mx-auto">
                  <p className="text-xl text-gray-300 mb-6">
                    As researchers in psychology, sociology, HCI, computational science, and AI ethics, we know the
                    limitations of our current tools. Lab studies struggle with ecological validity, surveys capture
                    static self-reports often divorced from context, and existing digital data streams rarely provide
                    insight into the mechanisms underlying observed behavior or sentiment.
                  </p>
                  <p className="text-lg text-gray-300 mb-6">
                    We started Global Pulse with a perhaps audacious goal: to build a computational framework grounded in
                    modern psychological theory (primarily TCE, integrating MHH, SDT, FFM, Values Theory) that could
                    dynamically model the construction of emotional meaning within a rich, evolving representation of
                    individual identity (our Unified Identity Graph - UIG). Our Enhanced Webb Emotional Framework (EWEF)
                    aims to capture the interplay between context, identity (Attachments with PL/V), perception
                    (P_Appraised with MHH vars), core affect (VAD), and emotional categorization.
                  </p>
                  <p className="text-lg text-gray-300">
                    We believe this platform offers unprecedented opportunities for research. We are committed to
                    open-sourcing the core analytical framework to foster academic scrutiny and collaboration, and we
                    envision offering ethically sourced, anonymized datasets and potential secure research environments to
                    accelerate scientific discovery.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="#" className="flex items-center">
                      <Code className="mr-2 h-4 w-4" />
                      Explore the Open Source Code
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                    <Link href="#" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Read Foundational Documents
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                    <Link href="#" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Our Ethical Framework
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Framework Section */}
          <section id="framework" className="py-16 bg-charcoal">
            <div className="container px-4 md:px-6">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                  The Global Pulse Framework: A Research Platform
                </h2>
                <p className="text-gray-300">
                  A novel computational implementation of modern psychological theory, designed for research and
                  real-world application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      Novel Theoretical Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-primary">Theory of Constructed Emotion (TCE)</h4>
                      <p className="text-gray-300 text-sm">
                        Modeling emotion via core affect (VAD), context, and concept application.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Webb/MHH Cognitive Appraisal</h4>
                      <p className="text-gray-300 text-sm">
                        Using Source, Perspective, Timeframe, Acceptance as key variables differentiating emotional
                        experience.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Unified Identity Graph (UIG)</h4>
                      <p className="text-gray-300 text-sm">
                        Persistently modeling stable traits (FFM), core values (Schwartz), needs (SDT), goals, beliefs,
                        roles, and their dynamic interrelationships (CONCEPT_RELATIONSHIP), power (PL), valence (V), and
                        activation (AW).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Contextual Dynamics</h4>
                      <p className="text-gray-300 text-sm">
                        Explicitly modeling the influence of State (S), Culture (C), Personality (T), Social (SocialVars),
                        and Network (NetworkContext) factors.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-primary" />
                      Dynamic, Longitudinal Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-primary">Evolution of Attachments</h4>
                      <p className="text-gray-300 text-sm">
                        Track changes in Power Level (PL) and Valence (V) for identity attachments over time.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Emotional Response Sequences</h4>
                      <p className="text-gray-300 text-sm">
                        Sequences of ERInstance (VAD + Probabilities) linked to specific PInstance appraisals and
                        Interactions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">State Tracking</h4>
                      <p className="text-gray-300 text-sm">Tracking shifts in UserStateInstance (S) over time.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Bridging Qualitative & Quantitative</h4>
                      <p className="text-gray-300 text-sm">
                        Captures rich conversational data (Interaction) alongside structured, quantitative outputs (VAD,
                        MHH Variables, Attachment PL/V, Probabilities).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                  <Link href="#" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Download Technical Framework Documentation
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Collaboration Opportunities Section */}
          <section id="collaboration" className="py-16 bg-darkBlue">
            <div className="container px-4 md:px-6">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                  Collaboration Opportunities: Help Build the Future of Understanding
                </h2>
                <p className="text-gray-300">
                  We are actively seeking collaboration with academic researchers, post-docs, and PhD students across
                  relevant disciplines.
                </p>
              </div>

              <Tabs defaultValue="validation" className="max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-900 border border-gray-800 rounded-lg p-1">
                  <TabsTrigger value="validation" className="data-[state=active]:bg-primary">
                    Framework Validation
                  </TabsTrigger>
                  <TabsTrigger value="development" className="data-[state=active]:bg-primary">
                    Algorithm Development
                  </TabsTrigger>
                  <TabsTrigger value="opensource" className="data-[state=active]:bg-primary">
                    Open Source
                  </TabsTrigger>
                  <TabsTrigger value="ethics" className="data-[state=active]:bg-primary">
                    Ethical AI Research
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="validation" className="mt-6 space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Microscope className="h-5 w-5 mr-2 text-primary" />
                        Framework Validation & Refinement
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Help ensure our computational implementation accurately reflects psychological theory
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary">Theoretical Mapping</h4>
                        <p className="text-gray-300 text-sm">
                          Help ensure our computational implementation accurately reflects the nuances of TCE, MHH, FFM,
                          SDT, Schwartz, etc.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Model Validation</h4>
                        <p className="text-gray-300 text-sm">
                          Design and conduct studies to validate the EWEF pipeline stages (Appraisal, VAD prediction,
                          Categorization) against behavioral data, self-report measures, or potentially physiological
                          signals.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">UIG Structure Validation</h4>
                        <p className="text-gray-300 text-sm">
                          Evaluate the psychological validity and completeness of the UIG schema. Propose refinements or
                          new node/edge types based on specific theoretical needs.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Cross-Cultural Adaptation</h4>
                        <p className="text-gray-300 text-sm">
                          Help refine CulturalContextProfile implementation and EWEF modulation rules for diverse cultural
                          contexts.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="development" className="mt-6 space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Code className="h-5 w-5 mr-2 text-primary" />
                        Algorithm & Model Development
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Collaborate on developing more sophisticated models and algorithms
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary">Enhance PCE Modules</h4>
                        <p className="text-gray-300 text-sm">
                          Collaborate on developing more sophisticated ML models for appraisal, VAD prediction,
                          categorization, or social sub-models using the framework.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Develop Learning Algorithms</h4>
                        <p className="text-gray-300 text-sm">
                          Work on advanced Learning Layer strategies (RL, Bayesian methods) for UIG personalization and
                          model adaptation.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Causal Inference</h4>
                        <p className="text-gray-300 text-sm">
                          Explore methods for inferring potential causal links within the complex UIG structure.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Narrative Analysis</h4>
                        <p className="text-gray-300 text-sm">
                          Develop techniques to extract and model LifeNarrativeTheme nodes from longitudinal interaction
                          data.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="opensource" className="mt-6 space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GitBranch className="h-5 w-5 mr-2 text-primary" />
                        Open Source Contribution
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Contribute directly to our open-source framework
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary">Code Contributions</h4>
                        <p className="text-gray-300 text-sm">
                          Directly contribute code, documentation, or tests to the open-source PCE framework.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Extensions & Modules</h4>
                        <p className="text-gray-300 text-sm">
                          Develop extensions or modules that integrate with the core framework.
                        </p>
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                          <Link href="#" className="flex items-center">
                            <GitBranch className="mr-2 h-4 w-4" />
                            View GitHub Repository
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ethics" className="mt-6 space-y-4">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        Ethical AI Research
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Use our platform as a testbed for ethical AI research
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary">Ethics Testbed</h4>
                        <p className="text-gray-300 text-sm">
                          Utilize the platform as a testbed for researching and developing novel AI ethics guardrails,
                          fairness assessment techniques, XAI methods, and privacy-preserving analytics.
                        </p>
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button asChild className="bg-primary hover:bg-primary/90">
                          <Link href="#" className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Research Collaboration Inquiry
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Data Access Section */}
          <section id="data-access" className="py-16 bg-charcoal">
            <div className="container px-4 md:px-6">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                  Data Access for Research: Ethical, Anonymized, Consented
                </h2>
                <p className="text-gray-300">
                  We plan to make data available for external research under strict ethical guidelines, governance, and
                  with user consent.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      Core Principles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-primary">User Consent is Paramount</h4>
                      <p className="text-gray-300 text-sm">
                        Data is only included in research datasets if users have given specific, informed, opt-in consent
                        for their anonymized data to be used for external research purposes.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Rigorous Anonymization</h4>
                      <p className="text-gray-300 text-sm">
                        All datasets shared for research will undergo state-of-the-art anonymization techniques (aiming
                        for Differential Privacy where feasible) to prevent individual re-identification.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Ethical Oversight</h4>
                      <p className="text-gray-300 text-sm">
                        All research data requests and proposed uses will be subject to review by an internal Ethics
                        Committee and likely require approval from the researcher's Institutional Review Board (IRB) or
                        equivalent body.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Data Minimization & Security</h4>
                      <p className="text-gray-300 text-sm">
                        Datasets will be curated to contain only the data necessary for the approved research question and
                        provided via secure channels or within a controlled research environment.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-primary" />
                      Potential Future Data Offerings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Subject to availability & ethical approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-primary">Anonymized Aggregate Trend Data</h4>
                      <p className="text-gray-300 text-sm">
                        Similar to potential commercial reports but tailored for academic questions (e.g., longitudinal
                        shifts in aggregate Value PL/V; correlation between aggregate UserState (S) and major
                        InformationEvents).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Anonymized Structural UIG Data</h4>
                      <p className="text-gray-300 text-sm">
                        Datasets capturing anonymized graph structures or property distributions across consenting
                        populations (e.g., common CONCEPT_RELATIONSHIP conflict patterns; distribution of
                        PersonalityProfile scores).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Anonymized Instance Sequences</h4>
                      <p className="text-gray-300 text-sm">
                        Datasets containing sequences of anonymized Interaction → PInstance → ERInstance nodes (excluding
                        raw text, focusing on VAD, MHH variables, Categories, context flags) for studying emotional
                        dynamics and appraisal patterns.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Synthetic Datasets</h4>
                      <p className="text-gray-300 text-sm">
                        Generation of statistically similar but entirely artificial UIG subgraph data based on learned
                        patterns from the consenting population, providing utility while further enhancing privacy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="max-w-3xl mx-auto">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-primary" />
                      Data Request & Governance Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ol className="list-decimal list-inside text-gray-300 space-y-2">
                      <li>
                        Researchers submit a detailed proposal outlining research questions, data requirements, analysis
                        plan, ethical considerations, IRB status, and planned outputs.
                      </li>
                      <li>Proposal reviewed by Global Pulse Ethics Committee / Data Governance team.</li>
                      <li>If approved, a Data Use Agreement (DUA) is executed.</li>
                      <li>Secure data access/delivery mechanism is established.</li>
                      <li>Ongoing compliance checks and output review (for anonymity preservation) may occur.</li>
                    </ol>
                  </CardContent>
                </Card>

                <div className="flex justify-center mt-8">
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="#" className="flex items-center">
                      <Database className="mr-2 h-4 w-4" />
                      Inquire About Ethical Data Access
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Section */}
          <section id="getting-started" className="py-16 bg-darkBlue">
            <div className="container px-4 md:px-6">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Getting Started</h2>
                <p className="text-gray-300">
                  We believe Global Pulse can be a powerful catalyst for understanding the human condition. We invite the
                  research community to join us in building, validating, and responsibly utilizing this technology to
                  generate meaningful knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                    <Code className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">Explore the Code</h3>
                    <p className="text-gray-400 mb-4 flex-grow">
                      Dive into the core framework on GitHub. Understand the EWEF logic and UIG utilities.
                    </p>
                    <Button asChild variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                      <Link href="#" className="flex items-center justify-center">
                        <GitBranch className="mr-2 h-4 w-4" />
                        GitHub Repository
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                    <BookOpen className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">Read the Documentation</h3>
                    <p className="text-gray-400 mb-4 flex-grow">
                      Review our PCE Framework documents and schema definitions to understand the theoretical foundations.
                    </p>
                    <Button asChild variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                      <Link href="#" className="flex items-center justify-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Documentation
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                    <GraduationCap className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">Contact Us</h3>
                    <p className="text-gray-400 mb-4 flex-grow">
                      Reach out with collaboration proposals or data inquiries via our research contact form.
                    </p>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href="#" className="flex items-center justify-center">
                        <Users className="mr-2 h-4 w-4" />
                        Research Contact
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-gray-800 bg-charcoal">
          <div className="container px-4 py-8 md:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold">Global Pulse</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Your AI companion for deep self-discovery and collective insight.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Resources</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-primary">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-primary">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-primary">
                        Ethical Charter
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Connect</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-primary">
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-primary">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-400 hover:text-primary">
                        GitHub
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Stay Updated</h3>
                <p className="mt-2 text-sm text-gray-400">Subscribe to our newsletter for updates on Global Pulse.</p>
                <form className="mt-4 flex items-center space-x-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                  />
                  <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>
                Global Pulse by LastMile Innovations | Built in Public | © {new Date().getFullYear()} All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Suspense>
  )
}
