import { z } from "zod"

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

export type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>
