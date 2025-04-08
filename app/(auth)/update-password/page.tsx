import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm"

export default function UpdatePasswordPage() {
  // This page is typically accessed via a link from email.
  // Supabase client handles the token exchange from the URL hash.
  return <UpdatePasswordForm />
}
