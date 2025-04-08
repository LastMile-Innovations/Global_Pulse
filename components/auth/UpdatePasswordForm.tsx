"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { updatePasswordSchema, type UpdatePasswordSchemaType } from "./update-password-schema"
import { Loader2 } from "lucide-react"

export default function UpdatePasswordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false) // To ensure component mounts client-side first
  const supabase = createClient()

  // Supabase handles the token from the URL hash automatically
  // via onAuthStateChange if set up correctly in a layout/provider.
  // We just need to provide the new password here.
  useEffect(() => {
    // Check if the user landed here due to a password recovery event
    // This effect just ensures we wait for potential auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // console.log("Password recovery event detected");
        // Can optionally add logic here if needed, but Supabase handles the session
      }
    })
    setIsReady(true) // Enable form rendering after potential auth check

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase.auth])

  const form = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: UpdatePasswordSchemaType) {
    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    setIsLoading(false)

    if (error) {
      console.error("Update Password Error:", error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update your password. The link may have expired or already been used.",
      })
    } else {
      toast({
        title: "Password Updated Successfully!",
        description: "You can now log in with your new password.",
      })
      form.reset()
      router.push("/login") // Redirect to login after successful update
    }
  }

  if (!isReady) {
    // Prevent rendering the form until Supabase auth state listener is potentially processed
    return <div className="text-center p-4">Loading...</div>
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Update Your Password</CardTitle>
        <CardDescription>Enter and confirm your new password below.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
