import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
})

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>
