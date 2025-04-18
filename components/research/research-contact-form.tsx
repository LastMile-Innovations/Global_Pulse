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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

// Define collaboration types
const collaborationTypes = [
  "framework-validation",
  "algorithm-development",
  "open-source",
  "ethical-ai",
  "data-access",
  "other",
] as const // Use const assertion for literal types
type CollaborationType = (typeof collaborationTypes)[number];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  institution: z.string().min(2, { message: "Institution/affiliation is required" }),
  researchArea: z.string().min(10, { message: "Please describe your research area" }),
  collaborationType: z.enum(collaborationTypes, { message: "Please select a collaboration type" }),
  message: z.string().min(50, { message: "Please provide a detailed message (minimum 50 characters)" }),
  // Use boolean().refine() for validation
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

// Infer the type from the schema
type FormValues = z.infer<typeof formSchema>;

export function ResearchContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Use the inferred type
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      institution: "",
      researchArea: "",
      collaborationType: undefined, // Default to undefined for enum
      message: "",
      agreeToTerms: false, // Default can be false
    },
  });

  // onSubmit receives validated data
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/research-contact", { // Make sure endpoint is correct
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit contact request");
      }

      setSubmitStatus("success");
      form.reset();
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-sm">
      {submitStatus === "success" && (
        <Alert className="mb-6 bg-green-900/20 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-400">Request Submitted</AlertTitle>
          <AlertDescription className="text-green-300">
            Thank you for your interest in collaborating with Global Pulse. Our research team will review your inquiry
            and contact you soon.
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} className="bg-gray-800 border-gray-700" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic/Professional Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@institution.edu"
                      {...field}
                      className="bg-gray-800 border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution/Organization *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="University or research institution"
                      {...field}
                      className="bg-gray-800 border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="researchArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Area/Expertise *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Affective Computing, Cognitive Psychology"
                      {...field}
                      className="bg-gray-800 border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="collaborationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collaboration Interest *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select your primary area of interest" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="framework-validation">Framework Validation & Refinement</SelectItem>
                    <SelectItem value="algorithm-development">Algorithm & Model Development</SelectItem>
                    <SelectItem value="open-source">Open Source Contribution</SelectItem>
                    <SelectItem value="ethical-ai">Ethical AI Research</SelectItem>
                    <SelectItem value="data-access">Data Access for Research</SelectItem>
                    <SelectItem value="other">Other (please specify in message)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Research Interest/Proposal *</FormLabel>
                <FormDescription className="text-gray-400">
                  Please briefly describe your research interests, potential collaboration ideas, or specific questions
                  about the Global Pulse framework.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Describe your research interests and how you'd like to collaborate with Global Pulse..."
                    className="min-h-[150px] bg-gray-800 border-gray-700"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    // field.value is correctly typed as boolean
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the Research Collaboration Terms and Conditions.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Research Collaboration Inquiry"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
