"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from "./forgot-password-schema"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const supabase = createClient()

  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordSchemaType) {
    setIsLoading(true)
    setMessageSent(false)

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      // IMPORTANT: This URL must match where your UpdatePasswordPage is located
      redirectTo: `${window.location.origin}/update-password`,
    })

    setIsLoading(false)

    if (error) {
      console.error("Password Reset Error:", error)
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error.message || "Could not send reset instructions. Please check the email and try again.",
      })
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for instructions to reset your password.",
      })
      setMessageSent(true)
      form.reset() // Clear the form
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>Enter your email address below to receive password reset instructions.</CardDescription>
      </CardHeader>
      {!messageSent ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} type="email" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/login" className="underline underline-offset-2 hover:text-primary">
                  Log In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      ) : (
        <CardContent>
          <p className="text-center text-green-600">
            Instructions sent! Please check your email (including spam folder).
          </p>
        </CardContent>
      )}
    </Card>
  )
}
