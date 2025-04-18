"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

// Form validation schema
const formSchema = z.object({
  contactName: z.string().min(2, { message: "Contact name is required" }),
  organizationName: z.string().min(2, { message: "Organization name is required" }),
  contactEmail: z.string().email({ message: "Valid email is required" }),
  contactPhone: z.string().optional(),
  intentDeclaration: z.string().min(100, {
    message: "Please provide a detailed intent declaration (minimum 100 characters)",
  }),
  policyAcknowledged: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the Data Use Policy",
  }),
})

// Infer the type directly from the schema
type FormValues = z.infer<typeof formSchema>

export function DataAccessRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Use the inferred type
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      organizationName: "",
      contactEmail: "",
      contactPhone: "",
      intentDeclaration: "",
      policyAcknowledged: false, // Default can be false, refine handles validation
    },
  })

  // onSubmit receives the validated data where policyAcknowledged is true
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/data-access-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit request")
      }

      setSubmitStatus("success")
      form.reset()
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      {submitStatus === "success" && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Request Submitted</AlertTitle>
          <AlertDescription className="text-green-700">
            Thank you for your inquiry. We have received your request and will review it according to our ethical
            guidelines. You will be contacted at the email address provided if your request is approved.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>
            {errorMessage || "There was an error submitting your request. Please try again later."}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Company or institution name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="intentDeclaration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intent Declaration *</FormLabel>
                <FormDescription>
                  Please describe specifically:
                  <ol className="list-decimal ml-5 mt-1 space-y-1">
                    <li>
                      How you intend to use potential future anonymized aggregate insights derived from Global Pulse?
                    </li>
                    <li>Who would be the end-users within your organization or for your clients?</li>
                    <li>
                      How does this intended use align with Global Pulse's stated ethical principles (see our{" "}
                      <Link href="/data-use-policy" className="text-purple-600 hover:underline" target="_blank">
                        Data Use Policy
                      </Link>
                      )?
                    </li>
                    <li>
                      What technical and procedural safeguards would you implement to prevent potential misuse or
                      attempts at re-identification?
                    </li>
                  </ol>
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Please provide a detailed response to all four points above..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="policyAcknowledged"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I have read and acknowledge the principles outlined in the{" "}
                    <Link href="/data-use-policy" className="text-purple-600 hover:underline" target="_blank">
                      Global Pulse Data Use Policy
                    </Link>
                    .
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
