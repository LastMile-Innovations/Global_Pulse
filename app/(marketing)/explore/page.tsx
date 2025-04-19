"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Github,
  Globe,
  HeartHandshake,
  Lock,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  Eye,
  Scale,
  FileCode,
  Lightbulb,
  ExternalLink,
  ChevronDown,
} from "lucide-react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function ExplorePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95 text-foreground">
      {/* <PrototypeDisclaimer context="early-stage" /> */}

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                  Future Feature
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
              >
                Explore Collective Perspectives <br />
                <span className="text-primary">Future Feature</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 text-left shadow-lg max-w-3xl mx-auto transform transition-all hover:shadow-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Important Note</h3>
                    <p className="text-muted-foreground">
                      Global Pulse is an early-stage prototype. The features described on this page for exploring
                      aggregate insights are <strong>not yet implemented</strong>. We are currently focused on building
                      the core personal reflection tools and ensuring our ethical foundation is solid.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                className="mt-12"
              >
                <ChevronDown className="h-8 w-8 text-primary/60" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: From Personal Insight to Shared Understanding */}
      <section id="personal-to-shared" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-l from-primary/5 to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                Section 1
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                From Personal Insight to Shared Understanding <br />
                <span className="text-primary">Mapping the Collective Pulse (Responsibly)</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Global Pulse begins with your personal journey of reflection and self-discovery, facilitated by the
                Pulse agent and visualized on your private Dashboard. We believe that understanding ourselves better is
                the foundation.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Looking ahead, we envision the potential to carefully explore broader patterns by ethically and
                anonymously aggregating insights from users who explicitly choose to contribute. This /explore section
                is where that potential future capability will reside.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full mr-3">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Personal Journey First</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Your personal reflection journey is our primary focus. The current prototype provides insights
                      derived only from your own interactions, visible only to you on your private dashboard.
                    </p>

                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Focus</span>
                        <span className="font-medium text-primary">100%</span>
                      </div>
                      <Progress value={100} className="h-2 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full mr-3">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Future Collective Insights</h3>
                    </div>
                    <p className="text-muted-foreground">
                      In the future, with proper ethical safeguards in place, we may enable exploration of anonymized,
                      aggregated insights from users who explicitly opt-in to contribute their data.
                    </p>

                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Development Status</span>
                        <span className="font-medium text-amber-500">Planning</span>
                      </div>
                      <Progress value={15} className="h-2 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Vision for Ethical Collective Insight */}
      <section id="vision" className="py-20 md:py-28 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
            >
              <Lightbulb className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The Vision for Ethical Collective Insight <br />
              <span className="text-primary">What Could We Learn, Together?</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              The goal of this future feature is <strong>not</strong> to spotlight individuals, but to understand shared
              human experiences and emergent trends by observing patterns in anonymized, aggregated data –
              <strong> like seeing a constellation, patterns only visible when viewed together, with care.</strong>
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-xl opacity-50"></div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6">Imagine being able to explore questions like:</h3>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Emotional Trends</p>
                      <p className="text-muted-foreground">
                        How do collective feelings (Valence/Arousal) shift in response to major global events?
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-start bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Value Activation</p>
                      <p className="text-muted-foreground">
                        What core Values are most commonly activated when discussing certain societal topics?
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="flex items-start bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Cognitive Patterns</p>
                      <p className="text-muted-foreground">
                        Are there common cognitive appraisal patterns (MHH variables) associated with specific types of
                        challenges?
                      </p>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-muted-foreground">
                      This requires moving beyond individual data points to see the larger tapestry – but doing so
                      demands extraordinary care and commitment to privacy.{" "}
                      <strong>
                        Even responsibly aggregated insights can be misinterpreted. That's why we commit to careful
                        framing, clear communication of limitations, and eventually, open peer review of methodologies.
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual representation of constellation */}
          <div className="max-w-4xl mx-auto mt-12 relative h-64 bg-muted/20 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/interconnected-purple-data.png')] bg-cover bg-center opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <h3 className="text-xl font-semibold mb-2">Patterns Emerge from Collective Data</h3>
                <p className="text-muted-foreground">
                  Like constellations in the night sky, meaningful patterns become visible only when we can see the
                  whole picture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Non-Negotiable Ethical Preconditions */}
      <section id="ethical-preconditions" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-0 top-1/4 w-1/3 h-2/3 bg-gradient-to-r from-primary/5 to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
            >
              <Shield className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Non-Negotiable Ethical Preconditions <br />
              <span className="text-primary">Building Ethically, Or Not At All</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Displaying any form of aggregated insight requires meeting strict ethical prerequisites{" "}
              <strong>before</strong> implementation begins. We will <strong>only</strong> proceed with features like
              the Explore Hub if and when:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
                number: "1",
                title: "Explicit, Granular Consent",
                description:
                  "Users have a clear, understandable way to opt-in specifically to contributing their anonymized structured data to aggregation pools. Consent must be easily revocable. Defaults are always private.",
                delay: 0.1,
              },
              {
                icon: <Lock className="h-6 w-6 text-primary" />,
                number: "2",
                title: "Robust Anonymization & Privacy",
                description:
                  "We implement and validate state-of-the-art techniques (like Differential Privacy) to ensure individual users cannot be re-identified from the aggregate data. Minimum data thresholds per insight will be enforced.",
                delay: 0.2,
              },
              {
                icon: <Eye className="h-6 w-6 text-primary" />,
                number: "3",
                title: "Transparency & Control",
                description:
                  "Users have visibility (via settings) into what types of their anonymized data could be included in aggregation pools, based on their consent.",
                delay: 0.3,
              },
              {
                icon: <HeartHandshake className="h-6 w-6 text-primary" />,
                number: "4",
                title: "Clear User/Public Benefit",
                description:
                  "The potential benefits of sharing aggregate insights (e.g., for research, societal understanding, user context) must demonstrably outweigh the inherent privacy risks.",
                delay: 0.4,
              },
              {
                icon: <Scale className="h-6 w-6 text-primary" />,
                number: "5",
                title: "Governance & Oversight",
                description:
                  "A clear process for ethical review and governance of aggregate data usage is established.",
                delay: 0.5,
                className: "md:col-span-2 lg:col-span-1",
              },
            ].map((precondition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: precondition.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={precondition.className}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary/40"></div>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full mr-3 flex-shrink-0">{precondition.icon}</div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Precondition {precondition.number}
                        </div>
                        <h3 className="text-xl font-semibold">{precondition.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{precondition.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 shadow-md"
            >
              <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg font-medium text-primary mb-2">
                Until these conditions are fully met, this section remains a placeholder for our principled exploration.
              </p>
              <p className="text-muted-foreground">
                We believe that building ethically is non-negotiable, even if it means taking more time to develop
                certain features.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Focus on Your Personal Pulse Today */}
      <section id="personal-pulse" className="py-20 md:py-28 bg-muted/30 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Focus on Your Personal Pulse Today <br />
              <span className="text-primary">Explore Your Own Insights Now</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              While collective insights are a future possibility, your personal reflection journey can begin now. The
              current Global Pulse prototype focuses on providing insights derived only from your own interactions,
              visible only to you on your private dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <BarChart3 className="h-6 w-6 text-primary" />,
                title: "Visit Your Dashboard",
                description: "See initial reflections on your mood trends and core {Self} Map attachments.",
                buttonText: "Go to Dashboard",
                buttonLink: "/dashboard",
                buttonVariant: "default",
                delay: 0.1,
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-primary" />,
                title: "Engage with Pulse (Future)",
                description: "When interactive chat launches, explore your thoughts and feelings in a private space.",
                buttonText: "Join Waitlist",
                buttonLink: "/waitlist",
                buttonVariant: "outline",
                delay: 0.2,
              },
              {
                icon: <Shield className="h-6 w-6 text-primary" />,
                title: "Review Your Consent Settings",
                description: "Understand and manage how your data is used.",
                buttonText: "Manage Settings",
                buttonLink: "/settings/consent",
                buttonVariant: "outline",
                delay: 0.3,
              },
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: card.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full mr-3">{card.icon}</div>
                      <h3 className="text-xl font-semibold">{card.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6 flex-grow">{card.description}</p>
                    <Button
                      variant={card.buttonVariant as "default" | "outline"}
                      className="w-full mt-auto group"
                      asChild
                    >
                      <Link href={card.buttonLink}>
                        {card.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Visual representation of personal dashboard */}
          <div className="max-w-4xl mx-auto mt-12 relative">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg overflow-hidden">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Preview: Your Personal Dashboard</h3>
              </div>

              <div className="relative h-64 bg-muted/20 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('/personal-insights-dashboard.png')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <Button className="rounded-full" asChild>
                    <Link href="/dashboard">
                      Preview Your Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Stay Informed */}
      <section id="stay-informed" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4"
            >
              <FileCode className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stay Informed <br />
              <span className="text-primary">Follow Our Progress</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              The development of ethical aggregation features will be discussed openly. Follow our progress and
              contribute to the conversation via our public channels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full mr-3">
                        <FileCode className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Blog & Updates</h3>
                    </div>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Read our latest updates on development progress, ethical considerations, and future plans.
                    </p>
                    <Button className="w-full mt-auto group" asChild>
                      <Link href="/blog">
                        Visit Blog
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full mr-3">
                        <Github className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">GitHub Repository</h3>
                    </div>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Explore our open-source code, contribute to discussions, and help shape our ethical approach.
                    </p>
                    <Button variant="outline" className="w-full mt-auto group" asChild>
                      <Link
                        href="https://github.com/LastMile-Innovations/Global_Pulse.git"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on GitHub
                        <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full mr-3">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Ethics Page</h3>
                    </div>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Review our comprehensive ethical framework and principles guiding our development.
                    </p>
                    <Button variant="outline" className="w-full mt-auto group" asChild>
                      <Link href="/ethics">
                        Read Ethics Framework
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-md"
            >
              <p className="text-lg font-medium mb-4">Join the Conversation</p>
              <p className="text-muted-foreground mb-6">
                We believe in building in the open and welcome your input on how we can develop these features
                responsibly.
              </p>
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/waitlist">
                  Join Our Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Ethical Precondition Card Component
function EthicalPreconditionCard({
  icon,
  number,
  title,
  description,
  className,
}: {
  icon: React.ReactNode
  number: string
  title: string
  description: string
  className?: string
}) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className={className}>
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border shadow-md hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full mr-3 flex-shrink-0">{icon}</div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Precondition {number}</div>
              <h3 className="text-xl font-semibold">{title}</h3>
            </div>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Restore Heart Icon Component
function Heart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}
