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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const metadata = {
  title: "Privacy Policy | Global Pulse",
  description: "How we protect your data and privacy at Global Pulse",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-darkBlue text-white">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-purple-900/20 to-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">Privacy Policy</h1>
            <p className="text-xl text-gray-300 mb-2">Last updated: April 7, 2025</p>
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg my-8">
              <p className="text-gray-300 mb-2">
                This Privacy Policy describes how Global Pulse ("we," "us," or "our") collects, uses, and shares information about you when you use our website, mobile applications, and services (collectively, the "Services"). Please read this policy carefully. By using our Services, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy.
              </p>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the changes becoming effective. Your continued use of our Services after any such changes constitutes your acceptance of the new Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Information We Collect Section */}
      <section className="py-16 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Database className="mr-3 h-8 w-8 text-primary" />
              1. Information We Collect
            </h2>

            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle>Personal Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">When you register with Global Pulse, we may collect:</p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Name and email address</li>
                  <li>Authentication information (if using third-party login)</li>
                  <li>Profile information you choose to provide</li>
                  <li>Information from connected data sources (with your explicit consent)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle>Usage Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">We collect information about how you interact with our platform:</p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Chat interactions and messages</li>
                  <li>Feature usage patterns</li>
                  <li>Time spent on various parts of the platform</li>
                  <li>Technical information about your device and connection</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Derived Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">Our platform generates insights based on your interactions:</p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Emotional response patterns (VAD values)</li>
                  <li>Inferred values and attachments (UIG data)</li>
                  <li>Interaction patterns and preferences</li>
                </ul>
                <Alert className="mt-4 bg-gray-800 border-gray-700">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-gray-300">
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
      <section className="py-16 bg-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-primary" />
              2. How We Use Your Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Providing Our Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>Delivering personalized insights and responses</li>
                    <li>Building and maintaining your Unified Identity Graph (UIG)</li>
                    <li>Processing emotional responses through the EWEF framework</li>
                    <li>Authenticating your account and maintaining security</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Improving Our Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>Analyzing usage patterns to enhance features</li>
                    <li>Debugging and fixing technical issues</li>
                    <li>Training and improving our AI models (with consent)</li>
                    <li>Conducting research to advance emotional intelligence technology</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li>Sending important service updates and notifications</li>
                    <li>Responding to your inquiries and support requests</li>
                    <li>Providing information about new features (if you opt-in)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Aggregate Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">With your explicit consent only, we may use anonymized data to:</p>
                  <ul className="space-y-2 text-gray-300 mt-2">
                    <li>Generate aggregate trends and patterns</li>
                    <li>Develop anonymized research insights</li>
                    <li>Create statistical models of emotional responses</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sharing Section */}
      <section className="py-16 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Globe className="mr-3 h-8 w-8 text-primary" />
              3. How We Share Your Information
            </h2>

            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle>We May Share Information With:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-2">Service Providers</h3>
                  <p className="text-gray-300">
                    Third-party vendors who assist us in operating our platform, conducting business, or servicing you.
                    These providers have access to your information only to perform these tasks on our behalf and are
                    obligated not to disclose or use it for any other purpose.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Business Partners</h3>
                  <p className="text-gray-300">
                    With your explicit consent only, we may share anonymized, aggregated data with trusted research or
                    business partners to develop insights or improve services.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Legal Requirements</h3>
                  <p className="text-gray-300">
                    If required to do so by law or in response to valid requests by public authorities (e.g., a court or
                    government agency).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Business Transfers</h3>
                  <p className="text-gray-300">
                    In connection with, or during negotiations of, any merger, sale of company assets, financing, or
                    acquisition of all or a portion of our business to another company.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-primary/20 border border-primary">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-gray-300">
                <strong className="text-white">Our Commitment:</strong> We will never sell your personal data to third
                parties. Any sharing of anonymized, aggregated data requires your explicit opt-in consent.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Data Security Section */}
      <section className="py-16 bg-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <Lock className="mr-3 h-8 w-8 text-primary" />
              4. Data Security
            </h2>

            <p className="text-gray-300 mb-8">
              We have implemented appropriate technical and organizational security measures designed to protect the
              security of any personal information we process. However, despite our safeguards and efforts to secure
              your information, no electronic transmission over the Internet or information storage technology can be
              guaranteed to be 100% secure.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-primary" />
                    Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We use industry-standard encryption for data at rest and in transit. Sensitive credentials are
                    protected with additional application-level encryption.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5 text-primary" />
                    Secure Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Our platform is built on modern, secure cloud infrastructure with regular security updates,
                    firewalls, and intrusion detection systems.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5 text-primary" />
                    Access Controls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    We implement strict role-based access controls and the principle of least privilege to ensure only
                    authorized personnel can access user data.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Regular Audits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
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
      <section className="py-16 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <UserCheck className="mr-3 h-8 w-8 text-primary" />
              5. Your Choices & Data Rights
            </h2>

            <p className="text-gray-300 mb-8">
              We respect your privacy rights and provide you with reasonable access and control over your data.
              Depending on your location, you may have the following rights:
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">You can request a copy of the personal data we hold about you.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Rectification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    You can request correction of your personal data if it is inaccurate or incomplete.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Erasure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    You can request deletion of your personal data in certain circumstances.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Restrict Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    You can request that we restrict the processing of your data under certain conditions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Data Portability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    You can request a copy of your data in a structured, commonly used, machine-readable format.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>Object</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    You can object to our processing of your personal data in certain circumstances.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <p className="text-gray-300 mb-4">To exercise any of these rights, please contact us at:</p>
              <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                <Link href="mailto:privacy@globalpulse.ai">privacy@globalpulse.ai</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="py-16 bg-darkBlue">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-primary" />
              6. Additional Information
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Cookies and Tracking Technologies</h3>
                <p className="text-gray-300">
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain
                  information. Cookies are files with a small amount of data which may include an anonymous unique
                  identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
                  sent.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Children's Privacy</h3>
                <p className="text-gray-300">
                  Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal
                  information from children under 18. If you are a parent or guardian and you are aware that your child
                  has provided us with personal information, please contact us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Changes to This Privacy Policy</h3>
                <p className="text-gray-300">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to
                  review this Privacy Policy periodically for any changes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <p className="text-gray-300 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                    <Link href="mailto:privacy@globalpulse.ai">By email: privacy@globalpulse.ai</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-gray-700 hover:bg-gray-800">
                    <Link href="/contact">Contact Form</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links Section */}
      <section className="py-16 bg-charcoal">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter mb-8">Related Resources</h2>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    Ethics Framework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Learn about our comprehensive approach to ethical AI development.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full border-gray-700 hover:bg-gray-800">
                    <Link href="/ethics">
                      View Ethics Framework
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Terms of Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Review our terms and conditions for using the Global Pulse platform.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full border-gray-700 hover:bg-gray-800">
                    <Link href="/terms">
                      View Terms of Service
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-primary" />
                    Data Use Policy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Understand how we handle aggregate data and insights.</p>
                  <Button asChild variant="outline" size="sm" className="w-full border-gray-700 hover:bg-gray-800">
                    <Link href="/data-use-policy">
                      View Data Use Policy
                      <ExternalLink className="ml-2 h-4 w-4" />
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
