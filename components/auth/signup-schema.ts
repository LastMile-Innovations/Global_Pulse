import { z } from "zod"

export const signupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"], // path of error
  })

export type SignupSchemaType = z.infer<typeof signupSchema>
