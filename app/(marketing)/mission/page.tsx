import WaitlistSignupForm from "@/components/waitlist/WaitlistSignupForm"
import { Badge } from "@/components/ui/badge"

export default function WaitlistPage() {
  return (
    <div className="container max-w-5xl mx-auto py-16 px-4 md:py-24">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
          Join the Waitlist
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Be Among the First to <span className="text-primary">Experience Global Pulse</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sign up to receive updates and early access to our platform as we continue to develop and refine our approach
          to deeper understanding.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
        <WaitlistSignupForm />
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>
          By joining our waitlist, you'll receive occasional updates about our progress and early access opportunities.
          We respect your privacy and will never share your information with third parties. You can unsubscribe at any
          time.
        </p>
      </div>
    </div>
  )
}
