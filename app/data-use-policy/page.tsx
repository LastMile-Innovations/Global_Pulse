import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Data Use Policy | Global Pulse",
  description: "Ethical principles governing the use of anonymized aggregate data from Global Pulse",
}

export default function DataUsePolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Global Pulse Data Use Policy</h1>

      <div className="prose prose-purple max-w-none">
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-8">
          <p className="text-sm text-purple-700">
            <strong>Note:</strong> This is a placeholder policy outlining our ethical principles and intentions
            regarding potential future data products. No such data products currently exist in this MVP stage.
          </p>
        </div>

        <h2>Our Commitment to Privacy and User Control</h2>
        <p>
          At Global Pulse, we are committed to maintaining the highest standards of privacy, security, and ethical data
          use. We believe that users should have complete control over their personal data and how it is used.
        </p>

        <h2>Ethical Principles Governing Data Use</h2>
        <p>All potential future data products will be governed by the following core ethical principles:</p>

        <ul>
          <li>
            <strong>Non-maleficence:</strong> We will never knowingly allow data to be used in ways that could cause
            harm to individuals or communities.
          </li>
          <li>
            <strong>Fairness:</strong> We are committed to ensuring that data use does not perpetuate or amplify
            existing biases or inequalities.
          </li>
          <li>
            <strong>Transparency:</strong> We will always be clear about how data is being used and who has access to
            it.
          </li>
          <li>
            <strong>User Control:</strong> Users will always have the right to opt out of having their data included in
            any aggregate data products.
          </li>
        </ul>

        <h2>Opt-In Only</h2>
        <p>
          We will only ever consider including data from users who have <strong>explicitly opted in</strong> to having
          their anonymized data included in aggregate data products. This opt-in will be clear, specific, and revocable
          at any time.
        </p>

        <h2>Anonymized and Aggregated Data Only</h2>
        <p>
          We will <strong>never</strong> sell raw or identifiable user data. Any potential future data products would
          consist only of anonymized, aggregated insights that cannot be traced back to individual users.
        </p>

        <h2>Strict Vetting of Data Recipients</h2>
        <p>
          All potential recipients of aggregate data insights will undergo a strict vetting process to ensure alignment
          with our ethical principles. This includes:
        </p>

        <ul>
          <li>Detailed declaration of intended use cases</li>
          <li>Verification of technical and procedural safeguards</li>
          <li>Contractual limitations on data use</li>
          <li>Ongoing monitoring and audit rights</li>
        </ul>

        <h2>Current Status</h2>
        <p>
          At this MVP stage, no data products exist or are being offered. This policy outlines our intentions and
          ethical framework for potential future offerings, should they be developed.
        </p>

        <h2>Relationship to Privacy Policy</h2>
        <p>
          This Data Use Policy supplements our{" "}
          <Link href="/privacy" className="text-purple-600 hover:text-purple-800">
            Privacy Policy
          </Link>
          , which contains comprehensive information about how we collect, use, and protect user data.
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline">
          <Link href="/privacy">View Privacy Policy</Link>
        </Button>
        <Button asChild>
          <Link href="/request-data-access">Request Data Access</Link>
        </Button>
      </div>
    </div>
  )
}
