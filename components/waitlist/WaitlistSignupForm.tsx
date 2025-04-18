"use client"

import { useState, useTransition } from "react"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function WaitlistSignupForm() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    interest: "",
    referralCode: "",
    emailPreferences: {
      updates: true,
      offers: false,
    },
    privacyAccepted: false,
  })
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    if (target instanceof HTMLInputElement) {
      const type = target.type;
      const checked = target.checked;

      if (name.startsWith("emailPreferences.")) {
        setForm(f => ({
          ...f,
          emailPreferences: {
            ...f.emailPreferences,
            [name.split(".")[1]]: checked,
          }
        }))
      } else if (type === "checkbox") {
        setForm(f => ({ ...f, [name]: checked }))
      } else {
        setForm(f => ({ ...f, [name]: value }))
      }
    } else {
      // Handle TextArea change (only value)
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          emailPreferences: form.emailPreferences,
          privacyAccepted: form.privacyAccepted,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong.")
      } else {
        setSuccess("You're on the waitlist! Share your referral link: " + data.referralLink)
        setForm({
          email: "",
          name: "",
          interest: "",
          referralCode: "",
          emailPreferences: { updates: true, offers: false },
          privacyAccepted: false,
        })
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/90 dark:bg-muted/40 rounded-2xl shadow-xl border border-primary/10 p-6 md:p-10 space-y-6 w-full"
    >
      <h2 className="text-xl font-bold mb-2 text-center">Join the Waitlist</h2>
      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-100 rounded p-2 text-sm">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-700 bg-green-100 rounded p-2 text-sm">
          <CheckCircle className="w-5 h-5" /> {success}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="email">Email<span className="text-red-500">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            disabled={pending}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            disabled={pending}
            autoComplete="name"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="interest">Why are you interested?</label>
        <textarea
          id="interest"
          name="interest"
          value={form.interest}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-primary/40 focus:outline-none"
          rows={3}
          disabled={pending}
        />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="referralCode">Referral Code</label>
        <input
          id="referralCode"
          name="referralCode"
          type="text"
          value={form.referralCode}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-primary/40 focus:outline-none"
          disabled={pending}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium">Email Preferences</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="emailPreferences.updates"
            checked={form.emailPreferences.updates}
            onChange={handleChange}
            disabled={pending}
          />
          Receive updates
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="emailPreferences.offers"
            checked={form.emailPreferences.offers}
            onChange={handleChange}
            disabled={pending}
          />
          Receive special offers
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="privacyAccepted"
            checked={form.privacyAccepted}
            onChange={handleChange}
            required
            disabled={pending}
          />
          <span>
            I agree to the <a href="/privacy" className="underline text-primary" target="_blank" rel="noopener noreferrer">privacy policy</a>
          </span>
        </label>
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2 text-lg"
        disabled={pending}
      >
        {pending && <Loader2 className="w-5 h-5 animate-spin" />}
        {pending ? "Joining..." : "Join Waitlist"}
      </button>
    </form>
  )
} 