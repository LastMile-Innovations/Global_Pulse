import type { Metadata } from "next"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact Us - Global Pulse",
  description: "Get in touch with the Global Pulse team for questions, feedback, or support.",
}

export default function ContactPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-10 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions or feedback about Global Pulse? We'd love to hear from you.
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="rounded-2xl border border-muted bg-background/80 shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Send us a message</h2>
        <ContactForm />
      </div>

      <div className="mt-16 rounded-2xl border border-muted bg-background/80 shadow-sm p-6 md:p-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">How long does it take to get a response?</h3>
            <p className="text-muted-foreground">
              We typically respond to inquiries within 1-2 business days. For urgent matters,
              please indicate the urgency in your subject line.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I request a feature?</h3>
            <p className="text-muted-foreground">
              Absolutely! We welcome feature requests. Please select "Feature Request" as your
              category and provide as much detail as possible about the functionality you'd like to see.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">How do I report a bug?</h3>
            <p className="text-muted-foreground">
              Select "Bug Report" as your category and include details like steps to reproduce,
              expected behavior, and your device/browser information.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I get involved as a developer?</h3>
            <p className="text-muted-foreground">
              Yes! Global Pulse is open-source. Check out our GitHub repository and the contributing
              guidelines. Feel free to reach out with specific questions about contributing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 