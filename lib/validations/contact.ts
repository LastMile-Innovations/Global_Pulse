import * as z from "zod"
import { contactCategoryEnum } from "@/lib/db/schema/contactMessages"

// Extract the enum values for Zod validation
const categoryValues = Object.values(contactCategoryEnum.enumValues)

// Form validation schema
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(255, { message: "Name cannot exceed 255 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).max(255, { message: "Email cannot exceed 255 characters" }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters" }).max(255, { message: "Subject cannot exceed 255 characters" }),
  category: z.enum(categoryValues as [string, ...string[]], {
    required_error: "Please select a category",
    invalid_type_error: "Please select a valid category"
  }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }).max(10000, { message: "Message cannot exceed 10,000 characters" })
})

// Type for form values inferred from the schema
export type ContactFormValues = z.infer<typeof contactFormSchema> 