import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getOrCreateProfile } from '@/lib/auth/auth-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await getOrCreateProfile(user)
        if (!profile) {
          console.error(`Failed to get/create profile for user ${user.id} during email confirmation`)
          // For MVP, log and continue redirect
        }
      } else {
        console.error(`User not found after successful OTP verification`)
      }
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
}