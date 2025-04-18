"use client"

import { CardFooter } from "@/components/ui/card"

import Link from "next/link"
import Image from "next/image"
import { Github, Brain, Lightbulb, Users, Target, Heart, Scale, Compass, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export default function FrameworksTheoriesClientPage() {
  return (
    <div className="flex flex-col min-h-screen bg-darkBlue text-white">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-purple-900/20 to-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              The Science Behind the Pulse: Our Theoretical Toolkit
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Global Pulse is not built on algorithmic guesswork. The Pulse Context Engine (PCE) is intentionally
              designed to operationalize and integrate insights from established scientific theories across psychology,
              neuroscience, sociology, and computational science.
            </p>
            <p className="text-gray-300 mb-8">
              We believe that grounding our platform in validated frameworks leads to more meaningful, interpretable,
              and ultimately more useful insights. This page provides an overview of the key theoretical models and
              concepts that inform the structure of our Unified Identity Graph (UIG), the analytical processes of our
              Enhanced Webb Emotional Framework (EWEF), and the overall design philosophy of Global Pulse.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="https://github.com/globalpulse" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  Open Source Repository
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                <Link href="/ethics">
                  <Scale className="mr-2 h-4 w-4" />
                  Safety & Ethics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="meta-theory" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
                <TabsTrigger value="meta-theory" className="data-[state=active]:bg-primary">
                  <Brain className="mr-2 h-4 w-4" />
                  Meta-Theory
                </TabsTrigger>
                <TabsTrigger value="appraisal" className="data-[state=active]:bg-primary">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Appraisal Framework
                </TabsTrigger>
                <TabsTrigger value="uig-schema" className="data-[state=active]:bg-primary">
                  <Compass className="mr-2 h-4 w-4" />
                  UIG Schema
                </TabsTrigger>
                <TabsTrigger value="learning" className="data-[state=active]:bg-primary">
                  <Zap className="mr-2 h-4 w-4" />
                  Learning & Adaptation
                </TabsTrigger>
              </TabsList>

              {/* Meta-Theory Tab */}
              <TabsContent value="meta-theory" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Brain className="mr-2 h-6 w-6 text-primary" />
                    I. Core Meta-Theory: Guiding the Construction Process
                  </h2>
                  <p className="text-gray-300 mb-6">
                    The foundational theories that shape our overall approach to understanding emotion and identity.
                  </p>
                </div>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">Theory of Constructed Emotion (TCE)</CardTitle>
                        <CardDescription className="text-gray-400">Proponent: Dr. Lisa Feldman Barrett</CardDescription>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary">Primary Meta-Theory</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Role in Global Pulse:</h4>
                      <p className="text-gray-300">
                        Primary meta-theory shaping the entire EWEF pipeline design and philosophy.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Key Concepts Integrated:</h4>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>
                          <span className="font-medium">Emotion as Construction:</span> Rejects innate emotion circuits;
                          models emotion as meaning-making events constructed in context.
                        </li>
                        <li>
                          <span className="font-medium">Core Affect (VAD):</span> Prioritizes prediction of
                          Valence-Arousal-Dominance as the fundamental feeling state derived from
                          interoceptive/body-budget signals (proxied by UserState S).
                        </li>
                        <li>
                          <span className="font-medium">Concepts & Categorization:</span> Explicitly models learned
                          Attachment:EmotionConcept nodes in the UIG and uses them (along with context) in a distinct
                          Categorization stage following VAD prediction.
                        </li>
                        <li>
                          <span className="font-medium">Predictive Processing:</span> Frames the EWEF core loop as
                          Prediction (EP) vs. Prediction Error Appraisal (P_Appraised).
                        </li>
                        <li>
                          <span className="font-medium">Contextual Dependency:</span> Demands deep integration of S, C,
                          T, D, Social, Network context throughout appraisal, VAD calculation, and categorization
                          (Modulate(...) function).
                        </li>
                        <li>
                          <span className="font-medium">Variability:</span> The framework inherently models and expects
                          variability in emotional responses based on context and individual conceptual structure.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Implementation in Global Pulse:</h4>
                      <p className="text-gray-300">
                        The multi-stage EWEF pipeline (Sec 4.3 of PCE doc), the focus on VAD output, the separate
                        categorization step, the use of contextual modulation, and the structure of the UIG's concept
                        layer directly reflect TCE principles.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-800 pt-4">
                    <Button variant="link" className="text-primary p-0" asChild>
                      <Link href="https://lisafeldmanbarrett.com/books/how-emotions-are-made/" target="_blank">
                        Learn more about TCE
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Theory Integration Diagram</h3>
                  <div className="relative h-[300px] w-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <Image
                      src="/interconnected-intelligence.png"
                      alt="Theory Integration Diagram"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Appraisal Framework Tab */}
              <TabsContent value="appraisal" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Lightbulb className="mr-2 h-6 w-6 text-primary" />
                    II. Core Appraisal & Categorization Framework
                  </h2>
                  <p className="text-gray-300 mb-6">
                    The specific frameworks that drive our emotion appraisal and categorization processes.
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="ewef" className="border-gray-800">
                    <AccordionTrigger className="text-xl font-medium py-4 hover:no-underline hover:bg-gray-800/50 px-4 rounded-t-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        Enhanced Webb Emotional Framework (EWEF) / Mind Hacking Happiness (MHH) Variables
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Proponent:</h4>
                          <p className="text-gray-300">Sean Webb (originator of MHH/EoE concepts)</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Role in Global Pulse:</h4>
                          <p className="text-gray-300">
                            Provides the specific structured cognitive variables and rule-based heuristics (V1) for
                            appraisal and initial emotion group identification, operating within the broader TCE
                            framework.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Key Concepts Integrated:</h4>
                          <ul className="space-y-2 text-gray-300 list-disc pl-5">
                            <li>
                              <span className="font-medium">EP vs. P Comparison:</span> Central computational step
                              evaluating Perception against Expectation/Preference derived from UIG {"{Attachments}"}.
                            </li>
                            <li>
                              <span className="font-medium">MHH Variables:</span> The core EWEF P Appraiser explicitly
                              infers these cognitive dimensions:
                              <ul className="pl-5 mt-2 space-y-1 list-disc">
                                <li>
                                  <span className="italic">Source:</span> Internal / External / ValueSelf (Locus of
                                  Causality).
                                </li>
                                <li>
                                  <span className="italic">Perspective:</span> Internal / External / Both (Social
                                  Evaluation Lens).
                                </li>
                                <li>
                                  <span className="italic">Timeframe:</span> Past / Present / Future / Ongoing.
                                </li>
                                <li>
                                  <span className="italic">AcceptanceState:</span> Accepted / Resisted / Unresolved.
                                </li>
                                <li>(Confidence scores are attached to each inferred variable).</li>
                              </ul>
                            </li>
                            <li>
                              <span className="font-medium">Emotion Group Rules:</span> The Emotion Categorization
                              module uses the combination of MHH variables (from P Appraiser) as primary drivers to
                              identify the likely emotionGroup (Fear, Anger, Sadness, Pride, Shame, etc.) based on
                              Webb's defined conditions.
                            </li>
                            <li>
                              <span className="font-medium">Severity Calculation:</span> Uses EP Power Level (PL) and
                              P_PowerLevel (from P Appraiser) to determine the specific severityLabel within the
                              identified emotionGroup.
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Implementation in Global Pulse:</h4>
                          <p className="text-gray-300">
                            lib/pce/perception-appraisal.ts and lib/pce/variable-inference.ts infer MHH variables.
                            lib/pce/webb-rules.ts and lib/pce/webb-severity.ts implement the categorization and severity
                            logic. lib/pce/emotion-categorization.ts integrates this with VAD. MHH variables serve as
                            key cognitive features bridging core affect and discrete labels.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cognitive-appraisal" className="border-gray-800">
                    <AccordionTrigger className="text-xl font-medium py-4 hover:no-underline hover:bg-gray-800/50 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        Cognitive Appraisal Theories (Lazarus, Scherer/CPM)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Proponents:</h4>
                          <p className="text-gray-300">Richard Lazarus, Klaus Scherer, and others.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Role in Global Pulse:</h4>
                          <p className="text-gray-300">
                            Provides structure and specific dimensions for the P Appraiser module to evaluate the
                            significance of the Perception (P) beyond just the MHH variables.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Key Concepts Integrated:</h4>
                          <ul className="space-y-2 text-gray-300 list-disc pl-5">
                            <li>
                              <span className="font-medium">Primary Appraisal (Lazarus):</span> Assessing relevance to
                              goals/values (Stressful, Benign-Positive, Irrelevant).
                            </li>
                            <li>
                              <span className="font-medium">Secondary Appraisal (Lazarus):</span> Assessing coping
                              resources and options (influences Coping Potential check).
                            </li>
                            <li>
                              <span className="font-medium">Component Process Model (CPM - Scherer):</span>{" "}
                              Systematically checking input against key dimensions informs both MHH inference and
                              quantified impact calculation:
                              <ul className="pl-5 mt-2 space-y-1 list-disc">
                                <li>
                                  <span className="italic">Relevance Checks:</span> Novelty, Intrinsic Pleasantness,
                                  Goal/Need Significance.
                                </li>
                                <li>
                                  <span className="italic">Implication Checks:</span> Causal Attribution (feeds MHH
                                  Source), Outcome Probability.
                                </li>
                                <li>
                                  <span className="italic">Coping Potential Checks:</span> Control, Power, Adjustment
                                  capability (influences Dominance, AcceptanceState).
                                </li>
                                <li>
                                  <span className="italic">Normative Significance Checks:</span> Compatibility with
                                  external (Social/Cultural C) norms and internal (Value/Belief EPs) standards
                                  (influences Valence, Perspective).
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Implementation in Global Pulse:</h4>
                          <p className="text-gray-300">
                            The logic within lib/pce/perception-appraisal.ts incorporates checks inspired by these
                            dimensions to calculate pValuationShiftEstimate, pPowerLevel, pAppraisalConfidence, and help
                            infer MHH variables more accurately.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">EWEF Pipeline Visualization</h3>
                  <div className="relative h-[300px] w-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <Image src="/EWEF-Loop-Diagram.png" alt="EWEF Loop Diagram" fill className="object-contain p-4" />
                  </div>
                </div>
              </TabsContent>

              {/* UIG Schema Tab */}
              <TabsContent value="uig-schema" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Compass className="mr-2 h-6 w-6 text-primary" />
                    III. UIG Schema Foundations: Modeling Identity & Context
                  </h2>
                  <p className="text-gray-300 mb-6">
                    The theoretical frameworks that inform how we model identity, personality, values, and social
                    relationships in the Unified Identity Graph.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        Personality: Five-Factor Model (FFM / Big Five)
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Proponents: Costa & McCrae, Goldberg, John & Srivastava, etc.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Role in Global Pulse:</h4>
                          <p className="text-gray-300">
                            Provides the primary structure for the stable PersonalityProfile (T) node.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Integration:</h4>
                          <p className="text-gray-300">
                            Uses OCEAN dimensions (Openness, Conscientiousness, Extraversion, Agreeableness,
                            Neuroticism) as core attributes. These T scores act as contextual modulators within the EWEF
                            (e.g., Neuroticism amplifying negative Valence/Arousal).
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Compass className="mr-2 h-5 w-5 text-primary" />
                        Values: Schwartz's Theory of Basic Human Values
                      </CardTitle>
                      <CardDescription className="text-gray-400">Proponent: Shalom H. Schwartz</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Role in Global Pulse:</h4>
                          <p className="text-gray-300">
                            Structures the :Value attachment nodes and informs the structure of :CONCEPT_RELATIONSHIP
                            edges (Conflict/Support) between them, impacting NetworkContext.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Integration:</h4>
                          <p className="text-gray-300">
                            Uses Schwartz's 10/19 value types (e.g., Security, Hedonism, Benevolence, Universalism) as
                            potential node labels or properties. Crucially, implements :CONCEPT_RELATIONSHIP edges
                            (Conflict, Support) between Value nodes based on the Schwartz circular model, informing the
                            NetworkContext analysis.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Heart className="mr-2 h-5 w-5 text-primary" />
                        Needs: Self-Determination Theory (SDT)
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Proponents: Richard Ryan & Edward Deci
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Role in Global Pulse:</h4>
                          <p className="text-gray-300">Defines core psychological needs acting as fundamental EPs.</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Integration:</h4>
                          <p className="text-gray-300">
                            Models :Need attachment nodes for Autonomy, Competence, and Relatedness. These Needs often
                            have high baseline PL and their perceived fulfillment/thwarting significantly impacts VAD
                            and categorization (e.g., thwarted Autonomy -&gt; Anger/Frustration).
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain className="mr-2 h-5 w-5 text-primary" />
                        Beliefs & Cognition
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Theories: Cognitive Therapy (CT/Beck), REBT (Ellis), Schema Theory, Dual Process Theory
                        (Kahneman)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Role in Global Pulse:</h4>
                          <p className="text-gray-300">Informs representation and processing of cognitive elements.</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Integration:</h4>
                          <p className="text-gray-300">
                            :Belief nodes store propositions. Core beliefs identified via CT principles have high PL.
                            The EWEF conceptually models potential System 1 (fast/heuristic) vs. System 2
                            (slow/deliberative) influences on appraisal and re-appraisal. Cognitive Biases modeled as
                            potential modulators (future).
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="mr-2 h-5 w-5 text-primary" />
                        Goals & Motivation
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Theories: Goal-Setting Theory (Locke & Latham), Self-Efficacy (Bandura)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Role in Global Pulse:</h4>
                          <p className="text-gray-300">
                            Structures goal representation and its link to action/emotion.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Integration:</h4>
                          <p className="text-gray-300">
                            :Goal nodes include attributes like Specificity, Difficulty, Commitment (from Goal-Setting
                            Theory). Self-efficacy estimate (linked to Goal or user T profile) influences Coping
                            Potential appraisal and potentially Dominance.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        Social Relationships & Cognition
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Theories: Attachment Theory (Bowlby, Ainsworth), Social Exchange/Equity Theory, Investment Model
                        (Rusbult), Theory of Mind (ToM), Attribution Theory (Weiner)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Role in Global Pulse:</h4>
                          <p className="text-gray-300">Models the structure and dynamics of the user's social world.</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200 mb-1">Integration:</h4>
                          <p className="text-gray-300">
                            :SOCIAL_RELATIONSHIP edges store perceived quality, trust, commitment attributes.
                            PersonalityProfile (T) may hold AttachmentStyleIndicator. :PERCEIVES_ATTACHMENT edges model
                            ToM. Attribution Theory informs MHH Source inference in P Appraiser. SocialContext flags
                            trigger specialized analysis.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">UIG Schema Visualization</h3>
                  <div className="relative h-[300px] w-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <Image
                      src="/system-connectivity-diagram.png"
                      alt="UIG Schema Visualization"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Learning & Adaptation Tab */}
              <TabsContent value="learning" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Zap className="mr-2 h-6 w-6 text-primary" />
                    IV. Learning & Adaptation
                  </h2>
                  <p className="text-gray-300 mb-6">
                    The frameworks that enable Global Pulse to learn and adapt based on user feedback and interaction.
                  </p>
                </div>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-primary" />
                      Reinforcement Learning (RL) & Supervised Learning (Conceptual)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Role in Global Pulse:</h4>
                      <p className="text-gray-300">
                        Provides the mechanisms for the Learning Layer to adapt the UIG and potentially EWEF models
                        based on user feedback.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Integration:</h4>
                      <p className="text-gray-300">
                        Uses user feedback (:PredictionEvaluation) as reward/error signals. Updates UIG PL/V on
                        :HOLDS_ATTACHMENT edges (personalization) or potentially fine-tunes ModelParameterSet weights
                        using RL algorithms or supervised retraining techniques.
                      </p>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg mt-4">
                      <h4 className="font-medium text-gray-200 mb-2">Learning Flow:</h4>
                      <ol className="space-y-2 text-gray-300 list-decimal pl-5">
                        <li>User provides feedback on emotion prediction accuracy</li>
                        <li>Feedback stored as :PredictionEvaluation node</li>
                        <li>Learning Layer processes feedback batch</li>
                        <li>
                          Updates made to:
                          <ul className="pl-5 mt-1 space-y-1 list-disc">
                            <li>Individual UIG attachment properties (personalization)</li>
                            <li>Model weights (with sufficient data)</li>
                            <li>Rule parameters (with sufficient data)</li>
                          </ul>
                        </li>
                        <li>Improved predictions in future interactions</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">UIG Activation Flow</h3>
                  <div className="relative h-[300px] w-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <Image
                      src="/uig-activation-flow.png"
                      alt="UIG Activation Flow"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  )
}
