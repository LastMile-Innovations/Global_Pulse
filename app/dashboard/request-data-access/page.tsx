import { DataAccessRequestForm } from "@/components/data-access/data-access-request-form"

export const metadata = {
  title: "Request Data Access | Global Pulse",
  description: "Submit an inquiry regarding future aggregate data insights from Global Pulse",
}

export default function RequestDataAccessPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-4">Inquiry Regarding Future Aggregate Data Insights</h1>

      <div className="mb-8 text-gray-600">
        <p>
          This form is for organizations interested in potential future aggregate data insights from Global Pulse.
          Please note that no such data products currently exist at this MVP stage.
        </p>
        <p className="mt-2">
          All inquiries will be reviewed according to our strict ethical guidelines. Submitting this form does not
          guarantee access to any data or insights.
        </p>
      </div>

      <DataAccessRequestForm />
    </div>
  )
}
