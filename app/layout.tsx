import type React from "react"
import { Suspense } from "react"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { inter, poppins } from "./fonts"
import { Metadata, Viewport } from "next"

// Define metadata for better SEO and performance
export const metadata: Metadata = {
  title: {
    template: '%s | Global Pulse',
    default: 'Global Pulse - Real-time global opinion insights',
  },
  description: 'Instantly see what the world thinks. Participate in AI-led conversations and surveys, explore live global sentiment.',
  keywords: ['global opinion', 'surveys', 'AI conversations', 'sentiment analysis', 'public opinion'],
  authors: [{ name: 'Global Pulse Team' }],
  generator: 'Next.js',
  applicationName: 'Global Pulse',
  referrer: 'origin-when-cross-origin',
  creator: 'Global Pulse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

// Define viewport settings
export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }, { media: '(prefers-color-scheme: dark)', color: '#020817' }],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Preload critical assets */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ""} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


