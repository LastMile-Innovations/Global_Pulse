import type React from "react"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { inter, poppins } from "./fonts"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Preload critical assets */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ""} crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'

export const metadata = {
  generator: 'v0.dev'
};
