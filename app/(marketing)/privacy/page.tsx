import Link from "next/link"
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Clock,
  Database,
  Server,
  Globe,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata = {
  title: "Privacy Policy | Global Pulse",
  description: "How we protect your data and privacy at Global Pulse",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Add Prototype Disclaimer */}
      <div className="container px-4 md:px-6 pt-12"> 
        <Alert variant="default" className="mb-8 bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Prototype Status</AlertTitle>
          <AlertDescription>
            Global Pulse is currently an early-stage prototype born from a 10-day hackathon. Features described represent our design goals and may not be fully interactive in the current demo. This policy reflects both current practices for the prototype and outlines our intentions for future functionality, which will always be subject to your explicit consent.
          </AlertDescription>
        </Alert>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground mb-2">Effective Date: [Insert Current Date or Initial Launch Date]</p>
            <div className="bg-card/50 border border-border p-6 rounded-lg my-8">
              <p className="text-muted-foreground mb-2">
                This Privacy Policy describes how Global Pulse ("we," "us," or "our") *currently* collects, uses, and shares information about you when you use our website and prototype services (collectively, the "Services"), and outlines *our planned approach* for future features. Please read this policy carefully. By using our Services, you consent to the collection, use, and disclosure of your information *as currently practiced and described* in this Privacy Policy. *Future data collection and use will require additional explicit consent.* 
              </p>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. If we make material changes, *especially regarding data use*, we will notify you prominently (e.g., by email or notice on our website) prior to the changes becoming effective. Your continued use of our Services after any such changes constitutes your acceptance of the new Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Information We Collect Section */}
      <section className="py-16 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Database className="mr-3 h-8 w-8 text-primary" />
              1. Information We Collect
            </h2>

            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle>Personal Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">*Currently, during the prototype phase, we may collect:*</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Email address (if you join the waitlist or create an account)</li>
                  <li>Authentication information (if using third-party login like Google/GitHub)</li>
                </ul>
                <p className="text-muted-foreground mt-4">*Future Features (Requires Explicit Consent):*</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Profile information you choose to provide (e.g., demographics, interests - always optional)</li>
                  <li>Information from connected data sources you explicitly authorize (e.g., calendar, health apps)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle>Usage Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">*Currently, during the prototype phase:*</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Basic website analytics (e.g., page views - anonymized where possible)</li>
                  <li>Technical information about your device/connection for troubleshooting</li>
                </ul>
                <p className="text-muted-foreground mt-4">*Future Features (Requires Explicit Consent):*</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Chat interactions and messages (specifically for analysis and providing insights back to *you*)</li>
                  <li>Feature usage patterns (to understand which features are helpful)</li>
                  <li>Time spent on various parts of the platform (for usability improvements)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Derived Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">*Currently, no derived data is generated as core features are not active.*</p>
                <p className="text-muted-foreground mt-4">*Future Features (Core to the platform, Requires Explicit Consent for any use beyond direct reflection to you):*</p>
                <p className="text-muted-foreground">Our platform *is designed to* generate insights based on your interactions:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Emotional response patterns (e.g., VAD values - reflecting potential feeling states)</li>
                  <li>Inferred values, needs, goals, beliefs (elements of your potential UIG)</li>
                  <li>Interaction patterns and preferences</li>
                </ul>
                <Alert variant="default" className="mt-4 bg-muted/50 border-border">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-muted-foreground">
                    This derived data is central to providing you with personalized insights but is treated with the
                    highest level of privacy protection.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How We Use Your Information Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-primary" />
              2. How We Use Your Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Providing Our Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">*Current Use:*</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Authenticating your account and maintaining security</li>
                    <li>Managing waitlist access</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">*Future Use (Requires Explicit Consent):*</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Delivering personalized insights and reflective responses based on your data</li>
                    <li>Building and maintaining your private Unified Identity Graph (UIG)</li>
                    <li>Processing emotional responses through the EWEF framework to provide reflections</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Improving Our Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">*Current Use:*</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Analyzing anonymized usage patterns to fix bugs and improve usability</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">*Future Use (Requires Explicit Consent):*</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Analyzing usage patterns to enhance specific features</li>
                    <li>Debugging and fixing technical issues related to your interactions</li>
                    <li>*Potentially* using anonymized, aggregated data for training and improving our AI models (Requires specific, opt-in consent)</li>
                    <li>*Potentially* conducting research using anonymized, aggregated data (Requires specific, opt-in consent and ethical review)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Sending essential service updates (e.g., policy changes, security notices)</li>
                    <li>Responding to your inquiries and support requests</li>
                    <li>Providing information about prototype progress or new features (if you opt-in, e.g., via waitlist)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Aggregate Insights & Potential Future Uses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">*Leading with Ethics:* Our fundamental principle is user control and benefit. *No current data products exist.* Any future use of aggregated, anonymized data for broader insights (e.g., research, societal trends, potential data products) will adhere strictly to the following:</p>
                  <ul className="space-y-2 text-muted-foreground mt-2">
                    <li><strong>Explicit, Granular Consent:</strong> You must specifically opt-in to allow your anonymized data to contribute to any aggregate pool for uses beyond direct service provision to you.</li>
                    <li><strong>Rigorous Anonymization:</strong> Techniques will be employed to ensure individual identities cannot be re-associated with the data.</li>
                    <li><strong>Ethical Review:</strong> Any potential use case will undergo strict ethical review focused on potential harms and benefits.</li>
                    <li><strong>Transparency:</strong> Clear explanations of how aggregated data *might* be used will be provided before seeking consent.</li>
                    <li><strong>No Sale of Personal Data:</strong> We reiterate: Your identifiable personal data will never be sold.</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">*Examples of potential future uses requiring this specific consent:*</p>
                  <ul className="space-y-2 text-muted-foreground mt-2">
                    <li>Generating aggregate reports on societal well-being trends (anonymized)</li>
                    <li>Contributing to anonymized datasets for academic research</li>
                    <li>Developing statistical models of general emotional responses (anonymized)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sharing Section */}
      <section className="py-16 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Globe className="mr-3 h-8 w-8 text-primary" />
              3. How We Share Your Information
            </h2>

            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle>We *May* Share Information With:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Service Providers</h3>
                  <p className="text-muted-foreground">
                    Third-party vendors who assist us in operating our platform (e.g., hosting providers like Vercel, database providers like Supabase). *Currently, this is limited to infrastructure essential for the prototype website and authentication.* These providers have access to minimal necessary information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Business Partners (Research & Development - Future Possibility)</h3>
                  <p className="text-muted-foreground">
                    *Strictly Hypothetical & Requires Explicit Consent:* In the future, *if* we pursue specific research or development partnerships, we *might* seek your explicit consent to share anonymized, aggregated data with trusted partners *under strict contractual obligations and ethical oversight*. *Currently, no such partnerships or data sharing exist.*
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Legal Requirements</h3>
                  <p className="text-muted-foreground">
                    If required to do so by law or in response to valid requests by public authorities (e.g., a court or
                    government agency).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Business Transfers</h3>
                  <p className="text-muted-foreground">
                    In connection with, or during negotiations of, any merger, sale of company assets, financing, or
                    acquisition of all or a portion of our business to another company.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-primary/10 border border-primary/50">
              <Shield className="h-4 w-4 text-primary" />
              <AlertTitle className="text-foreground">Our Commitment</AlertTitle>
              <AlertDescription className="text-primary-foreground">
                <strong className="text-foreground">We will never sell your identifiable personal data.</strong> Any potential future sharing of anonymized, aggregated data requires your explicit, informed, and granular opt-in consent, and will be subject to rigorous ethical review.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Data Security Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Lock className="mr-3 h-8 w-8 text-primary" />
              4. Data Security
            </h2>

            <p className="text-muted-foreground mb-8">
              We have implemented appropriate technical and organizational security measures designed to protect the
              security of any personal information we process. However, despite our safeguards and efforts to secure
              your information, no electronic transmission over the Internet or information storage technology can be
              guaranteed to be 100% secure.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-primary" />
                    Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We use industry-standard encryption for data at rest and in transit. Sensitive credentials are
                    protected with additional application-level encryption.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5 text-primary" />
                    Secure Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our platform is built on modern, secure cloud infrastructure with regular security updates,
                    firewalls, and intrusion detection systems.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5 text-primary" />
                    Access Controls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We implement strict role-based access controls and the principle of least privilege to ensure only
                    authorized personnel can access user data.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Regular Audits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We conduct regular security audits and vulnerability assessments to identify and address potential
                    security issues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Your Data Rights Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <UserCheck className="mr-3 h-8 w-8 text-primary" />
              5. Your Choices & Data Rights
            </h2>

            <p className="text-muted-foreground mb-8">
              We respect your privacy rights and provide you with reasonable access and control over your *currently collected* data (e.g., account information, waitlist status). *As features evolve, these rights will extend to all data collected with your consent.* Depending on your location, you may have the following rights regarding your personal data:
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">You can request a copy of the personal data we hold about you.</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Rectification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can request correction of your personal data if it is inaccurate or incomplete.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Erasure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can request deletion of your personal data in certain circumstances.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Restrict Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can request that we restrict the processing of your data under certain conditions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Data Portability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can request a copy of your data in a structured, commonly used, machine-readable format.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Object</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can object to our processing of your personal data in certain circumstances.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <p className="text-muted-foreground mb-4">To exercise any of these rights *regarding your current account/waitlist information*, or to ask questions about future data rights, please contact us at:</p>
              <Button asChild variant="outline" className="border-border hover:bg-card">
                <Link href="mailto:privacy@globalpulse.ai">privacy@globalpulse.ai</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-primary" />
              6. Additional Information
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Cookies and Tracking Technologies</h3>
                <p className="text-muted-foreground">
                  *Currently,* we use essential cookies for basic website functionality (e.g., authentication). We may use standard analytics tools (like Vercel Analytics) that collect anonymized usage data. We *do not currently* use invasive tracking cookies for advertising or cross-site tracking. *Future use* of additional cookies (e.g., for personalization) will require your consent via a cookie banner.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Children's Privacy</h3>
                <p className="text-muted-foreground">
                  Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal
                  information from children under 18. If you are a parent or guardian and you are aware that your child
                  has provided us with personal information, please contact us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Changes to This Privacy Policy</h3>
                <p className="text-muted-foreground">
                  We may update our Privacy Policy from time to time. We will notify you of any significant changes by posting the
                  new Privacy Policy on this page and updating the "Effective Date" at the top. *We strongly encourage you to review this policy periodically, especially before consenting to new features.* 
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild variant="outline" className="border-border hover:bg-card">
                    <Link href="mailto:privacy@globalpulse.ai">By email: privacy@globalpulse.ai</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-border hover:bg-card">
                    <Link href="/contact">Contact Form</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links Section */}
      <section className="py-16 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8">Related Resources</h2>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    Ethics Framework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Learn about our comprehensive approach to ethical AI development.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full border-border hover:bg-card">
                    <Link href="/ethics">
                      View Ethics Framework
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Terms of Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Review our terms and conditions for using the Global Pulse platform.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full border-border hover:bg-card">
                    <Link href="/terms">
                      View Terms of Service
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-primary" />
                    Data Use Policy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Details on how different types of data may be used, now and potentially in the future.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full border-border hover:bg-card">
                    <Link href="#data-use"> 
                      View Data Use Details <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
