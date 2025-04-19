import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { inter, poppins } from "./fonts";
import { Suspense } from "react";

export const metadata = {
  title: {
    template: "%s | Global Pulse",
    default: "Global Pulse - Real-time global opinion insights",
  },
  description:
    "Instantly see what the world thinks. Participate in AI-led conversations and surveys, explore live global sentiment.",
  keywords: [
    "global opinion",
    "surveys",
    "AI conversations",
    "sentiment analysis",
    "public opinion",
  ],
  authors: [{ name: "Global Pulse Team" }],
  generator: "Next.js",
  applicationName: "Global Pulse",
  referrer: "origin-when-cross-origin",
  creator: "Global Pulse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for fonts and Supabase */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link
            rel="preconnect"
            href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            crossOrigin="anonymous"
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main>{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
